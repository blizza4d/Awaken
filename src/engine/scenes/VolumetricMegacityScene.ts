import * as THREE from 'three';
import { ISpatialScene, BloomPreset } from '../types';
import { GLSL_DITHER } from '../shaders/common';

const BUILDING_COUNT = 820;
const TRAFFIC_COUNT = 320;
const RAIN_COUNT = 16_000;
const SPLASH_COUNT = 1_200;
const CITY_SPAN_Z = 440;

interface BuildingRecord {
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  hasSpire: boolean;
}

interface TrafficRecord {
  x: number;
  y: number;
  z: number;
  speed: number;
  length: number;
  isCyan: boolean;
}

const RAIN_VERTEX_SHADER = /* glsl */ `
  attribute vec3 aOffset;
  attribute float aSpeed;
  attribute float aPhase;

  uniform float uTime;
  uniform vec3 uCamPos;
  uniform vec3 uWind;

  varying float vAlpha;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 boxSize = vec3(110.0, 95.0, 140.0);

    // Advect raindrop downward and along wind vector
    vec3 pos = aOffset;
    pos.y -= uTime * (42.0 + aSpeed * 24.0);
    pos.x += uWind.x * uTime * 16.0;
    pos.z += uWind.z * uTime * 16.0;

    // Wrap continuously inside a moving volume locked to the drone camera
    vec3 rel = mod(pos - uCamPos + boxSize * 0.5, boxSize) - boxSize * 0.5;
    vec3 worldPos = uCamPos + rel;

    // Stretch streak along velocity vector (rain + wind slant)
    vec3 velDir = normalize(vec3(uWind.x * 16.0, -(42.0 + aSpeed * 24.0), uWind.z * 16.0));
    float streakLen = 1.6 + aSpeed * 1.4;
    vec3 finalPos = worldPos + velDir * (position.y * streakLen) + vec3(position.x * 0.04, 0.0, 0.0);

    float dist = length(rel);
    // Soft, low-opacity (~15%) depth-attenuated rain
    vAlpha = smoothstep(72.0, 12.0, dist) * 0.15 * (0.75 + 0.25 * sin(aPhase * 6.28318 + uTime * 3.0));

    gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);
  }
`;

const RAIN_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uRainTint;
  varying float vAlpha;
  varying vec2 vUv;

  void main() {
    float x = abs(vUv.x - 0.5) * 2.0;
    float y = abs(vUv.y - 0.5) * 2.0;
    float profile = clamp((1.0 - x * x) * (1.0 - y * y * y * y), 0.0, 1.0);
    if (profile <= 0.01) discard;
    gl_FragColor = vec4(uRainTint * 0.65, vAlpha * profile);
  }
`;

const SPLASH_VERTEX_SHADER = /* glsl */ `
  attribute vec3 aSplashPos;
  attribute float aSplashSeed;

  uniform float uTime;

  varying vec2 vUv;
  varying float vLife;

  void main() {
    vUv = uv;
    float cycle = fract(uTime * (1.25 + fract(aSplashSeed * 13.7) * 0.9) + aSplashSeed);
    vLife = cycle;

    float radius = 0.25 + cycle * 1.65;
    vec3 local = vec3(position.x * radius, 0.0, position.z * radius);
    vec3 worldPos = aSplashPos + local;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPos, 1.0);
  }
`;

const SPLASH_FRAGMENT_SHADER = /* glsl */ `
  varying vec2 vUv;
  varying float vLife;

  ${GLSL_DITHER}

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float d = length(p);
    if (d > 1.0) discard;
    float ring = smoothstep(0.08, 0.0, abs(d - vLife * 0.85));
    float alpha = ring * (1.0 - vLife) * 0.45;
    if (alpha < 0.01) discard;
    vec3 col = mix(vec3(0.35, 0.65, 0.85), vec3(0.65, 0.75, 0.95), vLife);
    col += screenDither(gl_FragCoord.xy);
    gl_FragColor = vec4(col * 0.85, alpha);
  }
`;

const BEACON_VERTEX_SHADER = /* glsl */ `
  attribute vec3 aBeaconPos;
  attribute float aBeaconPhase;

  uniform float uTime;

  varying float vFlash;

  void main() {
    // Slow-blinking crimson aviation rooftop obstruction beacons
    float cycle = fract(uTime * 0.65 + aBeaconPhase);
    float flash = smoothstep(0.0, 0.04, cycle) * smoothstep(0.18, 0.09, cycle);

    vFlash = 0.15 + flash * 2.2;

    vec3 localPos = position * (1.0 + flash * 0.4);
    vec3 worldPos = aBeaconPos + localPos;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPos, 1.0);
  }
`;

const BEACON_FRAGMENT_SHADER = /* glsl */ `
  varying float vFlash;

  void main() {
    // Pure subdued crimson beacon glow (#ff1744)
    vec3 red = vec3(0.95, 0.08, 0.18);
    gl_FragColor = vec4(red * vFlash, 1.0);
  }
`;

// Thin vertical architectural LED light accent along building edges
const ACCENT_STRIP_VERTEX_SHADER = /* glsl */ `
  attribute vec3 aStripPos;
  attribute vec3 aStripScale;
  attribute float aStripHue; // 0 = warm tungsten, 1 = slate cyan

  varying vec3 vColor;

  void main() {
    vec3 local = position * aStripScale;
    vec3 worldPos = aStripPos + local;

    vec3 tungsten = vec3(0.851, 0.608, 0.322); // #d99b52
    vec3 slateCyan = vec3(0.357, 0.659, 0.788); // #5ba8c9
    vColor = mix(tungsten, slateCyan, aStripHue);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPos, 1.0);
  }
`;

const ACCENT_STRIP_FRAGMENT_SHADER = /* glsl */ `
  varying vec3 vColor;

  void main() {
    // Restrained thin architectural accent glow
    gl_FragColor = vec4(vColor * 1.15, 1.0);
  }
`;

function createProceduralBrutalistTextures(): {
  albedoMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  emissiveMap: THREE.CanvasTexture;
} {
  const size = 512;

  // 1. Albedo: Brutalist dark wet-concrete & smoked-glass (#04070e)
  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = size;
  albedoCanvas.height = size;
  const aCtx = albedoCanvas.getContext('2d')!;
  aCtx.fillStyle = '#04070e';
  aCtx.fillRect(0, 0, size, size);

  // Facade architectural mullions
  for (let y = 0; y < size; y += 16) {
    aCtx.fillStyle = y % 64 === 0 ? '#0a1220' : '#060a14';
    aCtx.fillRect(0, y, size, 2);
  }
  for (let x = 0; x < size; x += 16) {
    aCtx.fillStyle = '#070c17';
    aCtx.fillRect(x, 0, 2, size);
  }

  // 2. Roughness: Wet concrete with runoff streaks (roughness floor >= 0.35)
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d')!;
  rCtx.fillStyle = '#5a5a5a'; // Baseline roughness 0.35
  rCtx.fillRect(0, 0, size, size);

  for (let i = 0; i < 80; i++) {
    const rx = Math.random() * size;
    const rw = 2 + Math.random() * 6;
    const grad = rCtx.createLinearGradient(rx, 0, rx, size);
    grad.addColorStop(0, 'rgba(48, 48, 48, 0.6)');
    grad.addColorStop(0.5, 'rgba(60, 60, 60, 0.45)');
    grad.addColorStop(1, 'rgba(72, 72, 72, 0.6)');
    rCtx.fillStyle = grad;
    rCtx.fillRect(rx, 0, rw, size);
  }

  // 3. Emissive Recessed Micro-Windows:
  // Strict rule: ~82% dark windows. Lit rooms glow in restrained warm tungsten (#d99b52) and cool slate-cyan (#5ba8c9)
  const emCanvas = document.createElement('canvas');
  emCanvas.width = size;
  emCanvas.height = size;
  const eCtx = emCanvas.getContext('2d')!;
  eCtx.fillStyle = '#000000';
  eCtx.fillRect(0, 0, size, size);

  const windowPalette = [
    '#d99b52', // Restrained warm tungsten
    '#5ba8c9', // Cool slate-cyan
    '#c88b48', // Deep amber
    '#4a95a8', // Subdued teal-slate
  ];

  const rows = 32;
  const cols = 32;
  const cellW = size / cols;
  const cellH = size / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // 82% dark windows
      if (Math.random() < 0.18) {
        const col = windowPalette[Math.floor(Math.random() * windowPalette.length)];
        eCtx.fillStyle = col;
        eCtx.globalAlpha = 0.35 + Math.random() * 0.45;
        eCtx.fillRect(c * cellW + 3, r * cellH + 3, cellW - 6, cellH - 6);
      }
    }
  }
  eCtx.globalAlpha = 1.0;

  const configure = (canvas: HTMLCanvasElement, srgb: boolean) => {
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(1, 3);
    tex.anisotropy = 8;
    if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
    tex.needsUpdate = true;
    return tex;
  };

  return {
    albedoMap: configure(albedoCanvas, true),
    roughnessMap: configure(roughCanvas, false),
    emissiveMap: configure(emCanvas, true),
  };
}

export class VolumetricMegacityScene implements ISpatialScene {
  public readonly id = 'volumetric-megacity' as const;
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  public readonly bloomPreset: BloomPreset = {
    strength: 0.32,
    radius: 0.48,
    threshold: 0.88,
  };
  public readonly exposure = 0.80;

  private buildingsMesh: THREE.InstancedMesh | null = null;
  private spiresMesh: THREE.InstancedMesh | null = null;
  private beaconsMesh: THREE.InstancedMesh | null = null;
  private accentStripsMesh: THREE.InstancedMesh | null = null;
  private trafficMesh: THREE.InstancedMesh | null = null;
  private rainMesh: THREE.InstancedMesh | null = null;
  private splashMesh: THREE.InstancedMesh | null = null;
  private groundMesh: THREE.Mesh | null = null;

  private buildingData: BuildingRecord[] = [];
  private trafficData: TrafficRecord[] = [];
  private disposableTextures: THREE.Texture[] = [];
  private disposableGeometries: THREE.BufferGeometry[] = [];
  private disposableMaterials: THREE.Material[] = [];

  private rainMaterial: THREE.ShaderMaterial | null = null;
  private splashMaterial: THREE.ShaderMaterial | null = null;
  private beaconMaterial: THREE.ShaderMaterial | null = null;
  private accentMaterial: THREE.ShaderMaterial | null = null;

  private dummy = new THREE.Object3D();
  private smoothPointer = new THREE.Vector2();
  private qualityScale = 1.0;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x02040a);
    // Deep midnight-indigo height fog separating near, mid, and far megastructures
    this.scene.fog = new THREE.FogExp2(0x030610, 0.0092);

    this.camera = new THREE.PerspectiveCamera(54, window.innerWidth / window.innerHeight, 0.1, 450);
    this.camera.position.set(0, 52, 110);
  }

  public init(renderer: THREE.WebGLRenderer): void {
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = this.exposure;

    // 1. Procedural Building Facade Textures
    const { albedoMap, roughnessMap, emissiveMap } = createProceduralBrutalistTextures();
    this.disposableTextures.push(albedoMap, roughnessMap, emissiveMap);

    // 2. Instanced Brutalist Towers
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    boxGeo.translate(0, 0.5, 0); // Pivot at bottom
    this.disposableGeometries.push(boxGeo);

    const buildingMat = new THREE.MeshStandardMaterial({
      map: albedoMap,
      roughnessMap,
      roughness: 0.42,
      metalness: 0.78,
      emissive: new THREE.Color(0xffffff),
      emissiveMap,
      emissiveIntensity: 0.65,
    });
    this.disposableMaterials.push(buildingMat);

    this.buildingsMesh = new THREE.InstancedMesh(boxGeo, buildingMat, BUILDING_COUNT);
    this.buildingsMesh.castShadow = false;
    this.buildingsMesh.receiveShadow = false;

    // Procedural Canyon Layout: wide central flight corridor (X between -16 and +16)
    const spireBuildings: BuildingRecord[] = [];
    let count = 0;

    for (let i = 0; i < BUILDING_COUNT; i++) {
      const isWest = i % 2 === 0;
      const xDist = 18 + Math.random() * 88;
      const x = isWest ? -xDist : xDist;
      const z = (Math.random() - 0.5) * CITY_SPAN_Z;

      const width = 12 + Math.random() * 24;
      const depth = 12 + Math.random() * 24;
      const height = 35 + Math.random() * 115;
      const hasSpire = height > 95 && Math.random() > 0.45;

      const record: BuildingRecord = { x, z, width, depth, height, hasSpire };
      this.buildingData.push(record);

      if (hasSpire) spireBuildings.push(record);

      this.dummy.position.set(x, 0, z);
      this.dummy.scale.set(width, height, depth);
      this.dummy.rotation.set(0, (Math.floor(Math.random() * 4) * Math.PI) / 2, 0);
      this.dummy.updateMatrix();

      this.buildingsMesh.setMatrixAt(count++, this.dummy.matrix);
    }

    this.buildingsMesh.instanceMatrix.needsUpdate = true;
    this.scene.add(this.buildingsMesh);

    // 3. Rooftop Spires and Crimson Obstruction Beacons
    const spireCount = spireBuildings.length;
    if (spireCount > 0) {
      const spireGeo = new THREE.CylinderGeometry(0.12, 0.75, 1, 6);
      spireGeo.translate(0, 0.5, 0);
      this.disposableGeometries.push(spireGeo);

      const spireMat = new THREE.MeshStandardMaterial({
        color: 0x141a26,
        roughness: 0.35,
        metalness: 0.85,
      });
      this.disposableMaterials.push(spireMat);

      this.spiresMesh = new THREE.InstancedMesh(spireGeo, spireMat, spireCount);

      const beaconGeo = new THREE.SphereGeometry(0.48, 8, 8);
      this.disposableGeometries.push(beaconGeo);

      const beaconPositions = new Float32Array(spireCount * 3);
      const beaconPhases = new Float32Array(spireCount);

      for (let i = 0; i < spireCount; i++) {
        const b = spireBuildings[i];
        const spireH = 14 + Math.random() * 18;

        this.dummy.position.set(b.x, b.height, b.z);
        this.dummy.scale.set(1, spireH, 1);
        this.dummy.rotation.set(0, 0, 0);
        this.dummy.updateMatrix();
        this.spiresMesh.setMatrixAt(i, this.dummy.matrix);

        beaconPositions[i * 3 + 0] = b.x;
        beaconPositions[i * 3 + 1] = b.height + spireH + 0.25;
        beaconPositions[i * 3 + 2] = b.z;
        beaconPhases[i] = Math.random();
      }

      this.spiresMesh.instanceMatrix.needsUpdate = true;
      this.scene.add(this.spiresMesh);

      beaconGeo.setAttribute('aBeaconPos', new THREE.InstancedBufferAttribute(beaconPositions, 3));
      beaconGeo.setAttribute('aBeaconPhase', new THREE.InstancedBufferAttribute(beaconPhases, 1));

      this.beaconMaterial = new THREE.ShaderMaterial({
        vertexShader: BEACON_VERTEX_SHADER,
        fragmentShader: BEACON_FRAGMENT_SHADER,
        uniforms: { uTime: { value: 0 } },
        transparent: false,
        toneMapped: false,
      });
      this.disposableMaterials.push(this.beaconMaterial);

      this.beaconsMesh = new THREE.InstancedMesh(beaconGeo, this.beaconMaterial, spireCount);
      this.beaconsMesh.frustumCulled = false;
      const idMat = new THREE.Matrix4();
      for (let i = 0; i < spireCount; i++) {
        this.beaconsMesh.setMatrixAt(i, idMat);
      }
      this.beaconsMesh.instanceMatrix.needsUpdate = true;
      this.scene.add(this.beaconsMesh);
    }

    // 4. Sparse Thin Vertical Architectural Light Accents along Building Corners
    const accentCount = 180;
    const accentGeo = new THREE.BoxGeometry(0.25, 1.0, 0.25);
    this.disposableGeometries.push(accentGeo);

    const stripPos = new Float32Array(accentCount * 3);
    const stripScale = new Float32Array(accentCount * 3);
    const stripHue = new Float32Array(accentCount);

    for (let i = 0; i < accentCount; i++) {
      const b = this.buildingData[i % this.buildingData.length];
      const cornerX = b.x + (Math.random() > 0.5 ? 1 : -1) * (b.width * 0.5);
      const cornerZ = b.z + (Math.random() > 0.5 ? 1 : -1) * (b.depth * 0.5);
      const stripH = 15 + Math.random() * 45;
      const stripBaseY = Math.max(10, b.height * (0.2 + Math.random() * 0.5));

      stripPos[i * 3 + 0] = cornerX;
      stripPos[i * 3 + 1] = stripBaseY + stripH * 0.5;
      stripPos[i * 3 + 2] = cornerZ;

      stripScale[i * 3 + 0] = 1.0;
      stripScale[i * 3 + 1] = stripH;
      stripScale[i * 3 + 2] = 1.0;

      stripHue[i] = Math.random() > 0.5 ? 1.0 : 0.0; // 50% slate cyan, 50% warm tungsten
    }

    accentGeo.setAttribute('aStripPos', new THREE.InstancedBufferAttribute(stripPos, 3));
    accentGeo.setAttribute('aStripScale', new THREE.InstancedBufferAttribute(stripScale, 3));
    accentGeo.setAttribute('aStripHue', new THREE.InstancedBufferAttribute(stripHue, 1));

    this.accentMaterial = new THREE.ShaderMaterial({
      vertexShader: ACCENT_STRIP_VERTEX_SHADER,
      fragmentShader: ACCENT_STRIP_FRAGMENT_SHADER,
      transparent: false,
      toneMapped: true,
    });
    this.disposableMaterials.push(this.accentMaterial);

    this.accentStripsMesh = new THREE.InstancedMesh(accentGeo, this.accentMaterial, accentCount);
    this.accentStripsMesh.frustumCulled = false;
    const idMat = new THREE.Matrix4();
    for (let i = 0; i < accentCount; i++) {
      this.accentStripsMesh.setMatrixAt(i, idMat);
    }
    this.accentStripsMesh.instanceMatrix.needsUpdate = true;
    this.scene.add(this.accentStripsMesh);

    // 5. Subtle Distant Flying Headlight & Taillight Streaks
    const trafficGeo = new THREE.BoxGeometry(0.35, 0.18, 1);
    const trafficMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: true });
    this.disposableGeometries.push(trafficGeo);
    this.disposableMaterials.push(trafficMat);

    this.trafficMesh = new THREE.InstancedMesh(trafficGeo, trafficMat, TRAFFIC_COUNT);
    const cyanTraffic = new THREE.Color(0x5ba8c9).multiplyScalar(1.1);
    const redTraffic = new THREE.Color(0xb91c1c).multiplyScalar(1.1);

    for (let i = 0; i < TRAFFIC_COUNT; i++) {
      const isCyan = i % 2 === 0;
      const laneX = (isCyan ? -1 : 1) * (4 + Math.random() * 12);
      const laneY = 16 + Math.random() * 70;
      const laneZ = (Math.random() - 0.5) * CITY_SPAN_Z;
      const speed = (isCyan ? -1 : 1) * (22 + Math.random() * 30);
      const length = 2.4 + Math.random() * 4.6;

      this.trafficData.push({ x: laneX, y: laneY, z: laneZ, speed, length, isCyan });
      this.trafficMesh.setColorAt(i, isCyan ? cyanTraffic : redTraffic);
    }
    if (this.trafficMesh.instanceColor) this.trafficMesh.instanceColor.needsUpdate = true;
    this.scene.add(this.trafficMesh);

    // 6. Ground Asphalt Bed
    const groundGeo = new THREE.PlaneGeometry(350, CITY_SPAN_Z);
    groundGeo.rotateX(-Math.PI / 2);
    this.disposableGeometries.push(groundGeo);

    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x02050b,
      roughness: 0.38,
      metalness: 0.88,
    });
    this.disposableMaterials.push(groundMat);

    this.groundMesh = new THREE.Mesh(groundGeo, groundMat);
    this.groundMesh.position.y = -0.5;
    this.scene.add(this.groundMesh);

    // 7. Ambient Lighting (Moody, dark-room calibrated)
    const ambientLight = new THREE.AmbientLight(0x0a1428, 0.45);
    const moonDirLight = new THREE.DirectionalLight(0x386090, 0.65);
    moonDirLight.position.set(-45, 90, 45);
    this.scene.add(ambientLight, moonDirLight);

    // 8. Soft Depth-Attenuated Rain & Rooftop Splashes
    this.buildRainSystem();
    this.buildSplashSystem();
  }

  private buildRainSystem(): void {
    const quadGeo = new THREE.PlaneGeometry(0.045, 1.0);
    this.disposableGeometries.push(quadGeo);

    const offsets = new Float32Array(RAIN_COUNT * 3);
    const speeds = new Float32Array(RAIN_COUNT);
    const phases = new Float32Array(RAIN_COUNT);

    for (let i = 0; i < RAIN_COUNT; i++) {
      offsets[i * 3 + 0] = (Math.random() - 0.5) * 110;
      offsets[i * 3 + 1] = (Math.random() - 0.5) * 95;
      offsets[i * 3 + 2] = (Math.random() - 0.5) * 140;
      speeds[i] = Math.random();
      phases[i] = Math.random();
    }

    quadGeo.setAttribute('aOffset', new THREE.InstancedBufferAttribute(offsets, 3));
    quadGeo.setAttribute('aSpeed', new THREE.InstancedBufferAttribute(speeds, 1));
    quadGeo.setAttribute('aPhase', new THREE.InstancedBufferAttribute(phases, 1));

    this.rainMaterial = new THREE.ShaderMaterial({
      vertexShader: RAIN_VERTEX_SHADER,
      fragmentShader: RAIN_FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uCamPos: { value: new THREE.Vector3() },
        uWind: { value: new THREE.Vector3(-0.35, 0, -0.15) },
        uRainTint: { value: new THREE.Color(0x6088a8) },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide,
    });
    this.disposableMaterials.push(this.rainMaterial);

    this.rainMesh = new THREE.InstancedMesh(quadGeo, this.rainMaterial, RAIN_COUNT);
    this.rainMesh.frustumCulled = false;
    const identityMat = new THREE.Matrix4();
    for (let i = 0; i < RAIN_COUNT; i++) {
      this.rainMesh.setMatrixAt(i, identityMat);
    }
    this.rainMesh.instanceMatrix.needsUpdate = true;
    this.scene.add(this.rainMesh);
  }

  private buildSplashSystem(): void {
    const splashQuadGeo = new THREE.PlaneGeometry(1, 1);
    splashQuadGeo.rotateX(-Math.PI / 2);
    this.disposableGeometries.push(splashQuadGeo);

    const positions = new Float32Array(SPLASH_COUNT * 3);
    const seeds = new Float32Array(SPLASH_COUNT);

    for (let i = 0; i < SPLASH_COUNT; i++) {
      const b = this.buildingData[i % this.buildingData.length];
      positions[i * 3 + 0] = b.x + (Math.random() - 0.5) * b.width * 0.85;
      positions[i * 3 + 1] = b.height + 0.08;
      positions[i * 3 + 2] = b.z + (Math.random() - 0.5) * b.depth * 0.85;
      seeds[i] = Math.random();
    }

    splashQuadGeo.setAttribute('aSplashPos', new THREE.InstancedBufferAttribute(positions, 3));
    splashQuadGeo.setAttribute('aSplashSeed', new THREE.InstancedBufferAttribute(seeds, 1));

    this.splashMaterial = new THREE.ShaderMaterial({
      vertexShader: SPLASH_VERTEX_SHADER,
      fragmentShader: SPLASH_FRAGMENT_SHADER,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    this.disposableMaterials.push(this.splashMaterial);

    this.splashMesh = new THREE.InstancedMesh(splashQuadGeo, this.splashMaterial, SPLASH_COUNT);
    this.splashMesh.frustumCulled = false;
    const identityMat = new THREE.Matrix4();
    for (let i = 0; i < SPLASH_COUNT; i++) {
      this.splashMesh.setMatrixAt(i, identityMat);
    }
    this.splashMesh.instanceMatrix.needsUpdate = true;
    this.scene.add(this.splashMesh);
  }

  public update(delta: number, elapsed: number, pointer: THREE.Vector2): void {
    this.smoothPointer.lerp(pointer, Math.min(1, delta * 2.0));

    // Moody autonomous drone descent through the canyon
    const flightSpeed = 10.5;
    const camZ = ((elapsed * flightSpeed) % CITY_SPAN_Z) - CITY_SPAN_Z * 0.5;
    const camY = 48 + Math.sin(elapsed * 0.12) * 8.5 + this.smoothPointer.y * 6.0;
    const camX = Math.sin(elapsed * 0.08) * 5.5 + this.smoothPointer.x * 8.0;

    this.camera.position.set(camX, camY, camZ);
    this.camera.lookAt(camX * 0.35, camY - 7.5, camZ - 55);

    // Update traffic
    if (this.trafficMesh) {
      for (let i = 0; i < TRAFFIC_COUNT; i++) {
        const car = this.trafficData[i];
        car.z += car.speed * delta;
        if (car.z > CITY_SPAN_Z * 0.5) car.z -= CITY_SPAN_Z;
        if (car.z < -CITY_SPAN_Z * 0.5) car.z += CITY_SPAN_Z;

        this.dummy.position.set(car.x, car.y, car.z);
        this.dummy.scale.set(1, 1, car.length);
        this.dummy.rotation.set(0, 0, 0);
        this.dummy.updateMatrix();
        this.trafficMesh.setMatrixAt(i, this.dummy.matrix);
      }
      this.trafficMesh.instanceMatrix.needsUpdate = true;
    }

    // Update shaders
    if (this.rainMaterial) {
      this.rainMaterial.uniforms.uTime.value = elapsed;
      this.rainMaterial.uniforms.uCamPos.value.copy(this.camera.position);
    }
    if (this.splashMaterial) {
      this.splashMaterial.uniforms.uTime.value = elapsed;
    }
    if (this.beaconMaterial) {
      this.beaconMaterial.uniforms.uTime.value = elapsed;
    }
  }

  public resize(width: number, height: number): void {
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();
  }

  public setQuality(scale: number): void {
    this.qualityScale = Math.max(0.4, Math.min(1.0, scale));
    if (this.rainMesh) {
      this.rainMesh.count = Math.floor(RAIN_COUNT * this.qualityScale);
      this.rainMesh.instanceMatrix.needsUpdate = true;
    }
  }

  public getActiveInstanceCount(): number {
    return BUILDING_COUNT + TRAFFIC_COUNT + RAIN_COUNT;
  }

  public dispose(): void {
    if (this.buildingsMesh) this.scene.remove(this.buildingsMesh);
    if (this.spiresMesh) this.scene.remove(this.spiresMesh);
    if (this.beaconsMesh) this.scene.remove(this.beaconsMesh);
    if (this.accentStripsMesh) this.scene.remove(this.accentStripsMesh);
    if (this.trafficMesh) this.scene.remove(this.trafficMesh);
    if (this.rainMesh) this.scene.remove(this.rainMesh);
    if (this.splashMesh) this.scene.remove(this.splashMesh);
    if (this.groundMesh) this.scene.remove(this.groundMesh);

    for (const tex of this.disposableTextures) tex.dispose();
    for (const geo of this.disposableGeometries) geo.dispose();
    for (const mat of this.disposableMaterials) mat.dispose();

    this.disposableTextures = [];
    this.disposableGeometries = [];
    this.disposableMaterials = [];
    this.buildingData = [];
    this.trafficData = [];

    this.scene.clear();
  }
}
