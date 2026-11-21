import React, { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';

interface RainDrop {
  x: number;
  y: number;
  r: number;
  length: number;
  speed: number;
  opacity: number;
}

export const RainyWindowScene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isPaused } = useAppStore();
  const [lightningFlash, setLightningFlash] = useState<boolean>(false);

  // Distant Lightning timer
  useEffect(() => {
    let timeout: any;
    const triggerLightning = () => {
      setLightningFlash(true);
      setTimeout(() => {
        setLightningFlash(false);
        // Sometimes a double-flash
        if (Math.random() > 0.5) {
          setTimeout(() => {
            setLightningFlash(true);
            setTimeout(() => setLightningFlash(false), 90);
          }, 120);
        }
      }, 100);

      const nextDelay = (Math.random() * 16 + 14) * 1000;
      timeout = setTimeout(triggerLightning, nextDelay);
    };

    timeout = setTimeout(triggerLightning, 6000);
    return () => clearTimeout(timeout);
  }, []);

  // Rain Drops Canvas Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Create 45 independent raindrops
    const dropCount = Math.min(50, Math.floor(width / 32));
    const drops: RainDrop[] = [];
    for (let i = 0; i < dropCount; i++) {
      drops.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2 + 1.2,
        length: Math.random() * 26 + 14,
        speed: Math.random() * 4 + 3.2,
        opacity: Math.random() * 0.45 + 0.35
      });
    }

    let animationId: number;

    const render = () => {
      if (!isPaused && ctx) {
        ctx.clearRect(0, 0, width, height);

        // Draw and update each sliding droplet
        for (let i = 0; i < drops.length; i++) {
          const d = drops[i];

          // Water trail line
          ctx.strokeStyle = `rgba(224, 242, 254, ${d.opacity * 0.4})`;
          ctx.lineWidth = d.r * 0.8;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - 1, d.y - d.length);
          ctx.stroke();

          // Droplet bead head
          ctx.fillStyle = `rgba(240, 249, 255, ${d.opacity * 0.9})`;
          ctx.beginPath();
          ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
          ctx.fill();

          // Highlight reflection on droplet
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.beginPath();
          ctx.arc(d.x - d.r * 0.3, d.y - d.r * 0.3, d.r * 0.4, 0, Math.PI * 2);
          ctx.fill();

          d.y += d.speed;
          d.x -= 0.35; // Slight wind slant

          if (d.y > height) {
            d.y = -d.length;
            d.x = Math.random() * width;
            d.speed = Math.random() * 4 + 3.2;
          }
        }
      }
      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isPaused]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#03060f]">
      {/* Blurred City Lights Bokeh Background */}
      <div className="absolute inset-[-30px] filter blur-[32px] scale-105 pointer-events-none opacity-85">
        <div className="absolute w-[45vw] h-[45vw] rounded-full bg-amber-500/25 top-[15%] left-[10%]" />
        <div className="absolute w-[50vw] h-[50vw] rounded-full bg-sky-500/20 top-[25%] right-[15%]" />
        <div className="absolute w-[35vw] h-[35vw] rounded-full bg-rose-500/20 bottom-[20%] left-[35%]" />
        <div className="absolute w-[30vw] h-[30vw] rounded-full bg-amber-400/25 bottom-[10%] right-[20%]" />
      </div>

      {/* Lightning Flash Overlay */}
      <div
        className={`absolute inset-0 bg-sky-100/30 pointer-events-none z-10 transition-opacity duration-100 ${
          lightningFlash ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Rain Droplets Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-20" />

      {/* Window Frame Vignette */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_120px_rgba(0,0,0,0.85)] z-25" />

      {/* Cozy Foreground Windowsill */}
      <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-b from-[#141824] to-[#080b12] border-t-2 border-white/10 z-30 flex items-end justify-between px-12 sm:px-24 pb-4">
        {/* Candle */}
        <div className="flex flex-col items-center relative">
          {/* Flame */}
          <div className="w-3.5 h-6 rounded-full bg-gradient-to-t from-orange-500 via-amber-300 to-white shadow-[0_0_24px_rgba(245,158,11,0.9),0_0_45px_rgba(245,158,11,0.5)] animate-bounce duration-[1400ms] -mb-1" />
          <div className="w-9 h-11 rounded-sm bg-white/10 border border-white/20 backdrop-blur-sm flex items-end justify-center p-1">
            <div className="w-6 h-7 bg-amber-100/80 rounded-sm" />
          </div>
        </div>

        {/* Sleeping Cat Silhouette */}
        <div className="flex flex-col items-center relative opacity-85">
          <div className="flex items-center">
            {/* Cat Head with Ears */}
            <div className="relative w-6 h-6 bg-[#04060c] rounded-full -mr-2 z-10">
              <div className="absolute -top-1 left-0.5 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] border-b-[#04060c]" />
              <div className="absolute -top-1 right-0.5 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] border-b-[#04060c]" />
            </div>
            {/* Curled Body */}
            <div className="w-14 h-7 bg-[#04060c] rounded-t-full shadow-lg" />
          </div>
        </div>

        {/* Steaming Coffee Cup */}
        <div className="flex flex-col items-center relative">
          {/* Animated Steam */}
          <div className="w-3 h-5 bg-gradient-to-t from-white/25 to-transparent blur-[1.5px] rounded-full animate-pulse -mb-1" />
          <div className="relative w-8 h-7 bg-slate-800 rounded-b-md border border-white/15">
            <div className="absolute top-1 -right-2 w-2 h-4 border-2 border-slate-800 border-l-0 rounded-r-md" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RainyWindowScene;
