import * as THREE from 'three';
import { ISpatialScene, BloomPreset } from '../types';

const DISK_PARTICLE_COUNT = 45_000;

const RAYMARCH_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`;

/**
 * Photorealistic Schwarzschild Black Hole Gravitational Lensing Raymarcher
 * Integrates curved null geodesics around the event horizon, rendering:
 * - Bent deep-space starfield & Einstein ring distortion
 * - Razor-sharp Photon Sphere & absolute Event Horizon shadow
 * - Volumetric Doppler-beamed relativistic Accretion Disk (heated orange -> blue-white)
 */
const RAYMARCH_FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec3 uCamPos;
  uniform vec3 uCamRight;
  uniform vec3 uCamUp;
  uniform vec3 uCamForward;
  uniform float uTanHalfFov;
  uniform int uRaySteps;

  varying vec2 vUv;

  // --- Fast Procedural Hash & Value Noise for Plasma & Starfield ---
  float hash31(vec3 p) {
    p = fract(p * vec3(443.897, 441.423, 437.195));
    p += dot(p, p.yzx + 19.19);
    return fract((p.x + p.y) * p.z);
  }

  float noise3D(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);

    float n000 = hash31(i + vec3(0.0, 0.0, 0.0));
    float n100 = hash31(i + vec3(1.0, 0.0, 0.0));
    float n010 = hash31(i + vec3(0.0, 1.0, 0.0));
    float n110 = hash31(i + vec3(1.0, 1.0, 0.0));
    float n001 = hash31(i + vec3(0.0, 0.0, 1.0));
    float n101 = hash31(i + vec3(1.0, 0.0, 1.0));
    float n011 = hash31(i + vec3(0.0, 1.0, 1.0));
    float n111 = hash31(i + vec3(1.0, 1.0, 1.0));

    float nx00 = mix(n000, n100, f.x);
    float nx10 = mix(n010, n110, f.x);
    float nx01 = mix(n001, n101, f.x);
    float nx11 = mix(n011, n111, f.x);

    float nxy0 = mix(nx00, nx10, f.y);
    float nxy1 = mix(nx01, nx11, f.y);
    return mix(nxy0, nxy1, f.z);
  }

  float fbm(vec3 p) {
    float val = 0.0;
    float amp = 0.55;
    for (int i = 0; i < 4; i++) {
      val += amp * noise3D(p);
      p = p * 2.07 + vec3(13.1, 7.4, -9.2);
      amp *= 0.5;
    }
    return val;
  }

  // Deep space procedural starfield & faint cosmic dust nebula (gravitationally lensed)
  vec3 sampleDeepSpace(vec3 dir) {
    vec3 col = vec3(0.0);

    // Subtle cosmic dust nebula band
    float neb = fbm(dir * 3.5 + vec3(0.0, 1.2, 0.0));
    float galacticPlane = exp(-abs(dir.y * 2.8 + dir.x * 0.6) * 2.6);
    vec3 nebColor = mix(vec3(0.02, 0.05, 0.14), vec3(0.14, 0.04, 0.22), neb);
    col += nebColor * galacticPlane * neb * 0.45;

    // Multi-scale crisp lensed stars
    for (int layer = 0; layer < 2; layer++) {
      float scale = layer == 0 ? 115.0 : 210.0;
      vec3 cell = floor(dir * scale);
      vec3 local = fract(dir * scale) - 0.5;
      float rnd = hash31(cell);
      if (rnd > 0.965) {
        vec3 starOffset = vec3(hash31(cell + 1.1), hash31(cell + 2.3), hash31(cell + 3.7)) - 0.5;
        float d = length(local - starOffset * 0.55);
        float bright = smoothstep(0.14, 0.0, d) * (rnd - 0.965) * 42.0;
        // Spectral star temperatures (blue O-type -> white -> warm amber K-type)
        vec3 starHue = mix(vec3(0.65, 0.85, 1.0), vec3(1.0, 0.78, 0.52), hash31(cell + 7.9));
        col += starHue * bright * (layer == 0 ? 1.1 : 0.65);
      }
    }

    return col;
  }

  void main() {
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 ndc = vUv * 2.0 - 1.0;

    // Reconstruct exact world-space camera ray matching Three.js PerspectiveCamera
    vec3 rayDir = normalize(
      uCamForward +
      uCamRight * (ndc.x * aspect * uTanHalfFov) +
      uCamUp * (ndc.y * uTanHalfFov)
    );

    vec3 pos = uCamPos;
    vec3 dir = rayDir;

    // Schwarzschild radius & accretion disk bounds
    const float RS = 1.65;
    const float DISK_INNER = 2.45;
    const float DISK_OUTER = 9.4;

    // Angular momentum squared for exact general-relativistic geodesic bending
    vec3 hVec = cross(pos, dir);
    float h2 = dot(hVec, hVec);

    vec3 accumGlow = vec3(0.0);
    float transmittance = 1.0;
    bool captured = false;

    for (int i = 0; i < 128; i++) {
      if (i >= uRaySteps) break;

      float r = length(pos);
      if (r < RS) {
        captured = true;
        break;
      }
      if (r > 32.0) {
        break;
      }

      // Adaptive step size: fine near photon sphere, coarser in far field
      float dt = clamp(r * 0.085, 0.045, 0.55);

      // General-relativistic null geodesic bending: a = -1.5 * RS * h^2 * pos / r^5
      float r2 = r * r;
      float r5 = r2 * r2 * r;
      vec3 accel = -1.5 * RS * h2 * pos / max(r5, 0.001);

      vec3 nextDir = normalize(dir + accel * dt);
      vec3 nextPos = pos + nextDir * dt;

      // Razor-thin inner photon ring (r ~ 1.5 * RS) - controlled pale-gold/warm-white halo, never blown out
      float photonDist = abs(r - RS * 1.48);
      float photonRing = exp(-photonDist * 16.0) * 0.024 * dt;
      accumGlow += vec3(0.96, 0.90, 0.78) * photonRing * transmittance;

      // Volumetric Accretion Disk slab intersection / proximity sampling
      float diskHeight = 0.22 + (r - DISK_INNER) * 0.04;
      if (abs(pos.y) < diskHeight * 2.2 && r > DISK_INNER * 0.88 && r < DISK_OUTER) {
        float verticalDensity = exp(-(pos.y * pos.y) / max(diskHeight * diskHeight * 0.28, 0.002));
        float radialIn = smoothstep(DISK_INNER, DISK_INNER + 0.75, r);
        float radialOut = smoothstep(DISK_OUTER, DISK_INNER + 1.6, r);
        float radialMask = radialIn * radialOut;

        if (radialMask * verticalDensity > 0.002) {
          // Differential Keplerian swirling plasma coordinates with fine filament structures
          float angle = atan(pos.z, pos.x);
          float keplerOmega = 2.4 / pow(max(r, 1.0), 1.35);
          float spiralAngle = angle + uTime * keplerOmega + 4.8 / max(r, 1.0);

          vec3 sampleCoord = vec3(
            cos(spiralAngle) * r * 0.85,
            pos.y * 3.2,
            sin(spiralAngle) * r * 0.85
          );

          float plasma1 = fbm(sampleCoord * 1.35 - vec3(0.0, 0.0, uTime * 0.16));
          float plasma2 = noise3D(sampleCoord * 3.6 + vec3(uTime * 0.22, 0.0, 0.0));
          float filaments = smoothstep(0.24, 0.88, plasma1 * 0.72 + plasma2 * 0.28);

          // Relativistic Doppler Beaming: approaching side is hotter/bluer & brighter; receding side is rich deep copper/crimson
          vec3 tangent = normalize(vec3(-pos.z, 0.0, pos.x));
          float doppler = dot(tangent, -rayDir); // >0 approaching camera, <0 receding
          float beaming = clamp(0.72 + doppler * 0.48, 0.35, 1.35);

          // Heated plasma temperature palette: deep crimson -> burnt copper -> molten amber -> warm gold on inner photon ring
          float heat = clamp((1.0 - (r - DISK_INNER) / (DISK_OUTER - DISK_INNER)) * 1.1 + doppler * 0.32 + filaments * 0.24, 0.0, 1.0);

          vec3 deepCrimson = vec3(0.48, 0.07, 0.02);
          vec3 burntCopper = vec3(0.78, 0.28, 0.05);
          vec3 moltenAmber = vec3(0.96, 0.55, 0.12);
          vec3 paleGold = vec3(1.0, 0.88, 0.58);
          vec3 innerPhotonWhite = vec3(0.95, 0.94, 0.88);

          vec3 diskColor = mix(deepCrimson, burntCopper, smoothstep(0.0, 0.38, heat));
          diskColor = mix(diskColor, moltenAmber, smoothstep(0.38, 0.72, heat));
          diskColor = mix(diskColor, paleGold, smoothstep(0.72, 0.92, heat));
          // Pale-gold/warm-white strictly on the razor-thin inner boundary approaching camera
          diskColor = mix(diskColor, innerPhotonWhite, smoothstep(0.92, 1.0, heat) * max(doppler, 0.0) * smoothstep(DISK_INNER + 0.6, DISK_INNER, r));

          float density = verticalDensity * radialMask * (0.32 + filaments * 1.15) * dt * 0.95;
          vec3 stepGlow = diskColor * density * beaming * transmittance * 1.12;
          // Soft shoulder compression per-step prevents white-out summing
          accumGlow += stepGlow / (vec3(1.0) + stepGlow * 0.35);
          transmittance *= exp(-density * 0.65);
        }
      }

      pos = nextPos;
      dir = nextDir;

      if (transmittance < 0.02) break;
    }

    vec3 finalColor = accumGlow;
    if (!captured) {
      // Escaped ray samples gravitationally lensed starfield & Einstein ring
      finalColor += sampleDeepSpace(dir) * transmittance;
    }

    // Screen-space interleaved gradient dithering prevents color banding in deep gravitational shadows
    float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) * 0.004;
    finalColor += dither;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const PARTICLE_DISK_VERT = /* glsl */ `
  attribute float aRadius;
  attribute float aAngle;
  attribute float aHeight;
  attribute float aSeed;

  uniform float uTime;
  uniform float uPixelRatio;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Fast Keplerian orbital rotation around the singularity
    float omega = 1.65 / pow(max(aRadius, 1.5), 1.45);
    float currentAngle = aAngle + uTime * omega;

    // Subtle vertical plasma wave turbulence
    float y = aHeight * (0.55 + 0.45 * sin(currentAngle * 3.0 + uTime * 1.2 + aSeed * 6.2831));
    vec3 worldPos = vec3(
      cos(currentAngle) * aRadius,
      y,
      sin(currentAngle) * aRadius
    );

    // Relativistic Doppler shift relative to viewer
    vec3 tangent = normalize(vec3(-sin(currentAngle), 0.0, cos(currentAngle)));
    vec3 toCam = normalize(cameraPosition - worldPos);
    float doppler = dot(tangent, toCam);

    float heat = clamp(1.0 - (aRadius - 2.5) / 7.8, 0.0, 1.0);

    vec3 fieryOrange = vec3(1.0, 0.38, 0.04);
    vec3 moltenGold = vec3(1.0, 0.82, 0.36);
    vec3 ionizedBlue = vec3(0.32, 0.78, 1.0);

    vec3 col = mix(fieryOrange, moltenGold, smoothstep(0.1, 0.72, heat));
    col = mix(col, ionizedBlue, smoothstep(0.55, 1.0, heat) * clamp(0.35 + doppler * 0.75, 0.0, 1.0));

    float boost = 0.85 + max(doppler, -0.3) * 0.75;
    vColor = col * boost;

    // Occlude particles that pass behind the event horizon shadow sphere
    vec3 camToHole = -cameraPosition;
    float camDist = length(camToHole);
    vec3 viewDir = normalize(worldPos - cameraPosition);
    float proj = dot(camToHole, viewDir);
    float perpDist = length(camToHole - viewDir * proj);
    float behindHole = step(camDist, length(worldPos - cameraPosition));
    float shadowMask = 1.0 - behindHole * smoothstep(2.55, 2.05, perpDist);

    vAlpha = (0.12 + 0.22 * aSeed) * smoothstep(10.8, 7.2, aRadius) * smoothstep(2.3, 2.9, aRadius) * shadowMask;

    vec4 mvPos = modelViewMatrix * vec4(worldPos, 1.0);
    gl_Position = projectionMatrix * mvPos;
    gl_PointSize = clamp((11.0 + aSeed * 12.0) * uPixelRatio / max(-mvPos.z, 1.0), 1.0, 3.6);
  }
`;

const PARTICLE_DISK_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float core = exp(-d * d * 28.0);
    float halo = 0.25 * exp(-d * d * 8.0);
    // Soft HDR shoulder compression preserves rich color saturation instead of clipping to white
    vec3 col = vColor / (vec3(1.0) + vColor * 0.65);
    gl_FragColor = vec4(col * (1.0 + core * 0.4), (core + halo) * vAlpha * 0.75);
  }
`;

export class EventHorizonScene implements ISpatialScene {
  public readonly id = 'event-horizon' as const;
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  public readonly bloomPreset: BloomPreset = {
    strength: 0.35,
    radius: 0.48,
    threshold: 0.90,
  };
  public readonly exposure = 0.75;

  private raymarchQuad: THREE.Mesh | null = null;
  private raymarchGeo: THREE.PlaneGeometry | null = null;
  private raymarchMat: THREE.ShaderMaterial | null = null;

  private diskPoints: THREE.Points | null = null;
  private diskGeo: THREE.BufferGeometry | null = null;
  private diskMat: THREE.ShaderMaterial | null = null;

  private smoothPointer = new THREE.Vector2();
  private activeParticleCount = DISK_PARTICLE_COUNT;
  private camRight = new THREE.Vector3();
  private camUp = new THREE.Vector3();
  private camForward = new THREE.Vector3();

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000000);
    this.camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 2.8, 13.8);
  }

  public init(renderer: THREE.WebGLRenderer): void {
    // 1. Full-Screen Gravitational Lensing Raymarching Quad
    this.raymarchGeo = new THREE.PlaneGeometry(2, 2);
    this.raymarchMat = new THREE.ShaderMaterial({
      vertexShader: RAYMARCH_VERTEX_SHADER,
      fragmentShader: RAYMARCH_FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uCamPos: { value: new THREE.Vector3() },
        uCamRight: { value: new THREE.Vector3(1, 0, 0) },
        uCamUp: { value: new THREE.Vector3(0, 1, 0) },
        uCamForward: { value: new THREE.Vector3(0, 0, -1) },
        uTanHalfFov: { value: Math.tan(THREE.MathUtils.degToRad(this.camera.fov * 0.5)) },
        uRaySteps: { value: 96 },
      },
      depthWrite: false,
      depthTest: false,
    });

    this.raymarchQuad = new THREE.Mesh(this.raymarchGeo, this.raymarchMat);
    this.raymarchQuad.frustumCulled = false;
    this.raymarchQuad.renderOrder = -10;
    this.scene.add(this.raymarchQuad);

    // 2. Swirling Volumetric 3D Emissive Accretion Disk Particle System
    this.diskGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(DISK_PARTICLE_COUNT * 3);
    const radii = new Float32Array(DISK_PARTICLE_COUNT);
    const angles = new Float32Array(DISK_PARTICLE_COUNT);
    const heights = new Float32Array(DISK_PARTICLE_COUNT);
    const seeds = new Float32Array(DISK_PARTICLE_COUNT);

    for (let i = 0; i < DISK_PARTICLE_COUNT; i++) {
      // Concentrate particles intensely near the inner hot plasma ring
      const u = Math.random();
      const radius = 2.55 + Math.pow(u, 1.55) * 7.8;
      const angle = Math.random() * Math.PI * 2;
      const spread = (radius - 2.3) * 0.055 + 0.05;
      const height = (Math.random() - 0.5) * 2.0 * spread;

      positions[i * 3 + 0] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = height;
      positions[i * 3 + 2] = Math.sin(angle) * radius;

      radii[i] = radius;
      angles[i] = angle;
      heights[i] = height;
      seeds[i] = Math.random();
    }

    this.diskGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.diskGeo.setAttribute('aRadius', new THREE.BufferAttribute(radii, 1));
    this.diskGeo.setAttribute('aAngle', new THREE.BufferAttribute(angles, 1));
    this.diskGeo.setAttribute('aHeight', new THREE.BufferAttribute(heights, 1));
    this.diskGeo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));

    this.diskMat = new THREE.ShaderMaterial({
      vertexShader: PARTICLE_DISK_VERT,
      fragmentShader: PARTICLE_DISK_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.diskPoints = new THREE.Points(this.diskGeo, this.diskMat);
    this.diskPoints.frustumCulled = false;
    this.diskPoints.renderOrder = 5;
    this.scene.add(this.diskPoints);
  }

  public update(delta: number, elapsed: number, pointer: THREE.Vector2): void {
    this.smoothPointer.lerp(pointer, Math.min(1, delta * 2.8));

    // Majestic slow orbital camera inclination showcasing the gravitational lensing arches
    const orbitAngle = elapsed * 0.08 + this.smoothPointer.x * 0.55;
    const radius = 18.6 + Math.sin(elapsed * 0.12) * 1.4;
    const elevation = 2.6 + Math.sin(elapsed * 0.15) * 1.25 + this.smoothPointer.y * 2.4;

    this.camera.position.set(
      Math.sin(orbitAngle) * radius,
      elevation,
      Math.cos(orbitAngle) * radius
    );
    this.camera.lookAt(0, 0, 0);
    // Slight cinematic Dutch roll for cosmic scale
    this.camera.rotateZ(0.16);
    this.camera.updateMatrixWorld();

    // Extract exact orthonormal camera basis vectors for the raymarcher
    this.camera.matrixWorld.extractBasis(this.camRight, this.camUp, this.camForward);
    this.camForward.negate(); // Three.js camera looks down -Z

    if (this.raymarchMat) {
      this.raymarchMat.uniforms.uTime.value = elapsed;
      this.raymarchMat.uniforms.uCamPos.value.copy(this.camera.position);
      this.raymarchMat.uniforms.uCamRight.value.copy(this.camRight);
      this.raymarchMat.uniforms.uCamUp.value.copy(this.camUp);
      this.raymarchMat.uniforms.uCamForward.value.copy(this.camForward);
      this.raymarchMat.uniforms.uTanHalfFov.value = Math.tan(
        THREE.MathUtils.degToRad(this.camera.fov * 0.5)
      );
    }

    if (this.diskMat) {
      this.diskMat.uniforms.uTime.value = elapsed;
    }
  }

  public resize(width: number, height: number): void {
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();
    if (this.raymarchMat) {
      this.raymarchMat.uniforms.uResolution.value.set(width, height);
    }
  }

  public setQuality(scale: number): void {
    const clamped = Math.max(0.35, Math.min(1.0, scale));
    this.activeParticleCount = Math.floor(DISK_PARTICLE_COUNT * clamped);
    if (this.diskGeo) {
      this.diskGeo.setDrawRange(0, this.activeParticleCount);
    }
    if (this.raymarchMat) {
      // Adaptive raymarch step governor (56..96 steps)
      this.raymarchMat.uniforms.uRaySteps.value = Math.round(52 + clamped * 44);
    }
  }

  public getActiveInstanceCount(): number {
    return this.activeParticleCount;
  }

  public dispose(): void {
    if (this.raymarchQuad) {
      this.scene.remove(this.raymarchQuad);
      this.raymarchQuad = null;
    }
    if (this.raymarchGeo) {
      this.raymarchGeo.dispose();
      this.raymarchGeo = null;
    }
    if (this.raymarchMat) {
      this.raymarchMat.dispose();
      this.raymarchMat = null;
    }
    if (this.diskPoints) {
      this.scene.remove(this.diskPoints);
      this.diskPoints = null;
    }
    if (this.diskGeo) {
      this.diskGeo.dispose();
      this.diskGeo = null;
    }
    if (this.diskMat) {
      this.diskMat.dispose();
      this.diskMat = null;
    }
    this.scene.clear();
  }
}
