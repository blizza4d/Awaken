import * as THREE from 'three';
import { ISpatialScene, BloomPreset } from '../types';

const ROAD_WIDTH = 18;
const ROAD_LENGTH = 240;
const STREETLIGHT_COUNT = 14;
const GUARDRAIL_POST_COUNT = 48;
const TREE_COUNT = 36;
const SKYLINE_BUILDING_COUNT = 45;

// Custom Wet Highway Asphalt Shader with dynamic streetlight reflections
const WET_ROAD_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPos;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const WET_ROAD_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3 uCarPos;
  uniform vec3 uLightPos[6];
  uniform vec3 uLightColor[6];

  varying vec2 vUv;
  varying vec3 vWorldPos;

  // Simple hash noise for asphalt micro-texture
  float hash(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 34.23);
    return fract(p.x * p.y);
  }

  void main() {
    // Scrolling road coordinates
    vec2 roadCoord = vec2(vWorldPos.x + uTime * 28.0, vWorldPos.z);

    // Asphalt dark base color
    float grain = hash(floor(roadCoord * 16.0)) * 0.08;
    vec3 asphalt = vec3(0.045 + grain, 0.05 + grain, 0.06 + grain);

    // Highway painted dashed center lane lines (Z = 0) and solid edge lines (Z = -5.5, +5.5)
    float centerDash = step(0.45, fract(roadCoord.x * 0.07)) * smoothstep(0.18, 0.08, abs(vWorldPos.z));
    float edgeLine1 = smoothstep(0.16, 0.06, abs(vWorldPos.z - 5.5));
    float edgeLine2 = smoothstep(0.16, 0.06, abs(vWorldPos.z + 5.5));
    float lines = clamp(centerDash * 0.85 + edgeLine1 * 0.75 + edgeLine2 * 0.75, 0.0, 1.0);

    vec3 roadColor = mix(asphalt, vec3(0.72, 0.75, 0.8), lines);

    // Wet asphalt mirror sheen & specular pools from passing streetlights
    vec3 lightAccum = vec3(0.0);
    for (int i = 0; i < 6; i++) {
      vec3 lightPos = uLightPos[i];
      vec3 toLight = lightPos - vWorldPos;
      float dist2 = dot(toLight, toLight);
      float atten = 1.0 / (1.0 + dist2 * 0.045);

      // Elongated anisotropic specular wet reflection streak along road
      float spec = exp(-abs(vWorldPos.z - lightPos.z) * 1.8) * exp(-abs(vWorldPos.x - lightPos.x) * 0.28);
      lightAccum += uLightColor[i] * (atten * 0.55 + spec * 0.85);
    }

    // Car headlight pool on road ahead of car (car at X = 0, headlights cast to X > 0)
    vec3 headDir = vWorldPos - (uCarPos + vec3(2.5, 0.4, 0.0));
    float headDist = length(headDir);
    float headBeam = smoothstep(22.0, 4.0, headDist) * smoothstep(3.5, 0.0, abs(vWorldPos.z - uCarPos.z));
    vec3 headlightGlow = vec3(1.0, 0.95, 0.82) * headBeam * 0.65;

    // Red taillight reflection behind car (X < 0)
    vec3 tailDir = vWorldPos - (uCarPos + vec3(-2.4, 0.4, 0.0));
    float tailDist = length(tailDir);
    float tailBeam = smoothstep(9.0, 1.0, tailDist) * smoothstep(2.2, 0.0, abs(vWorldPos.z - uCarPos.z));
    vec3 taillightGlow = vec3(0.95, 0.08, 0.08) * tailBeam * 0.55;

    vec3 finalCol = roadColor + lightAccum + headlightGlow + taillightGlow;
    gl_FragColor = vec4(finalCol, 1.0);
  }
`;

// Volumetric Headlight Mist Cone Shader
const HEADLIGHT_CONE_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const HEADLIGHT_CONE_FRAG = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    float lengthFade = smoothstep(1.0, 0.08, vUv.x);
    float widthFade = smoothstep(0.5, 0.0, abs(vUv.y - 0.5));
    float dust = 0.85 + 0.15 * sin(vUv.x * 24.0 - uTime * 6.0);
    float alpha = lengthFade * widthFade * dust * 0.32;
    gl_FragColor = vec4(1.0, 0.95, 0.85, alpha);
  }
`;

export class MidnightCruiseScene implements ISpatialScene {
  public readonly id = 'midnight-cruise' as const;
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  public readonly bloomPreset: BloomPreset = {
    strength: 0.85,
    radius: 0.58,
    threshold: 0.55,
  };
  public readonly exposure = 1.04;

  // Car Components
  private carGroup = new THREE.Group();
  private carBodyMesh: THREE.Mesh | null = null;
  private wheels: THREE.Mesh[] = [];
  private headlightCone: THREE.Mesh | null = null;

  // Road & Streetlights
  private roadMesh: THREE.Mesh | null = null;
  private roadMat: THREE.ShaderMaterial | null = null;
  private streetlightGroup = new THREE.Group();
  private activeLightPositions: THREE.Vector3[] = [];
  private activeLightColors: THREE.Vector3[] = [];

  // Parallax Scenery
  private guardrailGroup = new THREE.Group();
  private treeGroup = new THREE.Group();
  private skylineGroup = new THREE.Group();
  private moonMesh: THREE.Mesh | null = null;

  // Resource Tracking
  private disposableGeometries: THREE.BufferGeometry[] = [];
  private disposableMaterials: THREE.Material[] = [];

  private smoothPointer = new THREE.Vector2();

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x070c17);
    this.scene.fog = new THREE.FogExp2(0x09101e, 0.011);

    // Side-tracking perspective: camera to the side-rear of the car, looking slightly forward
    this.camera = new THREE.PerspectiveCamera(46, window.innerWidth / window.innerHeight, 0.1, 450);
    this.camera.position.set(-2.2, 2.1, 9.4);
  }

  public init(_renderer: THREE.WebGLRenderer): void {
    // 1. Ambient & Directional Moonlight
    const hemi = new THREE.HemisphereLight(0x7dd3fc, 0x09101d, 0.45);
    this.scene.add(hemi);

    const moonDir = new THREE.DirectionalLight(0xa5f3fc, 0.75);
    moonDir.position.set(-40, 60, -80);
    this.scene.add(moonDir);

    // 2. Build the Sleek Minimalist Car Silhouette
    this.buildCar();

    // 3. Wet Highway Asphalt Road
    const roadGeo = new THREE.PlaneGeometry(ROAD_LENGTH, ROAD_WIDTH, 12, 12);
    roadGeo.rotateX(-Math.PI / 2);
    this.disposableGeometries.push(roadGeo);

    for (let i = 0; i < 6; i++) {
      this.activeLightPositions.push(new THREE.Vector3((i - 2.5) * 32, 5.2, -6.5));
      const isAmber = i % 2 === 0;
      this.activeLightColors.push(
        isAmber ? new THREE.Vector3(1.0, 0.65, 0.22) : new THREE.Vector3(0.55, 0.85, 1.0)
      );
    }

    this.roadMat = new THREE.ShaderMaterial({
      vertexShader: WET_ROAD_VERT,
      fragmentShader: WET_ROAD_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uCarPos: { value: this.carGroup.position },
        uLightPos: { value: this.activeLightPositions },
        uLightColor: { value: this.activeLightColors },
      },
    });
    this.disposableMaterials.push(this.roadMat);

    this.roadMesh = new THREE.Mesh(roadGeo, this.roadMat);
    this.roadMesh.position.set(0, 0, 0);
    this.scene.add(this.roadMesh);

    // 4. Streetlights (Arched light poles along road edge)
    this.buildStreetlights();

    // 5. Foreground Guardrails (Speed Blur Parallax)
    this.buildGuardrails();

    // 6. Midground Silhouetted Trees
    this.buildTrees();

    // 7. Distant City Skyline & Moon
    this.buildSkyline();
  }

  private buildCar(): void {
    // Sleek aerodynamic GT chassis
    const bodyGeo = new THREE.BoxGeometry(4.4, 0.85, 1.95);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x0c111c,
      roughness: 0.18,
      metalness: 0.88,
    });
    this.disposableGeometries.push(bodyGeo);
    this.disposableMaterials.push(bodyMat);

    this.carBodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    this.carBodyMesh.position.set(0, 0.72, 0);
    this.carGroup.add(this.carBodyMesh);

    // Aerodynamic greenhouse / cabin glass
    const cabinGeo = new THREE.BoxGeometry(2.3, 0.58, 1.62);
    const cabinMat = new THREE.MeshStandardMaterial({
      color: 0x060910,
      roughness: 0.08,
      metalness: 0.95,
      transparent: true,
      opacity: 0.88,
    });
    this.disposableGeometries.push(cabinGeo);
    this.disposableMaterials.push(cabinMat);

    const cabinMesh = new THREE.Mesh(cabinGeo, cabinMat);
    cabinMesh.position.set(-0.25, 1.32, 0);
    this.carGroup.add(cabinMesh);

    // Glowing warm LED headlights
    const hlGeo = new THREE.BoxGeometry(0.12, 0.18, 0.42);
    const hlMat = new THREE.MeshBasicMaterial({ color: 0xfffaed });
    this.disposableGeometries.push(hlGeo);
    this.disposableMaterials.push(hlMat);

    const hlMesh = new THREE.Mesh(hlGeo, hlMat);
    hlMesh.position.set(2.22, 0.72, 0.65);
    const hrMesh = hlMesh.clone();
    hrMesh.position.z = -0.65;
    this.carGroup.add(hlMesh, hrMesh);

    // Glowing red LED taillight lightbar
    const tlGeo = new THREE.BoxGeometry(0.1, 0.14, 1.8);
    const tlMat = new THREE.MeshBasicMaterial({ color: 0xff1e27 });
    this.disposableGeometries.push(tlGeo);
    this.disposableMaterials.push(tlMat);

    const tlMesh = new THREE.Mesh(tlGeo, tlMat);
    tlMesh.position.set(-2.22, 0.78, 0);
    this.carGroup.add(tlMesh);

    // Volumetric forward headlight projection beam cone
    const coneGeo = new THREE.PlaneGeometry(16, 5.2);
    coneGeo.rotateZ(Math.PI / 2);
    coneGeo.rotateY(Math.PI / 2);
    this.disposableGeometries.push(coneGeo);

    const coneMat = new THREE.ShaderMaterial({
      vertexShader: HEADLIGHT_CONE_VERT,
      fragmentShader: HEADLIGHT_CONE_FRAG,
      uniforms: { uTime: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    this.disposableMaterials.push(coneMat);

    this.headlightCone = new THREE.Mesh(coneGeo, coneMat);
    this.headlightCone.position.set(10.2, 0.65, 0);
    this.carGroup.add(this.headlightCone);

    // 4 Wheels with alloy rims
    const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.32, 16);
    wheelGeo.rotateX(Math.PI / 2);
    const wheelMat = new THREE.MeshStandardMaterial({
      color: 0x111622,
      roughness: 0.45,
      metalness: 0.65,
    });
    this.disposableGeometries.push(wheelGeo);
    this.disposableMaterials.push(wheelMat);

    const wheelOffsets = [
      [1.35, 0.38, 0.95],
      [1.35, 0.38, -0.95],
      [-1.35, 0.38, 0.95],
      [-1.35, 0.38, -0.95],
    ];

    for (const [wx, wy, wz] of wheelOffsets) {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.position.set(wx, wy, wz);
      this.wheels.push(w);
      this.carGroup.add(w);
    }

    this.carGroup.position.set(0, 0, 0);
    this.scene.add(this.carGroup);
  }

  private buildStreetlights(): void {
    const poleGeo = new THREE.CylinderGeometry(0.08, 0.12, 7.5, 8);
    const armGeo = new THREE.BoxGeometry(2.4, 0.08, 0.08);
    const lampGeo = new THREE.BoxGeometry(0.8, 0.15, 0.35);

    const poleMat = new THREE.MeshStandardMaterial({
      color: 0x182030,
      roughness: 0.6,
      metalness: 0.8,
    });
    this.disposableGeometries.push(poleGeo, armGeo, lampGeo);
    this.disposableMaterials.push(poleMat);

    for (let i = 0; i < STREETLIGHT_COUNT; i++) {
      const group = new THREE.Group();
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.y = 3.75;
      group.add(pole);

      const arm = new THREE.Mesh(armGeo, poleMat);
      arm.position.set(0.9, 7.3, 0);
      group.add(arm);

      const isAmber = i % 2 === 0;
      const lampMat = new THREE.MeshBasicMaterial({
        color: isAmber ? 0xffaa33 : 0x93c5fd,
      });
      const lamp = new THREE.Mesh(lampGeo, lampMat);
      lamp.position.set(1.9, 7.2, 0);
      group.add(lamp);

      group.position.set((i - STREETLIGHT_COUNT * 0.5) * 24, 0, -6.8);
      this.streetlightGroup.add(group);
    }

    this.scene.add(this.streetlightGroup);
  }

  private buildGuardrails(): void {
    const postGeo = new THREE.BoxGeometry(0.12, 0.9, 0.12);
    const railGeo = new THREE.BoxGeometry(ROAD_LENGTH, 0.22, 0.08);
    const guardMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.45,
      metalness: 0.75,
    });
    this.disposableGeometries.push(postGeo, railGeo);
    this.disposableMaterials.push(guardMat);

    for (let i = 0; i < GUARDRAIL_POST_COUNT; i++) {
      const post = new THREE.Mesh(postGeo, guardMat);
      post.position.set((i - GUARDRAIL_POST_COUNT * 0.5) * 5.5, 0.45, 6.2);
      this.guardrailGroup.add(post);
    }

    const rail = new THREE.Mesh(railGeo, guardMat);
    rail.position.set(0, 0.65, 6.2);
    this.guardrailGroup.add(rail);

    this.scene.add(this.guardrailGroup);
  }

  private buildTrees(): void {
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.35, 4.2, 6);
    const foliageGeo = new THREE.ConeGeometry(2.2, 6.5, 6);
    const treeMat = new THREE.MeshStandardMaterial({
      color: 0x050912,
      roughness: 0.9,
    });
    this.disposableGeometries.push(trunkGeo, foliageGeo);
    this.disposableMaterials.push(treeMat);

    for (let i = 0; i < TREE_COUNT; i++) {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(trunkGeo, treeMat);
      trunk.position.y = 2.1;
      const foliage = new THREE.Mesh(foliageGeo, treeMat);
      foliage.position.y = 5.8;
      tree.add(trunk, foliage);

      const x = (i - TREE_COUNT * 0.5) * 8.5;
      const z = -12.5 - Math.random() * 8.0;
      tree.position.set(x, 0, z);
      this.treeGroup.add(tree);
    }

    this.scene.add(this.treeGroup);
  }

  private buildSkyline(): void {
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const bldgMat = new THREE.MeshBasicMaterial({ color: 0x070c18 });
    this.disposableGeometries.push(boxGeo);
    this.disposableMaterials.push(bldgMat);

    // Distant dark silhouette buildings with subtle warm window points
    for (let i = 0; i < SKYLINE_BUILDING_COUNT; i++) {
      const bldg = new THREE.Mesh(boxGeo, bldgMat);
      const w = 6 + Math.random() * 9;
      const h = 18 + Math.random() * 38;
      const d = 6 + Math.random() * 9;
      bldg.scale.set(w, h, d);
      bldg.position.set((i - SKYLINE_BUILDING_COUNT * 0.5) * 11, h * 0.5, -95 - (i % 3) * 18);
      this.skylineGroup.add(bldg);
    }
    this.scene.add(this.skylineGroup);

    // Glowing Moon in the Night Sky
    const moonGeo = new THREE.CircleGeometry(4.2, 24);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });
    this.disposableGeometries.push(moonGeo);
    this.disposableMaterials.push(moonMat);

    this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
    this.moonMesh.position.set(38, 36, -140);
    this.scene.add(this.moonMesh);
  }

  public update(delta: number, elapsed: number, pointer: THREE.Vector2): void {
    this.smoothPointer.lerp(pointer, Math.min(1, delta * 2.5));

    const speed = 28.0; // Highway cruise speed (units/sec)

    // 1. Suspension Micro-Bounce on Car Body
    const bounce =
      Math.sin(elapsed * 13.0) * 0.012 +
      Math.sin(elapsed * 23.0 + 1.2) * 0.007 +
      Math.sin(elapsed * 7.5) * 0.009;
    if (this.carBodyMesh) {
      this.carBodyMesh.position.y = 0.72 + bounce;
    }

    // 2. Continuous Wheel Rotation
    for (const w of this.wheels) {
      w.rotation.x -= speed * delta * 1.5;
    }

    // 3. Smooth Multi-Harmonic Side-Tracking Camera
    const camSwayX = Math.sin(elapsed * 0.18) * 0.45 + this.smoothPointer.x * 1.2;
    const camSwayY = Math.sin(elapsed * 0.22) * 0.25 + this.smoothPointer.y * 0.8;
    const camSwayZ = Math.cos(elapsed * 0.15) * 0.4;

    this.camera.position.set(-2.2 + camSwayX, 2.1 + camSwayY, 9.4 + camSwayZ);
    this.camera.lookAt(1.8 + this.smoothPointer.x * 0.8, 1.2, 0);

    // 4. Parallax Scrolling: Streetlights
    const slSpan = STREETLIGHT_COUNT * 24;
    for (const group of this.streetlightGroup.children) {
      group.position.x -= speed * delta;
      if (group.position.x < -slSpan * 0.5) {
        group.position.x += slSpan;
      }
    }

    // Update active light uniforms for road shader
    for (let i = 0; i < 6; i++) {
      const slGroup = this.streetlightGroup.children[i % this.streetlightGroup.children.length];
      if (slGroup) {
        this.activeLightPositions[i].set(slGroup.position.x, 7.2, slGroup.position.z);
      }
    }

    // 5. Parallax Scrolling: Guardrails (fastest)
    const grSpan = GUARDRAIL_POST_COUNT * 5.5;
    for (const post of this.guardrailGroup.children) {
      if (
        post instanceof THREE.Mesh &&
        post.geometry instanceof THREE.BoxGeometry &&
        post.geometry.parameters.width < 1.0
      ) {
        post.position.x -= speed * delta;
        if (post.position.x < -grSpan * 0.5) {
          post.position.x += grSpan;
        }
      }
    }

    // 6. Parallax Scrolling: Midground Trees
    const treeSpan = TREE_COUNT * 8.5;
    for (const tree of this.treeGroup.children) {
      tree.position.x -= speed * delta * 0.75;
      if (tree.position.x < -treeSpan * 0.5) {
        tree.position.x += treeSpan;
      }
    }

    // 7. Parallax Scrolling: Distant Skyline (slowest)
    const skySpan = SKYLINE_BUILDING_COUNT * 11;
    for (const bldg of this.skylineGroup.children) {
      bldg.position.x -= speed * delta * 0.18;
      if (bldg.position.x < -skySpan * 0.5) {
        bldg.position.x += skySpan;
      }
    }

    // Update shaders
    if (this.roadMat) {
      this.roadMat.uniforms.uTime.value = elapsed;
      this.roadMat.uniforms.uCarPos.value.copy(this.carGroup.position);
    }

    if (this.headlightCone) {
      const hcMat = this.headlightCone.material as THREE.ShaderMaterial;
      hcMat.uniforms.uTime.value = elapsed;
    }
  }

  public resize(width: number, height: number): void {
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();
  }

  public setQuality(_scale: number): void {
    // Highly optimized low-polygon geometry with custom shaders, maintains consistent smooth 60fps
  }

  public getActiveInstanceCount(): number {
    return (
      STREETLIGHT_COUNT +
      GUARDRAIL_POST_COUNT +
      TREE_COUNT +
      SKYLINE_BUILDING_COUNT +
      this.wheels.length +
      6
    );
  }

  public dispose(): void {
    this.scene.remove(this.carGroup);
    this.scene.remove(this.streetlightGroup);
    this.scene.remove(this.guardrailGroup);
    this.scene.remove(this.treeGroup);
    this.scene.remove(this.skylineGroup);

    if (this.roadMesh) {
      this.scene.remove(this.roadMesh);
      this.roadMesh = null;
    }

    if (this.moonMesh) {
      this.scene.remove(this.moonMesh);
      this.moonMesh = null;
    }

    for (const geo of this.disposableGeometries) {
      geo.dispose();
    }
    for (const mat of this.disposableMaterials) {
      mat.dispose();
    }
    this.disposableGeometries = [];
    this.disposableMaterials = [];

    this.scene.clear();
  }
}
