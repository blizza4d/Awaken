import React, { useEffect, useRef } from 'react';
import { SpatialEngine } from '../../engine/SpatialEngine';
import { useSpatialStore } from '../../store/useSpatialStore';

export const SpatialCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<SpatialEngine | null>(null);

  const activeScene = useSpatialStore((s) => s.activeScene);
  const postFX = useSpatialStore((s) => s.postFX);
  const powerProfile = useSpatialStore((s) => s.powerProfile);
  const brightness = useSpatialStore((s) => s.brightness);
  const setTelemetry = useSpatialStore((s) => s.setTelemetry);

  // Lazy WebGL Engine lifecycle:
  // When booting straight into OLED Void, Three.js & EffectComposer are never initialized (0% GPU).
  // SpatialEngine is created only once the user transitions into a real WebGL spatial mode.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (activeScene === 'oled-void') {
      if (engineRef.current) {
        engineRef.current.loadScene('oled-void');
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

    if (!engineRef.current) {
      const engine = new SpatialEngine(canvas, activeScene, (telemetry) => {
        setTelemetry(telemetry);
      });
      engine.setPowerProfile(powerProfile);
      engine.updatePostFX(postFX);
      engineRef.current = engine;
    } else {
      engineRef.current.loadScene(activeScene);
    }
  }, [activeScene, setTelemetry]);

  // Propagate real-time Power Profile changes
  useEffect(() => {
    engineRef.current?.setPowerProfile(powerProfile);
  }, [powerProfile]);

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
        className="block w-full h-full outline-none transition-opacity duration-500"
        style={{
          opacity: activeScene === 'oled-void' ? 0 : 1,
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
