import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';

export const NorthernLightsScene: React.FC = () => {
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

    // Stars
    const starCount = 300;
    const stars: { x: number; y: number; r: number; alpha: number }[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.65),
        r: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.7 + 0.3
      });
    }

    let animationId: number;
    let time = 0;

    const render = () => {
      if (!isPaused && ctx) {
        time += 0.008;

        // 1. Sky Gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.68);
        skyGrad.addColorStop(0, '#020409');
        skyGrad.addColorStop(0.5, '#050c18');
        skyGrad.addColorStop(1, '#0b192e');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, height * 0.68);

        // 2. Stars
        ctx.fillStyle = '#ffffff';
        for (let i = 0; i < stars.length; i++) {
          const s = stars[i];
          ctx.globalAlpha = s.alpha * (0.8 + 0.2 * Math.sin(time * 3 + i));
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;

        // 3. Morphing Aurora Curtains (3 layers)
        const drawAuroraRibbon = (
          baseY: number,
          amplitude: number,
          freq: number,
          speed: number,
          colorTop: string,
          colorBottom: string
        ) => {
          ctx.save();
          ctx.globalCompositeOperation = 'screen';

          const grad = ctx.createLinearGradient(0, baseY - 180, 0, baseY + 60);
          grad.addColorStop(0, 'rgba(0,0,0,0)');
          grad.addColorStop(0.4, colorTop);
          grad.addColorStop(0.8, colorBottom);
          grad.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(0, height * 0.7);

          for (let x = 0; x <= width; x += 15) {
            const y1 = Math.sin(x * freq + time * speed) * amplitude;
            const y2 = Math.cos(x * (freq * 0.5) + time * (speed * 0.8)) * (amplitude * 0.6);
            const y = baseY + y1 + y2;
            ctx.lineTo(x, y);
          }

          ctx.lineTo(width, height * 0.7);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        };

        // Emerald Curtain
        drawAuroraRibbon(
          height * 0.32,
          75,
          0.004,
          1.2,
          'rgba(16, 185, 129, 0.45)',
          'rgba(52, 211, 153, 0.15)'
        );
        // Cyan Curtain
        drawAuroraRibbon(
          height * 0.26,
          65,
          0.0035,
          0.9,
          'rgba(6, 182, 212, 0.4)',
          'rgba(56, 189, 248, 0.12)'
        );
        // Violet Curtain
        drawAuroraRibbon(
          height * 0.38,
          55,
          0.005,
          1.5,
          'rgba(168, 85, 247, 0.35)',
          'rgba(192, 132, 252, 0.1)'
        );

        // 4. Mountain Silhouettes (Midground)
        ctx.fillStyle = '#050912';
        ctx.beginPath();
        ctx.moveTo(0, height * 0.68);
        const mountainPoints = [
          [0, height * 0.58],
          [width * 0.12, height * 0.44],
          [width * 0.25, height * 0.56],
          [width * 0.4, height * 0.41],
          [width * 0.55, height * 0.55],
          [width * 0.7, height * 0.39],
          [width * 0.85, height * 0.52],
          [width, height * 0.46],
          [width, height * 0.68]
        ];
        ctx.moveTo(mountainPoints[0][0], mountainPoints[0][1]);
        for (let i = 1; i < mountainPoints.length; i++) {
          ctx.lineTo(mountainPoints[i][0], mountainPoints[i][1]);
        }
        ctx.closePath();
        ctx.fill();

        // 5. Frozen Lake Reflection (Lower Third)
        const lakeGrad = ctx.createLinearGradient(0, height * 0.68, 0, height);
        lakeGrad.addColorStop(0, '#081224');
        lakeGrad.addColorStop(1, '#020409');
        ctx.fillStyle = lakeGrad;
        ctx.fillRect(0, height * 0.68, width, height * 0.32);

        // Subtle Aurora Light Reflection in Ice
        ctx.save();
        ctx.globalAlpha = 0.28;
        ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
        ctx.fillRect(0, height * 0.68, width, 40);
        ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
        ctx.fillRect(0, height * 0.74, width, 50);
        ctx.restore();

        // Horizontal Ice Ripples
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.lineWidth = 1;
        for (let y = height * 0.7; y < height; y += 12) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
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
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#020409]">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

export default NorthernLightsScene;
