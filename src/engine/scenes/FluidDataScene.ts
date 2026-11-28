import * as THREE from 'three';
import { ISpatialScene, BloomPreset } from '../types';
import { GLSL_DITHER, GLSL_HASH, GLSL_TONEMAP_SHOULDER } from '../shaders/common';

const FLUID_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`;

const FLUID_FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform vec2 uOledDrift;
  uniform float uQuality;
  varying vec2 vUv;

  ${GLSL_DITHER}
  ${GLSL_HASH}
  ${GLSL_TONEMAP_SHOULDER}

  // 2D Value Noise & Fractional Brownian Motion
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash21(i + vec2(0.0, 0.0)), hash21(i + vec2(1.0, 0.0)), f.x),
      mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  // Multi-octave domain warping for liquid silk
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(cos(0.52), sin(0.52), -sin(0.52), cos(0.52));
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = rot * p * 2.05 + vec2(1.35, 2.45);
      a *= 0.48;
    }
    return v;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / min(uResolution.x, uResolution.y);

    // Subtle pointer interaction and continuous slow 10-minute OLED anti-burn-in drift
    vec2 p = uv * 2.4 + uOledDrift + uPointer * 0.12;
    float t = uTime * 0.065;

    // Multi-octave domain warping: Layer 1
    vec2 q = vec2(
      fbm(p + vec2(0.0, 0.0) + vec2(t * 0.5, t * 0.4)),
      fbm(p + vec2(5.2, 1.3) + vec2(-t * 0.35, t * 0.45))
    );

    // Multi-octave domain warping: Layer 2 (Flow Ribbon Fold)
    vec2 r = vec2(
      fbm(p + 3.8 * q + vec2(1.7, 9.2) + vec2(t * 0.3, -t * 0.25)),
      fbm(p + 3.8 * q + vec2(8.3, 2.8) + vec2(-t * 0.22, t * 0.35))
    );

    // High-frequency silky caustic field
    float f = fbm(p + 3.5 * r + vec2(sin(t * 0.8) * 0.2, cos(t * 0.6) * 0.2));

    // Folding silk ribbon contours
    float ribbon = pow(clamp(f * 1.8 - 0.35, 0.0, 1.0), 2.2);
    float secondaryRibbon = pow(clamp(length(q) * 1.3 - 0.4, 0.0, 1.0), 2.8);

    // Hairline caustic light edges along fold crests
    float causticWave = abs(sin((f + r.x * 0.8) * 6.28318));
    float causticEdge = pow(max(0.0, 1.0 - causticWave), 18.0) * smoothstep(0.2, 0.8, ribbon);

    // Translucent silk palette
    // 1. Deep sapphire base (#0a2e8c)
    vec3 sapphire = vec3(0.039, 0.180, 0.549);
    // 2. Bioluminescent cyan highlights (#08b6d4)
    vec3 cyan = vec3(0.031, 0.714, 0.831);
    // 3. Royal violet interior body (#6d28d9)
    vec3 violet = vec3(0.427, 0.157, 0.851);
    // 4. Hairline warm gold caustic rim (#d99b26)
    vec3 gold = vec3(0.851, 0.608, 0.149);

    // Smooth volumetric blend through silk layers
    vec3 silkColor = mix(sapphire, violet, clamp(r.x * 1.6, 0.0, 1.0));
    silkColor = mix(silkColor, cyan, clamp(r.y * r.y * 1.4, 0.0, 1.0));

    // Combine ribbons with delicate gold caustics
    vec3 finalColor = silkColor * (ribbon * 0.75 + secondaryRibbon * 0.45);
    finalColor += gold * causticEdge * 0.85;

    // Smooth vignette towards screen perimeter to maintain pitch-black (#000000) OLED edges
    vec2 screenUV = gl_FragCoord.xy / uResolution.xy;
    vec2 vigUV = screenUV - 0.5;
    float vignette = clamp(1.0 - dot(vigUV, vigUV) * 1.8, 0.0, 1.0);
    finalColor *= vignette;

    // Soft HDR shoulder compression to prevent chalky white blowouts
    finalColor = softHdrShoulder(finalColor, 0.45);

    // Dither against 8-bit banding
    finalColor += screenDither(gl_FragCoord.xy);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export class FluidDataScene implements ISpatialScene {
  public readonly id = 'fluid-data' as const;
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  public readonly isFullScreenShader = true;
  public readonly bloomPreset: BloomPreset = {
    strength: 0.28,
    radius: 0.45,
    threshold: 0.90,
  };
  public readonly exposure = 0.76;

  private quadMesh: THREE.Mesh | null = null;
  private quadGeo: THREE.PlaneGeometry | null = null;
  private fluidMat: THREE.ShaderMaterial | null = null;
  private smoothPointer = new THREE.Vector2();
  private qualityScale = 1.0;
  private oledDrift = new THREE.Vector2();

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000); // True pitch black for OLED
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 0, 1);
  }

  public init(renderer: THREE.WebGLRenderer): void {
    const size = renderer.getDrawingBufferSize(new THREE.Vector2());

    this.quadGeo = new THREE.PlaneGeometry(2, 2);
    this.fluidMat = new THREE.ShaderMaterial({
      vertexShader: FLUID_VERTEX_SHADER,
      fragmentShader: FLUID_FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(size.x, size.y) },
        uPointer: { value: new THREE.Vector2(0, 0) },
        uOledDrift: { value: new THREE.Vector2(0, 0) },
        uQuality: { value: 1.0 },
      },
      depthWrite: false,
      depthTest: false,
    });

    this.quadMesh = new THREE.Mesh(this.quadGeo, this.fluidMat);
    this.quadMesh.frustumCulled = false;
    this.scene.add(this.quadMesh);
  }

  public update(delta: number, elapsed: number, pointer: THREE.Vector2): void {
    this.smoothPointer.lerp(pointer, Math.min(1, delta * 2.5));

    // Slow 10-minute anti-burn-in Lissajous orbit (drift radius ~ 0.45)
    const oledT = elapsed * 0.0105;
    this.oledDrift.set(
      Math.sin(oledT * 3.0) * 0.42 + Math.cos(oledT * 1.5) * 0.15,
      Math.cos(oledT * 2.0) * 0.38 + Math.sin(oledT * 4.0) * 0.12
    );

    if (this.fluidMat) {
      this.fluidMat.uniforms.uTime.value = elapsed;
      this.fluidMat.uniforms.uPointer.value.copy(this.smoothPointer);
      this.fluidMat.uniforms.uOledDrift.value.copy(this.oledDrift);
      this.fluidMat.uniforms.uQuality.value = this.qualityScale;
    }
  }

  public resize(width: number, height: number, dpr = 1): void {
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();

    if (this.fluidMat) {
      this.fluidMat.uniforms.uResolution.value.set(
        Math.max(1, Math.floor(width * dpr)),
        Math.max(1, Math.floor(height * dpr))
      );
    }
  }

  public setQuality(scale: number): void {
    this.qualityScale = Math.max(0.4, Math.min(1.0, scale));
    if (this.fluidMat) {
      this.fluidMat.uniforms.uQuality.value = this.qualityScale;
    }
  }

  public getActiveInstanceCount(): number {
    return 1;
  }

  public dispose(): void {
    if (this.quadMesh) {
      this.scene.remove(this.quadMesh);
      this.quadMesh = null;
    }
    if (this.quadGeo) {
      this.quadGeo.dispose();
      this.quadGeo = null;
    }
    if (this.fluidMat) {
      this.fluidMat.dispose();
      this.fluidMat = null;
    }
    this.scene.clear();
  }
}
