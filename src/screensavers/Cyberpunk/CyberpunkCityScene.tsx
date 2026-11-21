import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { useAppStore } from '../../store/useAppStore';

export const CyberpunkCityScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isPaused, settings } = useAppStore();
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scene: THREE.Scene | null = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06020e, 0.0075);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 800);
    camera.position.set(0, 18, 55);

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
      renderer.toneMappingExposure = 1.15;
      container.appendChild(renderer.domElement);

      // EffectComposer + UnrealBloomPass
      if (settings.postProcessing.bloom) {
        composer = new EffectComposer(renderer);
        const renderPass = new RenderPass(scene, camera);
        composer.addPass(renderPass);

        const bloomPass = new UnrealBloomPass(
          new THREE.Vector2(width, height),
          settings.postProcessing.bloomIntensity || 1.3,
          0.5,
          0.2
        );
        composer.addPass(bloomPass);
      }
    } catch (err: any) {
      setInitError('WebGL 2.0 / Post-Processing could not be initialized on this hardware.');
      return;
    }

    // 1. Cyberpunk Atmospheric Lighting
    const ambientLight = new THREE.AmbientLight(0x130624, 1.6);
    scene.add(ambientLight);

    const cyanSpot = new THREE.PointLight(0x00f0ff, 4.5, 120);
    cyanSpot.position.set(-25, 30, -10);
    scene.add(cyanSpot);

    const magentaSpot = new THREE.PointLight(0xf43f5e, 5.0, 130);
    magentaSpot.position.set(25, 35, -35);
    scene.add(magentaSpot);

    // 2. Custom WebGL Shader Material for Procedural Glowing Skyscraper Windows
    const buildingShaderMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uFogColor: { value: new THREE.Color(0x06020e) },
        uFogDensity: { value: 0.0075 }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
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
        uniform vec3 uFogColor;
        uniform float uFogDensity;
        varying vec3 vWorldPosition;
        varying vec3 vNormal;
        varying vec2 vUv;

        // Hash function for pseudo-random window patterns
        float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }

        void main() {
          // Facade coordinates
          vec2 grid = vec2(vWorldPosition.x + vWorldPosition.z, vWorldPosition.y);
          vec2 windowCoord = floor(grid * vec2(0.5, 0.4));
          vec2 cell = fract(grid * vec2(0.5, 0.4));

          float h = hash(windowCoord);
          float isLit = step(0.55, h);

          // Window frame margin
          float frame = step(0.18, cell.x) * step(cell.x, 0.82) * step(0.2, cell.y) * step(cell.y, 0.8);
          isLit *= frame;

          // Colors: Cyberpunk Cyan, Hot Pink, Amber, and Dark Facade
          vec3 litColor = vec3(0.0, 0.94, 1.0); // Cyan default
          if (h > 0.85) {
            litColor = vec3(1.0, 0.1, 0.45); // Hot Pink
          } else if (h > 0.75) {
            litColor = vec3(1.0, 0.75, 0.2); // Warm Amber
          }

          // Window twinkle / flicker
          float flicker = sin(uTime * 3.0 + h * 50.0) * 0.15 + 0.85;
          litColor *= flicker;

          // High emission to trigger UnrealBloomPass!
          vec3 finalColor = mix(vec3(0.03, 0.02, 0.06), litColor * 2.2, isLit);

          // Structural rooftop and vertical edge accent
          if (abs(vNormal.y) > 0.8) {
            finalColor = vec3(0.02, 0.015, 0.04);
          }

          // Atmospheric exponential depth fog
          float depth = length(vWorldPosition - cameraPosition);
          float fogFactor = 1.0 - exp(-depth * uFogDensity);
          finalColor = mix(finalColor, uFogColor, clamp(fogFactor, 0.0, 1.0));

          gl_FragColor = vec4(finalColor, 1.0);
        }
      `
    });

    // 3. Dense Instanced Skyscraper City (InstancedMesh)
    const buildingCount = 130;
    const baseBoxGeo = new THREE.BoxGeometry(1, 1, 1);
    const cityInstances = new THREE.InstancedMesh(baseBoxGeo, buildingShaderMat, buildingCount);
    cityInstances.instanceMatrix.setUsage(THREE.StaticDrawUsage);

    const dummy = new THREE.Object3D();
    const cityLength = 340;

    for (let i = 0; i < buildingCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const x = side * (Math.random() * 32 + 18);
      const z = (Math.random() - 0.5) * cityLength - 40;
      const w = Math.random() * 14 + 9;
      const d = Math.random() * 14 + 9;
      const h = Math.random() * 75 + 28;
      const y = h / 2;

      dummy.position.set(x, y, z);
      dummy.scale.set(w, h, d);
      dummy.updateMatrix();
      cityInstances.setMatrixAt(i, dummy.matrix);
    }
    cityInstances.instanceMatrix.needsUpdate = true;
    scene.add(cityInstances);

    // 4. Ground Wet Reflective Highway
    const roadGeo = new THREE.PlaneGeometry(38, cityLength * 1.2);
    const roadShaderMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        void main() {
          vUv = uv;
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vWorldPosition;

        void main() {
          // Wet asphalt base with specular reflections
          vec3 asphalt = vec3(0.02, 0.015, 0.04);

          // Moving highway dashed centerline
          float line = step(0.485, vUv.x) * step(vUv.x, 0.515);
          float dash = step(0.45, fract(vUv.y * 50.0 + uTime * 2.5));
          vec3 laneGlow = vec3(0.0, 0.9, 1.0) * line * dash * 2.0;

          // Road shoulder neon lines
          float edgeL = step(0.12, vUv.x) * step(vUv.x, 0.135);
          float edgeR = step(0.865, vUv.x) * step(vUv.x, 0.88);
          vec3 edgeGlow = vec3(1.0, 0.1, 0.45) * (edgeL + edgeR) * 1.8;

          vec3 col = asphalt + laneGlow + edgeGlow;
          gl_FragColor = vec4(col, 1.0);
        }
      `
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadShaderMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.set(0, 0.1, -40);
    scene.add(roadMesh);

    // 5. Flying Hover Vehicles (Spinners) with Light Contrail Ribbons
    const spinnerCount = 8;
    const spinners: {
      mesh: THREE.Group;
      speed: number;
      startX: number;
      laneY: number;
      phase: number;
    }[] = [];

    const spinnerBodyGeo = new THREE.BoxGeometry(1.8, 0.45, 3.8);
    const spinnerBodyMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const trailGeo = new THREE.BoxGeometry(0.5, 0.12, 10);
    const trailMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.75
    });

    for (let i = 0; i < spinnerCount; i++) {
      const g = new THREE.Group();
      const b = new THREE.Mesh(spinnerBodyGeo, spinnerBodyMat);
      const t = new THREE.Mesh(trailGeo, trailMat);
      t.position.z = 5.2;
      g.add(b, t);

      const laneY = Math.random() * 32 + 16;
      const startX = (Math.random() - 0.5) * 32;
      const startZ = -Math.random() * 260;
      g.position.set(startX, laneY, startZ);
      scene.add(g);

      spinners.push({
        mesh: g,
        speed: Math.random() * 35 + 40,
        startX,
        laneY,
        phase: Math.random() * Math.PI * 2
      });
    }

    // 6. Custom Cyberpunk Rain Shader
    const rainCount = 1800;
    const rainGeo = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount * 3; i += 3) {
      rainPositions[i] = (Math.random() - 0.5) * 120;
      rainPositions[i + 1] = Math.random() * 90;
      rainPositions[i + 2] = (Math.random() - 0.5) * 250 - 30;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.7,
      transparent: true,
      opacity: 0.55
    });
    const rainPoints = new THREE.Points(rainGeo, rainMat);
    scene.add(rainPoints);

    // 7. Cinematic Drone Camera Path & Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      if (!isPaused && scene && renderer && camera) {
        const delta = Math.min(clock.getDelta(), 0.1);
        const elapsed = clock.getElapsedTime();

        // Update shader uniforms
        buildingShaderMat.uniforms.uTime.value = elapsed;
        roadShaderMat.uniforms.uTime.value = elapsed;

        // Cinematic drone flight through city canyons with smooth banking
        camera.position.z = Math.sin(elapsed * 0.18) * 45 + 10;
        camera.position.x = Math.sin(elapsed * 0.28) * 8.5;
        camera.position.y = 19 + Math.cos(elapsed * 0.22) * 4.0;
        camera.lookAt(
          Math.sin(elapsed * 0.28 + 0.3) * 6,
          15 + Math.cos(elapsed * 0.2) * 2,
          camera.position.z - 75
        );

        // Update flying hover vehicles
        for (let i = 0; i < spinners.length; i++) {
          const sp = spinners[i];
          sp.mesh.position.z += sp.speed * delta;
          sp.mesh.position.x = sp.startX + Math.sin(elapsed * 1.2 + sp.phase) * 3.5;
          sp.mesh.position.y = sp.laneY + Math.cos(elapsed * 0.8 + sp.phase) * 1.5;

          if (sp.mesh.position.z > 60) {
            sp.mesh.position.z = -280;
            sp.startX = (Math.random() - 0.5) * 32;
          }
        }

        // Animate rain falling down
        const pos = rainGeo.attributes.position.array as Float32Array;
        for (let i = 1; i < rainCount * 3; i += 3) {
          pos[i] -= delta * 75;
          if (pos[i] < 0) {
            pos[i] = 90;
          }
        }
        rainGeo.attributes.position.needsUpdate = true;

        // Render pass
        if (composer && settings.postProcessing.bloom) {
          composer.render();
        } else {
          renderer.render(scene, camera);
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    // 8. Resize Handler
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

    // 9. COMPLETE WEBGL DESTRUCTION & MEMORY CLEANUP
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

      baseBoxGeo.dispose();
      buildingShaderMat.dispose();
      roadGeo.dispose();
      roadShaderMat.dispose();
      spinnerBodyGeo.dispose();
      spinnerBodyMat.dispose();
      trailGeo.dispose();
      trailMat.dispose();
      rainGeo.dispose();
      rainMat.dispose();
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
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#06020e]" ref={containerRef} />
  );
};
export default CyberpunkCityScene;
