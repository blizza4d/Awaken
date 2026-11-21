import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { useAppStore } from '../../store/useAppStore';

export const SpaceExplorerScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isPaused, settings } = useAppStore();
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scene: THREE.Scene | null = new THREE.Scene();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1200);
    camera.position.set(0, 8, 65);

    let renderer: THREE.WebGLRenderer | null = null;
    let composer: EffectComposer | null = null;

    try {
      renderer = new THREE.WebGLRenderer({
        powerPreference: 'high-performance',
        antialias: settings.postProcessing.antiAliasing,
        alpha: false,
        stencil: false,
        depth: true
      });
      renderer.setSize(width, height);
      const pr = settings.performanceProfile === 'cinematic' ? Math.min(window.devicePixelRatio, 2) : 1;
      renderer.setPixelRatio(pr * settings.postProcessing.resolutionScale);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      container.appendChild(renderer.domElement);

      if (settings.postProcessing.bloom) {
        composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        composer.addPass(
          new UnrealBloomPass(
            new THREE.Vector2(width, height),
            settings.postProcessing.bloomIntensity || 1.15,
            0.4,
            0.15
          )
        );
      }
    } catch (e: any) {
      setInitError('WebGL initialization failed for Deep Space Explorer.');
      return;
    }

    // 1. Sun Key Light (Directional Sunlight)
    const sunLight = new THREE.DirectionalLight(0xfff7ed, 2.8);
    sunLight.position.set(70, 25, 45);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x060914, 0.4);
    scene.add(ambientLight);

    // 2. Custom Atmospheric Scattering Gas Giant Shader
    const planetRadius = 15.0;
    const planetGeo = new THREE.SphereGeometry(planetRadius, 64, 64);
    const planetShaderMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSunDirection: { value: new THREE.Vector3(70, 25, 45).normalize() }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec3 uSunDirection;
        varying vec3 vNormal;
        varying vec3 vWorldPosition;
        varying vec2 vUv;

        // Multi-octave turbulence noise
        float noise(vec2 p) {
          return sin(p.x * 12.0) * cos(p.y * 12.0) + sin(p.x * 24.0 + uTime * 0.1) * 0.5;
        }

        void main() {
          vec3 viewDir = normalize(cameraPosition - vWorldPosition);

          // Sunlight diffuse term
          float NdotL = max(dot(vNormal, uSunDirection), 0.0);

          // Gas giant multi-color atmospheric bands
          float band = sin(vUv.y * 38.0 + noise(vUv * 6.0) * 0.8);
          vec3 deepColor = vec3(0.08, 0.22, 0.58);  // Deep celestial indigo
          vec3 stormColor = vec3(0.18, 0.55, 0.95); // Cyan storm band
          vec3 goldColor = vec3(0.85, 0.65, 0.35);  // Trace amber atmospheric dust

          vec3 surfaceColor = mix(deepColor, stormColor, smoothstep(-0.6, 0.6, band));
          surfaceColor = mix(surfaceColor, goldColor, smoothstep(0.7, 1.0, band) * 0.4);

          // Atmospheric Fresnel Rim Glow (Rayleigh limb scattering)
          float fresnel = pow(1.0 - max(dot(vNormal, viewDir), 0.0), 3.2);
          vec3 atmosphereGlow = vec3(0.25, 0.75, 1.0) * fresnel * 2.5;

          // Planetary Day/Night terminator shading
          vec3 litSurface = surfaceColor * (NdotL * 1.3 + 0.04);
          vec3 finalColor = litSurface + atmosphereGlow * (NdotL * 0.8 + 0.3);

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    });

    const planetMesh = new THREE.Mesh(planetGeo, planetShaderMat);
    planetMesh.rotation.z = 0.42; // Axial tilt
    scene.add(planetMesh);

    // 3. Procedural Orbital Dust Rings (Particle System with Ray-Cast Shadow)
    const ringParticleCount = 8000;
    const ringGeo = new THREE.BufferGeometry();
    const ringPositions = new Float32Array(ringParticleCount * 3);
    const ringColors = new Float32Array(ringParticleCount * 3);

    const innerRadius = 20.0;
    const outerRadius = 35.0;

    for (let i = 0; i < ringParticleCount; i++) {
      const idx = i * 3;
      // Exclude Cassini Division gap around r = 26.5 - 27.5
      let r = innerRadius + Math.random() * (outerRadius - innerRadius);
      if (r > 26.2 && r < 27.6) {
        r += (Math.random() > 0.5 ? 2.0 : -2.0);
      }
      const theta = Math.random() * Math.PI * 2;

      ringPositions[idx] = r * Math.cos(theta);
      ringPositions[idx + 1] = (Math.random() - 0.5) * 0.4; // Vertical thickness
      ringPositions[idx + 2] = r * Math.sin(theta);

      // Dust colors: ice-white, pale blue, soft golden dust
      const tone = Math.random();
      if (tone > 0.65) {
        ringColors[idx] = 0.95; ringColors[idx + 1] = 0.88; ringColors[idx + 2] = 0.75;
      } else {
        ringColors[idx] = 0.72; ringColors[idx + 1] = 0.88; ringColors[idx + 2] = 1.0;
      }
    }

    ringGeo.setAttribute('position', new THREE.BufferAttribute(ringPositions, 3));
    ringGeo.setAttribute('color', new THREE.BufferAttribute(ringColors, 3));

    const ringMat = new THREE.PointsMaterial({
      size: 0.65,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    const ringParticles = new THREE.Points(ringGeo, ringMat);
    ringParticles.rotation.x = Math.PI / 2.35;
    ringParticles.rotation.y = 0.28;
    scene.add(ringParticles);

    // 4. Massive 10,000+ Depth-Layered Starfield with Spectral Temperatures & Twinkle Shader
    const starCount = 10500;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    const starTwinklePhases = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      const idx = i * 3;
      const radius = 220 + Math.random() * 550;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      starPositions[idx] = radius * Math.sin(phi) * Math.cos(theta);
      starPositions[idx + 1] = radius * Math.sin(phi) * Math.sin(theta);
      starPositions[idx + 2] = radius * Math.cos(phi);

      // Stellar Spectral Types (O, B, A, F, G, K, M)
      const spec = Math.random();
      if (spec > 0.85) {
        // Hot Blue-White O/B star
        starColors[idx] = 0.65; starColors[idx + 1] = 0.82; starColors[idx + 2] = 1.0;
      } else if (spec > 0.6) {
        // Pure White A star
        starColors[idx] = 1.0; starColors[idx + 1] = 1.0; starColors[idx + 2] = 1.0;
      } else if (spec > 0.3) {
        // Yellow-White G star
        starColors[idx] = 1.0; starColors[idx + 1] = 0.92; starColors[idx + 2] = 0.75;
      } else {
        // Red-Amber M star
        starColors[idx] = 1.0; starColors[idx + 1] = 0.65; starColors[idx + 2] = 0.45;
      }

      starTwinklePhases[i] = Math.random() * Math.PI * 2;
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    starGeo.setAttribute('aPhase', new THREE.BufferAttribute(starTwinklePhases, 1));

    const starShaderMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 }
      },
      vertexShader: `
        attribute vec3 color;
        attribute float aPhase;
        uniform float uTime;
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          vColor = color;
          // Twinkle oscillation
          vAlpha = 0.5 + 0.5 * sin(uTime * 3.5 + aPhase);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = (2.2 * vAlpha + 0.8) * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        void main() {
          // Circular particle shape with soft edge falloff
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          if (dist > 0.5) discard;
          float strength = 1.0 - smoothstep(0.0, 0.5, dist);
          gl_FragColor = vec4(vColor * 1.5, strength * vAlpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const starPoints = new THREE.Points(starGeo, starShaderMat);
    scene.add(starPoints);

    // 5. Volumetric Cosmic Nebula Clouds (Multi-layer points)
    const nebulaCount = 650;
    const nebulaGeo = new THREE.BufferGeometry();
    const nebulaPositions = new Float32Array(nebulaCount * 3);
    const nebulaColors = new Float32Array(nebulaCount * 3);

    for (let i = 0; i < nebulaCount; i++) {
      const idx = i * 3;
      nebulaPositions[idx] = (Math.random() - 0.5) * 500;
      nebulaPositions[idx + 1] = (Math.random() - 0.5) * 350;
      nebulaPositions[idx + 2] = -250 - Math.random() * 200;

      nebulaColors[idx] = Math.random() > 0.5 ? 0.35 : 0.65;
      nebulaColors[idx + 1] = 0.2;
      nebulaColors[idx + 2] = 0.85;
    }
    nebulaGeo.setAttribute('position', new THREE.BufferAttribute(nebulaPositions, 3));
    nebulaGeo.setAttribute('color', new THREE.BufferAttribute(nebulaColors, 3));

    const nebulaMat = new THREE.PointsMaterial({
      size: 75,
      vertexColors: true,
      transparent: true,
      opacity: 0.12,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const nebula = new THREE.Points(nebulaGeo, nebulaMat);
    scene.add(nebula);

    // 6. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      if (!isPaused && scene && renderer && camera) {
        const delta = Math.min(clock.getDelta(), 0.1);
        const elapsed = clock.getElapsedTime();

        // Update shaders
        planetShaderMat.uniforms.uTime.value = elapsed;
        starShaderMat.uniforms.uTime.value = elapsed;

        // Slow planetary rotation
        planetMesh.rotation.y += delta * 0.035;
        ringParticles.rotation.z += delta * 0.015;

        // Slow camera orbital float
        camera.position.x = Math.sin(elapsed * 0.08) * 4.5;
        camera.position.y = 8 + Math.cos(elapsed * 0.06) * 2.0;
        camera.lookAt(0, 0, 0);

        if (composer && settings.postProcessing.bloom) {
          composer.render();
        } else {
          renderer.render(scene, camera);
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    // 7. Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth || window.innerWidth;
      const newH = container.clientHeight || window.innerHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
      if (composer) composer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    // 8. COMPLETE WEBGL DESTRUCTION & MEMORY DISPOSAL
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);

      if (composer) {
        composer.dispose();
        composer = null;
      }

      if (scene) {
        scene.traverse((obj: any) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m: any) => m.dispose());
            } else {
              obj.material.dispose();
            }
          }
        });
        scene.clear();
        scene = null;
      }

      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
        renderer = null;
      }

      planetGeo.dispose();
      planetShaderMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      starGeo.dispose();
      starShaderMat.dispose();
      nebulaGeo.dispose();
      nebulaMat.dispose();
    };
  }, [isPaused, settings.postProcessing, settings.performanceProfile]);

  if (initError) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-rose-400 font-mono text-sm p-6 text-center">
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 max-w-md">
          <div className="font-bold text-rose-300 mb-1">WebGL 3D Engine Fallback</div>
          <p className="text-xs text-rose-400/80">{initError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#020308]" ref={containerRef} />
  );
};
export default SpaceExplorerScene;
