import React, { useEffect, useRef, useState } from 'react';
import { SpatialEngine } from '../../engine/SpatialEngine';
import { useSpatialStore } from '../../store/useSpatialStore';

export const SpatialCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<SpatialEngine | null>(null);
  const transitionSeqRef = useRef<number>(0);
  const isFirstMountRef = useRef<boolean>(true);

  const [canvasOpacity, setCanvasOpacity] = useState<number>(1);
  const [transitionSpeed, setTransitionSpeed] = useState<string>('duration-500');

  const activeScene = useSpatialStore((s) => s.activeScene);
  const postFX = useSpatialStore((s) => s.postFX);
  const powerProfile = useSpatialStore((s) => s.powerProfile);
  const motionSpeed = useSpatialStore((s) => s.motionSpeed);
  const ambientDimmer = useSpatialStore((s) => s.ambientDimmer);
  const subtleParallax = useSpatialStore((s) => s.subtleParallax);
  const brightness = useSpatialStore((s) => s.brightness);
  const setTelemetry = useSpatialStore((s) => s.setTelemetry);

  // Lazy WebGL Engine lifecycle with silky 420ms fade-out -> swap -> 520ms fade-in
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const currentSeq = ++transitionSeqRef.current;

    // 1. OLED Void handling: zero WebGL allocation on boot
    if (activeScene === 'oled-void') {
      setTransitionSpeed('duration-[420ms]');
      setCanvasOpacity(0);

      if (engineRef.current) {
        window.setTimeout(() => {
          if (transitionSeqRef.current === currentSeq) {
            engineRef.current?.loadScene('oled-void');
          }
        }, 420);
      } else {
        setTelemetry({
          fps: 0,
          pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
          qualityScale: 1.0,
          activeInstances: 0,
          drawCalls: 0,
          triangles: 0,
          geometries: 0,
          textures: 0,
          sceneId: 'oled-void',
          isOledVoid: true,
        });
      }
      return;
    }

    // 2. Initial Mount: initialize engine without crossfade delay
    if (!engineRef.current) {
      const engine = new SpatialEngine(canvas, activeScene, (telemetry) => {
        setTelemetry(telemetry);
      });
      engine.setPowerProfile(powerProfile);
      engine.setMotionSpeed(motionSpeed);
      engine.setAmbientDimmer(ambientDimmer);
      engine.setSubtleParallax(subtleParallax);
      engine.updatePostFX(postFX);
      engineRef.current = engine;
      isFirstMountRef.current = false;
      setCanvasOpacity(1);
      return;
    }

    // 3. Cinematic Scene Crossfade: 420ms fade-out -> load lazy chunk -> 520ms fade-in
    setTransitionSpeed('duration-[420ms]');
    setCanvasOpacity(0);

    const fadeOutTimer = window.setTimeout(async () => {
      if (transitionSeqRef.current !== currentSeq) return;

      if (engineRef.current) {
        await engineRef.current.loadScene(activeScene);
      }

      if (transitionSeqRef.current === currentSeq) {
        setTransitionSpeed('duration-[520ms]');
        setCanvasOpacity(1);
      }
    }, 420);

    return () => {
      window.clearTimeout(fadeOutTimer);
    };
  }, [activeScene, setTelemetry]);

  // Propagate real-time Power Profile changes
  useEffect(() => {
    engineRef.current?.setPowerProfile(powerProfile);
  }, [powerProfile]);

  // Propagate real-time Motion Speed changes
  useEffect(() => {
    engineRef.current?.setMotionSpeed(motionSpeed);
  }, [motionSpeed]);

  // Propagate real-time Ambient Dimmer changes
  useEffect(() => {
    engineRef.current?.setAmbientDimmer(ambientDimmer);
  }, [ambientDimmer]);

  // Propagate real-time Subtle Parallax toggle
  useEffect(() => {
    engineRef.current?.setSubtleParallax(subtleParallax);
  }, [subtleParallax]);

  // Propagate real-time Post-FX and Dynamic Resolution Governor updates
  useEffect(() => {
    engineRef.current?.updatePostFX(postFX);
  }, [postFX]);

  // Destroy engine on unmount
  useEffect(() => {
    return () => {
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, []);

  const dimOpacity = Math.max(0, Math.min(0.82, (100 - brightness) / 100));

  return (
    <div className="fixed inset-0 z-0 w-full h-full bg-black overflow-hidden">
      <canvas
        ref={canvasRef}
        className={`block w-full h-full outline-none transition-opacity ease-in-out ${transitionSpeed}`}
        style={{
          opacity: activeScene === 'oled-void' ? 0 : canvasOpacity,
          display: activeScene === 'oled-void' ? 'none' : 'block',
        }}
        aria-label="AWAKEN Spatial WebGL Viewport"
      />
      {/* Hardware Display Dimmer Veil */}
      {dimOpacity > 0.005 && (
        <div
          className="fixed inset-0 pointer-events-none bg-black transition-opacity duration-300"
          style={{ opacity: dimOpacity }}
        />
      )}
    </div>
  );
};

export default SpatialCanvas;
