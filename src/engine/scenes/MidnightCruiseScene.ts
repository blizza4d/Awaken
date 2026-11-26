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

  // Smooth value noise for clouds, coastal mist, and asphalt roughness
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

  // Anti-aliased crescent moon with subtle earthshine
  vec3 renderCrescentMoon(vec2 uv, vec2 moonPos, float radius) {
    vec2 p = uv - moonPos;
    float d1 = length(p) - radius;
    float d2 = length(p - vec2(radius * 0.44, radius * 0.20)) - radius * 0.90;
    float crescent = max(d1, -d2);

    float alpha = smoothstep(0.0025, -0.0025, crescent);
    float glow = exp(-max(0.0, d1) * 32.0) * 0.26;
    float earthshine = smoothstep(0.003, -0.003, d1) * (1.0 - alpha) * 0.032;

    vec3 moonCol = vec3(0.96, 0.94, 0.88) * alpha;
    vec3 glowCol = vec3(0.52, 0.68, 0.90) * (glow + earthshine);
    return moonCol + glowCol;
  }

  // Sculpted fastback sports coupe SDF (origin at chassis center)
  float sdFastbackCoupe(vec2 p) {
    // Lower sleek body sill -> nose -> rear deck
    float chassis = sdBox(p - vec2(0.0, 0.004), vec2(0.315, 0.034));
    // Aerodynamic front nose taper
    float noseCut = dot(p - vec2(0.245, 0.022), normalize(vec2(0.45, 1.0)));
    chassis = smax(chassis, noseCut, 0.028);
    // Front splitter & bumper bevel
    float frontLip = dot(p - vec2(0.305, -0.015), normalize(vec2(1.0, -0.35)));
    chassis = smax(chassis, frontLip, 0.018);
    // Rear diffuser bevel & fastback tail
    float rearCut = dot(p - vec2(-0.295, 0.020), normalize(vec2(-0.85, 0.45)));
    chassis = smax(chassis, rearCut, 0.022);
    float rearDiffuser = dot(p - vec2(-0.295, -0.022), normalize(vec2(-1.0, -0.6)));
    chassis = smax(chassis, rearDiffuser, 0.016);

    // Swept fastback greenhouse cabin (hood -> A-pillar -> roofline -> C-pillar -> decklid)
    float cabin = sdBox(p - vec2(-0.040, 0.056), vec2(0.165, 0.030));
    float aPillar = dot(p - vec2(0.088, 0.054), normalize(vec2(0.68, 1.0)));
    float cPillar = dot(p - vec2(-0.185, 0.048), normalize(vec2(-0.42, 1.0)));
    float roofCurve = p.y - (0.082 - pow(p.x + 0.025, 2.0) * 0.42);
    cabin = smax(cabin, aPillar, 0.022);
    cabin = smax(cabin, cPillar, 0.032);
    cabin = smax(cabin, roofCurve, 0.020);

    float body = smin(chassis, cabin, 0.018);

    // Sculpted wheel arch cutouts (centered on stationary wheel hubs relative to road)
    return body;
  }

  // Analytic finite-difference normal for crisp rim specular sweep
  vec2 fastbackNormal(vec2 p) {
    const float e = 0.002;
    return normalize(vec2(
      sdFastbackCoupe(p + vec2(e, 0.0)) - sdFastbackCoupe(p - vec2(e, 0.0)),
      sdFastbackCoupe(p + vec2(0.0, e)) - sdFastbackCoupe(p - vec2(0.0, e))
    ));
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;

    // Subtle breathing camera motion + damped pointer parallax
    vec2 camBreath = vec2(sin(uTime * 0.35) * 0.004, cos(uTime * 0.28) * 0.003);
    uv += uPointer * vec2(0.022, 0.012) + camBreath;

    float aa = 1.6 / uResolution.y;
    vec3 finalColor = vec3(0.0);

    // Vertical layout coordinates
    float bayHorizonY = 0.045;
    float waterBottomY = -0.025;
    float roadTopY = -0.068;

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
    // LAYER 2A: Passing Overhead Expressway Streetlight Gantries (#ff9c42)
    // =========================================================================
    float lampSpeed = 0.52;
    float lampBaseCycle = fract(uTime * lampSpeed);
    vec3 amberLamp = vec3(1.0, 0.612, 0.259); // #ff9c42 sodium-vapor amber

    // Store nearest passing lamp X positions for car rim sweep & asphalt reflections
    float lampPositions[3];
    for (int i = 0; i < 3; i++) {
      float cyc = fract(lampBaseCycle + float(i) * 0.333333);
      lampPositions[i] = mix(1.05, -1.05, cyc);
    }

    // Render lamp poles & overhead luminaires above roadTopY
    for (int i = 0; i < 3; i++) {
      float lx = lampPositions[i];
      // Vertical steel pole behind road shoulder
      float pole = sdSegment(uv, vec2(lx + 0.045, roadTopY - 0.005), vec2(lx + 0.045, 0.155));
      // Curved cantilever arm reaching over the lane
      float arm = sdSegment(uv, vec2(lx + 0.045, 0.155), vec2(lx, 0.165));
      float gantrySDF = min(pole, arm) - 0.0035;
      float gantryMask = smoothstep(aa, -aa, gantrySDF);
      if (gantryMask > 0.001) {
        finalColor = mix(finalColor, vec3(0.012, 0.016, 0.025), gantryMask * 0.92);
      }

      // Warm sodium-vapor luminaire bulb + volumetric atmospheric cone
      vec2 bulbPos = vec2(lx, 0.162);
      float dBulb = length(uv - bulbPos);
      float bulbCore = exp(-dBulb * 115.0);
      float bulbHalo = exp(-dBulb * 16.0) * 0.28;

      // Downward light cone onto expressway
      float coneDx = abs(uv.x - lx);
      float coneDy = bulbPos.y - uv.y;
      float inCone = smoothstep(0.02 + coneDy * 0.45, 0.0, coneDx) * step(0.0, coneDy) * smoothstep(0.38, 0.0, coneDy);
      finalColor += amberLamp * (bulbCore * 1.15 + bulbHalo + inCone * 0.11);
    }

    // =========================================================================
    // LAYER 2B: Restrained Wet-Asphalt Reflection Shader (Y < roadTopY)
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

      // Broken vertical shimmer reflections beneath each passing streetlight (capped)
      vec3 roadReflections = vec3(0.0);
      float shimmerBreakup = 0.55 + 0.45 * sin(roadDepth * 140.0 + grain * 45.0) * cos(roadTexUV.x * 3.5);
      for (int i = 0; i < 3; i++) {
        float lx = lampPositions[i];
        float streakX = exp(-pow(uv.x - lx, 2.0) * 28.0);
        float streakY = smoothstep(roadTopY, -0.34, uv.y) * smoothstep(-0.46, -0.22, uv.y);
        roadReflections += amberLamp * streakX * streakY * shimmerBreakup * 0.28;
      }

      // Grounded underbody contact shadow directly beneath the coupe
      float shadowBox = sdBox(uv - vec2(-0.02, -0.248), vec2(0.30, 0.024));
      float underShadow = smoothstep(0.045, -0.015, shadowBox);
      asphalt *= (1.0 - underShadow * 0.85);

      // Soft forward LED headlight pool on wet asphalt
      float headPoolX = smoothstep(0.24, 0.68, uv.x) * smoothstep(0.85, 0.28, uv.x);
      float headPoolY = smoothstep(-0.18, -0.255, uv.y) * smoothstep(-0.34, -0.255, uv.y);
      roadReflections += vec3(0.92, 0.88, 0.78) * headPoolX * headPoolY * shimmerBreakup * 0.26;

      // Restrained crimson taillight reflection behind rear bumper
      float tailPoolX = smoothstep(-0.28, -0.48, uv.x) * smoothstep(-0.62, -0.32, uv.x);
      float tailPoolY = smoothstep(-0.19, -0.25, uv.y) * smoothstep(-0.32, -0.25, uv.y);
      roadReflections += vec3(0.88, 0.07, 0.10) * tailPoolX * tailPoolY * shimmerBreakup * 0.22;

      finalColor = asphalt + softHdrShoulder(roadReflections, 0.8);
    }

    // =========================================================================
    // LAYER 2C: Hero Fastback Sports Coupe (Sculpted SDF + Specular Sweep)
    // =========================================================================
    // Damped suspension micro-bounce over highway expansion seams
    float roadSeam = pow(max(0.0, sin(uTime * 5.2)), 16.0) * 0.0028;
    float bounce = sin(uTime * 11.5) * 0.0014 + roadSeam;

    vec2 carAnchor = vec2(-0.02, -0.205); // Road-anchored reference
    vec2 cp = uv - (carAnchor + vec2(0.0, bounce));
    vec2 wpBase = uv - carAnchor; // Wheels stay planted on road surface

    // Wheel wells cut from road-anchored wheel coordinates
    float wheelR = 0.048;
    vec2 frontHub = vec2(0.185, -0.014);
    vec2 rearHub = vec2(-0.185, -0.014);
    float wellFront = length(wpBase - frontHub) - (wheelR + 0.011);
    float wellRear = length(wpBase - rearHub) - (wheelR + 0.011);

    float carSDF = sdFastbackCoupe(cp);
    carSDF = max(carSDF, -wellFront);
    carSDF = max(carSDF, -wellRear);

    float carMask = smoothstep(aa, -aa, carSDF);
    if (carMask > 0.001) {
      vec2 n = fastbackNormal(cp);

      // Deep wet obsidian metallic paint (#060a14)
      vec3 paint = vec3(0.018, 0.028, 0.052);
      // Subtle ambient sky dome reflection along upper curved body panels
      float skyReflect = clamp(n.y * 0.5 + 0.5, 0.0, 1.0);
      paint += vec3(0.025, 0.048, 0.085) * pow(skyReflect, 2.2) * 0.65;

      // Subtle sculpted side character line crease
      float sideCrease = smoothstep(0.004, 0.0, abs(cp.y - 0.008)) * smoothstep(0.24, 0.14, abs(cp.x));
      paint += vec3(0.03, 0.05, 0.08) * sideCrease * 0.45;

      // Real-Time Traveling Specular Rim Sweep from each passing overhead streetlight
      vec3 rimSweep = vec3(0.0);
      float edgeBand = smoothstep(-0.014, -0.001, carSDF); // Tight grazing rim band
      for (int i = 0; i < 3; i++) {
        float lx = lampPositions[i];
        vec2 toLamp = normalize(vec2(lx, 0.162) - (uv));
        float lambertRim = max(0.0, dot(n, toLamp));
        float prox = exp(-pow(uv.x - lx, 2.0) * 6.5);
        rimSweep += amberLamp * pow(lambertRim, 4.0) * edgeBand * prox * 0.95;
      }

      // Recessed smoked side-glass window cutout
      float winBox = sdBox(cp - vec2(-0.042, 0.052), vec2(0.142, 0.022));
      float winFront = dot(cp - vec2(0.075, 0.050), normalize(vec2(0.68, 1.0)));
      float winRear = dot(cp - vec2(-0.165, 0.046), normalize(vec2(-0.42, 1.0)));
      float winRoof = cp.y - (0.074 - pow(cp.x + 0.025, 2.0) * 0.40);
      float winSDF = smax(smax(winBox, winFront, 0.014), smax(winRear, winRoof, 0.014), 0.014);
      float winMask = smoothstep(aa, -aa, winSDF);

      // Subtle recessed glass interior with warm tungsten dashboard glow (#d99b52)
      vec3 glassCol = vec3(0.006, 0.010, 0.018);
      float dashGlow = exp(-length(cp - vec2(0.058, 0.042)) * 24.0) * 0.34;
      glassCol += vec3(0.85, 0.61, 0.32) * dashGlow;
      // Glass specular sweep
      glassCol += rimSweep * 0.45;

      // Crisp B-pillar divider inside smoked glass
      float bPillar = smoothstep(0.009, 0.005, abs(cp.x + 0.025));
      glassCol = mix(glassCol, paint * 0.8, bPillar * 0.85);

      vec3 carSurface = mix(paint + rimSweep, glassCol, winMask * 0.92);
      finalColor = mix(finalColor, carSurface, carMask);
    }

    // Rotating Multi-Spoke Alloy Wheels (Planted on road at wpBase)
    for (int w = 0; w < 2; w++) {
      vec2 hub = (w == 0) ? frontHub : rearHub;
      vec2 wp = wpBase - hub;
      float wd = length(wp);
      if (wd < wheelR + 0.004) {
        float wheelMask = smoothstep(aa, -aa, wd - wheelR);
        float rimOuter = wheelR - 0.014;
        float rimMask = smoothstep(aa, -aa, wd - rimOuter);
        float hubCap = smoothstep(aa, -aa, wd - 0.008);

        // Smoothly rotating 7-spoke alloy rim with metallic glint
        float angle = atan(wp.y, wp.x) + uTime * 26.0;
        float spokes = pow(abs(sin(angle * 3.5)), 4.0);
        float spokeMask = smoothstep(0.35, 0.78, spokes) * rimMask * (1.0 - hubCap);

        // Brake caliper subtle dark silhouette
        float tireColMask = wheelMask * (1.0 - rimMask);
        vec3 tireCol = vec3(0.012, 0.014, 0.018);
        vec3 barrelCol = vec3(0.018, 0.022, 0.032);
        vec3 alloyCol = vec3(0.38, 0.44, 0.54);

        // Traveling streetlight metallic glint on alloy spokes
        float glint = 0.0;
        for (int i = 0; i < 3; i++) {
          glint += exp(-pow(uv.x - lampPositions[i], 2.0) * 10.0);
        }
        alloyCol += amberLamp * clamp(glint, 0.0, 1.0) * 0.35;

        vec3 wheelCol = mix(barrelCol, alloyCol, clamp(spokeMask + hubCap * 0.7, 0.0, 1.0));
        wheelCol = mix(wheelCol, tireCol, tireColMask);
        finalColor = mix(finalColor, wheelCol, wheelMask);
      }
    }

    // Soft Warm-White LED Headlight Projector + Mist Cone
    vec2 hlPos = carAnchor + vec2(0.302, 0.014 + bounce);
    float dHead = length(uv - hlPos);
    float hlCore = exp(-dHead * 110.0);
    finalColor += vec3(1.0, 0.96, 0.88) * hlCore * 0.90;

    vec2 coneVec = uv - hlPos;
    if (coneVec.x > 0.0 && coneVec.x < 0.68) {
      float halfCone = 0.012 + coneVec.x * 0.22;
      float inBeam = smoothstep(halfCone, 0.0, abs(coneVec.y + coneVec.x * 0.085));
      float mist = 0.82 + 0.18 * noise(vec2(uv.x * 10.0 - uTime * 2.2, uv.y * 14.0));
      float fade = smoothstep(0.68, 0.02, coneVec.x) * mist * 0.17;
      finalColor += vec3(0.95, 0.92, 0.84) * inBeam * fade;
    }

    // Thin Recessed Glowing Crimson LED Taillight Bar
    vec2 tlPos = carAnchor + vec2(-0.305, 0.020 + bounce);
    float tlSeg = sdSegment(uv, tlPos - vec2(0.010, 0.0), tlPos + vec2(0.002, 0.002));
    float tlBar = smoothstep(0.0055, 0.001, tlSeg);
    float tlHalo = exp(-length(uv - tlPos) * 55.0) * 0.40;
    finalColor += vec3(0.96, 0.06, 0.10) * (tlBar * 1.15 + tlHalo);

    // =========================================================================
    // LAYER 1: Foreground Fast-Blurred Guardrail & Posts (Bottom Edge)
    // =========================================================================
    // Continuous horizontal steel guardrail beam
    float railBeam = smoothstep(0.012, 0.004, abs(uv.y - (-0.375)));
    finalColor = mix(finalColor, vec3(0.018, 0.024, 0.036), railBeam * 0.72);

    // Fast motion-blurred foreground guardrail posts
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
