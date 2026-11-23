import * as THREE from 'three';
import { ISpatialScene, BloomPreset } from '../types';

const PLANET_RADIUS = 5.2;
const RING_INNER = 6.8;
const RING_OUTER = 13.6;

const SATURN_PLANET_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const SATURN_PLANET_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3 uSunDir;
  uniform vec3 uPlanetPos;
  uniform float uRingInner;
  uniform float uRingOuter;

  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec2 vUv;

  // 3D Simplex-inspired value noise
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.08 + vec2(5.2, 1.7);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 N = normalize(vNormal);
    vec3 L = normalize(uSunDir);
    vec3 V = normalize(cameraPosition - vWorldPos);

    // Multi-octave banded atmospheric turbulence with zonal wind shear
    float lat = vUv.y * 38.0;
    float windOffset = sin(lat * 0.85) * uTime * 0.025;
    vec2 cloudCoord = vec2(vUv.x * 14.0 + windOffset, lat);
    float turbulence = fbm(cloudCoord) * 0.45 + fbm(cloudCoord * 2.5 - vec2(uTime * 0.015, 0.0)) * 0.25;

    // Saturnian atmospheric color bands: Muted ochre -> Soft cream -> Slate-brown turbulent storm bands
    vec3 colOchre = vec3(0.74, 0.62, 0.45);
    vec3 colButter = vec3(0.84, 0.72, 0.52);
    vec3 colCream = vec3(0.88, 0.82, 0.70);
    vec3 colSlateBrown = vec3(0.50, 0.38, 0.28);

    float bandPattern = sin(lat + turbulence * 3.8);
    vec3 surfaceColor = mix(colOchre, colButter, smoothstep(-0.8, 0.1, bandPattern));
    surfaceColor = mix(surfaceColor, colCream, smoothstep(0.1, 0.65, bandPattern));
    surfaceColor = mix(surfaceColor, colSlateBrown, smoothstep(0.65, 1.0, bandPattern));

    // Dramatic low-key cinematic side-lighting with crisp terminator (deep dark nightside)
    float NdotL = dot(N, L);
    float directLight = smoothstep(-0.02, 0.18, NdotL);

    // Calculate ring shadow projected onto planet sphere:
    // Cast ray from point toward sun; check if it intersects equatorial ring plane y=0
    float ringShadow = 1.0;
    if (abs(L.y) > 0.001) {
      float tRing = -vWorldPos.y / L.y;
      if (tRing > 0.0) {
        vec3 hit = vWorldPos + L * tRing;
        float rHit = length(hit.xz);
        if (rHit >= uRingInner && rHit <= uRingOuter) {
          // Inside ring shadow band; modulate by razor-sharp Cassini division gap
          float isCassini = smoothstep(0.035, 0.0, abs(rHit - (uRingInner + (uRingOuter - uRingInner) * 0.485)));
          ringShadow = mix(0.05, 0.72, isCassini);
        }
      }
    }

    // Delicate, restrained atmospheric limb Fresnel (prevents blinding white halo)
    float fresnel = 1.0 - max(dot(N, V), 0.0);
    float rimGlow = pow(fresnel, 4.2) * max(NdotL + 0.15, 0.0);
    vec3 rimColor = mix(vec3(0.32, 0.60, 0.82), vec3(0.82, 0.68, 0.45), clamp(NdotL, 0.0, 1.0));

    // Deep interstellar dark nightside ambient
    vec3 nightAmbient = vec3(0.004, 0.006, 0.009);

    // Screen-space dithering eliminates 8-bit banding across the gas giant terminator
    float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) * 0.005;
    vec3 finalColor = surfaceColor * (directLight * ringShadow) + nightAmbient + (rimColor * rimGlow * 0.32) + dither;
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

const SATURN_RING_VERT = /* glsl */ `
  varying vec3 vWorldPos;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const SATURN_RING_FRAG = /* glsl */ `
  uniform vec3 uSunDir;
  uniform float uPlanetRadius;
  uniform float uRingInner;
  uniform float uRingOuter;

  varying vec3 vWorldPos;
  varying vec2 vUv;

  float hash(float n) { return fract(sin(n) * 43758.5453123); }

  void main() {
    float r = length(vWorldPos.xz);
    if (r < uRingInner || r > uRingOuter) discard;

    float normR = (r - uRingInner) / (uRingOuter - uRingInner);

    // Multiband ring albedo density & gaps with razor-sharp Cassini Division
    float cassini = 1.0 - smoothstep(0.022, 0.004, abs(normR - 0.485));
    // Encke gap at normR ~ 0.82
    float encke = 1.0 - smoothstep(0.010, 0.002, abs(normR - 0.82));

    // High-frequency icy micro-ringlets
    float microRings = 0.5 + 0.5 * sin(normR * 280.0) + 0.25 * sin(normR * 680.0);

    float bandAlpha = (0.35 + 0.36 * microRings) * cassini * encke;

    // Check planet eclipse shadow cast onto rings:
    // Cylinder shadow along Sun direction: dot(P, SunDir) < 0 && distance to sun axis < PlanetRadius
    vec3 L = normalize(uSunDir);
    float proj = dot(vWorldPos, L);
    float perpDistSq = dot(vWorldPos, vWorldPos) - proj * proj;

    float planetShadow = 1.0;
    if (proj < 0.0 && perpDistSq < (uPlanetRadius * uPlanetRadius * 1.02)) {
      float distToEdge = uPlanetRadius - sqrt(max(perpDistSq, 0.0));
      planetShadow = smoothstep(0.0, 0.25, -distToEdge);
    }

    vec3 ringIceCol = mix(vec3(0.78, 0.70, 0.56), vec3(0.85, 0.80, 0.70), microRings);

    // Screen-space dither prevents color quantization on shadow transition
    float dither = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) * 0.004;
    vec3 litColor = ringIceCol * (planetShadow * 0.88 + 0.03) + dither;

    gl_FragColor = vec4(litColor, bandAlpha);
  }
`;

const SATURN_STAR_VERT = /* glsl */ `
  attribute vec3 aColor;
  uniform float uPixelRatio;
  varying vec3 vColor;

  void main() {
    vColor = aColor;
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPos;
    gl_PointSize = clamp(2.2 * uPixelRatio * (160.0 / -mvPos.z), 1.2, 4.5);
  }
`;

const SATURN_STAR_FRAG = /* glsl */ `
  varying vec3 vColor;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float core = exp(-d * d * 28.0);
    float halo = 0.25 * exp(-d * d * 8.0);
    gl_FragColor = vec4(vColor * (1.0 + core * 0.6), (core + halo) * 0.92);
  }
`;

export class SaturnianOrbitScene implements ISpatialScene {
  public readonly id = 'saturnian-orbit' as const;
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  public readonly bloomPreset: BloomPreset = {
    strength: 0.26,
    radius: 0.45,
    threshold: 0.90,
  };
  public readonly exposure = 0.76;

  private planetMesh: THREE.Mesh | null = null;
  private planetGeo: THREE.SphereGeometry | null = null;
  private planetMat: THREE.ShaderMaterial | null = null;

  private ringMesh: THREE.Mesh | null = null;
  private ringGeo: THREE.RingGeometry | null = null;
  private ringMat: THREE.ShaderMaterial | null = null;

  private starfieldPoints: THREE.Points | null = null;
  private starfieldGeo: THREE.BufferGeometry | null = null;
  private starfieldMat: THREE.ShaderMaterial | null = null;

  private smoothPointer = new THREE.Vector2();
  private sunDir = new THREE.Vector3(0.85, 0.24, -0.45).normalize();

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x010207);
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 300);
    this.camera.position.set(15.2, 5.4, 18.5);
  }

  public init(_renderer: THREE.WebGLRenderer): void {
    // 1. Starfield & Milky Way Cosmic Backdrop (26,000 pinpoint stars)
    this.starfieldGeo = new THREE.BufferGeometry();
    const starCount = 26_000;
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const r = 140 + Math.random() * 80;
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);

      // Concentrate a dense galactic dust band
      const isGalactic = Math.abs(Math.sin(theta + 0.4) * Math.sin(phi)) < 0.22;
      const finalPhi = isGalactic ? phi * 0.45 + Math.PI * 0.27 : phi;

      positions[i * 3 + 0] = r * Math.sin(finalPhi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(finalPhi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(finalPhi);

      const isBlue = Math.random() > 0.7;
      colors[i * 3 + 0] = isBlue ? 0.75 : 1.0;
      colors[i * 3 + 1] = isBlue ? 0.88 : 0.94;
      colors[i * 3 + 2] = isBlue ? 1.0 : 0.82;
    }

    this.starfieldGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.starfieldGeo.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    this.starfieldMat = new THREE.ShaderMaterial({
      vertexShader: SATURN_STAR_VERT,
      fragmentShader: SATURN_STAR_FRAG,
      uniforms: {
        uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.starfieldPoints = new THREE.Points(this.starfieldGeo, this.starfieldMat);
    this.scene.add(this.starfieldPoints);

    // 2. Gas Giant Planet Sphere with Banded Atmospheric Turbulence Shader
    this.planetGeo = new THREE.SphereGeometry(PLANET_RADIUS, 64, 48);
    this.planetMat = new THREE.ShaderMaterial({
      vertexShader: SATURN_PLANET_VERT,
      fragmentShader: SATURN_PLANET_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uSunDir: { value: this.sunDir },
        uPlanetPos: { value: new THREE.Vector3(0, 0, 0) },
        uRingInner: { value: RING_INNER },
        uRingOuter: { value: RING_OUTER },
      },
    });
    this.planetMesh = new THREE.Mesh(this.planetGeo, this.planetMat);
    // Saturn's natural axial tilt of ~26.7 degrees
    this.planetMesh.rotation.z = THREE.MathUtils.degToRad(26.7);
    this.scene.add(this.planetMesh);

    // 3. Dense Multi-Band Planetary Ring System with Mutual Shadows
    this.ringGeo = new THREE.RingGeometry(RING_INNER, RING_OUTER, 128);
    // Orient ring geometry into XZ plane
    this.ringGeo.rotateX(-Math.PI / 2);

    this.ringMat = new THREE.ShaderMaterial({
      vertexShader: SATURN_RING_VERT,
      fragmentShader: SATURN_RING_FRAG,
      uniforms: {
        uSunDir: { value: this.sunDir },
        uPlanetRadius: { value: PLANET_RADIUS },
        uRingInner: { value: RING_INNER },
        uRingOuter: { value: RING_OUTER },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.ringMesh = new THREE.Mesh(this.ringGeo, this.ringMat);
    this.ringMesh.rotation.z = THREE.MathUtils.degToRad(26.7);
    this.scene.add(this.ringMesh);
  }

  public update(delta: number, elapsed: number, pointer: THREE.Vector2): void {
    this.smoothPointer.lerp(pointer, Math.min(1, delta * 2.5));

    // Slow organic multi-harmonic orbital camera glide skimming past ring plane
    const orbitAngle =
      0.72 +
      elapsed * 0.022 +
      Math.sin(elapsed * 0.038) * 0.08 +
      this.smoothPointer.x * 0.35;
    const camDist =
      21.0 +
      Math.sin(elapsed * 0.075) * 1.6 +
      Math.cos(elapsed * 0.032 + 1.2) * 0.8;
    const camY =
      4.8 +
      Math.sin(elapsed * 0.055) * 1.5 +
      Math.cos(elapsed * 0.027 + 2.1) * 0.7 +
      this.smoothPointer.y * 2.2;

    this.camera.position.set(
      Math.cos(orbitAngle) * camDist,
      camY,
      Math.sin(orbitAngle) * camDist
    );
    this.camera.lookAt(0, 0, 0);
    this.camera.rotation.z = Math.sin(elapsed * 0.024) * 0.018;

    if (this.planetMat) {
      this.planetMat.uniforms.uTime.value = elapsed;
    }
  }

  public resize(width: number, height: number): void {
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();
    if (this.starfieldMat) {
      this.starfieldMat.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, 2);
    }
  }

  public setQuality(_scale: number): void {
    // Shader-driven, constant high performance
  }

  public getActiveInstanceCount(): number {
    return 26_002;
  }

  public dispose(): void {
    if (this.planetMesh) {
      this.scene.remove(this.planetMesh);
      this.planetMesh = null;
    }
    if (this.planetGeo) {
      this.planetGeo.dispose();
      this.planetGeo = null;
    }
    if (this.planetMat) {
      this.planetMat.dispose();
      this.planetMat = null;
    }

    if (this.ringMesh) {
      this.scene.remove(this.ringMesh);
      this.ringMesh = null;
    }
    if (this.ringGeo) {
      this.ringGeo.dispose();
      this.ringGeo = null;
    }
    if (this.ringMat) {
      this.ringMat.dispose();
      this.ringMat = null;
    }

    if (this.starfieldPoints) {
      this.scene.remove(this.starfieldPoints);
      this.starfieldPoints = null;
    }
    if (this.starfieldGeo) {
      this.starfieldGeo.dispose();
      this.starfieldGeo = null;
    }
    if (this.starfieldMat) {
      this.starfieldMat.dispose();
      this.starfieldMat = null;
    }

    this.scene.clear();
  }
}
