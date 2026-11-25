import * as THREE from 'three';
import { ISpatialScene, BloomPreset } from '../types';
import { GLSL_DITHER, GLSL_HASH, GLSL_TONEMAP_SHOULDER } from '../shaders/common';

const CRUISE_VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.9999, 1.0);
  }
`;

const CRUISE_FRAGMENT_SHADER = /* glsl */ `
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform float uQuality;
  varying vec2 vUv;

  ${GLSL_DITHER}
  ${GLSL_HASH}
  ${GLSL_TONEMAP_SHOULDER}

  // Value noise for asphalt micro-grain and coastal mist
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

  // Smooth minimum for organic vehicle body blending
  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }

  // Signed distance to 2D line segment
  float sdSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
  }

  // 2D Box SDF
  float sdBox(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
  }

  // Anti-aliased crescent moon SDF
  vec3 renderCrescentMoon(vec2 uv, vec2 moonPos, float radius) {
    vec2 p = uv - moonPos;
    float d1 = length(p) - radius;
    float d2 = length(p - vec2(radius * 0.42, radius * 0.18)) - radius * 0.92;
    float crescent = max(d1, -d2);

    float alpha = smoothstep(0.003, -0.003, crescent);
    // Delicate atmospheric halo around the crescent
    float glow = exp(-max(0.0, d1) * 35.0) * 0.35;

    // Faint earthshine inside the dark lunar disc
    float earthshine = smoothstep(0.003, -0.003, d1) * (1.0 - alpha) * 0.04;

    vec3 moonCol = vec3(0.98, 0.96, 0.90) * alpha;
    vec3 glowCol = vec3(0.65, 0.78, 0.95) * (glow + earthshine);
    return moonCol + glowCol;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;

    // Gentle camera sway influenced by pointer
    uv += uPointer * vec2(0.025, 0.015);

    vec3 finalColor = vec3(0.0);
    float horizonY = -0.04;

    // =========================================================================
    // PARALLAX LAYER 4: Starlit Night Sky & Crescent Moon
    // =========================================================================
    if (uv.y > horizonY - 0.08) {
      // Midnight navy to dark indigo twilight sky gradient
      float skyGrad = clamp((uv.y - horizonY) / 0.65, 0.0, 1.0);
      vec3 skyBase = mix(vec3(0.008, 0.018, 0.038), vec3(0.002, 0.005, 0.012), skyGrad);

      // Pinpoint anti-aliased twinkling stars
      vec2 starGrid = uv * 32.0;
      vec2 starId = floor(starGrid);
      vec2 starGv = fract(starGrid) - 0.5;
      float starH = hash21(starId);
      if (starH > 0.86 && uv.y > horizonY + 0.05) {
        float twinkle = 0.75 + 0.25 * sin(uTime * (1.5 + starH * 4.0) + starH * 62.8);
        float starD = length(starGv - (hash22(starId) - 0.5) * 0.7);
        float starCore = exp(-starD * starD * 95.0);
        vec3 starCol = mix(vec3(0.75, 0.88, 1.0), vec3(1.0, 0.95, 0.85), starH);
        skyBase += starCol * starCore * twinkle * 0.85;
      }

      // Crisp crescent moon in upper right quadrant
      vec2 moonPos = vec2(0.48, 0.28);
      skyBase += renderCrescentMoon(uv, moonPos, 0.065);

      finalColor = skyBase;
    }

    // =========================================================================
    // PARALLAX LAYER 3: Distant Bay Water & Twinkling Bay Skyline Across Water
    // =========================================================================
    float waterTopY = horizonY;
    float waterBottomY = horizonY - 0.06;

    if (uv.y <= waterTopY && uv.y >= waterBottomY - 0.02) {
      // Dark coastal bay water with horizontal water ripple specular distortion
      float waterRipple = sin(uv.x * 65.0 + uTime * 2.5) * 0.003 + noise(vec2(uv.x * 24.0, uTime * 0.8)) * 0.004;
      vec3 bayWater = vec3(0.003, 0.008, 0.016);

      // Mirror reflection of distant city lights shimmering in bay water
      float mirrorUvY = (waterTopY - uv.y) * 1.5;
      float cityLightReflection = smoothstep(0.08, 0.0, abs(uv.x + 0.15)) * exp(-mirrorUvY * 18.0) * (0.6 + 0.4 * sin(uv.x * 120.0 + uTime * 5.0));
      bayWater += vec3(0.95, 0.72, 0.25) * cityLightReflection * 0.25;

      finalColor = mix(finalColor, bayWater, smoothstep(waterTopY + 0.005, waterTopY - 0.005, uv.y));
    }

    // Distant City Skyline Silhouettes with Micro-Window Twinkles (Parallax Speed 0.04)
    float skylineX = uv.x + uTime * 0.04;
    float skylineBlock = floor(skylineX * 22.0);
    float skylineH = hash11(skylineBlock * 7.13);
    if (skylineH > 0.45) {
      float buildingHeight = horizonY + (skylineH - 0.45) * 0.16;
      if (uv.y < buildingHeight && uv.y >= horizonY) {
        vec3 buildingCol = vec3(0.006, 0.012, 0.022);

        // Micro-window grid inside skyline building
        vec2 winUV = vec2(fract(skylineX * 22.0), (uv.y - horizonY) / 0.16) * vec2(6.0, 14.0);
        float winH = hash21(floor(winUV) + skylineBlock * 13.0);
        if (winH > 0.78) {
          float winTwinkle = 0.6 + 0.4 * sin(uTime * 2.0 + winH * 32.0);
          vec3 winColor = winH > 0.9 ? vec3(0.95, 0.75, 0.35) : vec3(0.35, 0.75, 0.95);
          buildingCol += winColor * 0.35 * winTwinkle;
        }
        finalColor = buildingCol;
      }
    }

    // =========================================================================
    // PARALLAX LAYER 2: Silhouetted Coastal Pines & Rolling Hills (Parallax 0.12)
    // =========================================================================
    float hillX = uv.x + uTime * 0.12;
    float hillHeight = horizonY + 0.035 * sin(hillX * 3.5) + 0.018 * sin(hillX * 8.2 + 1.2) + 0.025;

    // Coastal Pine tree silhouettes along ridge
    float treeCell = floor(hillX * 18.0);
    float treeH = hash11(treeCell * 19.3);
    if (treeH > 0.55) {
      float treeXInCell = fract(hillX * 18.0) - 0.5;
      float treePeak = hillHeight + (treeH - 0.55) * 0.08;
      float treeProfile = treePeak - abs(treeXInCell) * 0.09;
      hillHeight = max(hillHeight, treeProfile);
    }

    if (uv.y < hillHeight) {
      // Dark coastal pine silhouette (#02050b) with subtle atmospheric depth fog
      vec3 hillCol = vec3(0.004, 0.009, 0.015);
      float rimFog = smoothstep(hillHeight - 0.015, hillHeight, uv.y) * 0.12;
      hillCol += vec3(0.02, 0.045, 0.075) * rimFog;
      finalColor = hillCol;
    }

    // =========================================================================
    // ROADWAY & WET ASPHALT SHADER (Lower-Middle Third, Y < -0.06)
    // =========================================================================
    float roadTopY = -0.06;
    if (uv.y < roadTopY) {
      float roadDepth = (roadTopY - uv.y) / 0.55; // 0 at horizon, 1 at screen bottom

      // Asphalt aggregate grain texture
      vec2 roadTexUV = vec2(uv.x * 12.0 + uTime * 2.8, roadDepth * 28.0);
      float grain = (hash21(floor(roadTexUV)) * 0.5 + hash21(floor(roadTexUV * 2.0)) * 0.5) * 0.035;
      vec3 asphalt = vec3(0.018 + grain, 0.020 + grain, 0.026 + grain);

      // Scrolling dashed lane lines
      float lineX = uv.x + uTime * 2.8;
      float dash = step(0.48, fract(lineX * 1.8));
      float isCenterLane = smoothstep(0.008, 0.002, abs(uv.y - (-0.36)));
      float isEdgeLine = smoothstep(0.009, 0.003, abs(uv.y - (-0.10)));
      vec3 laneLineColor = vec3(0.65, 0.68, 0.72) * 0.65;
      asphalt = mix(asphalt, laneLineColor, isCenterLane * dash * 0.75 + isEdgeLine * 0.65);

      // Real-Time Passing Sodium Streetlights (Amber #f59e0b)
      // Overhead lamp cycle passing rhythmically right-to-left
      float lampSpeed = 0.55;
      float lampCycle = fract(uTime * lampSpeed);
      vec3 streetLightAccum = vec3(0.0);

      for (int i = 0; i < 3; i++) {
        float offsetCycle = fract(lampCycle + float(i) * 0.3333);
        float lampPosX = mix(0.95, -0.95, offsetCycle);
        float lampPosY = 0.08;

        // Streetlight pole & lamp head
        float lampDist = length(uv - vec2(lampPosX, lampPosY));
        float lampGlow = exp(-lampDist * 8.5) * 0.45;
        vec3 amberLight = vec3(1.0, 0.62, 0.15);

        // Asphalt rough-grained shimmer specular reflection streak
        float specX = exp(-pow(uv.x - lampPosX, 2.0) * 14.0);
        float specFalloff = smoothstep(roadTopY, -0.45, uv.y);
        float asphaltShimmer = specX * (0.65 + 0.35 * sin(roadTexUV.x * 6.0 + grain * 12.0)) * specFalloff;

        streetLightAccum += amberLight * (lampGlow * 0.35 + asphaltShimmer * 0.42);
      }

      // Car Headlight forward road reflection pool (Soft warm mist projection)
      float carHeadDistX = uv.x - 0.18;
      float carHeadPool = smoothstep(0.35, -0.02, carHeadDistX) * smoothstep(roadTopY - 0.02, -0.38, uv.y) * smoothstep(-0.45, -0.28, uv.y);
      vec3 headLightPool = vec3(0.95, 0.90, 0.78) * carHeadPool * 0.32;

      // Car Taillight rear road reflection pool (Thin crimson LED shimmer)
      float carTailDistX = -0.26 - uv.x;
      float carTailPool = smoothstep(0.22, 0.0, carTailDistX) * smoothstep(roadTopY - 0.08, -0.32, uv.y) * smoothstep(-0.42, -0.26, uv.y);
      vec3 tailLightPool = vec3(0.95, 0.08, 0.12) * carTailPool * 0.28;

      finalColor = asphalt + streetLightAccum + headLightPool + tailLightPool;
    }

    // =========================================================================
    // HERO SILHOUETTE: Sculpted Fastback Coupe Profile (Zero Boxy Geometry)
    // =========================================================================
    // Subtle organic damped suspension bounce from highway irregularities
    float bounce = sin(uTime * 14.0) * 0.0022 + sin(uTime * 28.0) * 0.0009;
    vec2 carOrigin = vec2(-0.02, -0.22 + bounce);
    vec2 cp = uv - carOrigin;

    // Fastback aerodynamic profile bounds: X from -0.30 to +0.32, Y from -0.04 to +0.10
    float carMask = 0.0;
    float cabinMask = 0.0;
    float chromeRim = 0.0;

    // Main lower body chassis
    float bodyBox = sdBox(cp - vec2(0.01, 0.015), vec2(0.30, 0.038));
    // Curved nose slope down to front splitter
    float noseSlope = dot(cp - vec2(0.24, 0.02), normalize(vec2(1.0, 1.2)));
    bodyBox = smin(bodyBox, noseSlope, 0.04);
    // Rear fastback slope
    float tailSlope = dot(cp - vec2(-0.24, 0.02), normalize(vec2(-1.0, 0.85)));
    bodyBox = smin(bodyBox, tailSlope, 0.035);

    // Fastback aerodynamic greenhouse cabin
    // Windshield slope -> Flat roofline -> Swept fastback rear deck
    float cabinBox = sdBox(cp - vec2(-0.035, 0.068), vec2(0.14, 0.028));
    float windshieldSlope = dot(cp - vec2(0.11, 0.055), normalize(vec2(1.2, 1.0)));
    float rearGlassSlope = dot(cp - vec2(-0.16, 0.055), normalize(vec2(-0.9, 0.75)));
    cabinBox = max(cabinBox, windshieldSlope);
    cabinBox = max(cabinBox, rearGlassSlope);

    // Car Body Union
    float carSDF = smin(bodyBox, cabinBox, 0.032);

    // Wheel Well Cutouts: Front at X = 0.18, Rear at X = -0.18
    float frontWell = length(cp - vec2(0.18, -0.015)) - 0.056;
    float rearWell = length(cp - vec2(-0.18, -0.015)) - 0.056;
    carSDF = max(carSDF, -frontWell);
    carSDF = max(carSDF, -rearWell);

    // Render Car Silhouette with Sub-Pixel Anti-Aliasing
    float aaPixel = 1.8 / uResolution.y;
    carMask = smoothstep(aaPixel, -aaPixel, carSDF);

    if (carMask > 0.001) {
      // Glossy deep midnight obsidian car paint (#050914)
      vec3 paintBase = vec3(0.018, 0.032, 0.058);

      // Real-Time Traveling Specular Rim Highlights:
      // Glides naturally from hood -> windshield -> roofline -> rear deck as streetlights pass
      float lampCycle = fract(uTime * 0.55);
      float sweepX = mix(0.45, -0.45, lampCycle);
      float sweepHighlight = exp(-pow(cp.x - sweepX, 2.0) * 28.0) * smoothstep(0.02, 0.09, cp.y);
      vec3 specularSweep = vec3(1.0, 0.85, 0.55) * sweepHighlight * 0.75;

      // Chrome body accent line along door sill & roof arch
      float roofArchDist = abs(cabinBox);
      chromeRim = smoothstep(0.006, 0.0, roofArchDist) * smoothstep(-0.16, 0.12, cp.x) * 0.45;

      // Tinted cabin glass with faint warm tungsten dashboard glow
      float glassInner = smoothstep(0.012, -0.004, cabinBox);
      vec3 glassColor = vec3(0.008, 0.014, 0.024);
      // Warm tungsten dashboard glow (#d99b52) glowing softly from front cockpit
      float dashGlow = exp(-length(cp - vec2(0.065, 0.05)) * 18.0) * 0.38;
      glassColor += vec3(0.85, 0.61, 0.32) * dashGlow;

      vec3 carSurface = mix(paintBase + specularSweep + chromeRim, glassColor, glassInner * 0.85);

      finalColor = mix(finalColor, carSurface, carMask);
    }

    // Rotating Multi-Spoke Alloy Wheels
    // Front Wheel (X = 0.18), Rear Wheel (X = -0.18)
    vec2 frontWheelUV = cp - vec2(0.18, -0.015);
    vec2 rearWheelUV = cp - vec2(-0.18, -0.015);
    float wheelRadius = 0.048;

    for (int w = 0; w < 2; w++) {
      vec2 wp = w == 0 ? frontWheelUV : rearWheelUV;
      float wd = length(wp);
      if (wd < wheelRadius + 0.004) {
        float tireMask = smoothstep(wheelRadius, wheelRadius - 0.008, wd);
        float rimMask = smoothstep(wheelRadius - 0.012, wheelRadius - 0.016, wd);

        // Rotating 5-Spoke Alloy Rims
        float angle = atan(wp.y, wp.x) + uTime * 24.0;
        float spokes = abs(sin(angle * 2.5));
        float spokeMask = smoothstep(0.45, 0.85, spokes) * rimMask;

        vec3 tireCol = vec3(0.015, 0.018, 0.022);
        vec3 rimCol = mix(vec3(0.08, 0.12, 0.18), vec3(0.75, 0.80, 0.88), spokeMask * 0.7);

        vec3 wheelPixel = mix(tireCol, rimCol, rimMask);
        float wheelTotalMask = smoothstep(wheelRadius + 0.002, wheelRadius - 0.002, wd);
        finalColor = mix(finalColor, wheelPixel, wheelTotalMask);
      }
    }

    // Forward LED Headlight Projector & Volumetric Coastal Mist Cone
    vec2 hlOrigin = carOrigin + vec2(0.30, 0.025);
    float hlDist = length(uv - hlOrigin);
    float hlFlare = exp(-hlDist * 65.0);
    finalColor += vec3(1.0, 0.96, 0.88) * hlFlare * 0.85;

    // Volumetric Headlight Cone in light coastal mist
    vec2 coneDir = uv - hlOrigin;
    if (coneDir.x > 0.0 && coneDir.x < 0.65) {
      float coneWidth = coneDir.x * 0.32;
      float inCone = smoothstep(coneWidth, 0.0, abs(coneDir.y + coneDir.x * 0.12));
      float mistNoise = 0.82 + 0.18 * noise(vec2(uv.x * 8.0 - uTime * 1.5, uv.y * 12.0));
      float coneFalloff = smoothstep(0.65, 0.05, coneDir.x) * mistNoise * 0.22;
      finalColor += vec3(0.95, 0.92, 0.84) * inCone * coneFalloff;
    }

    // Sleek Rear LED Taillight Bar
    vec2 tlOrigin = carOrigin + vec2(-0.295, 0.032);
    float tlDist = length(uv - tlOrigin);
    float tlFlare = exp(-tlDist * 75.0);
    // Thin horizontal lightbar segment
    float tlBar = sdSegment(uv, tlOrigin - vec2(0.004, 0.0), tlOrigin + vec2(0.004, 0.0));
    float tlBarMask = smoothstep(0.006, 0.001, tlBar);
    finalColor += vec3(0.95, 0.06, 0.08) * (tlBarMask * 1.1 + tlFlare * 0.65);

    // =========================================================================
    // PARALLAX LAYER 0: Fast Blurred Foreground Guardrail Posts (Extreme Speed)
    // =========================================================================
    if (uv.y < -0.32 && uv.y > -0.48) {
      float guardX = uv.x + uTime * 4.2;
      float postGv = fract(guardX * 3.5);
      float postDist = abs(postGv - 0.5);
      // Speed motion blur horizontally
      float postMask = smoothstep(0.18, 0.02, postDist) * smoothstep(-0.48, -0.44, uv.y) * smoothstep(-0.32, -0.35, uv.y);
      vec3 guardrailCol = vec3(0.08, 0.10, 0.14) * 0.45;
      finalColor = mix(finalColor, guardrailCol, postMask * 0.65);
    }

    // Soft 35mm cinema vignette
    vec2 screenQ = gl_FragCoord.xy / uResolution.xy - 0.5;
    finalColor *= clamp(1.0 - dot(screenQ, screenQ) * 0.75, 0.0, 1.0);

    // Soft HDR shoulder compression to prevent chalky white blowouts
    finalColor = softHdrShoulder(finalColor, 0.35);

    // Dither against 8-bit banding
    finalColor += screenDither(gl_FragCoord.xy);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export class MidnightCruiseScene implements ISpatialScene {
  public readonly id = 'midnight-cruise' as const;
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  public readonly bloomPreset: BloomPreset = {
    strength: 0.30,
    radius: 0.50,
    threshold: 0.88,
  };
  public readonly exposure = 0.80;

  private quadMesh: THREE.Mesh | null = null;
  private quadGeo: THREE.PlaneGeometry | null = null;
  private cruiseMat: THREE.ShaderMaterial | null = null;
  private smoothPointer = new THREE.Vector2();
  private qualityScale = 1.0;

  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x02050e);
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 0, 1);
  }

  public init(renderer: THREE.WebGLRenderer): void {
    const size = renderer.getSize(new THREE.Vector2());

    this.quadGeo = new THREE.PlaneGeometry(2, 2);
    this.cruiseMat = new THREE.ShaderMaterial({
      vertexShader: CRUISE_VERTEX_SHADER,
      fragmentShader: CRUISE_FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(size.x, size.y) },
        uPointer: { value: new THREE.Vector2(0, 0) },
        uQuality: { value: 1.0 },
      },
      depthWrite: false,
      depthTest: false,
    });

    this.quadMesh = new THREE.Mesh(this.quadGeo, this.cruiseMat);
    this.quadMesh.frustumCulled = false;
    this.scene.add(this.quadMesh);
  }

  public update(delta: number, elapsed: number, pointer: THREE.Vector2): void {
    this.smoothPointer.lerp(pointer, Math.min(1, delta * 2.5));

    if (this.cruiseMat) {
      this.cruiseMat.uniforms.uTime.value = elapsed;
      this.cruiseMat.uniforms.uPointer.value.copy(this.smoothPointer);
      this.cruiseMat.uniforms.uQuality.value = this.qualityScale;
    }
  }

  public resize(width: number, height: number): void {
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();

    if (this.cruiseMat) {
      this.cruiseMat.uniforms.uResolution.value.set(width, height);
    }
  }

  public setQuality(scale: number): void {
    this.qualityScale = Math.max(0.4, Math.min(1.0, scale));
    if (this.cruiseMat) {
      this.cruiseMat.uniforms.uQuality.value = this.qualityScale;
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
    if (this.cruiseMat) {
      this.cruiseMat.dispose();
      this.cruiseMat = null;
    }
    this.scene.clear();
  }
}
