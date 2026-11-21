import * as THREE from 'three';
import { ISpatialScene, BloomPreset } from '../types';

const STAR_COUNT = 32_000;
const NEBULA_SLAB_COUNT = 24;

const STARFIELD_VERTEX_SHADER = /* glsl */ `
  attribute vec3 aColor;
  attribute float aSize;
  attribute float aTwinkleSpeed;
  attribute float aPhase;

  uniform float uTime;
  uniform float uPixelRatio;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 pos = position;

    // Subtle twinkling luminosity modulation
    float twinkle = 0.65 + 0.35 * sin(uTime * aTwinkleSpeed + aPhase * 6.28318);
    float flare = pow(0.5 + 0.5 * sin(uTime * aTwinkleSpeed * 1.5 + aPhase), 8.0);

    vColor = aColor * (1.0 + flare * 1.6);
    vAlpha = (0.55 + 0.45 * twinkle);

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;
    gl_PointSize = clamp(aSize * uPixelRatio * (280.0 / -mvPos.z) * (0.8 + 0.4 * flare), 1.0, 7.0);
  }
`;

const STARFIELD_FRAGMENT_SHADER = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 p = gl_PointCoord * 2.0 - 1.0;
    float d = dot(p, p);
    if (d > 1.0) discard;
    float core = exp(-d * 4.0);
    gl_FragColor = vec4(vColor, core * vAlpha);
  }
`;

const NEBULA_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const NEBULA_FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform float uLayerIndex;
  uniform vec3 uColorA; // Deep Indigo
  uniform vec3 uColorB; // Cosmic Teal
  uniform vec3 uColorC; // Warm Amber Gold

  varying vec2 vUv;
  varying vec3 vWorldPos;

  // 3D Simplex-inspired hash noise
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
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }

  float fbm(vec3 p) {
    float total = 0.0;
    float amp = 0.52;
    for (int i = 0; i < 4; i++) {
      total += amp * snoise(p);
      p = p * 2.05 + vec3(4.2, -7.1, 11.3);
      amp *= 0.5;
    }
    return total;
  }

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float dist = length(p);
    float softEdge = smoothstep(1.0, 0.15, dist);

    // Multi-scale 3D FBM sample through the interstellar dust volume
    vec3 samplePos = vWorldPos * 0.045 + vec3(uTime * 0.015, -uTime * 0.01, uLayerIndex * 0.42);
    float n1 = fbm(samplePos);
    float n2 = fbm(samplePos * 1.8 + vec3(9.2, -3.4, uTime * 0.02));

    float density = smoothstep(-0.25, 0.65, n1 + n2 * 0.45) * softEdge;

    // Color grading: Deep Indigo -> Cosmic Teal -> Warm Amber Gold
    float heat = clamp(n1 * 0.85 + n2 * 0.55 + 0.35, 0.0, 1.0);
    vec3 col = mix(uColorA, uColorB, smoothstep(0.1, 0.55, heat));
    col = mix(col, uColorC, smoothstep(0.55, 0.95, heat));

    // Localized energetic core boost
    float coreSparkle = pow(clamp(heat, 0.0, 1.0), 3.0);
    col += uColorC * coreSparkle * 0.65;

    float alpha = density * 0.28;
    if (alpha < 0.003) discard;

    gl_FragColor = vec4(col, alpha);
  }
`;

export class CarinaNebulaScene implements ISpatialScene {
  public readonly id = 'carina-nebula' as const;
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  public readonly bloomPreset: BloomPreset = {
    strength: 0.92,
    radius: 0.65,
    threshold: 0.48,
  };
  public readonly exposure = 1.06;

  private starPoints: THREE.Points | null = null;
  private starGeo: THREE.BufferGeometry | null = null;
  private starMat: THREE.ShaderMaterial | null = null;

  private nebulaPlanes: THREE.Mesh[] = [];
  private nebulaGeos: THREE.PlaneGeometry[] = [];
  private nebulaMats: THREE.ShaderMaterial[] = [];

  private smoothPointer = new THREE.Vector2();
  private activeStarCount = STAR_COUNT;
  private cameraZ = 30;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x02030a);
    this.camera = new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 0.1, 350);
    this.camera.position.set(0, 0, 30);
  }

  public init(renderer: THREE.WebGLRenderer): void {
    // 1. Starfield: 32,000 instanced stars with astrophysical spectral colors
    this.starGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(STAR_COUNT * 3);
    const colors = new Float32Array(STAR_COUNT * 3);
    const sizes = new Float32Array(STAR_COUNT);
    const twinkleSpeeds = new Float32Array(STAR_COUNT);
    const phases = new Float32Array(STAR_COUNT);

    const spectralPalette = [
      new THREE.Color(0x93c5fd), // O/B-type blue-white
      new THREE.Color(0xbfdbfe), // B-type light blue
      new THREE.Color(0xffffff), // A-type pure white
      new THREE.Color(0xfef08a), // G-type solar gold
      new THREE.Color(0xfb923c), // K-type orange
      new THREE.Color(0xf87171), // M-type red dwarf
    ];

    for (let i = 0; i < STAR_COUNT; i++) {
      // Cylinder distribution along travel path Z: -120 to +180
      const radius = 8 + Math.pow(Math.random(), 0.8) * 85;
      const theta = Math.random() * Math.PI * 2;
      positions[i * 3 + 0] = Math.cos(theta) * radius;
      positions[i * 3 + 1] = Math.sin(theta) * radius;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 260;

      const pick = spectralPalette[Math.floor(Math.random() * spectralPalette.length)];
      colors[i * 3 + 0] = pick.r;
      colors[i * 3 + 1] = pick.g;
      colors[i * 3 + 2] = pick.b;

      sizes[i] = 0.8 + Math.random() * 2.4;
      twinkleSpeeds[i] = 0.8 + Math.random() * 2.5;
      phases[i] = Math.random();
    }

    this.starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.starGeo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    this.starGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    this.starGeo.setAttribute('aTwinkleSpeed', new THREE.BufferAttribute(twinkleSpeeds, 1));
    this.starGeo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

    this.starMat = new THREE.ShaderMaterial({
      vertexShader: STARFIELD_VERTEX_SHADER,
      fragmentShader: STARFIELD_FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.starPoints = new THREE.Points(this.starGeo, this.starMat);
    this.starPoints.frustumCulled = false;
    this.scene.add(this.starPoints);

    // 2. Multi-Layer Volumetric Nebula Planes (FBM deep space dust slabs)
    const colorA = new THREE.Color(0x1e1b4b); // Deep Indigo
    const colorB = new THREE.Color(0x0d9488); // Cosmic Teal
    const colorC = new THREE.Color(0xf59e0b); // Warm Amber Gold

    for (let i = 0; i < NEBULA_SLAB_COUNT; i++) {
      const w = 70 + (i % 4) * 15;
      const h = 55 + (i % 3) * 12;
      const geo = new THREE.PlaneGeometry(w, h);
      this.nebulaGeos.push(geo);

      const mat = new THREE.ShaderMaterial({
        vertexShader: NEBULA_VERTEX_SHADER,
        fragmentShader: NEBULA_FRAGMENT_SHADER,
        uniforms: {
          uTime: { value: 0 },
          uLayerIndex: { value: i },
          uColorA: { value: colorA },
          uColorB: { value: colorB },
          uColorC: { value: colorC },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });
      this.nebulaMats.push(mat);

      const plane = new THREE.Mesh(geo, mat);
      const angle = (i / NEBULA_SLAB_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const radialOffset = 14 + Math.random() * 22;
      plane.position.set(
        Math.cos(angle) * radialOffset,
        Math.sin(angle) * radialOffset * 0.75,
        -110 + i * 11
      );
      plane.rotation.z = Math.random() * Math.PI;

      this.nebulaPlanes.push(plane);
      this.scene.add(plane);
    }
  }

  public update(delta: number, elapsed: number, pointer: THREE.Vector2): void {
    this.smoothPointer.lerp(pointer, Math.min(1, delta * 2.5));

    // Organic weightless cinematic drift through nebula corridor with multi-harmonic roll
    this.cameraZ -= delta * 2.8;
    if (this.cameraZ < -80) {
      this.cameraZ += 180;
    }

    const roll =
      Math.sin(elapsed * 0.08) * 0.05 +
      Math.cos(elapsed * 0.035 + 1.2) * 0.025 +
      this.smoothPointer.x * 0.05;
    const swayX =
      Math.sin(elapsed * 0.14) * 4.2 +
      Math.sin(elapsed * 0.055 + 2.1) * 1.6 +
      this.smoothPointer.x * 3.5;
    const swayY =
      Math.cos(elapsed * 0.11) * 2.8 +
      Math.sin(elapsed * 0.042 + 0.8) * 1.3 +
      this.smoothPointer.y * 2.5;

    this.camera.position.set(swayX, swayY, this.cameraZ);
    this.camera.rotation.z = roll;
    this.camera.lookAt(swayX * 0.35, swayY * 0.35, this.cameraZ - 40);

    // Update shaders
    if (this.starMat) {
      this.starMat.uniforms.uTime.value = elapsed;
    }

    for (let i = 0; i < this.nebulaMats.length; i++) {
      this.nebulaMats[i].uniforms.uTime.value = elapsed;
      const plane = this.nebulaPlanes[i];
      // Recycle nebula slabs that fall behind camera
      if (plane.position.z > this.camera.position.z + 20) {
        plane.position.z -= NEBULA_SLAB_COUNT * 11;
      }
    }
  }

  public resize(width: number, height: number): void {
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();
  }

  public setQuality(scale: number): void {
    const clamped = Math.max(0.35, Math.min(1.0, scale));
    this.activeStarCount = Math.floor(STAR_COUNT * clamped);
    if (this.starGeo) {
      this.starGeo.setDrawRange(0, this.activeStarCount);
    }
  }

  public getActiveInstanceCount(): number {
    return this.activeStarCount + NEBULA_SLAB_COUNT;
  }

  public dispose(): void {
    if (this.starPoints) {
      this.scene.remove(this.starPoints);
      this.starPoints = null;
    }
    if (this.starGeo) {
      this.starGeo.dispose();
      this.starGeo = null;
    }
    if (this.starMat) {
      this.starMat.dispose();
      this.starMat = null;
    }

    this.nebulaPlanes.forEach((p) => this.scene.remove(p));
    this.nebulaGeos.forEach((g) => g.dispose());
    this.nebulaMats.forEach((m) => m.dispose());

    this.nebulaPlanes = [];
    this.nebulaGeos = [];
    this.nebulaMats = [];

    this.scene.clear();
  }
}
