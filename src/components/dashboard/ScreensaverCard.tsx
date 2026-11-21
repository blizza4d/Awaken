import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ScreensaverMeta } from '../../types/screensaver';
import { useAppStore } from '../../store/useAppStore';
import { Play, Bookmark, Check, Cpu, Sparkles, Layers, ArrowUpRight } from 'lucide-react';

interface ScreensaverCardProps {
  item: ScreensaverMeta;
}

interface SceneTheme {
  primary: string;
  secondary: string;
  glow: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

const SCENE_THEMES: Record<string, SceneTheme> = {
  minimal: {
    primary: '#10b981',
    secondary: '#059669',
    glow: 'rgba(16, 185, 129, 0.4)',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-300',
    badgeBorder: 'border-emerald-500/30'
  },
  cyberpunk: {
    primary: '#00f0ff',
    secondary: '#f43f5e',
    glow: 'rgba(0, 240, 255, 0.45)',
    badgeBg: 'bg-cyan-500/15',
    badgeText: 'text-cyan-300',
    badgeBorder: 'border-cyan-400/40'
  },
  'night-drive': {
    primary: '#f59e0b',
    secondary: '#ef4444',
    glow: 'rgba(245, 158, 11, 0.45)',
    badgeBg: 'bg-amber-500/15',
    badgeText: 'text-amber-300',
    badgeBorder: 'border-amber-400/40'
  },
  space: {
    primary: '#38bdf8',
    secondary: '#a855f7',
    glow: 'rgba(56, 189, 248, 0.45)',
    badgeBg: 'bg-sky-500/15',
    badgeText: 'text-sky-300',
    badgeBorder: 'border-sky-400/40'
  },
  'rainy-window': {
    primary: '#60a5fa',
    secondary: '#38bdf8',
    glow: 'rgba(96, 165, 250, 0.4)',
    badgeBg: 'bg-blue-500/15',
    badgeText: 'text-blue-300',
    badgeBorder: 'border-blue-400/40'
  },
  fireplace: {
    primary: '#ea580c',
    secondary: '#facc15',
    glow: 'rgba(234, 88, 12, 0.5)',
    badgeBg: 'bg-orange-500/15',
    badgeText: 'text-orange-300',
    badgeBorder: 'border-orange-400/40'
  },
  'northern-lights': {
    primary: '#10b981',
    secondary: '#8b5cf6',
    glow: 'rgba(16, 185, 129, 0.45)',
    badgeBg: 'bg-emerald-500/15',
    badgeText: 'text-emerald-300',
    badgeBorder: 'border-emerald-400/40'
  },
  aquarium: {
    primary: '#06b6d4',
    secondary: '#14b8a6',
    glow: 'rgba(6, 182, 212, 0.45)',
    badgeBg: 'bg-cyan-500/15',
    badgeText: 'text-cyan-300',
    badgeBorder: 'border-cyan-400/40'
  },
  'mountain-escape': {
    primary: '#818cf8',
    secondary: '#c084fc',
    glow: 'rgba(129, 140, 248, 0.4)',
    badgeBg: 'bg-indigo-500/15',
    badgeText: 'text-indigo-300',
    badgeBorder: 'border-indigo-400/40'
  },
  'digital-zen': {
    primary: '#a855f7',
    secondary: '#38bdf8',
    glow: 'rgba(168, 85, 247, 0.45)',
    badgeBg: 'bg-purple-500/15',
    badgeText: 'text-purple-300',
    badgeBorder: 'border-purple-400/40'
  }
};

export const ScreensaverCard: React.FC<ScreensaverCardProps> = ({ item }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const { settings, selectMode, startScreensaver, toggleFavorite } = useAppStore();

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const isSelected = settings.selectedMode === item.id;
  const isFavorite = settings.favorites.includes(item.id);
  const theme = SCENE_THEMES[item.id] || SCENE_THEMES.minimal;

  // 3D Tilt Physics and Mouse Glare
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -7;
    const rotateY = ((x - centerX) / centerX) * 7;
    setTilt({ x: rotateX, y: rotateY });
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100
    });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  // High-Fidelity Mini Canvas Preview
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 380;
    canvas.height = 200;
    let animId: number;
    let t = Math.random() * 50;

    const render = () => {
      t += 0.035;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (item.id === 'minimal') {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#10b981';
        ctx.font = '700 30px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 12;
        ctx.fillText('00:00:00', canvas.width / 2, canvas.height / 2 + 6);
        ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(16, 185, 129, 0.7)';
        ctx.font = '600 10px "JetBrains Mono", monospace';
        ctx.fillText('• 0% GPU OLED STANDBY •', canvas.width / 2, canvas.height / 2 + 28);

      } else if (item.id === 'cyberpunk') {
        ctx.fillStyle = '#04020a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < 11; i++) {
          const bx = i * 36 - 15;
          const bh = 55 + Math.sin(i * 1.7) * 45;
          ctx.fillStyle = '#0e041d';
          ctx.fillRect(bx, canvas.height - bh, 32, bh);

          for (let wy = canvas.height - bh + 8; wy < canvas.height - 8; wy += 12) {
            const lit = (i + Math.floor(t * 1.5) + wy) % 3 === 0;
            ctx.fillStyle = lit ? (i % 2 === 0 ? '#00f0ff' : '#f43f5e') : 'rgba(255,255,255,0.04)';
            if (lit) {
              ctx.shadowColor = ctx.fillStyle;
              ctx.shadowBlur = 6;
            }
            ctx.fillRect(bx + 6, wy, 5, 5);
            ctx.fillRect(bx + 18, wy, 5, 5);
            ctx.shadowBlur = 0;
          }
        }

        const sx = ((t * 90) % (canvas.width + 120)) - 60;
        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 12;
        ctx.fillRect(sx, 50, 24, 3);
        ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
        ctx.fillRect(sx - 30, 50, 30, 3);
        ctx.shadowBlur = 0;

      } else if (item.id === 'night-drive') {
        ctx.fillStyle = '#030510';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Asphalt Road wedge
        ctx.fillStyle = '#090c18';
        ctx.beginPath();
        ctx.moveTo(canvas.width * 0.46, canvas.height * 0.42);
        ctx.lineTo(canvas.width * 0.54, canvas.height * 0.42);
        ctx.lineTo(canvas.width * 0.96, canvas.height);
        ctx.lineTo(canvas.width * 0.04, canvas.height);
        ctx.closePath();
        ctx.fill();

        // Yellow dashes
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        const dy = (t * 70) % 24;
        for (let y = canvas.height * 0.45 + dy; y < canvas.height; y += 24) {
          ctx.moveTo(canvas.width * 0.5, y);
          ctx.lineTo(canvas.width * 0.5, y + 12);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Taillights ahead
        ctx.fillStyle = '#ff0037';
        ctx.shadowColor = '#ff0037';
        ctx.shadowBlur = 14;
        ctx.fillRect(canvas.width * 0.5 - 14, canvas.height - 28, 8, 4);
        ctx.fillRect(canvas.width * 0.5 + 6, canvas.height - 28, 8, 4);
        ctx.shadowBlur = 0;

      } else if (item.id === 'space') {
        ctx.fillStyle = '#02030a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < 40; i++) {
          ctx.fillStyle = i % 3 === 0 ? '#38bdf8' : '#ffffff';
          ctx.fillRect((i * 47) % canvas.width, (i * 29) % canvas.height, 1.2, 1.2);
        }

        const px = canvas.width * 0.52;
        const py = canvas.height * 0.52;
        const pr = 40;

        const planetGrad = ctx.createRadialGradient(px - 14, py - 14, 4, px, py, pr);
        planetGrad.addColorStop(0, '#7dd3fc');
        planetGrad.addColorStop(0.4, '#0284c7');
        planetGrad.addColorStop(1, '#020617');

        ctx.fillStyle = planetGrad;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = 'rgba(186, 230, 253, 0.6)';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(px, py, pr * 1.9, pr * 0.45, -0.38, 0, Math.PI * 2);
        ctx.stroke();

      } else if (item.id === 'rainy-window') {
        ctx.fillStyle = '#030814';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const bColors = ['#f59e0b', '#38bdf8', '#f43f5e', '#10b981'];
        for (let b = 0; b < 6; b++) {
          ctx.fillStyle = bColors[b % bColors.length] + '40';
          ctx.beginPath();
          ctx.arc((b * 65 + 30) % canvas.width, (b * 50 + 25) % canvas.height, 24, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.strokeStyle = 'rgba(224, 242, 254, 0.6)';
        ctx.lineWidth = 1.8;
        for (let i = 0; i < 10; i++) {
          const rx = (i * 40 + 15);
          const ry = ((t * 80 + i * 40) % (canvas.height + 30)) - 15;
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 2, ry + 20);
          ctx.stroke();
        }

      } else if (item.id === 'fireplace') {
        ctx.fillStyle = '#060302';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let f = -1; f <= 1; f++) {
          const fx = canvas.width * 0.5 + f * 18;
          const fy = canvas.height * 0.65 + Math.sin(t * 8 + f) * 6;
          ctx.fillStyle = '#ea580c';
          ctx.shadowColor = '#f97316';
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.moveTo(fx - 14, canvas.height * 0.82);
          ctx.quadraticCurveTo(fx, fy - 30, fx + 14, canvas.height * 0.82);
          ctx.fill();
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.moveTo(fx - 8, canvas.height * 0.82);
          ctx.quadraticCurveTo(fx, fy - 16, fx + 8, canvas.height * 0.82);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

      } else if (item.id === 'northern-lights') {
        ctx.fillStyle = '#020612';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
        ctx.beginPath();
        ctx.moveTo(0, canvas.height * 0.7);
        for (let x = 0; x <= canvas.width; x += 15) {
          ctx.lineTo(x, canvas.height * 0.35 + Math.sin(x * 0.025 + t * 2) * 22);
        }
        ctx.lineTo(canvas.width, canvas.height * 0.75);
        ctx.lineTo(0, canvas.height * 0.75);
        ctx.fill();

      } else {
        ctx.fillStyle = '#050713';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.7)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(canvas.width * 0.5, canvas.height * 0.5, 32 + Math.sin(t * 2) * 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [item.id]);

  const handleLaunch = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectMode(item.id);
    startScreensaver();
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(item.id);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="conic-border-box group relative"
      style={{
        perspective: 1000,
        ['--theme-glow' as any]: theme.primary,
        ['--theme-glow-sec' as any]: theme.secondary
      }}
    >
      {/* Dynamic Conic Glow on Hover */}
      <div className="conic-border-glow">
        <div className="conic-spinner-core" />
      </div>

      <motion.div
        onClick={() => selectMode(item.id)}
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
          scale: isHovered ? 1.02 : 1
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        style={{ transformStyle: 'preserve-3d' }}
        className={`relative rounded-2xl flex flex-col justify-between overflow-hidden cursor-pointer transition-all duration-300 ${
          isSelected
            ? 'bg-[#151a2d]/95 border-2 border-sky-400 shadow-[0_0_35px_rgba(56,189,248,0.35)]'
            : 'bg-[#0f1322]/85 border border-white/[0.1] hover:border-white/30 hover:bg-[#14192b]'
        } backdrop-blur-xl shadow-xl`}
      >
        {/* Cursor-following Dynamic Light Glare */}
        {isHovered && (
          <div
            className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle 160px at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.12), transparent 80%)`
            }}
          />
        )}

        {/* Top Accent Strip */}
        <div
          className="h-1 w-full transition-opacity duration-300"
          style={{
            background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
            opacity: isSelected || isHovered ? 1 : 0.45
          }}
        />

        {/* Canvas Preview Container */}
        <div className="relative w-full h-44 overflow-hidden bg-black/90 border-b border-white/[0.08]">
          <canvas ref={canvasRef} className="w-full h-full object-cover" />

          {/* Badges Overlay */}
          <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-10">
            <span
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold tracking-wider uppercase backdrop-blur-md border ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder} shadow-md`}
            >
              {item.engine}
            </span>

            <div className="flex items-center gap-1.5 pointer-events-auto">
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleFavorite}
                className={`p-1.5 rounded-lg backdrop-blur-md border transition-colors shadow-sm cursor-pointer ${
                  isFavorite
                    ? 'bg-amber-500/25 border-amber-400/50 text-amber-300'
                    : 'bg-black/60 border-white/15 text-slate-400 hover:text-white'
                }`}
                title="Bookmark Environment"
              >
                <Bookmark className="w-3.5 h-3.5 fill-current" />
              </motion.button>

              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  isSelected
                    ? 'bg-sky-400 text-black shadow-[0_0_12px_#38bdf8]'
                    : 'bg-black/60 border border-white/20 text-transparent'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 flex flex-col flex-grow justify-between gap-3.5">
          <div>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-display font-bold text-white tracking-wide group-hover:text-sky-300 transition-colors">
                {item.title}
              </h3>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold border ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}
              >
                {item.tag}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mt-2 line-clamp-2 font-normal">
              {item.description}
            </p>
          </div>

          {/* Card Footer */}
          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-1.5 text-slate-300 text-[11px] font-medium">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>{item.resourceUsage}</span>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLaunch}
                className="btn-laser flex items-center gap-1 px-3 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/35 text-sky-200 border border-sky-400/40 text-[11px] font-display font-bold tracking-wider uppercase transition-all shadow-sm cursor-pointer"
              >
                <Play className="w-3 h-3 fill-current stroke-none" />
                <span>Launch</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
export default ScreensaverCard;
