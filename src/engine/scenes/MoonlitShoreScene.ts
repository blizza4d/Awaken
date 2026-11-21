import * as THREE from 'three';
import { ISpatialScene, BloomPreset } from '../types';

// Multi-Wave Gerstner Ocean Vertex Shader with analytic surface normal & wave crest tracking
const GERSTNER_OCEAN_VERT = /* glsl */ `
  uniform float uTime;
  uniform vec3 uMoonPos;

  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying float vWaveCrest;
  varying float vWaterDepth;

  struct Wave {
    vec2 dir;
    float amp;
    float len;
    float speed;
    float steepness;
  };

  void main() {
    vUv = uv;
    vec3 p = position;

    // 8 Gerstner Wave Components (layered swells rolling towards shore Z > 0 + cross-ripples)
    Wave waves[8];
    waves[0] = Wave(normalize(vec2(0.05, 0.99)), 1.15, 38.0, 1.45, 0.55);
    waves[1] = Wave(normalize(vec2(-0.15, 0.98)), 0.72, 22.0, 1.85, 0.50);
    waves[2] = Wave(normalize(vec2(0.22, 0.97)), 0.48, 14.0, 2.15, 0.45);
    waves[3] = Wave(normalize(vec2(-0.08, 0.99)), 0.32, 9.5, 2.55, 0.40);
    waves[4] = Wave(normalize(vec2(0.35, 0.93)), 0.22, 6.2, 3.10, 0.35);
    waves[5] = Wave(normalize(vec2(-0.32, 0.94)), 0.16, 4.4, 3.65, 0.30);
    waves[6] = Wave(normalize(vec2(0.55, 0.83)), 0.09, 2.8, 4.20, 0.25);
    waves[7] = Wave(normalize(vec2(-0.48, 0.87)), 0.06, 1.9, 4.80, 0.20);

    vec3 displaced = p;
    vec3 tangent = vec3(1.0, 0.0, 0.0);
    vec3 binormal = vec3(0.0, 0.0, 1.0);

    // Shoreline damping factor: waves crest higher in shallow water then break on sand slope
    // Beach slopes up as Z increases (Z > 5 is shallow, Z > 18 is shoreline)
    float shoreDamping = smoothstep(24.0, 8.0, p.z);
    float totalDisplacementY = 0.0;

    for (int i = 0; i < 8; i++) {
      Wave w = waves[i];
      float k = 6.2831853 / w.len;
      float c = sqrt(9.8 / k) * w.speed;
      float phase = k * (dot(w.dir, p.xz) - c * uTime * 0.42);

      float amp = w.amp * (0.65 + shoreDamping * 0.45);
      float q = w.steepness / (k * amp * 8.0 + 1e-4);

      displaced.x += w.dir.x * (q * amp * cos(phase));
      displaced.z += w.dir.y * (q * amp * cos(phase));
      displaced.y += amp * sin(phase);

      totalDisplacementY += amp * sin(phase);

      // Partial derivatives for exact analytic surface normal
      float wa = k * amp;
      float s = sin(phase);
      float c_val = cos(phase);

      tangent += vec3(
        -w.dir.x * w.dir.x * (q * wa * s),
        w.dir.x * (wa * c_val),
        -w.dir.x * w.dir.y * (q * wa * s)
      );

      binormal += vec3(
        -w.dir.x * w.dir.y * (q * wa * s),
        w.dir.y * (wa * c_val),
        -w.dir.y * w.dir.y * (q * wa * s)
      );
    }

    vec3 normal = normalize(cross(binormal, tangent));
    vNormal = normal;

    vec4 worldPos = modelMatrix * vec4(displaced, 1.0);
    vWorldPos = worldPos.xyz;

    // Beach sand bed height calculation: gentle slope from Y = -14 at Z = -80 up to Y = 1.2 at Z = 24
    float sandBedY = -14.0 + (worldPos.z + 80.0) * (15.2 / 104.0);
    vWaterDepth = max(0.0, worldPos.y - sandBedY);

    // Wave crest indicator for foam generation
    vWaveCrest = clamp((totalDisplacementY - 0.35) / 1.6, 0.0, 1.0);

    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

// Procedural Ocean Fragment Shader: Subsurface Scattering, Breaking Foam, Moon Specular
const GERSTNER_OCEAN_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3 uCamPos;
  uniform vec3 uMoonPos;
  uniform vec3 uMoonColor;
  uniform vec3 uDeepWaterColor;
  uniform vec3 uShallowWaterColor;

  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying vec2 vUv;
  varying float vWaveCrest;
  varying float vWaterDepth;

  // 2D Hash Noise for Organic Foam Bubbles
  float hash(vec2 p) {
    p = fract(p * vec2(213.34, 435.345));
    p += dot(p, p + 34.23);
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
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.2 + vec2(1.2, 3.4);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(uCamPos - vWorldPos);
    vec3 L = normalize(uMoonPos - vWorldPos);
    vec3 H = normalize(L + V);

    // 1. Fresnel Reflectance (Schlick's approximation)
    float NdotV = max(0.0, dot(N, V));
    float R0 = 0.025; // Water base reflectance at normal incidence
    float fresnel = R0 + (1.0 - R0) * pow(1.0 - NdotV, 5.0);

    // 2. Water Body Color (Deep Indigo/Teal gradient based on depth)
    float depthFactor = smoothstep(0.0, 5.5, vWaterDepth);
    vec3 waterBody = mix(uShallowWaterColor, uDeepWaterColor, depthFactor);

    // 3. Subsurface Scattering through Thin Wave Crests (Delicate Deep Teal Translucency)
    vec3 sssDir = normalize(L + N * 0.4);
    float sssFactor = pow(clamp(dot(V, -sssDir), 0.0, 1.0), 3.0) * vWaveCrest;
    vec3 sssColor = vec3(0.06, 0.52, 0.58) * sssFactor * 1.45;

    // 4. Shimmering Broken Moon Specular Track (Blinn-Phong Glint across rolling swells)
    float NdotH = max(0.0, dot(N, H));
    float specSharp = pow(NdotH, 180.0) * 2.2;
    float specBroad = pow(NdotH, 24.0) * 0.35;
    vec3 moonSpecular = uMoonColor * (specSharp + specBroad);

    // 5. Procedural Breaking Waves & Shoreline Foam
    vec2 foamCoord = vWorldPos.xz * 1.8 + vec2(uTime * 0.25, -uTime * 0.15);
    float foamNoise = fbm(foamCoord);

    // Foam at rolling wave crests + shallow shoreline wash
    float crestFoam = smoothstep(0.55, 0.95, vWaveCrest) * step(0.38, foamNoise);
    float shoreFoam = smoothstep(0.45, 0.02, vWaterDepth) * smoothstep(0.25, 0.75, foamNoise);
    float totalFoam = clamp(crestFoam * 1.2 + shoreFoam * 1.4, 0.0, 1.0);

    vec3 foamColor = vec3(0.92, 0.96, 1.0) * (1.0 + totalFoam * 0.5);

    // Combine Shading Elements
    vec3 waterColor = waterBody * (1.0 - fresnel * 0.5) + sssColor + moonSpecular * fresnel;
    vec3 finalColor = mix(waterColor, foamColor, totalFoam * 0.88);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// Sloped Dark Sandy Beach Shader with Dynamic Wave Wash Wetness
const BEACH_SAND_VERT = /* glsl */ `
  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const BEACH_SAND_FRAG = /* glsl */ `
  uniform float uTime;
  uniform vec3 uCamPos;
  uniform vec3 uMoonPos;
  uniform vec3 uMoonColor;

  varying vec3 vWorldPos;
  varying vec3 vNormal;
  varying vec2 vUv;

  // Simple noise for sand grain texture
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(uCamPos - vWorldPos);
    vec3 L = normalize(uMoonPos - vWorldPos);
    vec3 H = normalize(L + V);

    // Sand grain micro-texture
    float grain = hash(floor(vWorldPos.xz * 28.0)) * 0.06;
    vec3 drySand = vec3(0.14 + grain, 0.12 + grain, 0.10 + grain);

    // Dynamic wave wash wetness mask: oscillates with shoreline wave period
    float washCycle = sin(vWorldPos.z * 0.45 - uTime * 0.85);
    float isShoreline = smoothstep(14.0, 22.0, vWorldPos.z);
    float wetness = clamp(isShoreline * (0.65 + 0.35 * washCycle), 0.0, 1.0);

    // Wet sand darkens significantly and becomes mirror-reflective
    vec3 wetSand = drySand * 0.32;
    vec3 sandAlbedo = mix(drySand, wetSand, wetness);

    // Mirror-like wet sand specular reflection of moon
    float NdotH = max(0.0, dot(N, H));
    float wetSpec = pow(NdotH, 64.0) * wetness * 1.8;
    vec3 moonGlint = uMoonColor * wetSpec;

    vec3 finalColor = sandAlbedo + moonGlint;
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export class MoonlitShoreScene implements ISpatialScene {
  public readonly id = 'moonlit-shore' as const;
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  public readonly bloomPreset: BloomPreset = {
    strength: 0.82,
    radius: 0.52,
    threshold: 0.52,
  };
  public readonly exposure = 1.04;

  // Ocean Water Mesh
  private oceanMesh: THREE.Mesh | null = null;
  private oceanGeo: THREE.PlaneGeometry | null = null;
  private oceanMat: THREE.ShaderMaterial | null = null;

  // Beach Sandy Bed Mesh
  private beachMesh: THREE.Mesh | null = null;
  private beachGeo: THREE.PlaneGeometry | null = null;
  private beachMat: THREE.ShaderMaterial | null = null;

  // Celestial Environment
  private moonMesh: THREE.Mesh | null = null;
  private moonHaloMesh: THREE.Mesh | null = null;
  private starfieldPoints: THREE.Points | null = null;

  // Disposable tracking
  private disposableGeometries: THREE.BufferGeometry[] = [];
  private disposableMaterials: THREE.Material[] = [];

  private smoothPointer = new THREE.Vector2();

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x040813);
    this.scene.fog = new THREE.FogExp2(0x060c18, 0.0095);

    // Camera positioned on twilight sandy beach, looking slightly down and across the surf
    this.camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 450);
    this.camera.position.set(0, 3.8, 26.5);
  }

  public init(_renderer: THREE.WebGLRenderer): void {
    const moonPos = new THREE.Vector3(0, 24, -120);

    // 1. Ambient Twilight & Moon Directional Light
    const hemi = new THREE.HemisphereLight(0x38bdf8, 0x050811, 0.45);
    this.scene.add(hemi);

    const moonLight = new THREE.DirectionalLight(0xe0f2fe, 0.85);
    moonLight.position.copy(moonPos);
    this.scene.add(moonLight);

    // 2. High-Density Subdivided Ocean Mesh for Multi-Wave Gerstner Waves
    // 220x220 subdivisions provide exceptionally crisp wave curvature and foam definition
    this.oceanGeo = new THREE.PlaneGeometry(160, 160, 220, 220);
    this.oceanGeo.rotateX(-Math.PI / 2);
    this.disposableGeometries.push(this.oceanGeo);

    this.oceanMat = new THREE.ShaderMaterial({
      vertexShader: GERSTNER_OCEAN_VERT,
      fragmentShader: GERSTNER_OCEAN_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uCamPos: { value: this.camera.position },
        uMoonPos: { value: moonPos },
        uMoonColor: { value: new THREE.Vector3(0.92, 0.96, 1.0) },
        uDeepWaterColor: { value: new THREE.Vector3(0.02, 0.06, 0.16) }, // Deep Indigo
        uShallowWaterColor: { value: new THREE.Vector3(0.04, 0.18, 0.28) }, // Cyan-Teal
      },
    });
    this.disposableMaterials.push(this.oceanMat);

    this.oceanMesh = new THREE.Mesh(this.oceanGeo, this.oceanMat);
    this.oceanMesh.position.set(0, 0, -35);
    this.scene.add(this.oceanMesh);

    // 3. Gently Sloped Dark Sandy Beach Bed
    this.beachGeo = new THREE.PlaneGeometry(160, 80, 48, 48);
    this.beachGeo.rotateX(-Math.PI / 2);
    // Slope the beach vertices: higher at shore (Z > 0), lower into surf (Z < 0)
    const posAttr = this.beachGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const z = posAttr.getY(i); // Before rotation Y was along plane height
      // Slopes from -4.5 at surf up to +2.5 at shore
      posAttr.setZ(i, -z * 0.12);
    }
    posAttr.needsUpdate = true;
    this.beachGeo.computeVertexNormals();
    this.disposableGeometries.push(this.beachGeo);

    this.beachMat = new THREE.ShaderMaterial({
      vertexShader: BEACH_SAND_VERT,
      fragmentShader: BEACH_SAND_FRAG,
      uniforms: {
        uTime: { value: 0 },
        uCamPos: { value: this.camera.position },
        uMoonPos: { value: moonPos },
        uMoonColor: { value: new THREE.Vector3(0.92, 0.96, 1.0) },
      },
    });
    this.disposableMaterials.push(this.beachMat);

    this.beachMesh = new THREE.Mesh(this.beachGeo, this.beachMat);
    this.beachMesh.position.set(0, -0.6, 15);
    this.scene.add(this.beachMesh);

    // 4. Soft Glowing Moon near the Horizon
    const moonGeo = new THREE.CircleGeometry(5.2, 32);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xf0f9ff });
    this.disposableGeometries.push(moonGeo);
    this.disposableMaterials.push(moonMat);

    this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
    this.moonMesh.position.copy(moonPos);
    this.scene.add(this.moonMesh);

    // Soft incandescent atmospheric moon halo
    const haloGeo = new THREE.CircleGeometry(16.5, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.18,
    });
    this.disposableGeometries.push(haloGeo);
    this.disposableMaterials.push(haloMat);

    this.moonHaloMesh = new THREE.Mesh(haloGeo, haloMat);
    this.moonHaloMesh.position.set(moonPos.x, moonPos.y, moonPos.z - 0.5);
    this.scene.add(this.moonHaloMesh);

    // 5. Twilight Sky Pinpoint Stars
    const starCount = 1800;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3 + 0] = (Math.random() - 0.5) * 360;
      starPos[i * 3 + 1] = 12 + Math.random() * 95;
      starPos[i * 3 + 2] = -80 - Math.random() * 160;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xe0f2fe,
      size: 1.4,
      transparent: true,
      opacity: 0.65,
    });
    this.disposableGeometries.push(starGeo);
    this.disposableMaterials.push(starMat);

    this.starfieldPoints = new THREE.Points(starGeo, starMat);
    this.scene.add(this.starfieldPoints);
  }

  public update(delta: number, elapsed: number, pointer: THREE.Vector2): void {
    this.smoothPointer.lerp(pointer, Math.min(1, delta * 2.5));

    // Slow organic camera breathing on beach: mimics contemplative ocean gaze
    const camSwayX = Math.sin(elapsed * 0.12) * 1.6 + this.smoothPointer.x * 2.8;
    const camSwayY =
      3.8 +
      Math.sin(elapsed * 0.15) * 0.35 +
      Math.cos(elapsed * 0.062) * 0.2 +
      this.smoothPointer.y * 1.4;
    const camSwayZ = 26.5 + Math.sin(elapsed * 0.08) * 0.9;

    this.camera.position.set(camSwayX, camSwayY, camSwayZ);
    this.camera.lookAt(
      this.smoothPointer.x * 3.5,
      1.2 + this.smoothPointer.y * 0.8,
      -35
    );
    this.camera.rotation.z = Math.sin(elapsed * 0.04) * 0.012;

    // Update shaders
    if (this.oceanMat) {
      this.oceanMat.uniforms.uTime.value = elapsed;
      this.oceanMat.uniforms.uCamPos.value.copy(this.camera.position);
    }

    if (this.beachMat) {
      this.beachMat.uniforms.uTime.value = elapsed;
      this.beachMat.uniforms.uCamPos.value.copy(this.camera.position);
    }
  }

  public resize(width: number, height: number): void {
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();
  }

  public setQuality(scale: number): void {
    // Dynamic quality adjusts water grid rendering or maintains high-performance
    if (this.oceanMesh) {
      this.oceanMesh.visible = scale > 0.1;
    }
  }

  public getActiveInstanceCount(): number {
    return 48400; // 220x220 Gerstner water grid vertices
  }

  public dispose(): void {
    if (this.oceanMesh) {
      this.scene.remove(this.oceanMesh);
      this.oceanMesh = null;
    }
    if (this.beachMesh) {
      this.scene.remove(this.beachMesh);
      this.beachMesh = null;
    }
    if (this.moonMesh) {
      this.scene.remove(this.moonMesh);
      this.moonMesh = null;
    }
    if (this.moonHaloMesh) {
      this.scene.remove(this.moonHaloMesh);
      this.moonHaloMesh = null;
    }
    if (this.starfieldPoints) {
      this.scene.remove(this.starfieldPoints);
      this.starfieldPoints = null;
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
