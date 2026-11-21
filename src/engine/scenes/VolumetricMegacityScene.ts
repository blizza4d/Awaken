import * as THREE from 'three';
import { ISpatialScene, BloomPreset } from '../types';

const BUILDING_COUNT = 820;
const NEON_SIGN_COUNT = 260;
const TRAFFIC_COUNT = 340;
const RAIN_COUNT = 18_000;
const SPLASH_COUNT = 1_400;
const CITY_SPAN_Z = 420;

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

  void main() {
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
    // position.y is -0.5..0.5 along line quad
    vec3 finalPos = worldPos + velDir * (position.y * streakLen) + vec3(position.x * 0.045, 0.0, 0.0);

    float dist = length(rel);
    vAlpha = smoothstep(75.0, 12.0, dist) * (0.28 + 0.35 * sin(aPhase * 6.28318 + uTime * 4.0) * 0.5 + 0.25);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(finalPos, 1.0);
  }
`;

const RAIN_FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uRainTint;
  varying float vAlpha;

  void main() {
    gl_FragColor = vec4(uRainTint, vAlpha);
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

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float d = length(p);
    // Crisp expanding circular water ripple ring
    float ring = smoothstep(0.08, 0.0, abs(d - vLife * 0.85));
    float alpha = ring * (1.0 - vLife) * 0.72;
    if (alpha < 0.01) discard;
    vec3 col = mix(vec3(0.45, 0.92, 1.0), vec3(0.95, 0.45, 0.85), vLife);
    gl_FragColor = vec4(col * 1.4, alpha);
  }
`;

const VOLUMETRIC_HAZE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const VOLUMETRIC_HAZE_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uSeed;
  varying vec2 vUv;

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float radial = exp(-dot(p, p) * 2.4);
    float shimmer = 0.82 + 0.18 * sin(uTime * 0.7 + uSeed * 6.2831 + vUv.y * 4.0);
    float alpha = radial * 0.16 * shimmer;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

function createProceduralBuildingTextures(): {
  albedoMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  emissiveMap: THREE.CanvasTexture;
} {
  const size = 512;

  // 1. Albedo Architectural Panel Map
  const albedoCanvas = document.createElement('canvas');
  albedoCanvas.width = size;
  albedoCanvas.height = size;
  const aCtx = albedoCanvas.getContext('2d')!;
  aCtx.fillStyle = '#0c101b';
  aCtx.fillRect(0, 0, size, size);

  // Architectural steel & glass facade mullions
  for (let y = 0; y < size; y += 16) {
    aCtx.fillStyle = y % 64 === 0 ? '#182032' : '#101624';
    aCtx.fillRect(0, y, size, 2);
  }
  for (let x = 0; x < size; x += 24) {
    aCtx.fillStyle = '#151c2c';
    aCtx.fillRect(x, 0, 2, size);
  }

  // 2. Rain Wetness Roughness / Specular Map (dark = mirror wet, bright = rough concrete)
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d')!;
  rCtx.fillStyle = '#686868';
  rCtx.fillRect(0, 0, size, size);

  // Vertical rain-drenched specular sheets (low roughness = glossy neon reflections)
  for (let i = 0; i < 160; i++) {
    const rx = Math.random() * size;
    const rw = 2 + Math.random() * 14;
    const grad = rCtx.createLinearGradient(rx, 0, rx, size);
    grad.addColorStop(0, 'rgba(18, 18, 18, 0.85)');
    grad.addColorStop(0.5, 'rgba(32, 32, 32, 0.7)');
    grad.addColorStop(1, 'rgba(12, 12, 12, 0.92)');
    rCtx.fillStyle = grad;
    rCtx.fillRect(rx, 0, rw, size);
  }

  // 3. Randomized Emissive Window Lights Map
  const emCanvas = document.createElement('canvas');
  emCanvas.width = size;
  emCanvas.height = size;
  const eCtx = emCanvas.getContext('2d')!;
  eCtx.fillStyle = '#000000';
  eCtx.fillRect(0, 0, size, size);

  const palette = [
    '#00f0ff', // Cyberpunk Cyan
    '#38bdf8', // Cool Sky
    '#ff2a85', // Neon Magenta
    '#ff9f1c', // Warm Amber Apartment
    '#fde68a', // Soft Tungsten Office
    '#a855f7', // Violet Lab
  ];

  const rows = 32;
  const cols = 16;
  const cellW = size / cols;
  const cellH = size / rows;

  for (let r = 0; r < rows; r++) {
    // Occasional continuous neon floor strip
    const isNeonFloor = r % 9 === 0 && Math.random() > 0.35;
    const floorColor = Math.random() > 0.45 ? '#00f0ff' : '#ff2a85';

    for (let c = 0; c < cols; c++) {
      if (isNeonFloor) {
        eCtx.fillStyle = floorColor;
        eCtx.fillRect(c * cellW + 2, r * cellH + 5, cellW - 4, cellH - 10);
        continue;
      }

      if (Math.random() < 0.34) {
        const col = palette[Math.floor(Math.random() * palette.length)];
        eCtx.fillStyle = col;
        eCtx.globalAlpha = 0.45 + Math.random() * 0.55;
        eCtx.fillRect(c * cellW + 4, r * cellH + 4, cellW - 8, cellH - 8);
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
    strength: 0.76,
    radius: 0.52,
    threshold: 0.58,
  };
  public readonly exposure = 1.04;

  private buildingsMesh: THREE.InstancedMesh | null = null;
  private neonSignsMesh: THREE.InstancedMesh | null = null;
  private trafficMesh: THREE.InstancedMesh | null = null;
  private rainMesh: THREE.InstancedMesh | null = null;
  private splashMesh: THREE.InstancedMesh | null = null;
  private hazePlanes: THREE.Mesh[] = [];
  private groundMesh: THREE.Mesh | null = null;

  private buildingData: BuildingRecord[] = [];
  private trafficData: TrafficRecord[] = [];
  private disposableTextures: THREE.Texture[] = [];
  private disposableGeometries: THREE.BufferGeometry[] = [];
  private disposableMaterials: THREE.Material[] = [];

  private rainMaterial: THREE.ShaderMaterial | null = null;
  private splashMaterial: THREE.ShaderMaterial | null = null;
  private droneLights: THREE.PointLight[] = [];

  private dummy = new THREE.Object3D();
  private smoothPointer = new THREE.Vector2();
  private qualityScale = 1.0;
  private fogColorBase = new THREE.Color(0x060b1a);
  private fogColorPulse = new THREE.Color(0x130824);

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x050814);
    // Volumetric exponential fog tuned to absorb neon light hues
    this.scene.fog = new THREE.FogExp2(0x060b1a, 0.0082);

    this.camera = new THREE.PerspectiveCamera(62, window.innerWidth / window.innerHeight, 0.5, 420);
    this.camera.position.set(0, 42, 0);
  }

  public init(_renderer: THREE.WebGLRenderer): void {
    // 1. Lighting & Neon Atmospheric Beacons
    const hemi = new THREE.HemisphereLight(0x38bdf8, 0x1e092d, 0.65);
    this.scene.add(hemi);

    const dirLight = new THREE.DirectionalLight(0x7dd3fc, 0.95);
    dirLight.position.set(60, 120, 40);
    this.scene.add(dirLight);

    const cyanBeacon = new THREE.PointLight(0x00f0ff, 220, 140, 1.5);
    const magentaBeacon = new THREE.PointLight(0xff2a85, 210, 140, 1.5);
    const amberBeacon = new THREE.PointLight(0xff9f1c, 160, 120, 1.5);
    this.droneLights.push(cyanBeacon, magentaBeacon, amberBeacon);
    this.scene.add(cyanBeacon, magentaBeacon, amberBeacon);

    // 2. Rain-Slick Street Surface
    const { albedoMap, roughnessMap, emissiveMap } = createProceduralBuildingTextures();
    this.disposableTextures.push(albedoMap, roughnessMap, emissiveMap);

    const groundGeo = new THREE.PlaneGeometry(520, 520);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x05070e,
      roughness: 0.14,
      metalness: 0.78,
    });
    this.disposableGeometries.push(groundGeo);
    this.disposableMaterials.push(groundMat);

    this.groundMesh = new THREE.Mesh(groundGeo, groundMat);
    this.groundMesh.rotation.x = -Math.PI / 2;
    this.groundMesh.position.y = 0;
    this.scene.add(this.groundMesh);

    // 3. Instanced Procedural Skyscrapers with Wet PBR Specular + Emissive Windows
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    boxGeo.translate(0, 0.5, 0); // Anchor at ground y=0
    this.disposableGeometries.push(boxGeo);

    const buildingMat = new THREE.MeshStandardMaterial({
      map: albedoMap,
      roughnessMap: roughnessMap,
      roughness: 0.32,
      metalness: 0.72,
      emissive: new THREE.Color(0xffffff),
      emissiveMap: emissiveMap,
      emissiveIntensity: 1.55,
    });
    this.disposableMaterials.push(buildingMat);

    this.buildingsMesh = new THREE.InstancedMesh(boxGeo, buildingMat, BUILDING_COUNT);
    const color = new THREE.Color();

    for (let i = 0; i < BUILDING_COUNT; i++) {
      // Leave a dramatic central drone flight canyon (|x| > 16)
      const side = i % 2 === 0 ? 1 : -1;
      const laneOffset = 17 + Math.pow(Math.random(), 1.35) * 145;
      const x = side * laneOffset;
      const z = (Math.random() - 0.5) * CITY_SPAN_Z;

      const width = 8 + Math.random() * 14;
      const depth = 8 + Math.random() * 14;
      // Taller monumental megastructures flanking the central corridor
      const canyonFactor = Math.max(0.25, 1.0 - laneOffset / 165);
      const height = 24 + Math.random() * 98 * (0.45 + canyonFactor * 0.85);

      this.buildingData.push({ x, z, width, depth, height, hasSpire: height > 75 });

      this.dummy.position.set(x, 0, z);
      this.dummy.scale.set(width, height, depth);
      this.dummy.rotation.set(0, 0, 0);
      this.dummy.updateMatrix();
      this.buildingsMesh.setMatrixAt(i, this.dummy.matrix);

      // Subtle architectural tint variation
      color.setHSL(0.58 + Math.random() * 0.14, 0.25, 0.62 + Math.random() * 0.38);
      this.buildingsMesh.setColorAt(i, color);
    }
    this.buildingsMesh.instanceMatrix.needsUpdate = true;
    if (this.buildingsMesh.instanceColor) this.buildingsMesh.instanceColor.needsUpdate = true;
    this.scene.add(this.buildingsMesh);

    // 4. Instanced Glowing Neon Billboards & Rooftop Trim Bands
    const signGeo = new THREE.BoxGeometry(1, 1, 0.35);
    const signMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      toneMapped: false,
    });
    this.disposableGeometries.push(signGeo);
    this.disposableMaterials.push(signMat);

    this.neonSignsMesh = new THREE.InstancedMesh(signGeo, signMat, NEON_SIGN_COUNT);
    const neonColors = [
      new THREE.Color(0x00f0ff).multiplyScalar(2.4),
      new THREE.Color(0xff2a85).multiplyScalar(2.4),
      new THREE.Color(0xa855f7).multiplyScalar(2.2),
      new THREE.Color(0xff9f1c).multiplyScalar(2.2),
    ];

    for (let i = 0; i < NEON_SIGN_COUNT; i++) {
      const b = this.buildingData[i % this.buildingData.length];
      const inwardSign = b.x > 0 ? -1 : 1;
      const sx = b.x + inwardSign * (b.width * 0.5 + 0.4);
      const sy = Math.max(14, b.height * (0.45 + Math.random() * 0.5));
      const verticalBanner = Math.random() > 0.45;

      this.dummy.position.set(sx, sy, b.z);
      this.dummy.rotation.set(0, Math.PI / 2, 0);
      this.dummy.scale.set(
        verticalBanner ? 1.8 : b.depth * 0.72,
        verticalBanner ? 14 + Math.random() * 18 : 2.2 + Math.random() * 2.5,
        1
      );
      this.dummy.updateMatrix();
      this.neonSignsMesh.setMatrixAt(i, this.dummy.matrix);
      this.neonSignsMesh.setColorAt(i, neonColors[i % neonColors.length]);
    }
    this.neonSignsMesh.instanceMatrix.needsUpdate = true;
    if (this.neonSignsMesh.instanceColor) this.neonSignsMesh.instanceColor.needsUpdate = true;
    this.scene.add(this.neonSignsMesh);

    // 5. Instanced Aerial Drone Spinner Traffic Lanes
    const trafficGeo = new THREE.BoxGeometry(0.45, 0.25, 1);
    const trafficMat = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
    this.disposableGeometries.push(trafficGeo);
    this.disposableMaterials.push(trafficMat);

    this.trafficMesh = new THREE.InstancedMesh(trafficGeo, trafficMat, TRAFFIC_COUNT);
    const cyanCar = new THREE.Color(0x00f0ff).multiplyScalar(3.0);
    const redCar = new THREE.Color(0xff1e4d).multiplyScalar(3.0);

    for (let i = 0; i < TRAFFIC_COUNT; i++) {
      const isCyan = i % 2 === 0;
      const laneX = (isCyan ? -1 : 1) * (3 + Math.random() * 11);
      const laneY = 14 + Math.random() * 68;
      const laneZ = (Math.random() - 0.5) * CITY_SPAN_Z;
      const speed = (isCyan ? -1 : 1) * (24 + Math.random() * 32);
      const length = 2.8 + Math.random() * 5.2;

      this.trafficData.push({ x: laneX, y: laneY, z: laneZ, speed, length, isCyan });
      this.trafficMesh.setColorAt(i, isCyan ? cyanCar : redCar);
    }
    if (this.trafficMesh.instanceColor) this.trafficMesh.instanceColor.needsUpdate = true;
    this.scene.add(this.trafficMesh);

    // 6. Volumetric Colored Atmospheric Neon Haze Shafts
    const hazeGeo = new THREE.PlaneGeometry(68, 68);
    this.disposableGeometries.push(hazeGeo);
    const hazePalette = [0x00e5ff, 0xff2a85, 0x7c3aed, 0xff9f1c];

    for (let i = 0; i < 14; i++) {
      const hMat = new THREE.ShaderMaterial({
        vertexShader: VOLUMETRIC_HAZE_VERT,
        fragmentShader: VOLUMETRIC_HAZE_FRAG,
        uniforms: {
          uColor: { value: new THREE.Color(hazePalette[i % hazePalette.length]) },
          uTime: { value: 0 },
          uSeed: { value: Math.random() },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      });
      this.disposableMaterials.push(hMat);

      const plane = new THREE.Mesh(hazeGeo, hMat);
      plane.position.set(
        (i % 2 === 0 ? -1 : 1) * (12 + Math.random() * 28),
        22 + Math.random() * 44,
        -20 - i * 24
      );
      this.hazePlanes.push(plane);
      this.scene.add(plane);
    }

    // 7. Wind-Driven Slanted Rain Sheet Particle System (Custom GLSL)
    const rainQuad = new THREE.PlaneGeometry(1, 1);
    this.disposableGeometries.push(rainQuad);

    const rainOffsets = new Float32Array(RAIN_COUNT * 3);
    const rainSpeeds = new Float32Array(RAIN_COUNT);
    const rainPhases = new Float32Array(RAIN_COUNT);

    for (let i = 0; i < RAIN_COUNT; i++) {
      rainOffsets[i * 3 + 0] = (Math.random() - 0.5) * 110;
      rainOffsets[i * 3 + 1] = Math.random() * 95;
      rainOffsets[i * 3 + 2] = (Math.random() - 0.5) * 140;
      rainSpeeds[i] = Math.random();
      rainPhases[i] = Math.random();
    }

    rainQuad.setAttribute('aOffset', new THREE.InstancedBufferAttribute(rainOffsets, 3));
    rainQuad.setAttribute('aSpeed', new THREE.InstancedBufferAttribute(rainSpeeds, 1));
    rainQuad.setAttribute('aPhase', new THREE.InstancedBufferAttribute(rainPhases, 1));

    this.rainMaterial = new THREE.ShaderMaterial({
      vertexShader: RAIN_VERTEX_SHADER,
      fragmentShader: RAIN_FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uCamPos: { value: new THREE.Vector3() },
        uWind: { value: new THREE.Vector3(0.35, 0, -0.15) },
        uRainTint: { value: new THREE.Color(0x9be7ff) },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    this.disposableMaterials.push(this.rainMaterial);

    this.rainMesh = new THREE.InstancedMesh(rainQuad, this.rainMaterial, RAIN_COUNT);
    this.rainMesh.frustumCulled = false;
    const identity = new THREE.Matrix4();
    for (let i = 0; i < RAIN_COUNT; i++) {
      this.rainMesh.setMatrixAt(i, identity);
    }
    this.rainMesh.instanceMatrix.needsUpdate = true;
    this.scene.add(this.rainMesh);

    // 8. Rooftop & Street Horizontal Surface Splash Sprites
    const splashGeo = new THREE.PlaneGeometry(1, 1);
    splashGeo.rotateX(-Math.PI / 2);
    this.disposableGeometries.push(splashGeo);

    const splashPositions = new Float32Array(SPLASH_COUNT * 3);
    const splashSeeds = new Float32Array(SPLASH_COUNT);

    for (let i = 0; i < SPLASH_COUNT; i++) {
      if (i < SPLASH_COUNT * 0.72) {
        // Trigger splashes directly on horizontal skyscraper rooftops
        const b = this.buildingData[i % this.buildingData.length];
        splashPositions[i * 3 + 0] = b.x + (Math.random() - 0.5) * b.width * 0.85;
        splashPositions[i * 3 + 1] = b.height + 0.08;
        splashPositions[i * 3 + 2] = b.z + (Math.random() - 0.5) * b.depth * 0.85;
      } else {
        // Trigger splashes along central wet street corridor
        splashPositions[i * 3 + 0] = (Math.random() - 0.5) * 32;
        splashPositions[i * 3 + 1] = 0.08;
        splashPositions[i * 3 + 2] = (Math.random() - 0.5) * CITY_SPAN_Z;
      }
      splashSeeds[i] = Math.random();
    }

    splashGeo.setAttribute('aSplashPos', new THREE.InstancedBufferAttribute(splashPositions, 3));
    splashGeo.setAttribute('aSplashSeed', new THREE.InstancedBufferAttribute(splashSeeds, 1));

    this.splashMaterial = new THREE.ShaderMaterial({
      vertexShader: SPLASH_VERTEX_SHADER,
      fragmentShader: SPLASH_FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    this.disposableMaterials.push(this.splashMaterial);

    this.splashMesh = new THREE.InstancedMesh(splashGeo, this.splashMaterial, SPLASH_COUNT);
    this.splashMesh.frustumCulled = false;
    for (let i = 0; i < SPLASH_COUNT; i++) {
      this.splashMesh.setMatrixAt(i, identity);
    }
    this.splashMesh.instanceMatrix.needsUpdate = true;
    this.scene.add(this.splashMesh);
  }

  public update(delta: number, elapsed: number, pointer: THREE.Vector2): void {
    this.smoothPointer.lerp(pointer, Math.min(1, delta * 3.0));

    // Smooth high-altitude autonomous drone cruise down the neon canyon with organic multi-harmonic flight drift
    const droneZ = -((elapsed * 16.5) % (CITY_SPAN_Z * 0.5));
    const swayX =
      Math.sin(elapsed * 0.24) * 5.2 +
      Math.sin(elapsed * 0.53 + 1.1) * 1.8 +
      this.smoothPointer.x * 6.0;
    const altY =
      44 +
      Math.sin(elapsed * 0.35) * 6.5 +
      Math.cos(elapsed * 0.17 + 2.3) * 2.2 +
      this.smoothPointer.y * 5.0;

    this.camera.position.set(swayX, altY, droneZ + 80);
    this.camera.lookAt(
      swayX * 0.45 + Math.sin(elapsed * 0.18) * 3.5 + Math.cos(elapsed * 0.08) * 1.5,
      altY - 6.5 + Math.sin(elapsed * 0.12) * 1.2,
      droneZ - 45
    );
    // Subtle drone banking roll into turns with atmospheric micro-tremor
    this.camera.rotation.z +=
      -Math.cos(elapsed * 0.24) * 0.055 +
      Math.sin(elapsed * 0.61) * 0.008 -
      this.smoothPointer.x * 0.06;

    // Move ground & neon fog beacons smoothly with the drone
    if (this.groundMesh) {
      this.groundMesh.position.z = this.camera.position.z - 80;
    }

    if (this.droneLights.length >= 3) {
      this.droneLights[0].position.set(swayX - 24, altY - 8, this.camera.position.z - 45);
      this.droneLights[1].position.set(swayX + 26, altY + 4, this.camera.position.z - 75);
      this.droneLights[2].position.set(swayX, altY - 22, this.camera.position.z - 110);
    }

    // Subtly shift exponential fog absorption color as drone passes neon districts
    if (this.scene.fog instanceof THREE.FogExp2) {
      const neonShift = 0.5 + 0.5 * Math.sin(elapsed * 0.22);
      this.scene.fog.color.copy(this.fogColorBase).lerp(this.fogColorPulse, neonShift * 0.6);
    }

    // Update volumetric haze planes
    for (const plane of this.hazePlanes) {
      const mat = plane.material as THREE.ShaderMaterial;
      mat.uniforms.uTime.value = elapsed;
      plane.lookAt(this.camera.position);
      if (plane.position.z > this.camera.position.z + 30) {
        plane.position.z -= 336;
      } else if (plane.position.z < this.camera.position.z - 310) {
        plane.position.z += 336;
      }
    }

    // Update aerial drone traffic lanes
    if (this.trafficMesh) {
      const halfSpan = CITY_SPAN_Z * 0.5;
      for (let i = 0; i < this.trafficData.length; i++) {
        const car = this.trafficData[i];
        car.z += car.speed * delta;
        if (car.z > halfSpan) car.z = -halfSpan;
        if (car.z < -halfSpan) car.z = halfSpan;

        this.dummy.position.set(car.x, car.y, car.z);
        this.dummy.rotation.set(0, 0, 0);
        this.dummy.scale.set(1, 1, car.length);
        this.dummy.updateMatrix();
        this.trafficMesh.setMatrixAt(i, this.dummy.matrix);
      }
      this.trafficMesh.instanceMatrix.needsUpdate = true;
    }

    // Update wind-driven rain sheet shader
    if (this.rainMaterial) {
      this.rainMaterial.uniforms.uTime.value = elapsed;
      this.rainMaterial.uniforms.uCamPos.value.copy(this.camera.position);
      // Gusting atmospheric wind vector
      this.rainMaterial.uniforms.uWind.value.set(
        0.35 + Math.sin(elapsed * 0.4) * 0.28,
        0,
        -0.18 + Math.cos(elapsed * 0.3) * 0.14
      );
    }

    // Update rooftop & street splash ripples
    if (this.splashMaterial) {
      this.splashMaterial.uniforms.uTime.value = elapsed;
    }
  }

  public resize(width: number, height: number): void {
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();
  }

  public setQuality(scale: number): void {
    this.qualityScale = Math.max(0.35, Math.min(1.0, scale));
    if (this.rainMesh) {
      this.rainMesh.count = Math.floor(RAIN_COUNT * this.qualityScale);
    }
    if (this.splashMesh) {
      this.splashMesh.count = Math.floor(SPLASH_COUNT * this.qualityScale);
    }
  }

  public getActiveInstanceCount(): number {
    return (
      BUILDING_COUNT +
      NEON_SIGN_COUNT +
      TRAFFIC_COUNT +
      Math.floor((RAIN_COUNT + SPLASH_COUNT) * this.qualityScale)
    );
  }

  public dispose(): void {
    [
      this.buildingsMesh,
      this.neonSignsMesh,
      this.trafficMesh,
      this.rainMesh,
      this.splashMesh,
    ].forEach((m) => {
      if (m) {
        this.scene.remove(m);
        m.dispose();
      }
    });

    this.hazePlanes.forEach((p) => this.scene.remove(p));
    this.hazePlanes = [];

    if (this.groundMesh) {
      this.scene.remove(this.groundMesh);
      this.groundMesh = null;
    }

    this.disposableGeometries.forEach((g) => g.dispose());
    this.disposableMaterials.forEach((m) => m.dispose());
    this.disposableTextures.forEach((t) => t.dispose());

    this.disposableGeometries = [];
    this.disposableMaterials = [];
    this.disposableTextures = [];
    this.buildingData = [];
    this.trafficData = [];
    this.droneLights = [];
    this.buildingsMesh = null;
    this.neonSignsMesh = null;
    this.trafficMesh = null;
    this.rainMesh = null;
    this.splashMesh = null;
    this.rainMaterial = null;
    this.splashMaterial = null;

    this.scene.clear();
  }
}
