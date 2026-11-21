import * as THREE from 'three';
import { ISpatialScene, BloomPreset } from '../types';

const MAX_INSTANCES = 110_000;

const FLUID_VERTEX_SHADER = /* glsl */ `
  attribute vec4 aSeed;     // xyz: base flow coordinate, w: personal phase
  attribute vec2 aStream;   // x: filament band [0..1], y: scale jitter

  uniform float uTime;
  uniform vec2 uOledDrift;
  uniform vec2 uPointer;

  varying vec3 vColor;
  varying float vIntensity;
  varying float vDepth;

  // --- Ashima 3D Simplex Noise ---
  vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;

    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 1.0 / 7.0;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  // Divergence-free 3D Curl Noise via finite differences on 3 offset potential fields
  vec3 curlNoise(vec3 p) {
    const float e = 0.08;
    vec3 dx = vec3(e, 0.0, 0.0);
    vec3 dy = vec3(0.0, e, 0.0);
    vec3 dz = vec3(0.0, 0.0, e);

    float p_x0 = snoise(p - dx);
    float p_x1 = snoise(p + dx);
    float p_y0 = snoise(p - dy);
    float p_y1 = snoise(p + dy);
    float p_z0 = snoise(p - dz);
    float p_z1 = snoise(p + dz);

    float x = p_y1 - p_y0 - p_z1 + p_z0;
    float y = p_z1 - p_z0 - p_x1 + p_x0;
    float z = p_x1 - p_x0 - p_y1 + p_y0;

    return normalize(vec3(x, y, z) + 1e-5);
  }

  void main() {
    float slowT = uTime * 0.16;
    float phase = aSeed.w;

    // Base fiber-optic ribbon flow along helical torus-manifold
    float angle = aSeed.x + slowT * (0.45 + aStream.x * 0.35);
    float ringR = 5.4 + aSeed.y * 2.8 + sin(angle * 2.0 + slowT) * 0.9;
    float tubeAngle = aSeed.z + slowT * 0.7 + aStream.x * 6.28318;
    float tubeR = 1.65 + sin(phase * 6.28318 + slowT * 1.4) * 0.9;

    vec3 basePos = vec3(
      (ringR + tubeR * cos(tubeAngle)) * cos(angle),
      tubeR * sin(tubeAngle) * 1.35 + sin(angle * 3.0 - slowT) * 1.1,
      (ringR + tubeR * cos(tubeAngle)) * sin(angle)
    );

    // Advect along GPU 3D Curl Noise field for organic bioluminescent fluid streams
    vec3 flowSample = basePos * 0.22 + vec3(slowT * 0.45, -slowT * 0.3, slowT * 0.25);
    vec3 curl1 = curlNoise(flowSample);
    vec3 curl2 = curlNoise(flowSample * 1.85 + vec3(11.3, 4.7, -7.1) - slowT * 0.35);

    vec3 displaced = basePos + curl1 * 2.45 + curl2 * 1.05;

    // Gentle magnetic repulsion/attraction around user pointer
    vec3 pointerWorld = vec3(uPointer.x * 9.0, uPointer.y * 5.0, 2.0);
    vec3 toPtr = displaced - pointerWorld;
    float ptrDist = length(toPtr);
    displaced += normalize(toPtr + 1e-4) * exp(-ptrDist * 0.28) * 1.45;

    // 10-minute OLED Burn-In Prevention Orbital Drift
    displaced.xy += uOledDrift;

    // Fiber-optic pulse travelling along stream filaments
    float pulse = 0.5 + 0.5 * sin(phase * 18.0 - uTime * 1.65 + aStream.x * 12.0);
    float sparkle = pow(pulse, 4.0);

    // Scale instanced micro-sphere subtly with fluid pulse
    float particleScale = (0.45 + aStream.y * 0.72) * (0.72 + sparkle * 0.85);

    // Color ramp: Deep Cyan -> Electric Violet -> Molten Gold
    vec3 deepCyan = vec3(0.0, 0.88, 1.0);
    vec3 electricViolet = vec3(0.56, 0.16, 1.0);
    vec3 moltenGold = vec3(1.0, 0.68, 0.1);

    float colorWave = fract(aStream.x + uTime * 0.032 + dot(curl1, vec3(0.25, 0.35, 0.2)) * 0.45);
    vec3 col;
    if (colorWave < 0.42) {
      col = mix(deepCyan, electricViolet, smoothstep(0.0, 0.42, colorWave));
    } else if (colorWave < 0.78) {
      col = mix(electricViolet, moltenGold, smoothstep(0.42, 0.78, colorWave));
    } else {
      col = mix(moltenGold, deepCyan, smoothstep(0.78, 1.0, colorWave));
    }

    // Localized HDR bloom boost strictly on energetic fiber crests (prevents whiteout)
    float hdrGain = 0.38 + sparkle * 1.45;
    vColor = col * hdrGain;
    vIntensity = hdrGain;

    vec3 transformed = position * particleScale + displaced;
    vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
    vDepth = -mvPosition.z;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FLUID_FRAGMENT_SHADER = /* glsl */ `
  varying vec3 vColor;
  varying float vIntensity;
  varying float vDepth;
  varying float vDepth;

  void main() {
    float fogFactor = smoothstep(36.0, 10.0, vDepth);
    vec3 finalCol = vColor * fogFactor;
    gl_FragColor = vec4(finalCol, 1.0);
  }
`;

export class FluidDataScene implements ISpatialScene {
  public readonly id = 'fluid-data' as const;
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  public readonly bloomPreset: BloomPreset = {
    strength: 0.88,
    radius: 0.52,
    threshold: 0.58,
  };
  public readonly exposure = 1.02;

  private mesh: THREE.InstancedMesh | null = null;
  private geometry: THREE.BufferGeometry | null = null;
  private material: THREE.ShaderMaterial | null = null;
  private activeCount = MAX_INSTANCES;
  private smoothPointer = new THREE.Vector2();

  constructor() {
    this.scene = new THREE.Scene();
    // Pitch-black pure OLED background
    this.scene.background = new THREE.Color(0x000000);
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 120);
    this.camera.position.set(0, 1.2, 17.5);
  }

  public init(_renderer: THREE.WebGLRenderer): void {
    // Ultra-fine faceted micro-sphere geometry for 110k instanced fiber-optic beads
    const baseGeo = new THREE.OctahedronGeometry(0.022, 0);
    this.geometry = baseGeo;

    const seeds = new Float32Array(MAX_INSTANCES * 4);
    const streams = new Float32Array(MAX_INSTANCES * 2);

    // Group particles into 24 distinct fiber-optic fluid filaments
    const filamentCount = 24;
    for (let i = 0; i < MAX_INSTANCES; i++) {
      const filament = (i % filamentCount) / filamentCount;
      const tAlong = Math.random() * Math.PI * 2;
      const radialSpread = (Math.random() - 0.5) * 1.4;
      const tubeSpread = filament * Math.PI * 2 + (Math.random() - 0.5) * 0.45;

      seeds[i * 4 + 0] = tAlong;
      seeds[i * 4 + 1] = radialSpread;
      seeds[i * 4 + 2] = tubeSpread;
      seeds[i * 4 + 3] = Math.random();

      streams[i * 2 + 0] = filament;
      streams[i * 2 + 1] = Math.random();
    }

    this.geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 4));
    this.geometry.setAttribute('aStream', new THREE.InstancedBufferAttribute(streams, 2));

    this.material = new THREE.ShaderMaterial({
      vertexShader: FLUID_VERTEX_SHADER,
      fragmentShader: FLUID_FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uOledDrift: { value: new THREE.Vector2(0, 0) },
        uPointer: { value: new THREE.Vector2(0, 0) },
      },
      transparent: false,
      depthWrite: true,
      blending: THREE.NormalBlending,
    });

    this.mesh = new THREE.InstancedMesh(this.geometry, this.material, MAX_INSTANCES);
    this.mesh.frustumCulled = false;

    // Identity matrices (all world transforms are computed directly on GPU)
    const identity = new THREE.Matrix4();
    for (let i = 0; i < MAX_INSTANCES; i++) {
      this.mesh.setMatrixAt(i, identity);
    }
    this.mesh.instanceMatrix.needsUpdate = true;

    this.scene.add(this.mesh);
  }

  public update(delta: number, elapsed: number, pointer: THREE.Vector2): void {
    if (!this.material) return;

    this.smoothPointer.lerp(pointer, Math.min(1, delta * 3.5));

    // 10-minute (600s) Lissajous orbital drift for OLED burn-in prevention
    const tenMinCycle = (elapsed / 600.0) * Math.PI * 2;
    const oledX = Math.sin(tenMinCycle) * 3.4;
    const oledY = Math.cos(tenMinCycle * 1.333) * 1.8;

    this.material.uniforms.uTime.value = elapsed;
    this.material.uniforms.uOledDrift.value.set(oledX, oledY);
    this.material.uniforms.uPointer.value.copy(this.smoothPointer);

    // Cinematic multi-harmonic organic camera wander
    const camAngle = elapsed * 0.042;
    const wanderX =
      Math.sin(camAngle) * 3.8 + Math.sin(elapsed * 0.083 + 1.4) * 0.95 + this.smoothPointer.x * 2.2;
    const wanderY =
      Math.cos(camAngle * 0.7) * 1.8 + Math.sin(elapsed * 0.061 + 2.7) * 0.85 + this.smoothPointer.y * 1.5;
    const wanderZ = 16.8 + Math.sin(elapsed * 0.078) * 1.4 + Math.cos(elapsed * 0.035) * 0.8;

    this.camera.position.set(wanderX, wanderY, wanderZ);
    this.camera.lookAt(oledX * 0.35, oledY * 0.35, 0);
    this.camera.rotation.z = Math.sin(elapsed * 0.027) * 0.025;
  }

  public resize(width: number, height: number): void {
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();
  }

  public setQuality(scale: number): void {
    const clamped = Math.max(0.32, Math.min(1.0, scale));
    this.activeCount = Math.floor(MAX_INSTANCES * clamped);
    if (this.mesh) {
      this.mesh.count = this.activeCount;
    }
  }

  public getActiveInstanceCount(): number {
    return this.activeCount;
  }

  public dispose(): void {
    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.dispose();
      this.mesh = null;
    }
    if (this.geometry) {
      this.geometry.dispose();
      this.geometry = null;
    }
    if (this.material) {
      this.material.dispose();
      this.material = null;
    }
    this.scene.clear();
  }
}
