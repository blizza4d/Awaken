import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';

import { CinematicPostShader } from './shaders/CinematicPostShader';
import {
  ISpatialScene,
  SpatialSceneId,
  EngineTelemetry,
  PostFXSettings,
  PowerProfile,
} from './types';

type SceneClassConstructor = new () => ISpatialScene;
type SceneLoader = () => Promise<SceneClassConstructor>;

const SCENE_LOADERS: Record<SpatialSceneId, SceneLoader | null> = {
  'fluid-data': async () => (await import('./scenes/FluidDataScene')).FluidDataScene,
  'volumetric-megacity': async () => (await import('./scenes/VolumetricMegacityScene')).VolumetricMegacityScene,
  'event-horizon': async () => (await import('./scenes/EventHorizonScene')).EventHorizonScene,
  'carina-nebula': async () => (await import('./scenes/CarinaNebulaScene')).CarinaNebulaScene,
  'binary-pulsar': async () => (await import('./scenes/BinaryPulsarScene')).BinaryPulsarScene,
  'saturnian-orbit': async () => (await import('./scenes/SaturnianOrbitScene')).SaturnianOrbitScene,
  'deep-void-drift': async () => (await import('./scenes/DeepVoidDriftScene')).DeepVoidDriftScene,
  'midnight-cruise': async () => (await import('./scenes/MidnightCruiseScene')).MidnightCruiseScene,
  'moonlit-shore': async () => (await import('./scenes/MoonlitShoreScene')).MoonlitShoreScene,
  'arctic-aurora': async () => (await import('./scenes/ArcticAuroraScene')).ArcticAuroraScene,
  'nocturne-glass': async () => (await import('./scenes/NocturneGlassScene')).NocturneGlassScene,
  'abyssal-drift': async () => (await import('./scenes/AbyssalDriftScene')).AbyssalDriftScene,
  'oled-void': null,
};

export class SpatialEngine {
  private renderer: THREE.WebGLRenderer;
  private composer: EffectComposer;
  private renderPass: RenderPass;
  private bloomPass: UnrealBloomPass;
  private cinematicPass: ShaderPass;
  private outputPass: OutputPass;
  private smaaPass: SMAAPass;

  private activeScene: ISpatialScene | null = null;
  private activeSceneId: SpatialSceneId;
  private loadSequence = 0;
  private animFrameId: number | null = null;
  private clock = new THREE.Clock();
  private elapsed = 0;

  private pointer = new THREE.Vector2(0, 0);
  private width = window.innerWidth;
  private height = window.innerHeight;

  // Dynamic Resolution & Performance Governor state
  private nativeDpr = Math.min(window.devicePixelRatio || 1, 2);
  private currentDpr = Math.min(window.devicePixelRatio || 1, 2);
  private qualityScale = 1.0;
  private frameCounter = 0;
  private lastFpsSample = performance.now();
  private currentFps = 60;
  private highFpsStreak = 0;
  private isPaused = false;
  private isOledVoidActive = false;

  // Power Profile & FPS Limiter
  private powerProfile: PowerProfile = 'smooth';
  private targetFrameInterval = 1000 / 60; // 16.66ms for 60fps
  private lastRenderTimestamp = 0;

  private postFX: PostFXSettings = {
    bloomMultiplier: 1.0,
    filmGrain: 0.024,
    chromaticAberration: 0.0018,
    dynamicResolution: true,
  };

  private onTelemetry?: (telemetry: EngineTelemetry) => void;

  constructor(
    canvas: HTMLCanvasElement,
    initialScene: SpatialSceneId,
    onTelemetry?: (telemetry: EngineTelemetry) => void
  ) {
    this.onTelemetry = onTelemetry;
    this.activeSceneId = initialScene;

    // 1. High-Performance WebGLRenderer with ACESFilmic Cinematic Color Grading
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
      stencil: false,
    });
    this.renderer.setPixelRatio(this.currentDpr);
    this.renderer.setSize(this.width, this.height, false);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.80;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // 2. Bandwidth-efficient HalfFloat EffectComposer Pipeline
    const renderTarget = new THREE.WebGLRenderTarget(this.width, this.height, {
      type: THREE.HalfFloatType,
      format: THREE.RGBAFormat,
      colorSpace: THREE.SRGBColorSpace,
      stencilBuffer: false,
      depthBuffer: true,
    });

    this.composer = new EffectComposer(this.renderer, renderTarget);
    this.composer.setPixelRatio(this.currentDpr);
    this.composer.setSize(this.width, this.height);

    const bootScene = new THREE.Scene();
    const bootCam = new THREE.PerspectiveCamera(50, this.width / this.height, 0.1, 100);

    // Pass 1: Base Scene Render
    this.renderPass = new RenderPass(bootScene, bootCam);
    this.composer.addPass(this.renderPass);

    // Pass 2: Half-Resolution UnrealBloomPass for low GPU fillrate & cache efficiency
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(Math.floor(this.width * 0.5), Math.floor(this.height * 0.5)),
      0.32,
      0.48,
      0.88
    );
    this.composer.addPass(this.bloomPass);

    // Pass 3: Custom Cinematic Film Grain + Radial Chromatic Aberration
    this.cinematicPass = new ShaderPass(CinematicPostShader);
    this.composer.addPass(this.cinematicPass);

    // Pass 4: ACESFilmic Tone-Mapping & sRGB Color Space Output
    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);

    // Pass 5: SMAA Antialiasing
    this.smaaPass = new SMAAPass(
      Math.floor(this.width * this.currentDpr),
      Math.floor(this.height * this.currentDpr)
    );
    this.composer.addPass(this.smaaPass);

    // Bind window events
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('pointermove', this.handlePointerMove, { passive: true });
    document.addEventListener('visibilitychange', this.handleVisibilityChange);

    // Initialize initial scene
    this.loadScene(initialScene);
  }

  public setPowerProfile(profile: PowerProfile): void {
    this.powerProfile = profile;
    if (profile === 'eco') {
      this.targetFrameInterval = 1000 / 30; // 30 FPS target
    } else if (profile === 'smooth') {
      this.targetFrameInterval = 1000 / 60; // 60 FPS target
    } else {
      this.targetFrameInterval = 0; // Uncapped native refresh
    }
  }

  /**
   * Lazily loads and switches spatial scenes with strict WebGL garbage collection:
   * Dynamically imports the scene chunk, completely disposes old resources,
   * flushes renderer lists, and configures the direct or composer rendering pipeline.
   */
  public async loadScene(id: SpatialSceneId): Promise<void> {
    this.activeSceneId = id;
    const currentSeq = ++this.loadSequence;

    // 1. Strict GPU Memory Flush of previous scene
    if (this.activeScene) {
      this.activeScene.dispose();
      this.activeScene = null;
      this.renderer.renderLists.dispose();
    }

    // 2. Handle OLED Void: Complete WebGL Teardown
    if (id === 'oled-void') {
      this.isOledVoidActive = true;
      this.stop(); // Cancels requestAnimationFrame loop
      this.renderer.clear();
      if (this.onTelemetry) {
        this.onTelemetry({
          fps: 0,
          pixelRatio: this.currentDpr,
          qualityScale: 1.0,
          activeInstances: 0,
          drawCalls: 0,
          triangles: 0,
          geometries: 0,
          textures: 0,
          sceneId: 'oled-void',
          isOledVoid: true,
        });
      }
      return;
    }

    // 3. Resume from OLED Void if previously active
    if (this.isOledVoidActive) {
      this.isOledVoidActive = false;
      this.start();
    }

    // 4. Lazy asynchronous scene load
    const loader = SCENE_LOADERS[id];
    if (!loader) return;

    try {
      const SceneClass = await loader();

      // Race-condition guard: check if user switched scenes while downloading
      if (this.loadSequence !== currentSeq) {
        return;
      }

      const nextScene = new SceneClass();
      nextScene.init(this.renderer);
      nextScene.resize(this.width, this.height);
      nextScene.setQuality(this.qualityScale);
      this.activeScene = nextScene;

      // 5. Rewire passes & per-scene exposure/bloom
      this.renderPass.scene = nextScene.scene;
      this.renderPass.camera = nextScene.camera;
      this.renderer.toneMappingExposure = nextScene.exposure;
      this.applyPostFXUniforms();

      // Reset clock delta for smooth scene arrival
      this.clock.getDelta();

      // Ensure animation loop is running
      if (this.animFrameId === null) {
        this.start();
      }
    } catch (err) {
      console.error(`Failed to lazily load spatial scene '${id}':`, err);
    }
  }

  public updatePostFX(partial: Partial<PostFXSettings>): void {
    this.postFX = { ...this.postFX, ...partial };
    this.applyPostFXUniforms();

    if (partial.dynamicResolution === false) {
      this.setAdaptiveScale(this.nativeDpr, 1.0);
    }
  }

  private applyPostFXUniforms(): void {
    if (this.activeScene) {
      const preset = this.activeScene.bloomPreset;
      this.bloomPass.strength = preset.strength * this.postFX.bloomMultiplier;
      this.bloomPass.radius = preset.radius;
      this.bloomPass.threshold = preset.threshold;
    }
    this.cinematicPass.uniforms.uGrainAmount.value = this.postFX.filmGrain;
    this.cinematicPass.uniforms.uAberration.value = this.postFX.chromaticAberration;
  }

  private setAdaptiveScale(newDpr: number, newQuality: number): void {
    const dprChanged = Math.abs(newDpr - this.currentDpr) > 0.02;
    const qualityChanged = Math.abs(newQuality - this.qualityScale) > 0.02;

    if (dprChanged) {
      this.currentDpr = newDpr;
      this.renderer.setPixelRatio(this.currentDpr);
      this.composer.setPixelRatio(this.currentDpr);
      this.composer.setSize(this.width, this.height);
      this.bloomPass.setSize(Math.floor(this.width * 0.5), Math.floor(this.height * 0.5));
      this.smaaPass.setSize(
        Math.floor(this.width * this.currentDpr),
        Math.floor(this.height * this.currentDpr)
      );
    }

    if (qualityChanged) {
      this.qualityScale = newQuality;
      this.activeScene?.setQuality(this.qualityScale);
    }
  }

  private runPerformanceGovernor(now: number): void {
    this.frameCounter++;
    const dtMs = now - this.lastFpsSample;
    if (dtMs < 1000) return; // Strict 1 Hz throttling

    this.currentFps = Math.round((this.frameCounter * 1000) / dtMs);
    this.frameCounter = 0;
    this.lastFpsSample = now;

    if (this.postFX.dynamicResolution && !this.isOledVoidActive) {
      if (this.currentFps < 45) {
        this.highFpsStreak = 0;
        const nextDpr = Math.max(0.65, Number((this.currentDpr - 0.15).toFixed(2)));
        const nextQuality = Math.max(0.38, Number((this.qualityScale - 0.15).toFixed(2)));
        this.setAdaptiveScale(nextDpr, nextQuality);
      } else if (this.currentFps >= 57) {
        this.highFpsStreak++;
        if (this.highFpsStreak >= 3) {
          this.highFpsStreak = 0;
          const nextDpr = Math.min(this.nativeDpr, Number((this.currentDpr + 0.1).toFixed(2)));
          const nextQuality = Math.min(1.0, Number((this.qualityScale + 0.1).toFixed(2)));
          this.setAdaptiveScale(nextDpr, nextQuality);
        }
      } else {
        this.highFpsStreak = 0;
      }
    }

    if (this.onTelemetry && this.activeScene) {
      const info = this.renderer.info;
      this.onTelemetry({
        fps: this.currentFps,
        pixelRatio: this.currentDpr,
        qualityScale: this.qualityScale,
        activeInstances: this.activeScene.getActiveInstanceCount(),
        drawCalls: info.render.calls,
        triangles: info.render.triangles,
        geometries: info.memory.geometries,
        textures: info.memory.textures,
        sceneId: this.activeScene.id,
        isOledVoid: false,
      });
    }
  }

  private tick = (timestamp?: number): void => {
    if (this.isOledVoidActive) return;

    this.animFrameId = requestAnimationFrame(this.tick);
    if (this.isPaused || !this.activeScene) return;

    const now = timestamp || performance.now();

    // Frame-rate throttle according to active power profile
    if (this.targetFrameInterval > 0) {
      const elapsedSinceLastRender = now - this.lastRenderTimestamp;
      if (elapsedSinceLastRender < this.targetFrameInterval - 1.2) {
        return;
      }
    }
    this.lastRenderTimestamp = now;

    const delta = Math.min(this.clock.getDelta(), 0.05);
    this.elapsed += delta;

    this.activeScene.update(delta, this.elapsed, this.pointer);

    // Direct render bypass for full-screen GLSL scenes (saves 4-6 full-screen passes)
    if (this.activeScene.isFullScreenShader) {
      this.renderer.render(this.activeScene.scene, this.activeScene.camera);
    } else {
      this.cinematicPass.uniforms.uTime.value = this.elapsed;
      this.composer.render();
    }

    this.runPerformanceGovernor(now);
  };

  public start(): void {
    if (this.isOledVoidActive || this.animFrameId !== null) return;
    this.clock.start();
    this.lastFpsSample = performance.now();
    this.frameCounter = 0;
    this.tick();
  }

  public stop(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  public setPaused(paused: boolean): void {
    this.isPaused = paused;
    if (!paused && !this.isOledVoidActive) {
      this.clock.getDelta();
      this.lastFpsSample = performance.now();
      this.frameCounter = 0;
    }
  }

  private handleResize = (): void => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.nativeDpr = Math.min(window.devicePixelRatio || 1, 2);
    this.currentDpr = Math.min(this.currentDpr, this.nativeDpr);

    this.renderer.setPixelRatio(this.currentDpr);
    this.renderer.setSize(this.width, this.height, false);

    this.composer.setPixelRatio(this.currentDpr);
    this.composer.setSize(this.width, this.height);
    this.bloomPass.setSize(Math.floor(this.width * 0.5), Math.floor(this.height * 0.5));
    this.smaaPass.setSize(
      Math.floor(this.width * this.currentDpr),
      Math.floor(this.height * this.currentDpr)
    );

    this.activeScene?.resize(this.width, this.height);
  };

  private handlePointerMove = (e: PointerEvent): void => {
    this.pointer.x = (e.clientX / Math.max(1, window.innerWidth)) * 2 - 1;
    this.pointer.y = -(e.clientY / Math.max(1, window.innerHeight)) * 2 + 1;
  };

  private handleVisibilityChange = (): void => {
    if (document.hidden) {
      this.setPaused(true);
    } else {
      this.setPaused(false);
    }
  };

  public destroy(): void {
    this.stop();

    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('pointermove', this.handlePointerMove);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);

    if (this.activeScene) {
      this.activeScene.dispose();
      this.activeScene = null;
    }

    this.bloomPass.dispose();
    this.cinematicPass.dispose();
    this.outputPass.dispose();
    this.smaaPass.dispose();
    this.composer.dispose();
    this.renderer.renderLists.dispose();
    this.renderer.dispose();
  }
}
