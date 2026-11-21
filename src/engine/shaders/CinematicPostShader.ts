import * as THREE from 'three';

/**
 * Custom Cinematic Post-Processing Shader
 * Combines radial optical chromatic aberration, shadow-preserving temporal film grain
 * (preserves #000000 OLED black pixels), and subtle anamorphic vignette.
 */
export const CinematicPostShader = {
  name: 'CinematicPostShader',
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uTime: { value: 0 },
    uAberration: { value: 0.0018 },
    uGrainAmount: { value: 0.026 },
    uVignette: { value: 0.28 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uAberration;
    uniform float uGrainAmount;
    uniform float uVignette;

    varying vec2 vUv;

    // Fast high-frequency temporal film grain hash
    float hash12(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * 0.1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }

    void main() {
      vec2 centered = vUv - 0.5;
      float distSq = dot(centered, centered);

      // Radial optical chromatic aberration (zero at screen center, subtle at edges)
      vec2 offset = centered * distSq * uAberration * 4.5;

      float r = texture2D(tDiffuse, clamp(vUv + offset, 0.0, 1.0)).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, clamp(vUv - offset, 0.0, 1.0)).b;

      vec3 color = vec3(r, g, b);

      // Subtle optical vignette
      float vig = smoothstep(0.92, 0.22, distSq * (1.0 + uVignette));
      color *= mix(1.0, vig, uVignette);

      // Shadow-preserving temporal film grain (keeps pure OLED black untouched)
      float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
      float grainMask = smoothstep(0.008, 0.18, luma);
      float noise = hash12(gl_FragCoord.xy + fract(uTime * 17.31) * 512.0) - 0.5;
      color += noise * uGrainAmount * grainMask;

      gl_FragColor = vec4(max(color, 0.0), 1.0);
    }
  `,
};
