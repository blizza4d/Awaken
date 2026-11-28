import * as THREE from 'three';
import { ISpatialScene, BloomPreset } from '../types';
import { GLSL_DITHER, GLSL_TONEMAP_SHOULDER } from '../shaders/common';

const JELLY_COUNT = 4;
const MARINE_SNOW_COUNT = 1400;
const TENTACLE_COUNT_PER_JELLY = 8;
const TENTACLE_SEGMENTS = 24;

const JELLY_BELL_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uPhase;
  uniform float uPulseSpeed;

  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vWorldPos;
  varying vec2 vUv;
  varying float vContraction;

  void main() {
    vUv = uv;
    // Rhythmic swimming propulsion cycle
    float cycle = uTime * uPulseSpeed + uPhase;
    float wave = sin(cycle - position.y * 1.6);
    float contract = smoothstep(-0.6, 0.85, wave) * (1.0 - smoothstep(0.8, 2.2, position.y));

    vec3 pos = position;
    // Inward bell contraction on power stroke
    pos.xz *= 1.0 - contract * 0.36;
    pos.y *= 1.0 + contract * 0.24;

    vContraction = contract;
    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vWorldPos = worldPos.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vec4 mvPos = viewMatrix * worldPos;
    vViewDir = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const JELLY_BELL_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uPhase;

  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vWorldPos;
  varying vec2 vUv;
  varying float vContraction;

  ${GLSL_DITHER}
  ${GLSL_TONEMAP_SHOULDER}

  void main() {
    float NdotV = max(0.0, dot(normalize(vNormal), normalize(vViewDir)));
    // High-power Fresnel edge glow
    float fresnel = pow(max(0.0, 1.0 - NdotV), 2.6);

    // Bioluminescent radial veins running down the bell
    float angle = atan(vWorldPos.x, vWorldPos.z);
    float veins = pow(abs(sin(angle * 6.0)), 14.0) * (1.0 - vUv.y);

    // Margin rim organs (rhopalia)
    float rimGlow = smoothstep(0.12, 0.0, vUv.y) * 1.5;

    // Color shift: deep electric cyan (#14c8e8), cobalt (#2855e8), faint orchid violet (#b83ae0)
    float colorShift = sin(uTime * 0.5 + uPhase) * 0.5 + 0.5;
    vec3 cyan = vec3(0.078, 0.784, 0.910);
    vec3 cobalt = vec3(0.157, 0.333, 0.910);
    vec3 orchid = vec3(0.722, 0.227, 0.878);

    vec3 glowColor = mix(cyan, cobalt, colorShift);
    glowColor = mix(glowColor, orchid, veins * 0.65 + vContraction * 0.35);

    // Transparent dark interior core with luminous glowing edges
    float alpha = clamp(fresnel * 0.88 + veins * 0.85 + rimGlow * 0.8 + vContraction * 0.28, 0.0, 1.0);
    if (alpha < 0.005) discard;

    vec3 emissive = glowColor * (fresnel * 0.95 + veins * 1.15 + rimGlow * 1.1 + 0.22);
    // Soft HDR shoulder compression to prevent chalky white blowouts
    vec3 finalCol = softHdrShoulder(emissive, 0.65);
    finalCol += screenDither(gl_FragCoord.xy);

    gl_FragColor = vec4(finalCol, alpha * 0.82);
  }
`;

const TENTACLE_VERT = /* glsl */ `
  attribute float aIndex;
  uniform float uTime;
  uniform float uPhase;
  uniform float uPulseSpeed;

  varying float vProgress;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vProgress = uv.y; // 0.0 at base of bell, 1.0 at trailing tip

    vec3 pos = position;
    // Traveling delayed sine wave along tentacle length simulating fluid drag
    float dragTime = uTime * 2.2 - vProgress * 6.28 + uPhase;
    float dragWaveX = sin(dragTime) * vProgress * 0.85;
    float dragWaveZ = cos(dragTime * 0.85) * vProgress * 0.65;

    pos.x += dragWaveX;
    pos.z += dragWaveZ;

    vec4 worldPos = modelMatrix * vec4(pos, 1.0);
    vNormal = normalize(mat3(modelMatrix) * normal);
    vec4 mvPos = viewMatrix * worldPos;
    vViewDir = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

const TENTACLE_FRAG = /* glsl */ `
  uniform float uTime;
  uniform float uPhase;

  varying float vProgress;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    float NdotV = max(0.0, dot(normalize(vNormal), normalize(vViewDir)));
    float fresnel = pow(max(0.0, 1.0 - NdotV), 2.2);

    // Fade delicately towards trailing tip
    float tipFade = smoothstep(1.0, 0.15, vProgress);

    // Bioluminescent palette: deep electric cyan (#14c8e8) and faint orchid violet (#b83ae0)
    float colorShift = sin(uTime * 0.6 + uPhase + vProgress * 3.0) * 0.5 + 0.5;
    vec3 cyan = vec3(0.078, 0.784, 0.910);
    vec3 orchid = vec3(0.722, 0.227, 0.878);
    vec3 col = mix(cyan, orchid, colorShift);

    float alpha = (fresnel * 0.65 + 0.25) * tipFade * 0.65;
    if (alpha < 0.005) discard;

    vec3 tentCol = col * (0.85 + fresnel * 0.95);
    tentCol = tentCol / (1.0 + tentCol * 0.5);
    gl_FragColor = vec4(tentCol, alpha);
  }
`;

const MARINE_SNOW_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute float aSpeed;

  uniform float uTime;
  uniform vec3 uCamPos;

  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    vec3 box = vec3(38.0, 32.0, 45.0);

    // Drift slowly upward and swirl gently in ocean currents
    vec3 pos = position;
    pos.y += uTime * (0.8 + aSpeed * 0.6);
    pos.x += sin(uTime * 0.4 + aPhase * 6.28) * 1.4;
    pos.z += cos(uTime * 0.35 + aPhase * 6.28) * 1.4;

    // Continuous depth wrap around camera
    vec3 rel = mod(pos - uCamPos + box * 0.5, box) - box * 0.5;
    vec3 worldPos = uCamPos + rel;

    float dist = length(rel);
    // Smooth near and far fade
    float nearFade = smoothstep(2.5, 7.0, dist);
    float farFade = smoothstep(38.0, 18.0, dist);
    vAlpha = nearFade * farFade * (0.35 + 0.45 * sin(uTime * 1.5 + aPhase * 6.28));

    // Plankton hues: soft ocean blue-white, occasional bioluminescent teal sparkle
    vColor = mix(vec3(0.55, 0.82, 1.0), vec3(0.25, 0.95, 0.85), step(0.82, aPhase));

    vec4 mvPos = modelViewMatrix * vec4(worldPos, 1.0);
    gl_Position = projectionMatrix * mvPos;
    gl_PointSize = aSize * (140.0 / -mvPos.z);
  }
`;

const MARINE_SNOW_FRAG = /* glsl */ `
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    vec2 p = gl_PointCoord - 0.5;
    float d2 = dot(p, p);
    if (d2 > 0.25) discard;

    // Soft circular Gaussian falloff
    float core = exp(-d2 * 18.0);
    float halo = exp(-d2 * 6.5) * 0.45;
    gl_FragColor = vec4(vColor * (core + halo), vAlpha * (core + halo));
  }
`;

const ABYSSAL_HAZE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`;

const ABYSSAL_HAZE_FRAG = /* glsl */ `
  varying vec2 vUv;

  float screenDither(vec2 fc) {
    return fract(sin(dot(fc, vec2(12.9898, 78.233))) * 43758.5453) * 0.0039;
  }

  void main() {
    // Ultra-faint downwelling abyssal blue haze from surface far above
    float downwelling = smoothstep(0.0, 1.0, vUv.y) * 0.038;
    vec3 deepVoid = vec3(0.004, 0.008, 0.018); // #01040b deep ocean abyss
    vec3 downwellingCol = vec3(0.012, 0.045, 0.095) * downwelling;

    vec3 finalCol = deepVoid + downwellingCol;
    finalCol += screenDither(gl_FragCoord.xy);

    gl_FragColor = vec4(finalCol, 1.0);
  }
`;

interface JellyfishEntity {
  group: THREE.Group;
  bellMesh: THREE.Mesh;
  bellMat: THREE.ShaderMaterial;
  tentacles: THREE.Mesh[];
  tentacleMats: THREE.ShaderMaterial[];
  baseX: number;
  baseY: number;
  baseZ: number;
  pulseSpeed: number;
  phase: number;
  swayFreq: number;
  scale: number;
}

export class AbyssalDriftScene implements ISpatialScene {
  public readonly id = 'abyssal-drift' as const;
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  public readonly bloomPreset: BloomPreset = {
    strength: 0.26,
    radius: 0.45,
    threshold: 0.90,
  };
  public readonly exposure = 0.76;

  private hazeQuad: THREE.Mesh | null = null;
  private hazeGeo: THREE.PlaneGeometry | null = null;
  private hazeMat: THREE.ShaderMaterial | null = null;

  private jellies: JellyfishEntity[] = [];
  private snowPoints: THREE.Points | null = null;
  private snowGeo: THREE.BufferGeometry | null = null;
  private snowMat: THREE.ShaderMaterial | null = null;

  private disposableGeometries: THREE.BufferGeometry[] = [];
  private disposableMaterials: THREE.Material[] = [];

  private smoothPointer = new THREE.Vector2();
  private qualityScale = 1.0;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x010309);
    this.scene.fog = new THREE.FogExp2(0x010309, 0.024);

    this.camera = new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 0.1, 150);
    this.camera.position.set(0, 0, 8);
  }

  public init(_renderer: THREE.WebGLRenderer): void {
    // 1. Ambient Abyssal Downwelling Haze Background Quad
    this.hazeGeo = new THREE.PlaneGeometry(2, 2);
    this.hazeMat = new THREE.ShaderMaterial({
      vertexShader: ABYSSAL_HAZE_VERT,
      fragmentShader: ABYSSAL_HAZE_FRAG,
      depthWrite: false,
      depthTest: false,
    });
    this.hazeQuad = new THREE.Mesh(this.hazeGeo, this.hazeMat);
    this.hazeQuad.frustumCulled = false;
    this.scene.add(this.hazeQuad);

    // 2. Build Procedural Jellyfish Entities at Varied Oceanic Depths
    const bellGeo = new THREE.SphereGeometry(1.65, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.55);
    // Invert bell so open margin faces downward
    bellGeo.rotateX(Math.PI);
    this.disposableGeometries.push(bellGeo);

    const tentacleGeo = new THREE.CylinderGeometry(0.04, 0.015, 6.5, 6, TENTACLE_SEGMENTS, true);
    tentacleGeo.translate(0, -3.25, 0); // Anchor at attachment point
    this.disposableGeometries.push(tentacleGeo);

    const jellyConfigs = [
      { x: -1.8, y: -0.5, z: -4.5, pulseSpeed: 1.4, phase: 0.0, swayFreq: 0.35, scale: 1.1 },
      { x: 3.2, y: 1.8, z: -11.0, pulseSpeed: 1.25, phase: 2.1, swayFreq: 0.28, scale: 0.95 },
      { x: -4.5, y: -2.2, z: -18.0, pulseSpeed: 1.1, phase: 4.3, swayFreq: 0.22, scale: 1.35 },
      { x: 2.5, y: -1.2, z: -26.0, pulseSpeed: 0.95, phase: 1.6, swayFreq: 0.18, scale: 1.6 },
    ];

    for (const cfg of jellyConfigs) {
      const group = new THREE.Group();
      group.position.set(cfg.x, cfg.y, cfg.z);
      group.scale.setScalar(cfg.scale);

      const bellMat = new THREE.ShaderMaterial({
        vertexShader: JELLY_BELL_VERT,
        fragmentShader: JELLY_BELL_FRAG,
        uniforms: {
          uTime: { value: 0 },
          uPhase: { value: cfg.phase },
          uPulseSpeed: { value: cfg.pulseSpeed },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });
      this.disposableMaterials.push(bellMat);

      const bellMesh = new THREE.Mesh(bellGeo, bellMat);
      group.add(bellMesh);

      // Trailing delicate tentacles around bell margin
      const tentacles: THREE.Mesh[] = [];
      const tentacleMats: THREE.ShaderMaterial[] = [];

      for (let t = 0; t < TENTACLE_COUNT_PER_JELLY; t++) {
        const theta = (t / TENTACLE_COUNT_PER_JELLY) * Math.PI * 2;
        const rad = 1.15;
        const tx = Math.cos(theta) * rad;
        const tz = Math.sin(theta) * rad;

        const tMat = new THREE.ShaderMaterial({
          vertexShader: TENTACLE_VERT,
          fragmentShader: TENTACLE_FRAG,
          uniforms: {
            uTime: { value: 0 },
            uPhase: { value: cfg.phase + t * 0.4 },
            uPulseSpeed: { value: cfg.pulseSpeed },
          },
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
        });
        this.disposableMaterials.push(tMat);

        const tMesh = new THREE.Mesh(tentacleGeo, tMat);
        tMesh.position.set(tx, -0.2, tz);
        group.add(tMesh);

        tentacles.push(tMesh);
        tentacleMats.push(tMat);
      }

      this.jellies.push({
        group,
        bellMesh,
        bellMat,
        tentacles,
        tentacleMats,
        baseX: cfg.x,
        baseY: cfg.y,
        baseZ: cfg.z,
        pulseSpeed: cfg.pulseSpeed,
        phase: cfg.phase,
        swayFreq: cfg.swayFreq,
        scale: cfg.scale,
      });

      this.scene.add(group);
    }

    // 3. Marine Snow & Bioluminescent Microplankton Particles
    this.snowGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(MARINE_SNOW_COUNT * 3);
    const sizes = new Float32Array(MARINE_SNOW_COUNT);
    const phases = new Float32Array(MARINE_SNOW_COUNT);
    const speeds = new Float32Array(MARINE_SNOW_COUNT);

    for (let i = 0; i < MARINE_SNOW_COUNT; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 38;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 32;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 45;

      sizes[i] = 1.5 + Math.random() * 3.5;
      phases[i] = Math.random();
      speeds[i] = Math.random();
    }

    this.snowGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.snowGeo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    this.snowGeo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    this.snowGeo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    this.disposableGeometries.push(this.snowGeo);

    this.snowMat = new THREE.ShaderMaterial({
      vertexShader: MARINE_SNOW_VERT,
      fragmentShader: MARINE_SNOW_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uCamPos: { value: this.camera.position },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.disposableMaterials.push(this.snowMat);

    this.snowPoints = new THREE.Points(this.snowGeo, this.snowMat);
    this.snowPoints.frustumCulled = false;
    this.scene.add(this.snowPoints);
  }

  public update(delta: number, elapsed: number, pointer: THREE.Vector2): void {
    this.smoothPointer.lerp(pointer, Math.min(1, delta * 2.0));

    // Smooth oceanic meditative camera drift
    const camSwayX = Math.sin(elapsed * 0.14) * 0.45 + this.smoothPointer.x * 1.5;
    const camSwayY = Math.cos(elapsed * 0.11) * 0.35 + this.smoothPointer.y * 1.2;
    const camSwayZ = 8.0 + Math.sin(elapsed * 0.08) * 0.4;

    this.camera.position.set(camSwayX, camSwayY, camSwayZ);
    this.camera.lookAt(camSwayX * 0.25, camSwayY * 0.25, -12);

    // Update Jellyfish Swimming Physics & Shader Uniforms
    for (const j of this.jellies) {
      // Upward propulsion impulse paired with rhythmic contraction cycle
      const cycle = elapsed * j.pulseSpeed + j.phase;
      // Pulse impulse: upward lurch during contraction
      const impulse = Math.sin(cycle);
      const floatY = (elapsed * 0.45 * j.pulseSpeed) % 18.0;

      // Organic wandering sway
      const swayX = Math.sin(elapsed * j.swayFreq + j.phase) * 1.2;
      const swayZ = Math.cos(elapsed * j.swayFreq * 0.8 + j.phase) * 0.9;
      const roll = Math.sin(elapsed * j.swayFreq) * 0.08;
      const pitch = Math.cos(elapsed * j.swayFreq * 0.9) * 0.08 + (impulse > 0.0 ? 0.04 : -0.02);

      j.group.position.set(
        j.baseX + swayX,
        j.baseY + floatY - 6.0 + impulse * 0.22,
        j.baseZ + swayZ
      );
      j.group.rotation.set(pitch, elapsed * 0.05, roll);

      // Update bell shader
      j.bellMat.uniforms.uTime.value = elapsed;

      // Update tentacle shaders
      for (const tMat of j.tentacleMats) {
        tMat.uniforms.uTime.value = elapsed;
      }
    }

    // Update Marine Snow Particle System
    if (this.snowMat) {
      this.snowMat.uniforms.uTime.value = elapsed;
      this.snowMat.uniforms.uCamPos.value.copy(this.camera.position);
    }
  }

  public resize(width: number, height: number): void {
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();
  }

  public setQuality(scale: number): void {
    this.qualityScale = Math.max(0.4, Math.min(1.0, scale));
    if (this.snowPoints && this.snowGeo) {
      this.snowGeo.setDrawRange(0, Math.floor(MARINE_SNOW_COUNT * this.qualityScale));
    }
  }

  public getActiveInstanceCount(): number {
    return this.jellies.length * (1 + TENTACLE_COUNT_PER_JELLY) + Math.floor(MARINE_SNOW_COUNT * this.qualityScale);
  }

  public dispose(): void {
    if (this.hazeQuad) {
      this.scene.remove(this.hazeQuad);
      this.hazeQuad = null;
    }
    if (this.hazeGeo) {
      this.hazeGeo.dispose();
      this.hazeGeo = null;
    }
    if (this.hazeMat) {
      this.hazeMat.dispose();
      this.hazeMat = null;
    }

    for (const j of this.jellies) {
      this.scene.remove(j.group);
      j.bellMesh.geometry.dispose();
      j.bellMat.dispose();
      for (const t of j.tentacles) {
        t.geometry.dispose();
      }
      for (const tm of j.tentacleMats) {
        tm.dispose();
      }
    }
    this.jellies = [];

    if (this.snowPoints) {
      this.scene.remove(this.snowPoints);
      this.snowPoints = null;
    }

    for (const g of this.disposableGeometries) g.dispose();
    for (const m of this.disposableMaterials) m.dispose();

    this.disposableGeometries = [];
    this.disposableMaterials = [];

    this.scene.clear();
  }
}
