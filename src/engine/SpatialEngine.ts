import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';

import { CinematicPostShader } from './shaders/CinematicPostShader';
import { FluidDataScene } from './scenes/FluidDataScene';
import { VolumetricMegacityScene } from './scenes/VolumetricMegacityScene';
import { EventHorizonScene } from './scenes/EventHorizonScene';
import { CarinaNebulaScene } from './scenes/CarinaNebulaScene';
import { BinaryPulsarScene } from './scenes/BinaryPulsarScene';
import { SaturnianOrbitScene } from './scenes/SaturnianOrbitScene';
import { DeepVoidDriftScene } from './scenes/DeepVoidDriftScene';
import { MidnightCruiseScene } from './scenes/MidnightCruiseScene';
import { MoonlitShoreScene } from './scenes/MoonlitShoreScene';
import { ArcticAuroraScene } from './scenes/ArcticAuroraScene';
import { NocturneGlassScene } from './scenes/NocturneGlassScene';
import { AbyssalDriftScene } from './scenes/AbyssalDriftScene';
import {
  ISpatialScene,
  SpatialSceneId,
  EngineTelemetry,
  PostFXSettings,
} from './types';

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
    this.renderer.toneMappingExposure = 1.08;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // 2. Reusable EffectComposer Pipeline
    this.composer = new EffectComposer(this.renderer);
    this.composer.setPixelRatio(this.currentDpr);
    this.composer.setSize(this.width, this.height);

    const bootScene = new THREE.Scene();
    const bootCam = new THREE.PerspectiveCamera(50, this.width / this.height, 0.1, 100);

    // Pass 1: Base Scene Render
    this.renderPass = new RenderPass(bootScene, bootCam);
    this.composer.addPass(this.renderPass);

    // Pass 2: Localized UnrealBloomPass
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(this.width, this.height),
      1.1,
      0.65,
      0.32
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

    // Initialize initial scene or OLED Void
    this.loadScene(initialScene);
  }

  private instantiateScene(id: SpatialSceneId): ISpatialScene | null {
    switch (id) {
      case 'fluid-data':
        return new FluidDataScene();
      case 'volumetric-megacity':
        return new VolumetricMegacityScene();
      case 'event-horizon':
        return new EventHorizonScene();
      case 'carina-nebula':
        return new CarinaNebulaScene();
      case 'binary-pulsar':
        return new BinaryPulsarScene();
      case 'saturnian-orbit':
        return new SaturnianOrbitScene();
      case 'deep-void-drift':
        return new DeepVoidDriftScene();
      case 'midnight-cruise':
        return new MidnightCruiseScene();
      case 'moonlit-shore':
        return new MoonlitShoreScene();
      case 'arctic-aurora':
        return new ArcticAuroraScene();
      case 'nocturne-glass':
        return new NocturneGlassScene();
      case 'abyssal-drift':
        return new AbyssalDriftScene();
      case 'oled-void':
        return null;
      default:
        return new FluidDataScene();
    }
  }

  /**
   * Switches scenes with strict WebGL garbage collection:
   * Completely disposes geometries, materials, textures, and flushes renderer lists.
   * If switching to 'oled-void', completely tears down WebGL processing for 0% GPU.
   */
  public loadScene(id: SpatialSceneId): void {
    this.activeSceneId = id;

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

    // 3. Resume from OLED Void if active
    if (this.isOledVoidActive) {
      this.isOledVoidActive = false;
      this.start();
    }

    // 4. Instantiate and initialize new WebGL spatial scene
    const nextScene = this.instantiateScene(id);
    if (!nextScene) return;

    nextScene.init(this.renderer);
    nextScene.resize(this.width, this.height);
    nextScene.setQuality(this.qualityScale);
    this.activeScene = nextScene;

    // 5. Rewire EffectComposer passes & per-scene color grading / bloom tuning
    this.renderPass.scene = nextScene.scene;
    this.renderPass.camera = nextScene.camera;
    this.renderer.toneMappingExposure = nextScene.exposure;
    this.applyPostFXUniforms();

    // Reset clock delta for smooth scene arrival
    this.clock.getDelta();

    // Ensure loop is running
    if (this.animFrameId === null) {
      this.start();
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
    if (dtMs < 1000) return;

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

  private tick = (): void => {
    if (this.isOledVoidActive) return;

    this.animFrameId = requestAnimationFrame(this.tick);
    if (this.isPaused || !this.activeScene) return;

    const delta = Math.min(this.clock.getDelta(), 0.05);
    this.elapsed += delta;

    this.activeScene.update(delta, this.elapsed, this.pointer);
    this.cinematicPass.uniforms.uTime.value = this.elapsed;

    this.composer.render();
    this.runPerformanceGovernor(performance.now());
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
    this.bloomPass.setSize(this.width, this.height);
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
