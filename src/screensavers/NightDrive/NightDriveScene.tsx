import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { useAppStore } from '../../store/useAppStore';

export const NightDriveScene: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isPaused, settings } = useAppStore();
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scene: THREE.Scene | null = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x040610, 0.008);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(54, width / height, 0.1, 800);
    camera.position.set(0, 2.7, 8.5);
    camera.lookAt(0, 2.3, -70);

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
      renderer.toneMappingExposure = 1.25;
      container.appendChild(renderer.domElement);

      if (settings.postProcessing.bloom) {
        composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        composer.addPass(
          new UnrealBloomPass(
            new THREE.Vector2(width, height),
            settings.postProcessing.bloomIntensity || 1.2,
            0.45,
            0.18
          )
        );
      }
    } catch (e: any) {
      setInitError('WebGL initialization failed for Autonomous Night Drive.');
      return;
    }

    // 1. Midnight Ambient & Moonlight
    const ambientLight = new THREE.AmbientLight(0x0b1122, 1.2);
    scene.add(ambientLight);

    const moonLight = new THREE.DirectionalLight(0x7dd3fc, 0.75);
    moonLight.position.set(40, 80, -90);
    scene.add(moonLight);

    // 2. Custom Curved Highway Shader Material
    const roadWidth = 26;
    const roadLength = 450;
    const roadGeo = new THREE.PlaneGeometry(roadWidth, roadLength, 48, 160);

    const roadShaderMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: 45.0 },
        uHeadlightPosL: { value: new THREE.Vector3(-1.1, 0.9, -2.5) },
        uHeadlightPosR: { value: new THREE.Vector3(1.1, 0.9, -2.5) }
      },
      vertexShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        varying vec3 vNormal;

        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);

          // Highway procedural curvature displacement
          float curve = sin(worldPos.z * 0.009 + uTime * 0.35) * 14.0;
          worldPos.x += curve;

          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform float uSpeed;
        uniform vec3 uHeadlightPosL;
        uniform vec3 uHeadlightPosR;
        varying vec2 vUv;
        varying vec3 vWorldPosition;
        varying vec3 vNormal;

        void main() {
          // Asphalt base color
          vec3 asphalt = vec3(0.04, 0.05, 0.08);

          // Headlight illumination falloff
          float distL = length(vWorldPosition - uHeadlightPosL);
          float distR = length(vWorldPosition - uHeadlightPosR);
          float lightL = clamp(1.0 - distL / 70.0, 0.0, 1.0);
          float lightR = clamp(1.0 - distR / 70.0, 0.0, 1.0);
          float forwardBeam = max(pow(lightL, 2.0), pow(lightR, 2.0));

          // Moving yellow dashed centerline
          float centerLine = step(0.485, vUv.x) * step(vUv.x, 0.515);
          float dash = step(0.5, fract(vUv.y * 45.0 + uTime * 3.2));
          vec3 yellowDashes = vec3(1.0, 0.8, 0.1) * centerLine * dash * (forwardBeam * 3.5 + 0.4);

          // White lane boundaries
          float lineL = step(0.18, vUv.x) * step(vUv.x, 0.195);
          float lineR = step(0.805, vUv.x) * step(vUv.x, 0.82);
          vec3 whiteLines = vec3(0.95, 0.95, 1.0) * (lineL + lineR) * (forwardBeam * 3.0 + 0.35);

          // Roadside cat-eye reflectors that glow when struck by headlights
          float reflectorL = step(0.14, vUv.x) * step(vUv.x, 0.155) * step(0.85, fract(vUv.y * 30.0 + uTime * 3.2));
          float reflectorR = step(0.845, vUv.x) * step(vUv.x, 0.86) * step(0.85, fract(vUv.y * 30.0 + uTime * 3.2));
          vec3 catEyes = vec3(1.0, 0.3, 0.1) * (reflectorL + reflectorR) * forwardBeam * 5.0;

          vec3 litAsphalt = asphalt * (forwardBeam * 1.8 + 0.18);
          vec3 col = litAsphalt + yellowDashes + whiteLines + catEyes;

          gl_FragColor = vec4(col, 1.0);
        }
      `
    });

    const roadMesh = new THREE.Mesh(roadGeo, roadShaderMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.position.set(0, 0, -roadLength / 2 + 15);
    scene.add(roadMesh);

    // 3. Passing Motion-Blurred Streetlight Streaks
    const poleCount = 24;
    const poleSpacing = 20;
    const polePoles: THREE.Group[] = [];
    const poleGeo = new THREE.CylinderGeometry(0.1, 0.14, 10, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8 });

    // High-speed motion-blur light streak geometry
    const streakGeo = new THREE.BoxGeometry(0.5, 0.4, 6.0);
    const streakMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    for (let i = 0; i < poleCount; i++) {
      const zPos = -i * poleSpacing;
      // Left pole group
      const gL = new THREE.Group();
      const pL = new THREE.Mesh(poleGeo, poleMat);
      pL.position.y = 5.0;
      const sL = new THREE.Mesh(streakGeo, streakMat);
      sL.position.set(1.5, 9.8, 0);
      gL.add(pL, sL);
      gL.position.set(-roadWidth / 2 - 2.5, 0, zPos);
      scene.add(gL);
      polePoles.push(gL);

      // Right pole group
      const gR = new THREE.Group();
      const pR = new THREE.Mesh(poleGeo, poleMat);
      pR.position.y = 5.0;
      const sR = new THREE.Mesh(streakGeo, streakMat);
      sR.position.set(-1.5, 9.8, 0);
      gR.add(pR, sR);
      gR.position.set(roadWidth / 2 + 2.5, 0, zPos - poleSpacing / 2);
      scene.add(gR);
      polePoles.push(gR);
    }

    // 4. Autonomous Car Model with Volumetric Forward Headlights
    const carGroup = new THREE.Group();

    // Chassis
    const chassisGeo = new THREE.BoxGeometry(2.3, 0.85, 4.6);
    const chassisMat = new THREE.MeshStandardMaterial({
      color: 0x081022,
      metalness: 0.9,
      roughness: 0.15
    });
    const chassis = new THREE.Mesh(chassisGeo, chassisMat);
    chassis.position.y = 0.75;

    // Cockpit cabin
    const cabinGeo = new THREE.BoxGeometry(1.8, 0.7, 2.4);
    const cabinMat = new THREE.MeshStandardMaterial({
      color: 0x02040a,
      metalness: 0.8,
      roughness: 0.1
    });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 1.45, -0.3);

    // Glowing LED Taillights (Red)
    const tailLightGeo = new THREE.BoxGeometry(0.6, 0.15, 0.08);
    const tailLightMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
    const tailL = new THREE.Mesh(tailLightGeo, tailLightMat);
    tailL.position.set(-0.8, 0.8, 2.31);
    const tailR = new THREE.Mesh(tailLightGeo, tailLightMat);
    tailR.position.set(0.8, 0.8, 2.31);

    // Red light connecting bar
    const tailBarGeo = new THREE.BoxGeometry(0.95, 0.04, 0.04);
    const tailBar = new THREE.Mesh(tailBarGeo, tailLightMat);
    tailBar.position.set(0, 0.88, 2.31);

    carGroup.add(chassis, cabin, tailL, tailR, tailBar);
    carGroup.position.set(0, 0, -15);
    scene.add(carGroup);

    // Dual Forward Headlight Beams (Cones)
    const headlightConeGeo = new THREE.ConeGeometry(9.0, 55, 20);
    const headlightConeMat = new THREE.MeshBasicMaterial({
      color: 0xfef9c3,
      transparent: true,
      opacity: 0.09,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const beamL = new THREE.Mesh(headlightConeGeo, headlightConeMat);
    beamL.rotation.x = -Math.PI / 2;
    beamL.position.set(-0.9, 0.8, -35);

    const beamR = new THREE.Mesh(headlightConeGeo, headlightConeMat);
    beamR.rotation.x = -Math.PI / 2;
    beamR.position.set(0.9, 0.8, -35);

    scene.add(beamL, beamR);

    // 5. Receding Distant Taillights (Traffic Ahead)
    const distantTrafficCount = 4;
    const distantCars: THREE.Group[] = [];
    for (let i = 0; i < distantTrafficCount; i++) {
      const g = new THREE.Group();
      const tL = new THREE.Mesh(tailLightGeo, tailLightMat);
      tL.position.set(-0.7, 0.8, 0);
      const tR = new THREE.Mesh(tailLightGeo, tailLightMat);
      tR.position.set(0.7, 0.8, 0);
      g.add(tL, tR);

      g.position.set(
        (Math.random() > 0.5 ? 4.5 : -4.5),
        0,
        -90 - i * 65
      );
      scene.add(g);
      distantCars.push(g);
    }

    // 6. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();
    const driveSpeed = 52.0;

    const animate = () => {
      if (!isPaused && scene && renderer && camera) {
        const delta = Math.min(clock.getDelta(), 0.1);
        const elapsed = clock.getElapsedTime();

        // Update road shader
        roadShaderMat.uniforms.uTime.value = elapsed;

        // Move streetlights toward viewer for high-speed effect
        const moveDist = driveSpeed * delta;
        const poleWrap = poleCount * (poleSpacing / 2);
        for (let i = 0; i < polePoles.length; i++) {
          polePoles[i].position.z += moveDist;
          if (polePoles[i].position.z > 15) {
            polePoles[i].position.z -= poleWrap * 2;
          }
        }

        // Animate distant traffic
        for (let i = 0; i < distantCars.length; i++) {
          const dc = distantCars[i];
          dc.position.z += (driveSpeed * 0.4) * delta;
          // Follow road curvature
          const curve = Math.sin(dc.position.z * 0.009 + elapsed * 0.35) * 14.0;
          dc.position.x = (i % 2 === 0 ? 5.0 : -5.0) + curve;

          if (dc.position.z > -10) {
            dc.position.z = -260;
          }
        }

        // Car chassis bob and gentle steering sway
        carGroup.position.x = Math.sin(elapsed * 0.55) * 0.55;
        carGroup.position.y = Math.sin(elapsed * 7.5) * 0.025;
        beamL.position.x = -0.9 + carGroup.position.x;
        beamR.position.x = 0.9 + carGroup.position.x;

        camera.position.x = carGroup.position.x * 0.4;

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

      roadGeo.dispose();
      roadShaderMat.dispose();
      poleGeo.dispose();
      poleMat.dispose();
      streakGeo.dispose();
      streakMat.dispose();
      chassisGeo.dispose();
      chassisMat.dispose();
      cabinGeo.dispose();
      cabinMat.dispose();
      tailLightGeo.dispose();
      tailLightMat.dispose();
      headlightConeGeo.dispose();
      headlightConeMat.dispose();
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
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#040610]" ref={containerRef} />
  );
};
export default NightDriveScene;
