import * as THREE from 'three';
import { ISpatialScene, BloomPreset } from '../types';

const JET_PARTICLE_COUNT = 16_000;
const ACCRETION_PARTICLE_COUNT = 18_000;

const NEUTRON_STAR_VERT = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const NEUTRON_STAR_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3 uCoreColor;
  uniform vec3 uLimbColor;
  uniform float uPulseRate;

  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec2 vUv;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);

    // Fresnel edge emission
    float nDotV = max(dot(viewDir, normal), 0.0);
    float fresnel = 1.0 - nDotV;
    float rim = pow(fresnel, 2.5);

    // High-frequency magnetic turbulence ripple
    float ripple = 0.5 + 0.5 * sin(vUv.y * 36.0 + uTime * uPulseRate + sin(vUv.x * 24.0) * 2.0);
    float pulse = 0.88 + 0.22 * sin(uTime * uPulseRate * 1.8);

    // Preserved distinct chromatic identity per star core (prevents bloom blowout merge)
    float coreFalloff = pow(nDotV, 1.6);
    vec3 emissive = mix(uLimbColor, uCoreColor, coreFalloff * 0.82 + 0.18) * (1.15 + ripple * 0.32) * pulse;
    emissive += uCoreColor * pow(nDotV, 5.5) * 0.75;
    emissive += uLimbColor * rim * 1.25;

    gl_FragColor = vec4(emissive, 1.0);
  }
`;

const JET_BEAM_VERT = /* glsl */ `
  attribute float aProgress;
  attribute float aAngle;
  attribute float aDirection; // +1 or -1 along polar axis
  attribute float aSeed;

  uniform float uTime;
  uniform vec3 uPulsarPos;
  uniform vec3 uJetAxis;
  uniform float uPixelRatio;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    // Relativistic velocity outward along magnetic polar axis
    float speed = 52.0 + aSeed * 22.0;
    float dist = mod(uTime * speed + aProgress * 65.0, 65.0);

    // Jet expansion cone with helical precession
    float coneRadius = 0.12 + dist * 0.065;
    float helixAngle = aAngle + dist * 0.45 + uTime * 6.0;

    // Build orthogonal basis relative to jet axis
    vec3 up = abs(uJetAxis.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
    vec3 sideA = normalize(cross(uJetAxis, up));
    vec3 sideB = cross(uJetAxis, sideA);

    vec3 radialOffset = (sideA * cos(helixAngle) + sideB * sin(helixAngle)) * coneRadius;
    vec3 worldPos = uPulsarPos + (uJetAxis * (dist * aDirection)) + radialOffset;

    // Shock diamond knots along jet axis
    float shockDiamond = 0.7 + 0.5 * sin(dist * 1.8 - uTime * 8.0);

    // Color gradient: Incandescent pure blue-white -> Electric cyan -> Violet shock sheath
    float distFade = 1.0 - (dist / 65.0);
    vec3 jetCol = mix(vec3(0.85, 0.95, 1.0), vec3(0.1, 0.85, 1.0), smoothstep(0.0, 24.0, dist));
    jetCol = mix(jetCol, vec3(0.65, 0.2, 1.0), smoothstep(24.0, 65.0, dist));

    vColor = jetCol * (1.6 + shockDiamond * 1.4);
    vAlpha = distFade * smoothstep(0.0, 3.5, dist) * (0.65 + aSeed * 0.35);

    vec4 mvPos = modelViewMatrix * vec4(worldPos, 1.0);
    gl_Position = projectionMatrix * mvPos;
    gl_PointSize = clamp((32.0 + aSeed * 22.0) * uPixelRatio / max(-mvPos.z, 1.0), 1.2, 9.0);
  }
`;

const JET_BEAM_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float core = exp(-d * d * 28.0);
    float halo = 0.28 * exp(-d * d * 8.0);
    gl_FragColor = vec4(vColor * (1.0 + core * 0.8), (core + halo) * vAlpha);
  }
`;

const ACCRETION_BRIDGE_VERT = /* glsl */ `
  attribute float aTrack;
  attribute float aOrbitAngle;
  attribute float aHeight;
  attribute float aSpeed;
  attribute float aSeed;

  uniform float uTime;
  uniform vec3 uStarA;
  uniform vec3 uStarB;
  uniform float uPixelRatio;

  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 worldPos;
    float angle = aOrbitAngle + uTime * aSpeed;

    if (aTrack < 0.45) {
      // Swirling circumbinary accretion disk encircling both stars
      float radius = 5.2 + aHeight * 3.2;
      worldPos = vec3(cos(angle) * radius, (aSeed - 0.5) * 0.8, sin(angle) * radius);
      vColor = mix(vec3(0.3, 0.75, 1.0), vec3(1.0, 0.55, 0.15), aSeed);
      vAlpha = 0.55 * smoothstep(8.5, 5.0, radius);
    } else {
      // Roche-lobe overflow plasma stream transferring mass from companion star B to Pulsar A
      float t = fract(aOrbitAngle + uTime * aSpeed * 0.45);
      vec3 p0 = uStarB;
      vec3 p1 = (uStarA + uStarB) * 0.5 + vec3(0.0, 1.2, 0.0);
      vec3 p2 = uStarA;
      // Quadratic bezier mass transfer arc
      worldPos = mix(mix(p0, p1, t), mix(p1, p2, t), t);
      worldPos += vec3((aSeed - 0.5) * 0.4, (aHeight - 0.5) * 0.4, (aSeed - 0.5) * 0.4);

      vColor = mix(vec3(1.0, 0.4, 0.1), vec3(0.3, 0.85, 1.0), t);
      vAlpha = 0.75;
    }

    vec4 mvPos = modelViewMatrix * vec4(worldPos, 1.0);
    gl_Position = projectionMatrix * mvPos;
    gl_PointSize = clamp((18.0 + aSeed * 18.0) * uPixelRatio / max(-mvPos.z, 1.0), 1.0, 6.0);
  }
`;

const ACCRETION_BRIDGE_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float core = exp(-d * d * 24.0);
    float halo = 0.3 * exp(-d * d * 8.0);
    gl_FragColor = vec4(vColor * (1.0 + core * 0.5), (core + halo) * vAlpha);
  }
`;

export class BinaryPulsarScene implements ISpatialScene {
  public readonly id = 'binary-pulsar' as const;
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  public readonly bloomPreset: BloomPreset = {
    strength: 0.92,
    radius: 0.54,
    threshold: 0.52,
  };
  public readonly exposure = 1.05;

  // Star A (Primary Magnetar / Pulsar)
  private starAMesh: THREE.Mesh | null = null;
  private starAGeo: THREE.SphereGeometry | null = null;
  private starAMat: THREE.ShaderMaterial | null = null;

  // Star B (Dense Companion Neutron Star)
  private starBMesh: THREE.Mesh | null = null;
  private starBGeo: THREE.SphereGeometry | null = null;
  private starBMat: THREE.ShaderMaterial | null = null;

  // Relativistic Jets Particles
  private jetPoints: THREE.Points | null = null;
  private jetGeo: THREE.BufferGeometry | null = null;
  private jetMat: THREE.ShaderMaterial | null = null;

  // Magnetic & Accretion Bridge Stream
  private bridgePoints: THREE.Points | null = null;
  private bridgeGeo: THREE.BufferGeometry | null = null;
  private bridgeMat: THREE.ShaderMaterial | null = null;

  // Distant Starfield Background
  private starfieldPoints: THREE.Points | null = null;
  private starfieldGeo: THREE.BufferGeometry | null = null;
  private starfieldMat: THREE.PointsMaterial | null = null;

  private smoothPointer = new THREE.Vector2();
  private starAPos = new THREE.Vector3();
  private starBPos = new THREE.Vector3();
  private jetAxis = new THREE.Vector3(0.2, 0.95, 0.15).normalize();

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x010208);
    this.camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 200);
    this.camera.position.set(0, 5.5, 18.0);
  }

  public init(renderer: THREE.WebGLRenderer): void {
    // 1. Distant cosmic background pinpoint stars
    this.starfieldGeo = new THREE.BufferGeometry();
    const bgCount = 14_000;
    const bgPos = new Float32Array(bgCount * 3);
    for (let i = 0; i < bgCount; i++) {
      const r = 90 + Math.random() * 80;
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      bgPos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      bgPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      bgPos[i * 3 + 2] = r * Math.cos(phi);
    }
    this.starfieldGeo.setAttribute('position', new THREE.BufferAttribute(bgPos, 3));
    this.starfieldMat = new THREE.PointsMaterial({
      color: 0xccddee,
      size: 1.2,
      sizeAttenuation: false,
    });
    this.starfieldPoints = new THREE.Points(this.starfieldGeo, this.starfieldMat);
    this.scene.add(this.starfieldPoints);

    // 2. Primary Pulsar Core A (Electric Cyan / Ultra-dense)
    this.starAGeo = new THREE.SphereGeometry(0.85, 32, 32);
    this.starAMat = new THREE.ShaderMaterial({
      vertexShader: NEUTRON_STAR_VERT,
      fragmentShader: NEUTRON_STAR_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uCoreColor: { value: new THREE.Color(0xa5f3fc) },
        uLimbColor: { value: new THREE.Color(0x0284c7) },
        uPulseRate: { value: 18.0 },
      },
    });
    this.starAMesh = new THREE.Mesh(this.starAGeo, this.starAMat);
    this.scene.add(this.starAMesh);

    // 3. Companion Neutron Star Core B (Molten Gold / Amber)
    this.starBGeo = new THREE.SphereGeometry(0.68, 32, 32);
    this.starBMat = new THREE.ShaderMaterial({
      vertexShader: NEUTRON_STAR_VERT,
      fragmentShader: NEUTRON_STAR_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uCoreColor: { value: new THREE.Color(0xfef08a) },
        uLimbColor: { value: new THREE.Color(0xea580c) },
        uPulseRate: { value: 12.0 },
      },
    });
    this.starBMesh = new THREE.Mesh(this.starBGeo, this.starBMat);
    this.scene.add(this.starBMesh);

    // 4. Opposing Relativistic Plasma Jets (16,000 particles)
    this.jetGeo = new THREE.BufferGeometry();
    const jProgress = new Float32Array(JET_PARTICLE_COUNT);
    const jAngle = new Float32Array(JET_PARTICLE_COUNT);
    const jDirection = new Float32Array(JET_PARTICLE_COUNT);
    const jSeed = new Float32Array(JET_PARTICLE_COUNT);

    for (let i = 0; i < JET_PARTICLE_COUNT; i++) {
      jProgress[i] = Math.random();
      jAngle[i] = Math.random() * Math.PI * 2;
      jDirection[i] = i % 2 === 0 ? 1.0 : -1.0;
      jSeed[i] = Math.random();
    }

    this.jetGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(JET_PARTICLE_COUNT * 3), 3));
    this.jetGeo.setAttribute('aProgress', new THREE.BufferAttribute(jProgress, 1));
    this.jetGeo.setAttribute('aAngle', new THREE.BufferAttribute(jAngle, 1));
    this.jetGeo.setAttribute('aDirection', new THREE.BufferAttribute(jDirection, 1));
    this.jetGeo.setAttribute('aSeed', new THREE.BufferAttribute(jSeed, 1));

    this.jetMat = new THREE.ShaderMaterial({
      vertexShader: JET_BEAM_VERT,
      fragmentShader: JET_BEAM_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uPulsarPos: { value: this.starAPos },
        uJetAxis: { value: this.jetAxis },
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.jetPoints = new THREE.Points(this.jetGeo, this.jetMat);
    this.jetPoints.frustumCulled = false;
    this.scene.add(this.jetPoints);

    // 5. Magnetic Roche-lobe Mass Transfer & Circumbinary Accretion Bridge (18,000 particles)
    this.bridgeGeo = new THREE.BufferGeometry();
    const bTrack = new Float32Array(ACCRETION_PARTICLE_COUNT);
    const bOrbitAngle = new Float32Array(ACCRETION_PARTICLE_COUNT);
    const bHeight = new Float32Array(ACCRETION_PARTICLE_COUNT);
    const bSpeed = new Float32Array(ACCRETION_PARTICLE_COUNT);
    const bSeed = new Float32Array(ACCRETION_PARTICLE_COUNT);

    for (let i = 0; i < ACCRETION_PARTICLE_COUNT; i++) {
      bTrack[i] = Math.random();
      bOrbitAngle[i] = Math.random() * Math.PI * 2;
      bHeight[i] = Math.random();
      bSpeed[i] = 0.8 + Math.random() * 1.6;
      bSeed[i] = Math.random();
    }

    this.bridgeGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(ACCRETION_PARTICLE_COUNT * 3), 3));
    this.bridgeGeo.setAttribute('aTrack', new THREE.BufferAttribute(bTrack, 1));
    this.bridgeGeo.setAttribute('aOrbitAngle', new THREE.BufferAttribute(bOrbitAngle, 1));
    this.bridgeGeo.setAttribute('aHeight', new THREE.BufferAttribute(bHeight, 1));
    this.bridgeGeo.setAttribute('aSpeed', new THREE.BufferAttribute(bSpeed, 1));
    this.bridgeGeo.setAttribute('aSeed', new THREE.BufferAttribute(bSeed, 1));

    this.bridgeMat = new THREE.ShaderMaterial({
      vertexShader: ACCRETION_BRIDGE_VERT,
      fragmentShader: ACCRETION_BRIDGE_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uStarA: { value: this.starAPos },
        uStarB: { value: this.starBPos },
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.bridgePoints = new THREE.Points(this.bridgeGeo, this.bridgeMat);
    this.bridgePoints.frustumCulled = false;
    this.scene.add(this.bridgePoints);
  }

  public update(delta: number, elapsed: number, pointer: THREE.Vector2): void {
    this.smoothPointer.lerp(pointer, Math.min(1, delta * 2.8));

    // Mutual binary orbit: period ~3.2 seconds
    const binaryOmega = elapsed * 1.95;
    const orbitalRadius = 2.45;
    this.starAPos.set(
      Math.cos(binaryOmega) * (orbitalRadius * 0.45),
      0,
      Math.sin(binaryOmega) * (orbitalRadius * 0.45)
    );
    this.starBPos.set(
      -Math.cos(binaryOmega) * (orbitalRadius * 0.55),
      0,
      -Math.sin(binaryOmega) * (orbitalRadius * 0.55)
    );

    if (this.starAMesh) this.starAMesh.position.copy(this.starAPos);
    if (this.starBMesh) this.starBMesh.position.copy(this.starBPos);

    // Magnetic polar jet precession
    const precessAngle = elapsed * 0.35;
    this.jetAxis.set(
      Math.sin(precessAngle) * 0.28,
      0.95,
      Math.cos(precessAngle) * 0.28
    ).normalize();

    // Smooth organic multi-harmonic orbital camera sweep
    const camAngle =
      elapsed * 0.075 +
      Math.sin(elapsed * 0.028) * 0.25 +
      this.smoothPointer.x * 0.5;
    const camDist = 16.5 + Math.sin(elapsed * 0.11) * 1.4 + Math.cos(elapsed * 0.045) * 0.9;
    const camY =
      4.2 +
      Math.sin(elapsed * 0.12) * 1.8 +
      Math.cos(elapsed * 0.052 + 1.4) * 0.9 +
      this.smoothPointer.y * 2.2;

    this.camera.position.set(
      Math.sin(camAngle) * camDist,
      camY,
      Math.cos(camAngle) * camDist
    );
    this.camera.lookAt(0, 0, 0);
    this.camera.rotation.z = Math.sin(elapsed * 0.035) * 0.025;

    // Update shaders
    if (this.starAMat) this.starAMat.uniforms.uTime.value = elapsed;
    if (this.starBMat) this.starBMat.uniforms.uTime.value = elapsed;

    if (this.jetMat) {
      this.jetMat.uniforms.uTime.value = elapsed;
      this.jetMat.uniforms.uPulsarPos.value.copy(this.starAPos);
      this.jetMat.uniforms.uJetAxis.value.copy(this.jetAxis);
    }

    if (this.bridgeMat) {
      this.bridgeMat.uniforms.uTime.value = elapsed;
      this.bridgeMat.uniforms.uStarA.value.copy(this.starAPos);
      this.bridgeMat.uniforms.uStarB.value.copy(this.starBPos);
    }
  }

  public resize(width: number, height: number): void {
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();
  }

  public setQuality(scale: number): void {
    const clamped = Math.max(0.35, Math.min(1.0, scale));
    if (this.jetGeo) {
      this.jetGeo.setDrawRange(0, Math.floor(JET_PARTICLE_COUNT * clamped));
    }
    if (this.bridgeGeo) {
      this.bridgeGeo.setDrawRange(0, Math.floor(ACCRETION_PARTICLE_COUNT * clamped));
    }
  }

  public getActiveInstanceCount(): number {
    return JET_PARTICLE_COUNT + ACCRETION_PARTICLE_COUNT + 2;
  }

  public dispose(): void {
    if (this.starAMesh) {
      this.scene.remove(this.starAMesh);
      this.starAMesh = null;
    }
    if (this.starAGeo) {
      this.starAGeo.dispose();
      this.starAGeo = null;
    }
    if (this.starAMat) {
      this.starAMat.dispose();
      this.starAMat = null;
    }

    if (this.starBMesh) {
      this.scene.remove(this.starBMesh);
      this.starBMesh = null;
    }
    if (this.starBGeo) {
      this.starBGeo.dispose();
      this.starBGeo = null;
    }
    if (this.starBMat) {
      this.starBMat.dispose();
      this.starBMat = null;
    }

    if (this.jetPoints) {
      this.scene.remove(this.jetPoints);
      this.jetPoints = null;
    }
    if (this.jetGeo) {
      this.jetGeo.dispose();
      this.jetGeo = null;
    }
    if (this.jetMat) {
      this.jetMat.dispose();
      this.jetMat = null;
    }

    if (this.bridgePoints) {
      this.scene.remove(this.bridgePoints);
      this.bridgePoints = null;
    }
    if (this.bridgeGeo) {
      this.bridgeGeo.dispose();
      this.bridgeGeo = null;
    }
    if (this.bridgeMat) {
      this.bridgeMat.dispose();
      this.bridgeMat = null;
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
