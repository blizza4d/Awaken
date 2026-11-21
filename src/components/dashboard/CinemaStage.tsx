import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useWakeLock } from '../../hooks/useWakeLock';
import { SCREENSAVER_CATALOG } from '../../utils/screensaverCatalog';
import { audioSynthesizer } from '../../utils/audioSynthesis';
import {
  Play,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Sparkles,
  Cpu,
  Layers,
  Radio,
  Clock,
  ShieldCheck,
  Flame
} from 'lucide-react';

export const CinemaStage: React.FC = () => {
  const {
    settings,
    selectMode,
    startScreensaver,
    updateSetting
  } = useAppStore();
  const { wakeLockStatus, toggleLock } = useWakeLock();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [stageHovered, setStageHovered] = useState(false);

  const activeModeId = settings.selectedMode;
  const currentItem =
    SCREENSAVER_CATALOG.find((m) => m.id === activeModeId) || SCREENSAVER_CATALOG[0];
  const currentIndex = SCREENSAVER_CATALOG.findIndex((m) => m.id === activeModeId);

  // Cycle Next & Previous
  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % SCREENSAVER_CATALOG.length;
    selectMode(SCREENSAVER_CATALOG[nextIdx].id);
  };

  const handlePrev = () => {
    const prevIdx = (currentIndex - 1 + SCREENSAVER_CATALOG.length) % SCREENSAVER_CATALOG.length;
    selectMode(SCREENSAVER_CATALOG[prevIdx].id);
  };

  // Toggle ambient sound for this scene
  const toggleSoundscape = () => {
    if (isPlayingAudio) {
      audioSynthesizer.stop();
      setIsPlayingAudio(false);
    } else {
      audioSynthesizer.play(activeModeId, settings.soundVolume);
      setIsPlayingAudio(true);
    }
  };

  // Stop audio on unmount or mode change
  useEffect(() => {
    if (isPlayingAudio) {
      audioSynthesizer.play(activeModeId, settings.soundVolume);
    }
    return () => {
      audioSynthesizer.stop();
    };
  }, [activeModeId]);

  // High-Resolution Live Canvas Simulation for Cinema Stage
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 960;
    canvas.height = 500;
    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.025;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (activeModeId === 'minimal') {
        // OLED Minimal Mode
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Matrix subtle grid
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.05)';
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }

        // Phosphor Green OLED HUD
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];
        ctx.fillStyle = '#10b981';
        ctx.font = '700 72px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 24;
        ctx.fillText(timeStr, canvas.width / 2, canvas.height / 2 + 10);
        ctx.shadowBlur = 0;

        ctx.fillStyle = 'rgba(52, 211, 153, 0.8)';
        ctx.font = '600 13px "JetBrains Mono", monospace';
        ctx.fillText('• 0% GPU OLED BURN-IN SAFE REFRESH (1/MIN) •', canvas.width / 2, canvas.height / 2 + 65);

      } else if (activeModeId === 'cyberpunk') {
        // Cyberpunk Metropolis
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#020008');
        grad.addColorStop(0.55, '#120526');
        grad.addColorStop(1, '#020005');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Perspective grid lines at ground
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
        ctx.lineWidth = 1.5;
        const groundY = canvas.height * 0.72;
        for (let x = -canvas.width * 0.5; x <= canvas.width * 1.5; x += 60) {
          ctx.beginPath();
          ctx.moveTo(canvas.width * 0.5, groundY);
          ctx.lineTo(x, canvas.height);
          ctx.stroke();
        }
        for (let y = groundY; y < canvas.height; y += 18) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(canvas.width, y);
          ctx.stroke();
        }

        // Procedural Skyscrapers
        for (let i = 0; i < 18; i++) {
          const bx = i * 58 - 30;
          const bh = 140 + Math.sin(i * 1.8) * 90;
          const bw = 50;

          // Building shadow body
          ctx.fillStyle = '#0b0417';
          ctx.fillRect(bx, groundY - bh, bw, bh + 40);

          // Glowing matrix windows
          for (let wy = groundY - bh + 14; wy < groundY - 10; wy += 14) {
            for (let wx = bx + 8; wx < bx + bw - 10; wx += 12) {
              const lit = (i * 7 + wy * 3 + Math.floor(t * 1.8)) % 5 === 0;
              if (lit) {
                const color = i % 2 === 0 ? '#00f0ff' : '#f43f5e';
                ctx.fillStyle = color;
                ctx.shadowColor = color;
                ctx.shadowBlur = 8;
                ctx.fillRect(wx, wy, 6, 8);
                ctx.shadowBlur = 0;
              }
            }
          }

          // Rooftop communication antenna & strobe
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(bx + bw / 2, groundY - bh);
          ctx.lineTo(bx + bw / 2, groundY - bh - 24);
          ctx.stroke();

          // Blinking red beacon
          if (Math.sin(t * 4 + i) > 0.3) {
            ctx.fillStyle = '#f43f5e';
            ctx.shadowColor = '#f43f5e';
            ctx.shadowBlur = 14;
            ctx.beginPath();
            ctx.arc(bx + bw / 2, groundY - bh - 24, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }

        // Flying Spinners with Neon Contrails
        for (let s = 0; s < 3; s++) {
          const spX = ((t * 120 + s * 340) % (canvas.width + 200)) - 100;
          const spY = 90 + s * 45 + Math.sin(t * 2 + s) * 12;
          const trailColor = s % 2 === 0 ? '#00f0ff' : '#f43f5e';

          ctx.fillStyle = trailColor;
          ctx.shadowColor = trailColor;
          ctx.shadowBlur = 16;
          ctx.fillRect(spX, spY, 32, 4);

          // Contrail
          const trailGrad = ctx.createLinearGradient(spX - 70, spY, spX, spY);
          trailGrad.addColorStop(0, 'transparent');
          trailGrad.addColorStop(1, trailColor);
          ctx.fillStyle = trailGrad;
          ctx.fillRect(spX - 70, spY, 70, 4);
          ctx.shadowBlur = 0;
        }

      } else if (activeModeId === 'night-drive') {
        // Highway Night Drive
        ctx.fillStyle = '#02040c';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Starfield
        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        for (let i = 0; i < 40; i++) {
          ctx.fillRect((i * 47) % canvas.width, (i * 23) % (canvas.height * 0.45), 1.5, 1.5);
        }

        // Distant city skyline glow at horizon
        const horizGrad = ctx.createLinearGradient(0, canvas.height * 0.35, 0, canvas.height * 0.48);
        horizGrad.addColorStop(0, 'rgba(245, 158, 11, 0)');
        horizGrad.addColorStop(1, 'rgba(245, 158, 11, 0.25)');
        ctx.fillStyle = horizGrad;
        ctx.fillRect(0, canvas.height * 0.35, canvas.width, canvas.height * 0.13);

        // Asphalt Road
        ctx.fillStyle = '#080a14';
        ctx.beginPath();
        ctx.moveTo(canvas.width * 0.47, canvas.height * 0.45);
        ctx.lineTo(canvas.width * 0.53, canvas.height * 0.45);
        ctx.lineTo(canvas.width * 0.98, canvas.height);
        ctx.lineTo(canvas.width * 0.02, canvas.height);
        ctx.closePath();
        ctx.fill();

        // Dashed Centerline
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        const dOffset = (t * 110) % 36;
        for (let y = canvas.height * 0.46 + dOffset; y < canvas.height; y += 36) {
          ctx.moveTo(canvas.width * 0.5, y);
          ctx.lineTo(canvas.width * 0.5, y + 18);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Streetlights swooping past
        for (let l = 0; l < 6; l++) {
          const lProgress = ((t * 90 + l * 60) % (canvas.height * 0.55)) / (canvas.height * 0.55);
          const ly = canvas.height * 0.45 + lProgress * (canvas.height * 0.55);
          const lx = canvas.width * 0.5 - (canvas.width * 0.48) * lProgress;
          const rx = canvas.width * 0.5 + (canvas.width * 0.48) * lProgress;

          // Left light pole & bulb
          ctx.fillStyle = '#fde047';
          ctx.shadowColor = '#fde047';
          ctx.shadowBlur = 18;
          ctx.beginPath();
          ctx.arc(lx, ly - 20, 3 + lProgress * 4, 0, Math.PI * 2);
          ctx.arc(rx, ly - 20, 3 + lProgress * 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Taillights of Traffic Ahead
        const carY = canvas.height - 55;
        ctx.fillStyle = '#ff003c';
        ctx.shadowColor = '#ff003c';
        ctx.shadowBlur = 24;
        ctx.fillRect(canvas.width * 0.5 - 28, carY, 14, 6);
        ctx.fillRect(canvas.width * 0.5 + 14, carY, 14, 6);
        ctx.shadowBlur = 0;

      } else if (activeModeId === 'space') {
        // Deep Space Explorer
        ctx.fillStyle = '#010208';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Twinkling stars with spectral colors
        for (let i = 0; i < 90; i++) {
          const sx = (i * 67 + Math.sin(t + i) * 5) % canvas.width;
          const sy = (i * 41) % canvas.height;
          const sz = i % 4 === 0 ? 2.2 : 1.2;
          ctx.fillStyle = i % 3 === 0 ? '#38bdf8' : (i % 5 === 0 ? '#c084fc' : '#ffffff');
          ctx.fillRect(sx, sy, sz, sz);
        }

        // Nebula cloud
        const nebGrad = ctx.createRadialGradient(canvas.width * 0.7, canvas.height * 0.4, 10, canvas.width * 0.7, canvas.height * 0.4, 250);
        nebGrad.addColorStop(0, 'rgba(168, 85, 247, 0.22)');
        nebGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.12)');
        nebGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = nebGrad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Huge Detailed Gas Giant Planet
        const px = canvas.width * 0.52;
        const py = canvas.height * 0.52;
        const pr = 110;

        const pGrad = ctx.createRadialGradient(px - 40, py - 40, 15, px, py, pr);
        pGrad.addColorStop(0, '#bae6fd');
        pGrad.addColorStop(0.3, '#0284c7');
        pGrad.addColorStop(0.7, '#0f172a');
        pGrad.addColorStop(1, '#020617');

        ctx.fillStyle = pGrad;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 35;
        ctx.beginPath();
        ctx.arc(px, py, pr, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Banded planet atmosphere
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.lineWidth = 6;
        for (let b = -40; b <= 40; b += 20) {
          ctx.beginPath();
          ctx.arc(px, py, pr - Math.abs(b) * 0.2, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Majestic Planetary Rings
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.65)';
        ctx.lineWidth = 9;
        ctx.shadowColor = '#7dd3fc';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.ellipse(px, py, pr * 2.2, pr * 0.48, -0.32, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

      } else if (activeModeId === 'rainy-window') {
        // Rainy Window & City Bokeh
        ctx.fillStyle = '#030612';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Out-of-focus city bokeh lights
        const bColors = ['#f59e0b', '#38bdf8', '#f43f5e', '#10b981', '#a855f7'];
        for (let b = 0; b < 14; b++) {
          const bx = (b * 80 + 40) % canvas.width;
          const by = (b * 65 + 30) % canvas.height;
          const br = 45 + (b % 4) * 15;

          const bGrad = ctx.createRadialGradient(bx, by, 5, bx, by, br);
          bGrad.addColorStop(0, bColors[b % bColors.length] + '55');
          bGrad.addColorStop(0.7, bColors[b % bColors.length] + '18');
          bGrad.addColorStop(1, 'transparent');

          ctx.fillStyle = bGrad;
          ctx.beginPath();
          ctx.arc(bx, by, br, 0, Math.PI * 2);
          ctx.fill();
        }

        // Running water trails down glass
        ctx.strokeStyle = 'rgba(224, 242, 254, 0.6)';
        ctx.lineWidth = 2.2;
        for (let i = 0; i < 20; i++) {
          const rx = (i * 52 + 25);
          const ry = ((t * 110 + i * 55) % (canvas.height + 40)) - 20;

          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 3, ry + 28);
          ctx.stroke();

          // Droplet lens reflection
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.beginPath();
          ctx.arc(rx - 3, ry + 28, 2.8, 0, Math.PI * 2);
          ctx.fill();
        }

      } else if (activeModeId === 'fireplace') {
        // Fireplace & Winter Cabin
        ctx.fillStyle = '#070302';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Warm radial light bloom
        const hGlow = ctx.createRadialGradient(canvas.width * 0.5, canvas.height * 0.75, 20, canvas.width * 0.5, canvas.height * 0.75, 240);
        hGlow.addColorStop(0, 'rgba(249, 115, 22, 0.5)');
        hGlow.addColorStop(0.5, 'rgba(234, 88, 12, 0.2)');
        hGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = hGlow;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Fire logs
        ctx.fillStyle = '#1c0d05';
        ctx.fillRect(canvas.width * 0.5 - 110, canvas.height * 0.8, 220, 28);

        // Multi-layered dancing flame tongues
        for (let f = -3; f <= 3; f++) {
          const fx = canvas.width * 0.5 + f * 26;
          const fy = canvas.height * 0.65 + Math.sin(t * 9 + f * 1.5) * 14;

          // Outer flame
          ctx.fillStyle = '#ea580c';
          ctx.shadowColor = '#f97316';
          ctx.shadowBlur = 24;
          ctx.beginPath();
          ctx.moveTo(fx - 24, canvas.height * 0.8);
          ctx.quadraticCurveTo(fx, fy - 60, fx + 24, canvas.height * 0.8);
          ctx.fill();

          // Inner flame
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.moveTo(fx - 14, canvas.height * 0.8);
          ctx.quadraticCurveTo(fx, fy - 35, fx + 14, canvas.height * 0.8);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Drifting ember particles
        ctx.fillStyle = '#facc15';
        for (let e = 0; e < 16; e++) {
          const ex = canvas.width * 0.5 + Math.sin(t * 3 + e) * 70;
          const ey = canvas.height * 0.8 - ((t * 60 + e * 45) % 180);
          ctx.fillRect(ex, ey, 2.5, 2.5);
        }

      } else if (activeModeId === 'northern-lights') {
        // Northern Lights Aurora
        ctx.fillStyle = '#02050f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Stars
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let s = 0; s < 50; s++) {
          ctx.fillRect((s * 53) % canvas.width, (s * 29) % (canvas.height * 0.6), 1.5, 1.5);
        }

        // Multiple sinusoidal emerald and violet ribbons
        for (let r = 0; r < 3; r++) {
          const aGrad = ctx.createLinearGradient(0, canvas.height * 0.15, 0, canvas.height * 0.7);
          if (r % 2 === 0) {
            aGrad.addColorStop(0, 'rgba(16, 185, 129, 0)');
            aGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.45)');
            aGrad.addColorStop(1, 'rgba(52, 211, 153, 0)');
          } else {
            aGrad.addColorStop(0, 'rgba(168, 85, 247, 0)');
            aGrad.addColorStop(0.5, 'rgba(139, 92, 246, 0.38)');
            aGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
          }

          ctx.fillStyle = aGrad;
          ctx.beginPath();
          ctx.moveTo(0, canvas.height * 0.7);
          for (let x = 0; x <= canvas.width; x += 20) {
            const wave = Math.sin(x * 0.015 + t * 2 + r * 1.5) * 45;
            ctx.lineTo(x, canvas.height * 0.35 + wave + r * 25);
          }
          ctx.lineTo(canvas.width, canvas.height * 0.75);
          ctx.lineTo(0, canvas.height * 0.75);
          ctx.closePath();
          ctx.fill();
        }

        // Mountain Horizon Silhouette
        ctx.fillStyle = '#050a18';
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        ctx.lineTo(canvas.width * 0.25, canvas.height * 0.65);
        ctx.lineTo(canvas.width * 0.5, canvas.height * 0.75);
        ctx.lineTo(canvas.width * 0.78, canvas.height * 0.6);
        ctx.lineTo(canvas.width, canvas.height);
        ctx.closePath();
        ctx.fill();

      } else {
        // Digital Zen / Aquarium / Mountain Default Canvas
        ctx.fillStyle = '#040714';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width * 0.5;
        const cy = canvas.height * 0.5;

        // Concentric mandalas
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(cx, cy, 75 + Math.sin(t * 2) * 10, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(168, 85, 247, 0.7)';
        ctx.beginPath();
        ctx.arc(cx, cy, 45 - Math.sin(t * 2) * 6, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, cy, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [activeModeId]);

  return (
    <div
      onMouseEnter={() => setStageHovered(true)}
      onMouseLeave={() => setStageHovered(false)}
      className="relative w-full rounded-3xl overflow-hidden glass-card-stage border border-white/15 transition-all duration-500"
    >
      {/* 1. Canvas Viewport Display */}
      <div className="relative w-full h-[460px] sm:h-[520px] overflow-hidden bg-black/95">
        <canvas ref={canvasRef} className="w-full h-full object-cover" />

        {/* Dynamic Vignette & Ambient Shading */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080b16] via-transparent to-black/60 pointer-events-none" />

        {/* 2. Top HUD Telemetry Bar */}
        <div className="absolute top-5 inset-x-6 flex items-center justify-between pointer-events-none z-20">
          {/* Active Engine Badge */}
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-black/65 backdrop-blur-xl border border-white/15 text-xs font-mono shadow-xl pointer-events-auto">
            <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span className="text-slate-400 uppercase tracking-widest text-[10px]">ENGINE:</span>
            <span className="text-white font-bold">{currentItem.engine}</span>
          </div>

          {/* Quick Hardware Telemetry */}
          <div className="flex items-center gap-2.5">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/65 backdrop-blur-xl border border-white/15 text-xs font-mono text-emerald-300 shadow-xl pointer-events-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>60.0 FPS LOCKED</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleLock}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-mono border backdrop-blur-xl shadow-xl pointer-events-auto cursor-pointer ${
                wakeLockStatus === 'active'
                  ? 'bg-emerald-950/60 border-emerald-400 text-emerald-300 wake-lock-halo'
                  : 'bg-black/65 border-white/15 text-slate-400 hover:text-white'
              }`}
            >
              {wakeLockStatus === 'active' ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>WAKE LOCK: ACTIVE</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5 text-slate-400" />
                  <span>WAKE LOCK: IDLE</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* 3. Navigation Chevron Paddles (Left / Right) */}
        <div className="absolute inset-y-0 inset-x-4 flex items-center justify-between pointer-events-none z-20">
          <motion.button
            whileHover={{ scale: 1.15, x: -3 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePrev}
            className="p-3 rounded-2xl bg-black/60 hover:bg-black/85 text-white/70 hover:text-white border border-white/15 backdrop-blur-xl shadow-2xl pointer-events-auto transition-colors cursor-pointer"
            title="Previous Scene"
          >
            <ChevronLeft className="w-6 h-6" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.15, x: 3 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleNext}
            className="p-3 rounded-2xl bg-black/60 hover:bg-black/85 text-white/70 hover:text-white border border-white/15 backdrop-blur-xl shadow-2xl pointer-events-auto transition-colors cursor-pointer"
            title="Next Scene"
          >
            <ChevronRight className="w-6 h-6" />
          </motion.button>
        </div>

        {/* 4. Bottom Information & Control Dashboard */}
        <div className="absolute bottom-6 inset-x-6 z-20 flex flex-col md:flex-row items-end justify-between gap-6 pointer-events-auto">
          {/* Left: Title, Tag, and Description */}
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase bg-sky-500/20 text-sky-300 border border-sky-400/40 shadow-md">
                {currentItem.tag}
              </span>
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                {currentItem.resourceUsage}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight drop-shadow-md">
              {currentItem.title}
            </h1>

            <p className="text-sm text-slate-300 line-clamp-2 leading-relaxed">
              {currentItem.description}
            </p>
          </div>

          {/* Right: Soundscape Visualizer & Giant Launch CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full md:w-auto">
            {/* Ambient Soundscape Toggle with Live Animated Waveform */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={toggleSoundscape}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-xs font-mono backdrop-blur-xl transition-all cursor-pointer ${
                isPlayingAudio
                  ? 'bg-sky-500/20 border-sky-400 text-sky-200 shadow-[0_0_20px_rgba(56,189,248,0.3)]'
                  : 'bg-black/65 border-white/15 text-slate-400 hover:text-white hover:bg-black/80'
              }`}
              title="Toggle Generative Ambient Soundscape"
            >
              {isPlayingAudio ? (
                <>
                  <Volume2 className="w-4 h-4 text-sky-400" />
                  <div className="flex items-center gap-1 h-4">
                    <span className="audio-bar" style={{ animationDelay: '0s' }} />
                    <span className="audio-bar" style={{ animationDelay: '0.2s' }} />
                    <span className="audio-bar" style={{ animationDelay: '0.4s' }} />
                    <span className="audio-bar" style={{ animationDelay: '0.1s' }} />
                  </div>
                  <span>AUDIO ACTIVE</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>PREVIEW AUDIO</span>
                </>
              )}
            </motion.button>

            {/* Giant High-Impact Launch Button with Laser Sheen */}
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 38px rgba(56,189,248,0.6)' }}
              whileTap={{ scale: 0.95 }}
              onClick={startScreensaver}
              className="btn-laser w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 text-white font-display font-extrabold text-sm uppercase tracking-wider shadow-[0_0_28px_rgba(56,189,248,0.45)] border border-sky-300/40 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white stroke-none" />
              <span>LAUNCH FULLSCREEN</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CinemaStage;
