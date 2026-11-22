import * as THREE from 'three';
import { ISpatialScene, BloomPreset } from '../types';

const AURORA_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`;

const AURORA_FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform float uQuality;
  varying vec2 vUv;

  // Interleaved gradient dithering to completely eliminate 8-bit color banding
  float screenDither(vec2 fc) {
    return fract(sin(dot(fc, vec2(12.9898, 78.233))) * 43758.5453) * 0.0039;
  }

  // Hash & Noise Primitives
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float hash13(vec3 p) {
    p = fract(p * 0.1031);
    p += dot(p, p.zyx + 31.32);
    return fract((p.x + p.y) * p.z);
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

  // Triangular curl noise for silky organic aurora curtains
  float tri(float x) {
    return abs(fract(x) - 0.5);
  }

  vec2 tri2(vec2 p) {
    return vec2(tri(p.x + tri(p.y * 1.5)), tri(p.y + tri(p.x * 1.5)));
  }

  float triNoise2d(vec2 p, float speed) {
    float z = 1.4;
    float rz = 0.0;
    vec2 bp = p;
    for (int i = 0; i < 4; i++) {
      vec2 dg = tri2(bp * 1.85);
      p += (dg + uTime * speed);
      bp *= 1.9;
      z *= 1.6;
      p *= 1.25;
      rz += (tri(p.x + tri(p.y))) / z;
      bp += 0.14;
    }
    return rz;
  }

  // Multi-layered mountain silhouette profile
  float mountainHeight(float x) {
    float h = 0.0;
    h += abs(noise(vec2(x * 2.2, 1.2)) * 2.0 - 1.0) * 0.045;
    h += abs(noise(vec2(x * 5.5, 4.8)) * 2.0 - 1.0) * 0.025;
    h += abs(noise(vec2(x * 12.0, 9.1)) * 2.0 - 1.0) * 0.012;
    return h + 0.012;
  }

  float mountainLayer2(float x) {
    float h = 0.0;
    h += abs(noise(vec2(x * 3.8 + 8.4, 2.7)) * 2.0 - 1.0) * 0.035;
    h += abs(noise(vec2(x * 8.5 + 4.1, 5.3)) * 2.0 - 1.0) * 0.018;
    return h + 0.006;
  }

  // Twinkling background starfield with circular anti-aliasing
  vec3 renderStars(vec3 rd) {
    vec2 starUV = vec2(atan(rd.x, rd.z) * 6.28318, rd.y * 18.0);
    vec2 id = floor(starUV * 8.0);
    float rnd = hash(id);
    if (rnd > 0.88 && rd.y > 0.02) {
      vec2 gv = fract(starUV * 8.0) - 0.5;
      float d = length(gv);
      float twinkle = 0.65 + 0.35 * sin(uTime * (1.2 + rnd * 3.5) + rnd * 62.8);
      float core = exp(-d * d * 55.0);
      float glow = exp(-d * 14.0) * 0.45;
      vec3 starColor = mix(vec3(0.75, 0.9, 1.0), vec3(1.0, 0.95, 0.82), fract(rnd * 13.5));
      float horizonFade = smoothstep(0.01, 0.18, rd.y);
      return starColor * (core + glow) * twinkle * horizonFade * 1.8;
    }
    return vec3(0.0);
  }

  // Volumetric aurora curtain ray-marcher
  vec4 marchAurora(vec3 ro, vec3 rd) {
    vec4 col = vec4(0.0);
    if (rd.y <= 0.01) return col;

    // Raymarch through upper atmosphere altitude planes [100km..280km equivalent]
    float baseAlt = 4.0;
    float topAlt = 16.0;

    int steps = int(mix(16.0, 26.0, uQuality));
    float stepSize = (topAlt - baseAlt) / float(steps);

    for (int i = 0; i < 26; i++) {
      if (i >= steps) break;
      float t = (baseAlt + float(i) * stepSize) / max(rd.y, 0.025);
      vec3 pos = ro + rd * t;

      // Folded drapery coordinates (curtain ribbon running across East-West horizon)
      vec2 p = pos.xz * 0.052;
      float fold1 = sin(p.x * 1.5 + sin(p.y * 1.3 + uTime * 0.08) * 2.2 + uTime * 0.11);
      float fold2 = cos(p.x * 2.2 - uTime * 0.09) * 0.45;
      float curtain1 = exp(-abs(fold1 + fold2) * 4.2);
      float noiseDetail = triNoise2d(p * 1.4, 0.038);
      float curtain = curtain1 * (0.55 + 0.85 * noiseDetail);

      // Vertical ray filaments shooting upwards along magnetic field lines
      float rays = noise(vec2(pos.x * 0.6 + sin(pos.y * 0.35 + uTime * 0.35), uTime * 0.12));
      float density = smoothstep(0.08, 0.75, curtain) * (0.6 + 0.4 * rays);

      // Altitude factor along curtain height
      float h = float(i) / float(steps);
      float vertFalloff = smoothstep(0.0, 0.18, h) * smoothstep(1.0, 0.42, h);

      // Aurora Palette:
      // Lower edge: Luminous emerald green (#1df2a0)
      // Mid-height: Arctic teal (#14b5d0)
      // Upper tips: High-altitude ethereal violet/magenta (#8c46ff)
      vec3 emerald = vec3(0.114, 0.949, 0.627);
      vec3 teal = vec3(0.078, 0.710, 0.816);
      vec3 violet = vec3(0.549, 0.275, 1.0);

      vec3 layerCol = mix(emerald, teal, smoothstep(0.05, 0.48, h));
      layerCol = mix(layerCol, violet, smoothstep(0.48, 0.92, h));

      float alpha = density * vertFalloff * 0.35;
      col.rgb += layerCol * alpha * (1.0 - col.a) * 4.5;
      col.a += alpha * (1.0 - col.a);

      if (col.a >= 0.94) break;
    }

    return col;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;

    // Organic interactive camera drift
    float camYaw = uPointer.x * 0.25 + sin(uTime * 0.04) * 0.08;
    float camPitch = 0.08 + uPointer.y * 0.12 + cos(uTime * 0.035) * 0.02;

    // Construct primary view ray
    vec3 ro = vec3(0.0, 1.2, 0.0);
    vec3 rd = normalize(vec3(uv.x + camYaw * 0.8, uv.y + camPitch, 1.25));

    // Twilight Sky Gradient (Deep Navy Polar Obsidian -> Subtle Horizon Glow)
    vec3 skyBase = mix(vec3(0.015, 0.045, 0.09), vec3(0.003, 0.008, 0.018), clamp(rd.y * 2.2, 0.0, 1.0));
    vec3 finalColor = vec3(0.0);

    bool isSky = rd.y > 0.0;
    vec3 sampleRd = rd;
    float waterReflectance = 0.0;

    if (!isSky) {
      // Glacial Fjord Lake Water Surface
      // Dynamic gentle ripple distortion reflecting sky and aurora
      float dist = -ro.y / min(rd.y, -0.005);
      vec3 hitPos = ro + rd * dist;

      float wave1 = sin(hitPos.x * 1.8 + uTime * 2.2) * 0.012;
      float wave2 = cos(hitPos.z * 1.4 - uTime * 1.6) * 0.008;
      float micro = noise(hitPos.xz * 4.5 + uTime * 0.8) * 0.01;

      // Reflect view ray upward with surface ripples
      sampleRd = reflect(rd, normalize(vec3(wave1 + micro, 1.0, wave2 + micro)));
      sampleRd.y = max(sampleRd.y, 0.005);

      // Fresnel reflectance (Schlick approximation)
      waterReflectance = 0.04 + 0.96 * pow(1.0 - abs(rd.y), 5.0);
    }

    // 1. Stars in sample direction
    vec3 stars = renderStars(sampleRd);

    // 2. Volumetric Aurora Curtains
    vec4 aurora = marchAurora(ro, sampleRd);

    // Dim background stars naturally behind dense glowing aurora bands
    stars *= (1.0 - smoothstep(0.15, 0.75, aurora.a * 0.8));

    // 3. Polar Fjord Mountain Silhouettes
    float normX = sampleRd.x / max(sampleRd.z, 0.1);
    float mHeight1 = mountainHeight(normX);
    float mHeight2 = mountainLayer2(normX);

    vec3 skyAndAurora = skyBase + stars + aurora.rgb;

    if (sampleRd.y < mHeight1) {
      // Near mountain silhouette (dark slate #040914 with faint rim catch)
      float snowCatch = smoothstep(mHeight1 - 0.015, mHeight1, sampleRd.y) * 0.25;
      vec3 mCol = mix(vec3(0.012, 0.022, 0.038), vec3(0.04, 0.08, 0.12), snowCatch);
      // Subtle rim illumination from overhead green aurora
      mCol += aurora.rgb * 0.06;
      skyAndAurora = mCol;
    } else if (sampleRd.y < mHeight2) {
      // Distant mountain layer
      vec3 mCol2 = vec3(0.018, 0.032, 0.052) + aurora.rgb * 0.04;
      skyAndAurora = mCol2;
    }

    if (isSky) {
      finalColor = skyAndAurora;
    } else {
      // Dark deep glacial lake water color with aurora specular reflection
      vec3 waterDeep = vec3(0.004, 0.014, 0.026);
      vec3 waterSurface = mix(waterDeep, skyAndAurora * 0.92, waterReflectance);

      // Soft shoreline mist layer near horizon
      float shoreMist = smoothstep(0.08, 0.0, abs(rd.y)) * 0.35;
      vec3 mistCol = mix(vec3(0.03, 0.07, 0.11), aurora.rgb * 0.25, 0.45);
      finalColor = mix(waterSurface, mistCol, shoreMist);
    }

    // Subtle edge vignette
    vec2 q = vUv - 0.5;
    finalColor *= clamp(1.0 - dot(q, q) * 0.65, 0.0, 1.0);

    // Dither against 8-bit banding
    finalColor += screenDither(gl_FragCoord.xy);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export class ArcticAuroraScene implements ISpatialScene {
  public readonly id = 'arctic-aurora' as const;
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  public readonly bloomPreset: BloomPreset = {
    strength: 0.95,
    radius: 0.62,
    threshold: 0.45,
  };
  public readonly exposure = 1.05;

  private quadMesh: THREE.Mesh | null = null;
  private quadGeo: THREE.PlaneGeometry | null = null;
  private auroraMat: THREE.ShaderMaterial | null = null;
  private smoothPointer = new THREE.Vector2();
  private qualityScale = 1.0;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x020510);
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 0, 1);
  }

  public init(renderer: THREE.WebGLRenderer): void {
    const size = renderer.getSize(new THREE.Vector2());

    this.quadGeo = new THREE.PlaneGeometry(2, 2);
    this.auroraMat = new THREE.ShaderMaterial({
      vertexShader: AURORA_VERTEX_SHADER,
      fragmentShader: AURORA_FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(size.x, size.y) },
        uPointer: { value: new THREE.Vector2(0, 0) },
        uQuality: { value: 1.0 },
      },
      depthWrite: false,
      depthTest: false,
    });

    this.quadMesh = new THREE.Mesh(this.quadGeo, this.auroraMat);
    this.quadMesh.frustumCulled = false;
    this.scene.add(this.quadMesh);
  }

  public update(delta: number, elapsed: number, pointer: THREE.Vector2): void {
    this.smoothPointer.lerp(pointer, Math.min(1, delta * 2.5));

    if (this.auroraMat) {
      this.auroraMat.uniforms.uTime.value = elapsed;
      this.auroraMat.uniforms.uPointer.value.copy(this.smoothPointer);
      this.auroraMat.uniforms.uQuality.value = this.qualityScale;
    }
  }

  public resize(width: number, height: number): void {
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();

    if (this.auroraMat) {
      this.auroraMat.uniforms.uResolution.value.set(width, height);
    }
  }

  public setQuality(scale: number): void {
    this.qualityScale = Math.max(0.4, Math.min(1.0, scale));
    if (this.auroraMat) {
      this.auroraMat.uniforms.uQuality.value = this.qualityScale;
    }
  }

  public getActiveInstanceCount(): number {
    return 1;
  }

  public dispose(): void {
    if (this.quadMesh) {
      this.scene.remove(this.quadMesh);
      this.quadMesh = null;
    }
    if (this.quadGeo) {
      this.quadGeo.dispose();
      this.quadGeo = null;
    }
    if (this.auroraMat) {
      this.auroraMat.dispose();
      this.auroraMat = null;
    }
    this.scene.clear();
  }
}
