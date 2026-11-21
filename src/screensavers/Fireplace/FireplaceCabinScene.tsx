import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';

interface FireParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
}

interface SnowParticle {
  x: number;
  y: number;
  r: number;
  speed: number;
  sway: number;
}

export const FireplaceCabinScene: React.FC = () => {
  const fireCanvasRef = useRef<HTMLCanvasElement>(null);
  const snowCanvasRef = useRef<HTMLCanvasElement>(null);
  const { isPaused } = useAppStore();

  // Fireplace & Snow Canvas Simulations
  useEffect(() => {
    const fireCanvas = fireCanvasRef.current;
    const snowCanvas = snowCanvasRef.current;
    if (!fireCanvas || !snowCanvas) return;

    const fCtx = fireCanvas.getContext('2d');
    const sCtx = snowCanvas.getContext('2d');
    if (!fCtx || !sCtx) return;

    fireCanvas.width = 300;
    fireCanvas.height = 220;

    snowCanvas.width = 220;
    snowCanvas.height = 280;

    // Fire Particles
    const fireParticles: FireParticle[] = [];
    const colors = ['#ea580c', '#f97316', '#facc15', '#fef08a', '#ffffff'];

    // Snow Particles
    const snowFlakes: SnowParticle[] = [];
    for (let i = 0; i < 45; i++) {
      snowFlakes.push({
        x: Math.random() * snowCanvas.width,
        y: Math.random() * snowCanvas.height,
        r: Math.random() * 1.8 + 0.8,
        speed: Math.random() * 0.9 + 0.4,
        sway: Math.random() * Math.PI * 2
      });
    }

    let animationId: number;

    const render = () => {
      if (!isPaused) {
        // 1. RENDER FLAMES
        fCtx.clearRect(0, 0, fireCanvas.width, fireCanvas.height);

        // Spawn new fire sparks
        for (let i = 0; i < 4; i++) {
          fireParticles.push({
            x: fireCanvas.width / 2 + (Math.random() - 0.5) * 80,
            y: fireCanvas.height - 20,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -(Math.random() * 2.8 + 2.2),
            size: Math.random() * 18 + 10,
            life: 0,
            maxLife: Math.random() * 25 + 20,
            color: colors[Math.floor(Math.random() * colors.length)]
          });
        }

        // Update & draw flames
        for (let i = fireParticles.length - 1; i >= 0; i--) {
          const p = fireParticles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.size *= 0.94;
          p.life++;

          const alpha = 1 - p.life / p.maxLife;
          fCtx.fillStyle = p.color;
          fCtx.globalAlpha = Math.max(0, alpha * 0.7);
          fCtx.beginPath();
          fCtx.arc(p.x, p.y, Math.max(0.1, p.size), 0, Math.PI * 2);
          fCtx.fill();

          if (p.life >= p.maxLife || p.size < 0.8) {
            fireParticles.splice(i, 1);
          }
        }
        fCtx.globalAlpha = 1.0;

        // 2. RENDER SNOW
        sCtx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);
        sCtx.fillStyle = 'rgba(255, 255, 255, 0.85)';

        for (let i = 0; i < snowFlakes.length; i++) {
          const s = snowFlakes[i];
          s.y += s.speed;
          s.sway += 0.02;
          s.x += Math.sin(s.sway) * 0.4;

          sCtx.beginPath();
          sCtx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          sCtx.fill();

          if (s.y > snowCanvas.height) {
            s.y = -5;
            s.x = Math.random() * snowCanvas.width;
          }
        }
      }
      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isPaused]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#070503] flex items-center justify-center">
      {/* Dynamic Ambient Warmth Pulsing */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_75%,rgba(245,158,11,0.22)_0%,rgba(180,83,9,0.08)_55%,transparent_80%)] animate-pulse duration-[2200ms]" />

      {/* Cabin Side Window with Falling Snow */}
      <div className="absolute top-12 right-12 sm:right-28 w-44 sm:w-56 h-64 sm:h-72 rounded-sm bg-[#040813] border-8 border-[#170f08] shadow-[inset_0_0_35px_rgba(0,0,0,0.9)] overflow-hidden z-10">
        <canvas ref={snowCanvasRef} className="w-full h-full" />
      </div>

      {/* Wooden Beam Floor Shadow */}
      <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-[#020202] via-[#090604] to-transparent z-15" />

      {/* Stone Fireplace Hearth Centerpiece */}
      <div className="relative z-20 flex flex-col items-center mt-28">
        {/* Stone Arch Hearth */}
        <div className="relative w-80 sm:w-96 h-64 sm:h-72 rounded-t-[140px] bg-[#020101] border-[16px] border-[#1f1712] border-b-0 shadow-[inset_0_0_70px_rgba(0,0,0,0.95)] flex items-end justify-center overflow-hidden">
          {/* Glowing Embers Base */}
          <div className="absolute bottom-3 w-56 h-7 rounded-full bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 blur-sm shadow-[0_0_35px_#ea580c] z-10" />

          {/* Fireplace Logs */}
          <div className="absolute bottom-4 w-48 h-10 rounded-full bg-[#160c04] border-2 border-[#261507] z-12" />

          {/* Canvas Animated Fire */}
          <canvas ref={fireCanvasRef} className="absolute bottom-4 w-64 h-52 z-15 pointer-events-none" />
        </div>

        {/* Mantel Base Surround */}
        <div className="w-[340px] sm:w-[420px] h-6 bg-[#170e08] rounded-t-sm shadow-2xl border-t border-amber-900/30" />
      </div>
    </div>
  );
};

export default FireplaceCabinScene;
