import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { SceneMeta } from '../../engine/types';
import { ArrowUpRight, Cpu, ShieldCheck, Sparkles } from 'lucide-react';

interface SpatialPortalCardProps {
  scene: SceneMeta;
  isActive: boolean;
  index: number;
  onPreview: (id: SceneMeta['id']) => void;
  onLaunch: (id: SceneMeta['id']) => void;
}

export const SpatialPortalCard: React.FC<SpatialPortalCardProps> = ({
  scene,
  isActive,
  index,
  onPreview,
  onLaunch,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);

  // GPU-composited spring physics for 3D magnetic hover tilt & pull
  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const rawShiftX = useMotionValue(0);
  const rawShiftY = useMotionValue(0);

  const springCfg = { stiffness: 260, damping: 22, mass: 0.5 };
  const rotateX = useSpring(rawRotateX, springCfg);
  const rotateY = useSpring(rawRotateY, springCfg);
  const shiftX = useSpring(rawShiftX, springCfg);
  const shiftY = useSpring(rawShiftY, springCfg);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // Update masked conic border & specular glare coordinates directly via CSS variables (0 re-renders)
    el.style.setProperty('--mouse-x', `${px}px`);
    el.style.setProperty('--mouse-y', `${py}px`);

    // Normalized [-1, 1] offsets from center
    const nx = (px / rect.width) * 2 - 1;
    const ny = (py / rect.height) * 2 - 1;

    // Tilt gently toward cursor + subtle magnetic pull
    rawRotateX.set(-ny * 8.5);
    rawRotateY.set(nx * 8.5);
    rawShiftX.set(nx * 7);
    rawShiftY.set(ny * 7);
  };

  const handlePointerEnter = () => {
    onPreview(scene.id);
  };

  const handlePointerLeave = () => {
    rawRotateX.set(0);
    rawRotateY.set(0);
    rawShiftX.set(0);
    rawShiftY.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94, filter: 'blur(14px)' }}
      transition={{
        duration: 0.55,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{ perspective: 1100 }}
      className="w-full"
    >
      <motion.div
        ref={cardRef}
        layoutId={`spatial-portal-${scene.id}`}
        data-active={isActive ? 'true' : 'false'}
        onPointerMove={handlePointerMove}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={() => onLaunch(scene.id)}
        whileTap={{ scale: 0.975 }}
        style={{
          rotateX,
          rotateY,
          x: shiftX,
          y: shiftY,
          ['--accent-primary' as string]: scene.accentPrimary,
          ['--accent-secondary' as string]: scene.accentSecondary,
        }}
        className="spatial-card group cursor-pointer p-6 sm:p-7 flex flex-col justify-between min-h-[310px] sm:min-h-[340px]"
      >
        {/* Subtle chromatic ambient glow bloom inside top of card */}
        <div
          className="absolute -top-20 -right-20 w-56 h-56 rounded-full blur-[80px] pointer-events-none transition-opacity duration-500"
          style={{
            background: `radial-gradient(circle, ${scene.accentPrimary}, transparent 70%)`,
            opacity: isActive ? 0.34 : 0.14,
          }}
        />

        {/* Top Meta Bar */}
        <div className="relative z-10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: scene.accentPrimary,
                boxShadow: `0 0 12px ${scene.accentPrimary}`,
              }}
            />
            <span className="spatial-micro text-slate-300 font-semibold">{scene.category}</span>
          </div>

          <span
            className="spatial-micro px-2.5 py-1 rounded-full border font-semibold backdrop-blur-md"
            style={{
              color: scene.accentPrimary,
              borderColor: `${scene.accentPrimary}55`,
              backgroundColor: `${scene.accentPrimary}18`,
            }}
          >
            {scene.badge}
          </span>
        </div>

        {/* Center Typography & Description */}
        <div className="relative z-10 my-6 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-mono text-white/70">
            <Sparkles className="w-3.5 h-3.5" style={{ color: scene.accentPrimary }} />
            <span>{scene.subtitle}</span>
          </div>

          <h2 className="spatial-card-title">{scene.title}</h2>

          <p className="spatial-card-body">{scene.description}</p>
        </div>

        {/* Bottom Technical Specs & FLIP Launch Trigger */}
        <div className="relative z-10 pt-4 border-t border-white/10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-300/90">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" style={{ color: scene.accentPrimary }} />
              {scene.shaderTech}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-300/90">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {scene.oledProfile}
            </span>

            <div
              className="spatial-btn-sheen flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-display font-semibold tracking-wide text-white border transition-all duration-300 group-hover:translate-x-0.5"
              style={{
                background: isActive
                  ? `linear-gradient(135deg, ${scene.accentPrimary}44, ${scene.accentSecondary}44)`
                  : 'rgba(255, 255, 255, 0.08)',
                borderColor: isActive ? `${scene.accentPrimary}88` : 'rgba(255, 255, 255, 0.18)',
                boxShadow: isActive ? `0 0 24px ${scene.accentPrimary}35` : 'none',
              }}
            >
              <span>Enter</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SpatialPortalCard;
