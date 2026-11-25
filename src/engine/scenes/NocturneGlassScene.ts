import * as THREE from 'three';
import { ISpatialScene, BloomPreset } from '../types';
import { GLSL_DITHER, GLSL_HASH, GLSL_TONEMAP_SHOULDER } from '../shaders/common';

const NOCTURNE_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`;

const NOCTURNE_FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform float uQuality;
  varying vec2 vUv;

  ${GLSL_DITHER}
  ${GLSL_HASH}
  ${GLSL_TONEMAP_SHOULDER}

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash21(i + vec2(0.0, 0.0)), hash21(i + vec2(1.0, 0.0)), f.x),
      mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }

  // Two-Layer Procedural City Bokeh Backdrop (Distant Out-of-Focus Streetlamps & Traffic)
  vec3 renderBokehBackdrop(vec2 uv, float blur) {
    vec3 col = vec3(0.006, 0.009, 0.016); // Deep night obsidian sky

    // Horizon street level gradient
    float streetGlow = smoothstep(-0.6, 0.2, uv.y) * smoothstep(0.8, -0.1, uv.y);
    col += vec3(0.045, 0.025, 0.012) * streetGlow;

    // Grid of overlapping bokeh circles at 3 distinct depth layers
    for (float layer = 0.0; layer < 3.0; layer += 1.0) {
      float scale = 3.5 + layer * 2.8;
      vec2 gridUV = uv * scale;
      // Distant traffic motion along horizontal city streets
      gridUV.x += uTime * (layer == 0.0 ? 0.08 : layer == 1.0 ? -0.12 : 0.04) * (0.8 + layer * 0.4);

      vec2 id = floor(gridUV);
      vec2 gv = fract(gridUV) - 0.5;

      for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
          vec2 offset = vec2(float(x), float(y));
          vec2 cellId = id + offset;
          float rnd = hash21(cellId + layer * 17.5);

          if (rnd > 0.48) {
            vec2 pos = offset + (hash22(cellId) - 0.5) * 0.75;
            vec2 dVec = gv - pos;
            float d = length(dVec);

            // Bokeh disk radius and breathing pulsation
            float baseRadius = 0.14 + rnd * 0.22;
            float pulse = 0.88 + 0.12 * sin(uTime * (0.8 + rnd * 1.5) + rnd * 62.8);
            float radius = baseRadius * pulse;

            // Soft-edged out-of-focus circle with aperture falloff
            float disk = smoothstep(radius, radius * (0.45 + blur * 0.5), d);

            if (disk > 0.001) {
              // Bokeh Palette:
              // 40% Sodium streetlamp amber (#f59e0b)
              // 25% Traffic ruby taillights (#ef4444)
              // 20% Cool cyan neon shop signs (#06b6d4)
              // 15% Soft tungsten incandescent (#fef3c7)
              vec3 bColor;
              float colorPick = fract(rnd * 7.13);
              if (colorPick < 0.40) {
                bColor = vec3(1.0, 0.65, 0.12); // Amber
              } else if (colorPick < 0.65) {
                bColor = vec3(0.96, 0.14, 0.18); // Ruby Taillight
              } else if (colorPick < 0.85) {
                bColor = vec3(0.08, 0.78, 0.95); // Cool Cyan Neon
              } else {
                bColor = vec3(1.0, 0.94, 0.82); // Soft Tungsten
              }

              float intensity = (0.35 + rnd * 0.45) * (1.1 - layer * 0.22);
              vec3 bokehContribution = bColor * disk * intensity;
              col += bokehContribution / (1.0 + bokehContribution * 0.35);
            }
          }
        }
      }
    }

    return col;
  }

  // Raindrop Normal & Mask Computation
  // Returns vec4(normal.xy, isDropletMask, trailMask)
  vec4 getRaindropSurface(vec2 uv) {
    vec2 normal = vec2(0.0);
    float dropMask = 0.0;
    float trailMask = 0.0;

    // 1. Slow, Heavy "Hero" Droplets Sliding Down Gravity Paths
    vec2 heroUV = uv * vec2(4.5, 1.2);
    float colId = floor(heroUV.x);
    float colHash = hash11(colId * 13.7);

    // Droplet fall speed and cycle timing
    float speed = 0.18 + colHash * 0.22;
    float colTime = uTime * speed + colHash * 24.0;
    float slideCycle = fract(colTime);

    // Wiggly gravity path down the glass
    float wiggle = sin(slideCycle * 14.0 + colHash * 6.28) * 0.08 + sin(slideCycle * 32.0) * 0.03;
    vec2 heroPos = vec2(colId + 0.5 + wiggle, 1.0 - slideCycle * 2.2);

    vec2 dHero = heroUV - heroPos;
    // Tear shape: slightly elongated vertically
    dHero.y *= 0.72;
    float dHeroDist = length(dHero);
    float heroRadius = 0.16 + colHash * 0.08;

    if (dHeroDist < heroRadius) {
      float dNorm = dHeroDist / heroRadius;
      float z = sqrt(max(0.0, 1.0 - dNorm * dNorm));
      normal += (dHero / heroRadius) * (1.0 - z * 0.35);
      dropMask = max(dropMask, smoothstep(1.0, 0.85, dNorm));
    }

    // Shedding tiny static trail droplets behind sliding hero drop
    float trailY = heroUV.y - heroPos.y;
    if (trailY > 0.0 && trailY < 1.4) {
      float trailSegment = floor(trailY * 6.0);
      float trailHash = hash21(vec2(colId, trailSegment));
      if (trailHash > 0.42) {
        vec2 trailDropPos = vec2(heroPos.x + (trailHash - 0.5) * 0.12, heroPos.y + (trailSegment + 0.5) / 6.0);
        vec2 dTrail = (heroUV - trailDropPos);
        float dTrailDist = length(dTrail);
        float tRadius = 0.045 + trailHash * 0.045;
        if (dTrailDist < tRadius) {
          float tNorm = dTrailDist / tRadius;
          float z = sqrt(max(0.0, 1.0 - tNorm * tNorm));
          normal += (dTrail / tRadius) * (1.0 - z * 0.4);
          dropMask = max(dropMask, smoothstep(1.0, 0.8, tNorm));
          trailMask = 1.0;
        }
      }
    }

    // 2. Medium Static & Drifting Droplets Across the Pane
    vec2 medUV = uv * vec2(14.0, 14.0);
    vec2 mId = floor(medUV);
    vec2 mGv = fract(medUV) - 0.5;

    for (int my = -1; my <= 1; my++) {
      for (int mx = -1; mx <= 1; mx++) {
        vec2 offset = vec2(float(mx), float(my));
        vec2 cell = mId + offset;
        float h = hash21(cell * 43.1);

        if (h > 0.62) {
          vec2 p = offset + (hash22(cell * 19.3) - 0.5) * 0.7;
          vec2 diff = mGv - p;
          float dist = length(diff);
          float rad = 0.12 + h * 0.14;

          if (dist < rad) {
            float normD = dist / rad;
            float z = sqrt(max(0.0, 1.0 - normD * normD));
            normal += (diff / rad) * (1.0 - z * 0.35);
            dropMask = max(dropMask, smoothstep(1.0, 0.82, normD));
          }
        }
      }
    }

    // 3. Fine Condensation Mist Layer
    float condensation = noise(uv * 68.0) * 0.08;

    return vec4(normal, dropMask, condensation);
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;

    // Subtle breathing camera drift
    vec2 pan = uPointer * 0.06 + vec2(sin(uTime * 0.06) * 0.03, cos(uTime * 0.05) * 0.02);
    vec2 glassUV = uv + pan;

    // Compute raindrop surface physics
    vec4 dropSurface = getRaindropSurface(glassUV);
    vec2 dropNormal = dropSurface.xy;
    float dropMask = dropSurface.z;
    float mist = dropSurface.w;

    // Refraction: Drops act as convex lenses, inverting and displacing the sharper bokeh image
    vec2 refractedUV = glassUV - dropNormal * 0.18;

    // 1. Frosted background glass (condensation blurs the city lights)
    vec3 backgroundBlurred = renderBokehBackdrop(glassUV, 0.85);

    // 2. Sharper refracted city bokeh inside the water droplets
    vec3 refractedInside = renderBokehBackdrop(refractedUV, 0.15);

    // Composite frosted glass with crystal-clear droplet lenses (restrained contrast)
    vec3 finalColor = mix(backgroundBlurred * (0.80 - mist * 0.5), refractedInside * 1.05, dropMask);

    // Specular Rim Glint on the upper-left crest of each raindrop from overhead streetlights (subtle, non-glaring)
    if (dropMask > 0.05) {
      vec3 lightDir = normalize(vec3(-0.45, 0.82, 0.35));
      vec3 norm3D = normalize(vec3(dropNormal, sqrt(max(0.01, 1.0 - dot(dropNormal, dropNormal)))));
      float spec = pow(max(0.0, dot(norm3D, lightDir)), 32.0);
      vec3 rimGlint = vec3(0.95, 0.90, 0.82) * spec * 0.85 * dropMask;
      finalColor += rimGlint;
    }

    // Ultra-rare, soft distant warm lightning illumination across the foggy glass (gentle pulse every ~35s)
    float lightningCycle = fract(uTime * 0.028);
    float lightningFlash = exp(-abs(lightningCycle - 0.5) * 45.0) * step(0.48, lightningCycle) * step(lightningCycle, 0.52);
    vec3 lightningColor = vec3(0.12, 0.11, 0.15) * lightningFlash * 0.5;
    finalColor += lightningColor;

    // Soft HDR shoulder compression to prevent hot spots
    finalColor = finalColor / (1.0 + finalColor * 0.35);

    // Cinematic 35mm Vignette (darkened window frame edges)
    vec2 q = vUv - 0.5;
    float vignette = clamp(1.0 - dot(q, q) * 0.85, 0.0, 1.0);
    finalColor *= vignette;

    // Subtle warm film grain / dithering to eliminate 8-bit banding
    finalColor += screenDither(gl_FragCoord.xy);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export class NocturneGlassScene implements ISpatialScene {
  public readonly id = 'nocturne-glass' as const;
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  public readonly bloomPreset: BloomPreset = {
    strength: 0.26,
    radius: 0.45,
    threshold: 0.88,
  };
  public readonly exposure = 0.80;

  private quadMesh: THREE.Mesh | null = null;
  private quadGeo: THREE.PlaneGeometry | null = null;
  private nocturneMat: THREE.ShaderMaterial | null = null;
  private smoothPointer = new THREE.Vector2();
  private qualityScale = 1.0;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060912);
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 0, 1);
  }

  public init(renderer: THREE.WebGLRenderer): void {
    const size = renderer.getSize(new THREE.Vector2());

    this.quadGeo = new THREE.PlaneGeometry(2, 2);
    this.nocturneMat = new THREE.ShaderMaterial({
      vertexShader: NOCTURNE_VERTEX_SHADER,
      fragmentShader: NOCTURNE_FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(size.x, size.y) },
        uPointer: { value: new THREE.Vector2(0, 0) },
        uQuality: { value: 1.0 },
      },
      depthWrite: false,
      depthTest: false,
    });

    this.quadMesh = new THREE.Mesh(this.quadGeo, this.nocturneMat);
    this.quadMesh.frustumCulled = false;
    this.scene.add(this.quadMesh);
  }

  public update(delta: number, elapsed: number, pointer: THREE.Vector2): void {
    this.smoothPointer.lerp(pointer, Math.min(1, delta * 2.5));

    if (this.nocturneMat) {
      this.nocturneMat.uniforms.uTime.value = elapsed;
      this.nocturneMat.uniforms.uPointer.value.copy(this.smoothPointer);
      this.nocturneMat.uniforms.uQuality.value = this.qualityScale;
    }
  }

  public resize(width: number, height: number): void {
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();

    if (this.nocturneMat) {
      this.nocturneMat.uniforms.uResolution.value.set(width, height);
    }
  }

  public setQuality(scale: number): void {
    this.qualityScale = Math.max(0.4, Math.min(1.0, scale));
    if (this.nocturneMat) {
      this.nocturneMat.uniforms.uQuality.value = this.qualityScale;
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
    if (this.nocturneMat) {
      this.nocturneMat.dispose();
      this.nocturneMat = null;
    }
    this.scene.clear();
  }
}
