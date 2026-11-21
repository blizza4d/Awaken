import React, { useEffect, useRef } from 'react';
import { SpatialEngine } from '../../engine/SpatialEngine';
import { useSpatialStore } from '../../store/useSpatialStore';

export const SpatialCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<SpatialEngine | null>(null);

  const activeScene = useSpatialStore((s) => s.activeScene);
  const postFX = useSpatialStore((s) => s.postFX);
  const brightness = useSpatialStore((s) => s.brightness);
  const setTelemetry = useSpatialStore((s) => s.setTelemetry);

  // Mount Three.js + EffectComposer SpatialEngine once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new SpatialEngine(canvas, useSpatialStore.getState().activeScene, (telemetry) => {
      setTelemetry(telemetry);
    });
    engine.updatePostFX(useSpatialStore.getState().postFX);
    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [setTelemetry]);

  // Switch active WebGL environment with strict dispose() + memory flush
  useEffect(() => {
    engineRef.current?.loadScene(activeScene);
  }, [activeScene]);

  // Propagate real-time Post-FX and Dynamic Resolution Governor updates
  useEffect(() => {
    engineRef.current?.updatePostFX(postFX);
  }, [postFX]);

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
