import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';

interface Fish {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  type: 'angelfish' | 'torpedo' | 'manta';
  color: string;
  tailPhase: number;
}

interface Bubble {
  x: number;
  y: number;
  r: number;
  speed: number;
  swayPhase: number;
}

export const AquariumScene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isPaused } = useAppStore();

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

    // Initialize Fish with Independent Vectors
    const fishList: Fish[] = [
      // Manta Ray
      {
        x: -180,
        y: height * 0.22,
        vx: 1.1,
        vy: 0,
        size: 70,
        type: 'manta',
        color: '#06162a',
        tailPhase: 0
      }
    ];

    // School of Fish
    for (let i = 0; i < 14; i++) {
      const dir = Math.random() > 0.4 ? 1 : -1;
      fishList.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.7) + 60,
        vx: (Math.random() * 1.5 + 1.2) * dir,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 14 + 18,
        type: Math.random() > 0.5 ? 'angelfish' : 'torpedo',
        color: Math.random() > 0.5 ? '#061a33' : '#031224',
        tailPhase: Math.random() * Math.PI * 2
      });
    }

    // Bubbles
    const bubbles: Bubble[] = [];
    for (let i = 0; i < 28; i++) {
      bubbles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 3.5 + 1.5,
        speed: Math.random() * 1.6 + 0.8,
        swayPhase: Math.random() * Math.PI * 2
      });
    }

    let animationId: number;
    let time = 0;

    const render = () => {
      if (!isPaused && ctx) {
        time += 0.015;

        // 1. Deep Ocean Background Gradient
        const oceanGrad = ctx.createLinearGradient(0, 0, 0, height);
        oceanGrad.addColorStop(0, '#0c3559');
        oceanGrad.addColorStop(0.35, '#072440');
        oceanGrad.addColorStop(0.75, '#031424');
        oceanGrad.addColorStop(1, '#010811');
        ctx.fillStyle = oceanGrad;
        ctx.fillRect(0, 0, width, height);

        // 2. Sunlight Caustic God-Rays
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
        for (let i = 0; i < 5; i++) {
          const rayX = width * (0.15 + i * 0.18) + Math.sin(time * 0.8 + i) * 35;
          ctx.beginPath();
          ctx.moveTo(rayX, 0);
          ctx.lineTo(rayX + 90, 0);
          ctx.lineTo(rayX + 220, height);
          ctx.lineTo(rayX + 60, height);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();

        // 3. Swaying Seabed Kelp (Bottom)
        ctx.fillStyle = '#020b17';
        for (let k = 0; k < width; k += 80) {
          const kelpHeight = 110 + Math.sin(k) * 45;
          const sway = Math.sin(time * 1.5 + k * 0.05) * 16;
          ctx.beginPath();
          ctx.moveTo(k, height);
          ctx.quadraticCurveTo(k + sway, height - kelpHeight / 2, k + sway * 1.4, height - kelpHeight);
          ctx.quadraticCurveTo(k + sway * 0.8, height - kelpHeight / 2, k + 12, height);
          ctx.fill();
        }

        // 4. Update and Draw Fish
        for (let i = 0; i < fishList.length; i++) {
          const f = fishList[i];
          f.x += f.vx;
          f.y += f.vy + Math.sin(time * 2 + i) * 0.3;
          f.tailPhase += 0.18;

          // Wrap horizontally
          if (f.vx > 0 && f.x > width + 100) f.x = -100;
          if (f.vx < 0 && f.x < -100) f.x = width + 100;

          ctx.save();
          ctx.translate(f.x, f.y);
          if (f.vx < 0) ctx.scale(-1, 1);

          ctx.fillStyle = f.color;

          if (f.type === 'manta') {
            // Manta Ray Shape
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(f.size * 0.5, -f.size * 0.45, f.size, 0);
            ctx.quadraticCurveTo(f.size * 0.5, f.size * 0.45, 0, 0);
            ctx.fill();

            // Manta Tail
            ctx.strokeStyle = f.color;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-f.size * 0.7, Math.sin(f.tailPhase) * 6);
            ctx.stroke();
          } else if (f.type === 'angelfish') {
            // High dorsal angel fish
            ctx.beginPath();
            ctx.ellipse(0, 0, f.size * 0.8, f.size * 0.55, 0, 0, Math.PI * 2);
            ctx.fill();

            // Dorsal & Pelvic fins
            ctx.beginPath();
            ctx.moveTo(-f.size * 0.2, -f.size * 0.5);
            ctx.lineTo(-f.size * 0.6, -f.size * 1.1);
            ctx.lineTo(0, -f.size * 0.4);
            ctx.fill();

            // Tail with wag
            const wag = Math.sin(f.tailPhase) * (f.size * 0.25);
            ctx.beginPath();
            ctx.moveTo(-f.size * 0.7, 0);
            ctx.lineTo(-f.size * 1.2, -f.size * 0.4 + wag);
            ctx.lineTo(-f.size * 1.2, f.size * 0.4 + wag);
            ctx.closePath();
            ctx.fill();
          } else {
            // Torpedo Fish
            ctx.beginPath();
            ctx.ellipse(0, 0, f.size, f.size * 0.38, 0, 0, Math.PI * 2);
            ctx.fill();

            // Wagging tail
            const wag = Math.sin(f.tailPhase) * (f.size * 0.22);
            ctx.beginPath();
            ctx.moveTo(-f.size * 0.9, 0);
            ctx.lineTo(-f.size * 1.35, -f.size * 0.35 + wag);
            ctx.lineTo(-f.size * 1.35, f.size * 0.35 + wag);
            ctx.closePath();
            ctx.fill();
          }

          ctx.restore();
        }

        // 5. Rising Effervescent Bubbles
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 0.8;

        for (let i = 0; i < bubbles.length; i++) {
          const b = bubbles[i];
          b.y -= b.speed;
          b.swayPhase += 0.04;
          b.x += Math.sin(b.swayPhase) * 0.6;

          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          if (b.y < -10) {
            b.y = height + 10;
            b.x = Math.random() * width;
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
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#010811]">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default AquariumScene;
