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

  // Smooth value noise for atmosphere, coastal mist, and asphalt micro-grain
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

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p = p * 2.04 + vec2(1.7, 3.1);
      a *= 0.5;
    }
    return v;
  }

  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }

  float smax(float a, float b, float k) {
    return -smin(-a, -b, k);
  }

  float sdSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
  }

  float sdBox(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
  }

  // Anti-aliased crescent moon with subtle earthshine glow
  vec3 renderCrescentMoon(vec2 uv, vec2 moonPos, float radius) {
    vec2 p = uv - moonPos;
    float d1 = length(p) - radius;
    float d2 = length(p - vec2(radius * 0.45, radius * 0.22)) - radius * 0.90;
    float crescent = max(d1, -d2);

    float alpha = smoothstep(0.0025, -0.0025, crescent);
    float glow = exp(-max(0.0, d1) * 32.0) * 0.24;
    float earthshine = smoothstep(0.003, -0.003, d1) * (1.0 - alpha) * 0.030;

    vec3 moonCol = vec3(0.96, 0.94, 0.88) * alpha;
    vec3 glowCol = vec3(0.52, 0.68, 0.90) * (glow + earthshine);
    return moonCol + glowCol;
  }

  // =========================================================================
  // MATHEMATICALLY LOCKED SPORTS COUPE SDF
  // Normalized car-local space: x in [-1.0, 1.0], facing right (+X).
  // Wheels at x = +-0.58, radius r = 0.19, road line at y = -0.19.
  // Ground clearance = 0.08 above asphalt -> sill at y = -0.11.
  // Hood: +0.20 to +0.95. Windshield: +0.22 to -0.05.
  // Roof height: ~0.56. Ducktail lip: -0.92.
  // =========================================================================
  float sdCoupeBodyOnly(vec2 p) {
    // 1. Lower chassis slab (rocker sill to shoulder line)
    // Center at (0.0, 0.09), half-size (0.94, 0.20) -> spans y from -0.11 to +0.29
    float chassis = sdBox(p - vec2(0.02, 0.09), vec2(0.93, 0.20));

    // Aerodynamic nose down-slope (+0.20 to +0.95)
    // Cuts the upper-front corner from cowl (+0.20, 0.29) to nose tip (+0.95, 0.03)
    vec2 hoodA = vec2(0.20, 0.29);
    vec2 hoodB = vec2(0.95, 0.03);
    vec2 hoodDir = normalize(hoodB - hoodA);
    vec2 hoodNorm = vec2(-hoodDir.y, hoodDir.x);
    float hoodCut = dot(p - hoodA, hoodNorm);
    chassis = smax(chassis, hoodCut, 0.045);

    // Front splitter bevel & under-nose air dam
    float noseLip = dot(p - vec2(0.95, -0.05), normalize(vec2(0.85, -0.52)));
    chassis = smax(chassis, noseLip, 0.035);

    // Rear diffuser tuck-in beneath bumper
    float rearDiffuser = dot(p - vec2(-0.88, -0.07), normalize(vec2(-0.75, -0.66)));
    chassis = smax(chassis, rearDiffuser, 0.035);

    // 2. Swept fastback greenhouse cabin (A-pillar -> Roof -> C-pillar)
    // Spans from windshield base at x = +0.22, y = 0.28 up to roof height ~0.56 at x = -0.05
    // and sweeps down to decklid at x = -0.78, y = 0.32
    float cabin = sdBox(p - vec2(-0.22, 0.39), vec2(0.48, 0.17));

    // Raked windshield plane (+0.22, 0.28) -> (-0.05, 0.56)
    vec2 wsA = vec2(0.22, 0.28);
    vec2 wsB = vec2(-0.05, 0.56);
    vec2 wsDir = normalize(wsB - wsA);
    vec2 wsNorm = vec2(-wsDir.y, wsDir.x);
    float windshieldCut = dot(p - wsA, wsNorm);
    cabin = smax(cabin, windshieldCut, 0.038);

    // Fastback rear glass sweep: (-0.05, 0.56) -> (-0.78, 0.32)
    vec2 fbA = vec2(-0.05, 0.56);
    vec2 fbB = vec2(-0.78, 0.32);
    vec2 fbDir = normalize(fbB - fbA);
    vec2 fbNorm = vec2(-fbDir.y, fbDir.x);
    float fastbackCut = dot(p - fbA, fbNorm);
    cabin = smax(cabin, fastbackCut, 0.042);

    // Smooth aerodynamic roof crown (peak height ~0.56 at x = -0.05)
    float rx = p.x + 0.05;
    float roofCurve = p.y - (0.565 - rx * rx * 0.32);
    cabin = smax(cabin, roofCurve, 0.024);

    // Blend lower chassis with fastback cabin
    float body = smin(chassis, cabin, 0.045);

    // 3. Integrated ducktail spoiler lip at x = -0.92, y = 0.35
    vec2 ducktailPos = vec2(-0.92, 0.34);
    float ducktail = length(p - ducktailPos) - 0.042;
    body = smin(body, ducktail, 0.035);

    // Rear fascia vertical cutoff behind spoiler
    float rearFascia = dot(p - vec2(-0.94, 0.18), normalize(vec2(-1.0, 0.08)));
    body = smax(body, rearFascia, 0.028);

    return body;
  }

  // Body SDF including wheel well cutouts
  float sdSportsCoupe(vec2 bodyP, vec2 wheelP) {
    float body = sdCoupeBodyOnly(bodyP);

    // Wheel wells cut from road-locked hub positions at x = +-0.58
    float wellRadius = 0.235; // Tire radius 0.19 + 0.045 clearance
    float frontWell = length(wheelP - vec2(0.58, 0.0)) - wellRadius;
    float rearWell = length(wheelP - vec2(-0.58, 0.0)) - wellRadius;

    body = max(body, -frontWell);
    body = max(body, -rearWell);
    return body;
  }

  // Recessed smoked side glass SDF
  float sdSideWindow(vec2 p) {
    float winBox = sdBox(p - vec2(-0.20, 0.40), vec2(0.38, 0.12));
    // Windshield inner frame rake
    float wsCut = dot(p - vec2(0.18, 0.31), normalize(vec2(0.72, 0.69)));
    // Fastback C-pillar inner slope
    float cCut = dot(p - vec2(-0.64, 0.35), normalize(vec2(-0.48, 0.88)));
    // Roof inner trim
    float wrx = p.x + 0.05;
    float roofCut = p.y - (0.535 - wrx * wrx * 0.30);

    float win = smax(winBox, wsCut, 0.022);
    win = smax(win, cCut, 0.025);
    win = smax(win, roofCut, 0.018);
    return win;
  }

  // Numerical gradient of the vehicle body SDF for smooth metallic specular rim sweep
  vec2 sportsCoupeNormal(vec2 bodyP, vec2 wheelP) {
    const float eps = 0.0035;
    float d = sdSportsCoupe(bodyP, wheelP);
    float dx = sdSportsCoupe(bodyP + vec2(eps, 0.0), wheelP + vec2(eps, 0.0)) -
               sdSportsCoupe(bodyP - vec2(eps, 0.0), wheelP - vec2(eps, 0.0));
    float dy = sdSportsCoupe(bodyP + vec2(0.0, eps), wheelP) -
               sdSportsCoupe(bodyP - vec2(0.0, eps), wheelP);
    return normalize(vec2(dx, dy));
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;

    // Organic breathing camera motion + subtle pointer parallax
    vec2 camBreath = vec2(sin(uTime * 0.32) * 0.0035, cos(uTime * 0.25) * 0.0025);
    uv += uPointer * vec2(0.022, 0.012) + camBreath;

    float aa = 1.6 / uResolution.y;
    vec3 finalColor = vec3(0.0);

    // World horizon & road coordinates
    float bayHorizonY = 0.045;
    float waterBottomY = -0.025;
    float roadTopY = -0.070;

    // =========================================================================
    // LAYER 5: Dithered Deep Midnight Sky, Drifting Clouds, Stars & Crescent Moon
    // =========================================================================
    if (uv.y >= waterBottomY) {
      float skyT = clamp((uv.y - bayHorizonY) / 0.55, 0.0, 1.0);
      // #03060f to #0a1226 midnight coastal sky
      vec3 skyLow = vec3(0.039, 0.071, 0.149);  // #0a1226
      vec3 skyHigh = vec3(0.012, 0.024, 0.059); // #03060f
      vec3 skyCol = mix(skyLow, skyHigh, pow(skyT, 0.72));

      // Circular anti-aliased pinpoint stars
      vec2 starGrid = uv * 34.0;
      vec2 starId = floor(starGrid);
      vec2 starGv = fract(starGrid) - 0.5;
      float starH = hash21(starId);
      if (starH > 0.85 && uv.y > bayHorizonY + 0.03) {
        vec2 starOffset = (hash22(starId) - 0.5) * 0.65;
        float dStar = length(starGv - starOffset);
        float twinkle = 0.72 + 0.28 * sin(uTime * (1.2 + starH * 3.2) + starH * 62.8);
        float core = exp(-dStar * dStar * 120.0);
        vec3 sCol = mix(vec3(0.75, 0.86, 1.0), vec3(1.0, 0.94, 0.84), fract(starH * 19.7));
        skyCol += sCol * core * twinkle * 0.78 * smoothstep(bayHorizonY + 0.03, bayHorizonY + 0.16, uv.y);
      }

      // Crisp crescent moon
      skyCol += renderCrescentMoon(uv, vec2(0.46, 0.29), 0.058);

      // Faint drifting high-altitude coastal clouds
      if (uv.y > bayHorizonY) {
        float cloudNoise = fbm(vec2(uv.x * 2.2 + uTime * 0.012, uv.y * 4.8));
        float cloudBand = smoothstep(0.48, 0.80, cloudNoise) * smoothstep(bayHorizonY, bayHorizonY + 0.22, uv.y);
        skyCol = mix(skyCol, vec3(0.045, 0.075, 0.135), cloudBand * 0.35);
      }

      finalColor = skyCol;
    }

    // =========================================================================
    // LAYER 4: Distant Bay Skyline Across Dark Water (Slow Parallax 0.025)
    // =========================================================================
    float skyParallaxX = uv.x + uTime * 0.025;
    float cityBlock = floor(skyParallaxX * 26.0);
    float cityH = hash11(cityBlock * 7.13);
    float buildingTop = bayHorizonY + (cityH > 0.42 ? (cityH - 0.42) * 0.14 : 0.0);

    if (uv.y >= bayHorizonY && uv.y < buildingTop) {
      vec3 bCol = vec3(0.008, 0.015, 0.030);
      vec2 winUV = vec2(fract(skyParallaxX * 26.0), (uv.y - bayHorizonY) / 0.14) * vec2(5.0, 14.0);
      float wRnd = hash21(floor(winUV) + cityBlock * 17.3);
      if (wRnd > 0.80) {
        float twinkle = 0.7 + 0.3 * sin(uTime * 1.6 + wRnd * 40.0);
        vec3 wCol = wRnd > 0.90 ? vec3(0.95, 0.70, 0.32) : vec3(0.42, 0.72, 0.92);
        bCol += wCol * 0.32 * twinkle;
      }
      finalColor = bCol;
    }

    // Dark bay water with soft shimmering reflections of the distant skyline
    if (uv.y < bayHorizonY && uv.y >= roadTopY) {
      float mirrorY = bayHorizonY + (bayHorizonY - uv.y) * 1.1;
      float mirrorBlock = floor((uv.x + uTime * 0.025) * 26.0);
      float mirrorCityH = hash11(mirrorBlock * 7.13);
      float mirrorTop = bayHorizonY + (mirrorCityH > 0.42 ? (mirrorCityH - 0.42) * 0.14 : 0.0);

      vec3 waterCol = vec3(0.005, 0.011, 0.024);
      if (mirrorY < mirrorTop) {
        float ripple = 0.55 + 0.45 * sin(uv.y * 280.0 + sin(uv.x * 35.0 + uTime * 2.2) * 2.0);
        float distFade = exp(-(bayHorizonY - uv.y) * 26.0);
        waterCol += vec3(0.45, 0.34, 0.18) * ripple * distFade * 0.32;
      }
      finalColor = waterCol;
    }

    // =========================================================================
    // LAYER 3: Far Midground Coastal Hills, Pines & Subtle Low Haze (Parallax 0.10)
    // =========================================================================
    float hillX = uv.x + uTime * 0.10;
    float hillBase = -0.020 + 0.028 * sin(hillX * 2.6) + 0.014 * sin(hillX * 6.4 + 1.1);
    float pineCell = floor(hillX * 20.0);
    float pineRnd = hash11(pineCell * 13.7);
    if (pineRnd > 0.48) {
      float px = fract(hillX * 20.0) - 0.5;
      float pinePeak = hillBase + (pineRnd - 0.48) * 0.068;
      hillBase = max(hillBase, pinePeak - abs(px) * 0.11);
    }

    // Subtle low-lying coastal haze along the water/hill seam
    float coastalHaze = exp(-abs(uv.y - (-0.015)) * 28.0) * 0.14;
    finalColor += vec3(0.08, 0.14, 0.24) * coastalHaze;

    if (uv.y < hillBase && uv.y >= roadTopY - 0.005) {
      vec3 hillCol = vec3(0.004, 0.008, 0.016);
      float ridgeMist = smoothstep(hillBase - 0.015, hillBase, uv.y);
      hillCol += vec3(0.018, 0.032, 0.056) * ridgeMist;
      finalColor = hillCol;
    }

    // =========================================================================
    // LAYER 2A: Passing Overhead Expressway Streetlight Gantries (#ff9e44)
    // =========================================================================
    float lampSpeed = 0.52;
    float lampBaseCycle = fract(uTime * lampSpeed);
    vec3 amberLamp = vec3(1.0, 0.620, 0.267); // #ff9e44 sodium-vapor amber

    // Nearest passing streetlight X positions
    float lampPositions[3];
    for (int i = 0; i < 3; i++) {
      float cyc = fract(lampBaseCycle + float(i) * 0.333333);
      lampPositions[i] = mix(1.10, -1.10, cyc);
    }

    // Render lamp poles & overhead luminaires above roadTopY
    for (int i = 0; i < 3; i++) {
      float lx = lampPositions[i];
      // Vertical steel pole behind road shoulder
      float pole = sdSegment(uv, vec2(lx + 0.045, roadTopY - 0.005), vec2(lx + 0.045, 0.160));
      // Curved cantilever arm reaching over the lane
      float arm = sdSegment(uv, vec2(lx + 0.045, 0.160), vec2(lx, 0.170));
      float gantrySDF = min(pole, arm) - 0.0035;
      float gantryMask = smoothstep(aa, -aa, gantrySDF);
      if (gantryMask > 0.001) {
        finalColor = mix(finalColor, vec3(0.012, 0.016, 0.025), gantryMask * 0.92);
      }

      // Warm sodium-vapor luminaire bulb + volumetric atmospheric cone
      vec2 bulbPos = vec2(lx, 0.168);
      float dBulb = length(uv - bulbPos);
      float bulbCore = exp(-dBulb * 115.0);
      float bulbHalo = exp(-dBulb * 16.0) * 0.28;

      // Downward light cone onto expressway
      float coneDx = abs(uv.x - lx);
      float coneDy = bulbPos.y - uv.y;
      float inCone = smoothstep(0.02 + coneDy * 0.45, 0.0, coneDx) * step(0.0, coneDy) * smoothstep(0.40, 0.0, coneDy);
      finalColor += amberLamp * (bulbCore * 1.15 + bulbHalo + inCone * 0.11);
    }

    // =========================================================================
    // LAYER 2B: Wet-Asphalt Reflection Shader (Y < roadTopY)
    // =========================================================================
    if (uv.y < roadTopY) {
      float roadDepth = clamp((roadTopY - uv.y) / 0.45, 0.0, 1.0);

      // Scrolling micro-grain asphalt roughness
      vec2 roadTexUV = vec2(uv.x * 16.0 + uTime * 4.2, roadDepth * 34.0);
      float grain = (hash21(floor(roadTexUV)) * 0.55 + hash21(floor(roadTexUV * 2.1)) * 0.45) * 0.032;
      vec3 asphalt = vec3(0.014 + grain, 0.016 + grain, 0.022 + grain);

      // Shoulder concrete curb & crisp dashed highway markings
      float curb = smoothstep(0.008, 0.002, abs(uv.y - (roadTopY - 0.006)));
      float edgeLine = smoothstep(0.005, 0.001, abs(uv.y - (roadTopY - 0.024)));
      float lineScroll = fract((uv.x + uTime * 4.2) * 1.4);
      float dash = step(0.46, lineScroll);
      float centerLine = smoothstep(0.006, 0.0015, abs(uv.y - (-0.285))) * dash;

      asphalt = mix(asphalt, vec3(0.04, 0.045, 0.055), curb * 0.6);
      asphalt = mix(asphalt, vec3(0.55, 0.58, 0.62), clamp(edgeLine * 0.45 + centerLine * 0.68, 0.0, 1.0));

      // Broken vertical shimmer reflections beneath each passing streetlight
      vec3 roadReflections = vec3(0.0);
      float shimmerBreakup = 0.55 + 0.45 * sin(roadDepth * 140.0 + grain * 45.0) * cos(roadTexUV.x * 3.5);
      for (int i = 0; i < 3; i++) {
        float lx = lampPositions[i];
        float dx = uv.x - lx;
        float streakX = exp(-dx * dx * 28.0);
        float streakY = smoothstep(roadTopY, -0.34, uv.y) * smoothstep(-0.46, -0.22, uv.y);
        roadReflections += amberLamp * streakX * streakY * shimmerBreakup * 0.28;
      }

      // Grounded underbody contact shadow directly beneath the coupe
      float shadowBox = sdBox(uv - vec2(-0.02, -0.250), vec2(0.31, 0.026));
      float underShadow = smoothstep(0.045, -0.015, shadowBox);
      asphalt *= (1.0 - underShadow * 0.88);

      // Soft forward LED headlight pool on wet asphalt (#eef4ff)
      float headPoolX = smoothstep(0.24, 0.70, uv.x) * smoothstep(0.88, 0.28, uv.x);
      float headPoolY = smoothstep(-0.18, -0.255, uv.y) * smoothstep(-0.35, -0.255, uv.y);
      roadReflections += vec3(0.933, 0.957, 1.0) * headPoolX * headPoolY * shimmerBreakup * 0.26;

      // Restrained crimson taillight reflection behind rear bumper (#ff1e38)
      float tailPoolX = smoothstep(-0.28, -0.50, uv.x) * smoothstep(-0.65, -0.32, uv.x);
      float tailPoolY = smoothstep(-0.19, -0.25, uv.y) * smoothstep(-0.33, -0.25, uv.y);
      roadReflections += vec3(1.0, 0.118, 0.22) * tailPoolX * tailPoolY * shimmerBreakup * 0.24;

      finalColor = asphalt + softHdrShoulder(roadReflections, 0.8);
    }

    // =========================================================================
    // LAYER 2C: HERO SPORTS COUPE (Mathematically Proportional SDF & Specular Sweep)
    // =========================================================================
    // Car screen scale and anchor
    const float carScale = 0.315;
    vec2 carScreenCenter = vec2(-0.02, -0.190);

    // Suspension micro-bounce applied ONLY to car body, while wheels stay pinned to road
    float roadSeam = pow(max(0.0, sin(uTime * 5.2)), 16.0) * 0.0024;
    float bodyBounce = (sin(uTime * 11.5) * 0.0012 + roadSeam) / carScale;

    // Local coordinates:
    // pWheel: centered on wheel hub baseline (y = 0.0 corresponds to hub level)
    vec2 pWheel = (uv - carScreenCenter) / carScale;
    // pBody: body shifts vertically with suspension bounce
    vec2 pBody = pWheel - vec2(0.0, bodyBounce);

    float carSDF = sdSportsCoupe(pBody, pWheel) * carScale;
    float carMask = smoothstep(aa, -aa, carSDF);

    if (carMask > 0.001) {
      vec2 n = sportsCoupeNormal(pBody, pWheel);

      // Deep obsidian metallic paint (#060a14) with subtle wet clearcoat
      vec3 paint = vec3(0.016, 0.024, 0.046);
      // Subtle ambient sky reflection along upper body curves
      float skyReflect = clamp(n.y * 0.5 + 0.5, 0.0, 1.0);
      paint += vec3(0.024, 0.045, 0.082) * pow(skyReflect, 2.2) * 0.65;

      // Sculpted side character line crease running along the waist
      float sideCrease = smoothstep(0.012, 0.0, abs(pBody.y - 0.10)) * smoothstep(0.85, 0.20, abs(pBody.x));
      paint += vec3(0.032, 0.052, 0.085) * sideCrease * 0.45;

      // Real-Time Traveling Sodium-Vapor (#ff9e44) Specular Rim Sweep
      vec3 rimSweep = vec3(0.0);
      float edgeBand = smoothstep(-0.025, -0.001, carSDF / carScale); // Grazing edge rim highlight
      for (int i = 0; i < 3; i++) {
        float lx = lampPositions[i];
        vec2 lampScreen = vec2(lx, 0.168);
        vec2 toLamp = normalize(lampScreen - uv);
        float lambertRim = max(0.0, dot(n, toLamp));
        float rdx = uv.x - lx;
        float prox = exp(-rdx * rdx * 6.5);
        rimSweep += amberLamp * pow(max(0.0, lambertRim), 4.0) * edgeBand * prox * 0.95;
      }

      // Smoked glass window cutout
      float winSDF = sdSideWindow(pBody) * carScale;
      float winMask = smoothstep(aa, -aa, winSDF);

      // Interior with warm tungsten dashboard instrument glow (#d99b52)
      vec3 glassCol = vec3(0.006, 0.010, 0.018);
      float dashGlow = exp(-length(pBody - vec2(0.25, 0.34)) * 7.5) * 0.35;
      glassCol += vec3(0.85, 0.61, 0.32) * dashGlow;
      glassCol += rimSweep * 0.45;

      // Thin B-pillar divider inside smoked glass
      float bPillar = smoothstep(0.035, 0.015, abs(pBody.x + 0.12));
      glassCol = mix(glassCol, paint * 0.8, bPillar * 0.85);

      vec3 carSurface = mix(paint + rimSweep, glassCol, winMask * 0.92);
      finalColor = mix(finalColor, carSurface, carMask);
    }

    // Rotating Multi-Spoke Alloy Wheels (Stationary relative to road at x = +-0.58)
    const float wheelRadiusLocal = 0.19;
    const float wheelRadiusScreen = wheelRadiusLocal * carScale;

    vec2 frontHubScreen = carScreenCenter + vec2(0.58 * carScale, 0.0);
    vec2 rearHubScreen = carScreenCenter + vec2(-0.58 * carScale, 0.0);

    for (int w = 0; w < 2; w++) {
      vec2 hubScreen = (w == 0) ? frontHubScreen : rearHubScreen;
      vec2 wp = uv - hubScreen;
      float wd = length(wp);
      if (wd < wheelRadiusScreen + 0.004) {
        float wheelMask = smoothstep(aa, -aa, wd - wheelRadiusScreen);
        float rimOuter = wheelRadiusScreen - 0.012;
        float rimMask = smoothstep(aa, -aa, wd - rimOuter);
        float hubCap = smoothstep(aa, -aa, wd - 0.007);

        // Rotating 7-spoke alloy rim with metallic glint
        float angle = atan(wp.y, wp.x) + uTime * 26.0;
        float spokes = pow(abs(sin(angle * 3.5)), 4.0);
        float spokeMask = smoothstep(0.35, 0.78, spokes) * rimMask * (1.0 - hubCap);

        float tireColMask = wheelMask * (1.0 - rimMask);
        vec3 tireCol = vec3(0.012, 0.014, 0.018);
        vec3 barrelCol = vec3(0.018, 0.022, 0.032);
        vec3 alloyCol = vec3(0.38, 0.44, 0.54);

        // Traveling streetlight metallic glint on alloy spokes
        float glint = 0.0;
        for (int i = 0; i < 3; i++) {
          float gdx = uv.x - lampPositions[i];
          glint += exp(-gdx * gdx * 10.0);
        }
        alloyCol += amberLamp * clamp(glint, 0.0, 1.0) * 0.35;

        vec3 wheelCol = mix(barrelCol, alloyCol, clamp(spokeMask + hubCap * 0.7, 0.0, 1.0));
        wheelCol = mix(wheelCol, tireCol, tireColMask);
        finalColor = mix(finalColor, wheelCol, wheelMask);
      }
    }

    // Focused Warm-White LED Headlight Projector + Forward Mist Beam (#eef4ff)
    vec2 hlScreenPos = carScreenCenter + vec2(0.94 * carScale, (0.05 + bodyBounce) * carScale);
    float dHead = length(uv - hlScreenPos);
    float hlCore = exp(-dHead * 110.0);
    finalColor += vec3(0.933, 0.957, 1.0) * hlCore * 0.92;

    vec2 coneVec = uv - hlScreenPos;
    if (coneVec.x > 0.0 && coneVec.x < 0.68) {
      float halfCone = 0.012 + coneVec.x * 0.22;
      float inBeam = smoothstep(halfCone, 0.0, abs(coneVec.y + coneVec.x * 0.085));
      float mist = 0.82 + 0.18 * noise(vec2(uv.x * 10.0 - uTime * 2.2, uv.y * 14.0));
      float fade = smoothstep(0.68, 0.02, coneVec.x) * mist * 0.18;
      finalColor += vec3(0.933, 0.957, 1.0) * inBeam * fade;
    }

    // Razor-Thin Crimson Taillight Bar on Ducktail Lip (#ff1e38)
    vec2 tlScreenPos = carScreenCenter + vec2(-0.93 * carScale, (0.34 + bodyBounce) * carScale);
    float tlSeg = sdSegment(uv, tlScreenPos - vec2(0.010, 0.0), tlScreenPos + vec2(0.002, 0.002));
    float tlBar = smoothstep(0.0055, 0.001, tlSeg);
    float tlHalo = exp(-length(uv - tlScreenPos) * 55.0) * 0.40;
    finalColor += vec3(1.0, 0.118, 0.22) * (tlBar * 1.20 + tlHalo);

    // =========================================================================
    // LAYER 1: Foreground Fast-Blurred Guardrail & Posts (Bottom Edge)
    // =========================================================================
    float railBeam = smoothstep(0.012, 0.004, abs(uv.y - (-0.375)));
    finalColor = mix(finalColor, vec3(0.018, 0.024, 0.036), railBeam * 0.72);

    if (uv.y < -0.355 && uv.y > -0.52) {
      float guardScroll = fract((uv.x + uTime * 5.6) * 2.8);
      float postDist = abs(guardScroll - 0.5);
      float postBlur = smoothstep(0.16, 0.02, postDist) * smoothstep(-0.355, -0.375, uv.y);
      finalColor = mix(finalColor, vec3(0.012, 0.016, 0.024), postBlur * 0.78);
    }

    // Soft cinema vignette & HDR shoulder compression
    vec2 q = gl_FragCoord.xy / uResolution.xy - 0.5;
    finalColor *= clamp(1.0 - dot(q, q) * 0.72, 0.0, 1.0);
    finalColor = softHdrShoulder(finalColor, 0.38);
    finalColor += screenDither(gl_FragCoord.xy);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export class MidnightCruiseScene implements ISpatialScene {
  public readonly id = 'midnight-cruise' as const;
  public readonly scene: THREE.Scene;
  public readonly camera: THREE.PerspectiveCamera;
  public readonly isFullScreenShader = true;
  public readonly bloomPreset: BloomPreset = {
    strength: 0.28,
    radius: 0.48,
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
    this.scene.background = new THREE.Color(0x03060f);
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 0, 1);
  }

  public init(renderer: THREE.WebGLRenderer): void {
    const size = renderer.getDrawingBufferSize(new THREE.Vector2());

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

  public resize(width: number, height: number, dpr = 1): void {
    this.camera.aspect = width / Math.max(1, height);
    this.camera.updateProjectionMatrix();

    if (this.cruiseMat) {
      this.cruiseMat.uniforms.uResolution.value.set(
        Math.max(1, Math.floor(width * dpr)),
        Math.max(1, Math.floor(height * dpr))
      );
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
