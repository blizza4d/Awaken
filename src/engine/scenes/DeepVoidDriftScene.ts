import * as THREE from 'three';
import { ISpatialScene, BloomPreset } from '../types';
import { GLSL_DITHER } from '../shaders/common';

const SPARSE_STAR_COUNT = 850;

// Custom GLSL for sparse, pinpoint stars with distance-based fade in/out
const SPARSE_STAR_VERT = /* glsl */ `
  attribute vec3 aColor;
  attribute float aBaseSize;
  attribute float aPhase;
  attribute float aParallaxSpeed;

  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec3 uCamPos;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 worldPos = position;

    // Relative distance vector from camera
    vec3 rel = worldPos - uCamPos;

    // Continuous depth wrap so stars infinitely drift through deep void without popping
    float zSpan = 450.0;
    float zRel = mod(rel.z + zSpan * 0.5, zSpan) - zSpan * 0.5;
    worldPos.z = uCamPos.z + zRel;

    // Organic slow twinkle
    float twinkle = 0.82 + 0.18 * sin(uTime * 0.55 + aPhase * 6.28318);

    // Smoothstep fade out before clipping camera near-plane (near threshold ~ 14.0)
    // Smoothstep fade in at distant boundary (far threshold ~ 340.0)
    float distZ = -zRel;
    float nearFade = smoothstep(12.0, 48.0, distZ);
    float farFade = smoothstep(360.0, 180.0, distZ);
    float fade = nearFade * farFade;

    vColor = aColor;
    vAlpha = fade * twinkle * 0.78;

    vec4 mvPosition = modelViewMatrix * vec4(worldPos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Attenuated point size with maximum cap to preserve crisp pinpoint aesthetic
    float size = aBaseSize * (120.0 / -mvPosition.z) * uPixelRatio;
    gl_PointSize = clamp(size, 1.0, 3.8);
  }
`;

const SPARSE_STAR_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec2 p = gl_PointCoord - 0.5;
    float d2 = dot(p, p);
    if (d2 > 0.25) discard;

    // Soft Gaussian pinpoint falloff with incandescent core
    float core = exp(-d2 * 28.0);
    float halo = exp(-d2 * 9.0) * 0.35;
    float intensity = core + halo;

    gl_FragColor = vec4(vColor * (0.85 + core * 0.35), vAlpha * intensity);
  }
`;

// Subtle deep-space cosmic dust gradient shader
const VOID_DUST_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`;

const VOID_DUST_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec2 uResolution;
  varying vec2 vUv;

  // 2D Hash & Value Noise
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 3; i++) {
      v += a * noise(p);
      p = p * 2.1 + vec2(1.4, 2.7);
      a *= 0.5;
    }
    return v;
  }

  float screenDither(vec2 fc) {
    return fract(sin(dot(fc, vec2(12.9898, 78.233))) * 43758.5453) * 0.0039;
  }

  void main() {
    vec2 uv = vUv;
    vec2 centered = uv - 0.5;

    // Barely perceptible deep-space dust gradient (mostly #010205)
    float dust = fbm(uv * 3.8 + vec2(uTime * 0.003, uTime * 0.002));
    float vignette = 1.0 - dot(centered, centered) * 1.6;

    // Faint interstellar dust veil: dark indigo/slate #02040c
    vec3 dustColor = vec3(0.008, 0.015, 0.035) * dust * 0.35;
    vec3 baseVoid = vec3(0.004, 0.008, 0.018) * clamp(vignette, 0.0, 1.0);

    vec3 finalColor = baseVoid + dustColor;
    finalColor += screenDither(gl_FragCoord.xy);
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// Procedural Spiral Dwarf Galaxy Landmark Shader
const GALAXY_SMUDGE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const GALAXY_SMUDGE_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uFade;
  varying vec2 vUv;

  ${GLSL_DITHER}

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    // Breathtaking tilted viewing perspective
    p.y *= 1.65;
    float r = length(p);
    if (r > 1.0) discard;

    float angle = atan(p.y, p.x);
    // Logarithmic grand-design spiral arms
    float spiral = sin(angle * 2.0 - log(max(r, 0.015)) * 3.4 + uTime * 0.035);
    float arms = smoothstep(-0.15, 0.85, spiral) * exp(-r * 2.8);
    // Dark absorbing cosmic dust lanes carving into inner arm edges
    float dustLane = smoothstep(-0.4, 0.05, sin(angle * 2.0 - log(max(r, 0.015)) * 3.4 - 0.45));
    arms *= (0.45 + 0.55 * dustLane);

    float core = exp(-r * 7.5) * 2.2;
    float alpha = (core * 0.65 + arms * 0.45) * smoothstep(1.0, 0.45, r) * uFade;

    vec3 coreColor = vec3(0.98, 0.90, 0.75); // Warm golden galactic nucleus
    vec3 armColor = vec3(0.38, 0.72, 0.95);  // Soft star-forming blue stellar arms
    vec3 col = mix(armColor, coreColor, core / max(core + arms, 0.001));
    col += screenDither(gl_FragCoord.xy);

    gl_FragColor = vec4(col * 0.55, alpha * 0.35);
  }
`;

// Procedural Stellar Sphere Shader with Limb Darkening
const STELLAR_SPHERE_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const STELLAR_SPHERE_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec2 vUv;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  void main() {
    float NdotV = max(0.0, dot(vNormal, vViewDir));
    float limb = pow(max(NdotV, 0.0), 0.45);
    float grain = hash(vUv * 48.0 + fract(uTime * 0.03)) * 0.12;
    vec3 col = uColor * (0.88 + grain + pow(max(NdotV, 0.0), 1.8) * 0.65);
    gl_FragColor = vec4(col * (0.75 + limb * 0.85), 1.0);
  }
`;

// Optical 4-Point Telescope Diffraction Flare Spike Quad
const DIFFRACTION_SPIKE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const DIFFRACTION_SPIKE_FRAG = /* glsl */ `
  uniform vec3 uColor;
  varying vec2 vUv;

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    // Sharp 4-point telescope diffraction spikes along X and Y axes
    float spikeX = exp(-abs(p.y) * 48.0) * exp(-abs(p.x) * 3.8);
    float spikeY = exp(-abs(p.x) * 48.0) * exp(-abs(p.y) * 3.8);
    // Soft diagonal secondary flare
    float diag1 = exp(-abs(p.x + p.y) * 55.0) * exp(-abs(p.x - p.y) * 5.0) * 0.22;
    float diag2 = exp(-abs(p.x - p.y) * 55.0) * exp(-abs(p.x + p.y) * 5.0) * 0.22;
    // Central incandescent glare core
    float r = length(p);
    float core = exp(-r * r * 38.0) * 1.5;
    float halo = exp(-r * 7.5) * 0.45;

    float intensity = spikeX + spikeY + diag1 + diag2 + core + halo;
    float alpha = clamp(intensity, 0.0, 1.0);
    if (alpha < 0.005) discard;

    gl_FragColor = vec4(uColor * (1.2 + core * 1.4), alpha);
  }
`;

// Red Giant Convective Boiling Granulation Shader
const RED_GIANT_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec2 vUv;
  varying vec3 vPosition;

  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const RED_GIANT_FRAG = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec2 vUv;
  varying vec3 vPosition;

  float hash(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  float noise(vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash(p + vec3(0,0,0)), hash(p + vec3(1,0,0)), f.x),
          mix(hash(p + vec3(0,1,0)), hash(p + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash(p + vec3(0,0,1)), hash(p + vec3(1,0,1)), f.x),
          mix(hash(p + vec3(0,1,1)), hash(p + vec3(1,1,1)), f.x), f.y),
      f.z
    );
  }

  float fbm(vec3 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.08;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    float NdotV = max(0.0, dot(vNormal, vViewDir));
    float limb = pow(max(NdotV, 0.0), 0.42);

    // Convective boiling granulation cells on photospheric surface
    vec3 samplePos = vPosition * 4.2 + vec3(uTime * 0.04, uTime * 0.03, uTime * 0.02);
    float cells = fbm(samplePos);
    float fineGrain = noise(vPosition * 18.0 + uTime * 0.08) * 0.18;

    // Red giant photospheric palette: deep carbon crimson, convective orange, brilliant gold filaments
    vec3 darkSpot = vec3(0.55, 0.05, 0.02);
    vec3 photosphere = vec3(0.96, 0.32, 0.04);
    vec3 hotFilament = vec3(1.0, 0.78, 0.35);

    vec3 surfaceColor = mix(darkSpot, photosphere, smoothstep(0.25, 0.65, cells));
    surfaceColor = mix(surfaceColor, hotFilament, smoothstep(0.68, 0.88, cells + fineGrain));

    // Coronal limb glow (warm crimson/gold rim)
    float rim = pow(max(0.0, 1.0 - NdotV), 2.2);
    vec3 rimColor = vec3(1.0, 0.25, 0.05) * rim * 1.8;

    vec3 finalCol = surfaceColor * (0.45 + limb * 0.85) + rimColor;
    gl_FragColor = vec4(finalCol, 1.0);
  }
`;

// Red Giant Coronal Atmospheric Halo Quad
const CORONA_HALO_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const CORONA_HALO_FRAG = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float r = length(p);
    float halo = exp(-r * 4.8) * 0.65 + exp(-r * 12.0) * 0.55;
    float fade = smoothstep(1.0, 0.4, r);
    float alpha = halo * fade * 0.24;
    if (alpha < 0.005) discard;
    vec3 haloCol = mix(vec3(0.95, 0.28, 0.05), vec3(0.95, 0.60, 0.15), exp(-r * 6.0));
    gl_FragColor = vec4(haloCol * 0.85, alpha);
  }
`;

export class DeepVoidDriftScene implements ISpatialScene {
  public readonly id = 'deep-void-drift' as const;
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  public readonly bloomPreset: BloomPreset = {
    strength: 0.24,
    radius: 0.42,
    threshold: 0.92,
  };
  public readonly exposure = 0.72;

  // Starfield
  private starGeo: THREE.BufferGeometry | null = null;
  private starMat: THREE.ShaderMaterial | null = null;
  private starPoints: THREE.Points | null = null;
  private activeStarCount = SPARSE_STAR_COUNT;

  // Ambient Void Dust Quad
  private dustGeo: THREE.PlaneGeometry | null = null;
  private dustMat: THREE.ShaderMaterial | null = null;
  private dustMesh: THREE.Mesh | null = null;

  // Rare Celestial Landmarks
  private galaxyMesh: THREE.Mesh | null = null;
  private binaryPairGroup: THREE.Group | null = null;
  private redGiantMesh: THREE.Mesh | null = null;
  private redGiantCoronaMesh: THREE.Mesh | null = null;
  private redGiantMat: THREE.ShaderMaterial | null = null;
  private starMatA: THREE.ShaderMaterial | null = null;
  private starMatB: THREE.ShaderMaterial | null = null;
  private flareA: THREE.Mesh | null = null;
  private flareB: THREE.Mesh | null = null;

  private cameraZ = 0;
  private smoothPointer = new THREE.Vector2();

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x010204);
    this.camera = new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 0.1, 500);
    this.camera.position.set(0, 0, 0);
  }

  public init(renderer: THREE.WebGLRenderer): void {
    const size = renderer.getDrawingBufferSize(new THREE.Vector2());

    // 1. Subtle Deep-Space Dust Gradient Quad
    this.dustGeo = new THREE.PlaneGeometry(2, 2);
    this.dustMat = new THREE.ShaderMaterial({
      vertexShader: VOID_DUST_VERT,
      fragmentShader: VOID_DUST_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(size.x, size.y) },
      },
      depthWrite: false,
      depthTest: false,
    });
    this.dustMesh = new THREE.Mesh(this.dustGeo, this.dustMat);
    this.dustMesh.frustumCulled = false;
    this.scene.add(this.dustMesh);

    // 2. Sparse Starfield
    this.starGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(SPARSE_STAR_COUNT * 3);
    const colors = new Float32Array(SPARSE_STAR_COUNT * 3);
    const sizes = new Float32Array(SPARSE_STAR_COUNT);
    const phases = new Float32Array(SPARSE_STAR_COUNT);
    const parallaxSpeeds = new Float32Array(SPARSE_STAR_COUNT);

    const spectralPalette = [
      new THREE.Color(0xf87171), // 40% faint warm red dwarf
      new THREE.Color(0xfb923c), // 25% soft orange K-type
      new THREE.Color(0xfef9c3), // 20% solar white/cream
      new THREE.Color(0x7dd3fc), // 15% solitary icy blue/cyan
    ];

    for (let i = 0; i < SPARSE_STAR_COUNT; i++) {
      // Wide volume distribution
      positions[i * 3 + 0] = (Math.random() - 0.5) * 240;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 160;
      positions[i * 3 + 2] = -Math.random() * 450;

      const pickIndex =
        Math.random() < 0.4
          ? 0
          : Math.random() < 0.65
          ? 1
          : Math.random() < 0.85
          ? 2
          : 3;
      const c = spectralPalette[pickIndex];
      colors[i * 3 + 0] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      sizes[i] = 0.9 + Math.random() * 1.8;
      phases[i] = Math.random();
      parallaxSpeeds[i] = 0.85 + Math.random() * 0.3;
    }

    this.starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.starGeo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    this.starGeo.setAttribute('aBaseSize', new THREE.BufferAttribute(sizes, 1));
    this.starGeo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    this.starGeo.setAttribute('aParallaxSpeed', new THREE.BufferAttribute(parallaxSpeeds, 1));

    this.starMat = new THREE.ShaderMaterial({
      vertexShader: SPARSE_STAR_VERT,
      fragmentShader: SPARSE_STAR_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uCamPos: { value: this.camera.position },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.starPoints = new THREE.Points(this.starGeo, this.starMat);
    this.starPoints.frustumCulled = false;
    this.scene.add(this.starPoints);

    // 3. Rare Landmark A: Distant Barred Spiral Galaxy Smudge
    const galaxyGeo = new THREE.PlaneGeometry(55, 55);
    const galaxyMat = new THREE.ShaderMaterial({
      vertexShader: GALAXY_SMUDGE_VERT,
      fragmentShader: GALAXY_SMUDGE_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uFade: { value: 1.0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    this.galaxyMesh = new THREE.Mesh(galaxyGeo, galaxyMat);
    this.galaxyMesh.position.set(-68, 28, -260);
    this.galaxyMesh.rotation.z = 0.45;
    this.galaxyMesh.rotation.x = -0.3;
    this.scene.add(this.galaxyMesh);

    // 4. Rare Landmark B: Orbiting Distant Binary Star Pair with Optical Diffraction Spikes
    this.binaryPairGroup = new THREE.Group();
    this.binaryPairGroup.position.set(74, -22, -180);

    const bStarGeo = new THREE.SphereGeometry(0.55, 20, 20);
    this.starMatA = new THREE.ShaderMaterial({
      vertexShader: STELLAR_SPHERE_VERT,
      fragmentShader: STELLAR_SPHERE_FRAG,
      uniforms: {
        uColor: { value: new THREE.Color(0xfef08a) }, // Gold
        uTime: { value: 0 },
      },
    });
    this.starMatB = new THREE.ShaderMaterial({
      vertexShader: STELLAR_SPHERE_VERT,
      fragmentShader: STELLAR_SPHERE_FRAG,
      uniforms: {
        uColor: { value: new THREE.Color(0x38bdf8) }, // Azure
        uTime: { value: 0 },
      },
    });

    const starA = new THREE.Mesh(bStarGeo, this.starMatA);
    const starB = new THREE.Mesh(bStarGeo, this.starMatB);
    starA.position.x = 1.6;
    starB.position.x = -1.6;

    // Optical 4-point telescope diffraction flare quads
    const flareGeo = new THREE.PlaneGeometry(7.5, 7.5);
    const flareMatA = new THREE.ShaderMaterial({
      vertexShader: DIFFRACTION_SPIKE_VERT,
      fragmentShader: DIFFRACTION_SPIKE_FRAG,
      uniforms: {
        uColor: { value: new THREE.Color(0xfef08a) },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const flareMatB = new THREE.ShaderMaterial({
      vertexShader: DIFFRACTION_SPIKE_VERT,
      fragmentShader: DIFFRACTION_SPIKE_FRAG,
      uniforms: {
        uColor: { value: new THREE.Color(0x38bdf8) },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });

    this.flareA = new THREE.Mesh(flareGeo, flareMatA);
    this.flareB = new THREE.Mesh(flareGeo, flareMatB);
    starA.add(this.flareA);
    starB.add(this.flareB);

    this.binaryPairGroup.add(starA, starB);
    this.scene.add(this.binaryPairGroup);

    // 5. Rare Landmark C: Warm Red Giant with Convective Photospheric Granulation & Coronal Atmosphere
    const redGiantGeo = new THREE.SphereGeometry(2.4, 32, 32);
    this.redGiantMat = new THREE.ShaderMaterial({
      vertexShader: RED_GIANT_VERT,
      fragmentShader: RED_GIANT_FRAG,
      uniforms: {
        uTime: { value: 0 },
      },
    });
    this.redGiantMesh = new THREE.Mesh(redGiantGeo, this.redGiantMat);
    this.redGiantMesh.position.set(52, 45, -340);

    const coronaGeo = new THREE.PlaneGeometry(16.0, 16.0);
    const coronaMat = new THREE.ShaderMaterial({
      vertexShader: CORONA_HALO_VERT,
      fragmentShader: CORONA_HALO_FRAG,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    this.redGiantCoronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    this.redGiantMesh.add(this.redGiantCoronaMesh);

    this.scene.add(this.redGiantMesh);
  }

  public update(delta: number, elapsed: number, pointer: THREE.Vector2): void {
    this.smoothPointer.lerp(pointer, Math.min(1, delta * 2.0));

    // Slow, meditative forward drift (1.4 units/sec)
    this.cameraZ -= delta * 1.4;

    // Organic hypnotic pitch/yaw wandering via multi-harmonic sines
    const wanderPitch =
      Math.sin(elapsed * 0.031) * 0.022 +
      Math.sin(elapsed * 0.077 + 1.2) * 0.01 +
      this.smoothPointer.y * 0.03;
    const wanderYaw =
      Math.cos(elapsed * 0.023) * 0.03 +
      Math.sin(elapsed * 0.053 + 2.1) * 0.012 +
      this.smoothPointer.x * 0.035;
    const wanderRoll = Math.sin(elapsed * 0.018) * 0.008;

    const swayX = Math.sin(elapsed * 0.04) * 2.2 + this.smoothPointer.x * 2.5;
    const swayY = Math.cos(elapsed * 0.032) * 1.6 + this.smoothPointer.y * 1.8;

    this.camera.position.set(swayX, swayY, this.cameraZ);
    this.camera.rotation.set(wanderPitch, wanderYaw, wanderRoll);

    // Update shaders
    if (this.dustMat) {
      this.dustMat.uniforms.uTime.value = elapsed;
    }

    if (this.starMat) {
      this.starMat.uniforms.uTime.value = elapsed;
      this.starMat.uniforms.uCamPos.value.copy(this.camera.position);
    }

    if (this.starMatA) this.starMatA.uniforms.uTime.value = elapsed;
    if (this.starMatB) this.starMatB.uniforms.uTime.value = elapsed;
    if (this.redGiantMat) this.redGiantMat.uniforms.uTime.value = elapsed;

    if (this.flareA) this.flareA.lookAt(this.camera.position);
    if (this.flareB) this.flareB.lookAt(this.camera.position);
    if (this.redGiantCoronaMesh) this.redGiantCoronaMesh.lookAt(this.camera.position);

    // Rare Distant Landmarks: 25-40s cadence (32s cycle)
    // A breathtaking, softly lit tilted procedural spiral galaxy drifts gently through far background and disappears
    const landmarkPeriod = 32.0;
    const landmarkPhase = (elapsed % landmarkPeriod) / landmarkPeriod; // 0..1
    const landmarkFade = Math.sin(landmarkPhase * Math.PI);

    if (this.galaxyMesh) {
      const gMat = this.galaxyMesh.material as THREE.ShaderMaterial;
      gMat.uniforms.uTime.value = elapsed;
      gMat.uniforms.uFade.value = landmarkFade;

      this.galaxyMesh.rotation.z = 0.45 + elapsed * 0.008;

      if (landmarkPhase < 0.03) {
        this.galaxyMesh.position.z = this.camera.position.z - 220;
      }
    }

    if (this.binaryPairGroup) {
      this.binaryPairGroup.rotation.y = elapsed * 0.8;
      if (this.binaryPairGroup.position.z > this.camera.position.z + 40) {
        this.binaryPairGroup.position.z -= 380;
        this.binaryPairGroup.position.x = (Math.random() - 0.5) * 140;
        this.binaryPairGroup.position.y = (Math.random() - 0.5) * 80;
      }
    }

    if (this.redGiantMesh) {
      const scale = 1.0 + Math.sin(elapsed * 0.4) * 0.06;
      this.redGiantMesh.scale.setScalar(scale);
      if (this.redGiantMesh.position.z > this.camera.position.z + 40) {
        this.redGiantMesh.position.z -= 450;
        this.redGiantMesh.position.x = (Math.random() - 0.5) * 150;
        this.redGiantMesh.position.y = (Math.random() - 0.5) * 90;
      }
    }
  }

  public resize(width: number, height: number, dpr = 1): void {
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();
    if (this.dustMat) {
      this.dustMat.uniforms.uResolution.value.set(
        Math.max(1, Math.floor(width * dpr)),
        Math.max(1, Math.floor(height * dpr))
      );
    }
    if (this.starMat) {
      this.starMat.uniforms.uPixelRatio.value = dpr;
    }
  }

  public setQuality(scale: number): void {
    const clamped = Math.max(0.3, Math.min(1.0, scale));
    this.activeStarCount = Math.floor(SPARSE_STAR_COUNT * clamped);
    if (this.starGeo) {
      this.starGeo.setDrawRange(0, this.activeStarCount);
    }
  }

  public getActiveInstanceCount(): number {
    return this.activeStarCount + 4;
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

    if (this.dustMesh) {
      this.scene.remove(this.dustMesh);
      this.dustMesh = null;
    }
    if (this.dustGeo) {
      this.dustGeo.dispose();
      this.dustGeo = null;
    }
    if (this.dustMat) {
      this.dustMat.dispose();
      this.dustMat = null;
    }

    if (this.galaxyMesh) {
      this.scene.remove(this.galaxyMesh);
      this.galaxyMesh.geometry.dispose();
      (this.galaxyMesh.material as THREE.Material).dispose();
      this.galaxyMesh = null;
    }

    if (this.binaryPairGroup) {
      this.scene.remove(this.binaryPairGroup);
      this.binaryPairGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          child.material.dispose();
        }
      });
      this.binaryPairGroup = null;
    }

    if (this.redGiantMesh) {
      this.scene.remove(this.redGiantMesh);
      this.redGiantMesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (child.material instanceof THREE.Material) {
            child.material.dispose();
          }
        }
      });
      this.redGiantMesh = null;
      this.redGiantCoronaMesh = null;
    }

    this.starMatA = null;
    this.starMatB = null;
    this.redGiantMat = null;
    this.flareA = null;
    this.flareB = null;

    this.scene.clear();
  }
}
