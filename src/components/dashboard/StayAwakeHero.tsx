import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useWakeLock } from '../../hooks/useWakeLock';
import { useSessionTimer } from '../../hooks/useSessionTimer';
import { SCREENSAVER_CATALOG } from '../../utils/screensaverCatalog';
import { Play, Lock, Unlock, Clock, Sparkles, Shield, Layers, Flame } from 'lucide-react';

export const StayAwakeHero: React.FC = () => {
  const { settings, startScreensaver } = useAppStore();
  const { wakeLockStatus, toggleLock } = useWakeLock();
  const { formattedTime } = useSessionTimer();

  const activeCatalog =
    SCREENSAVER_CATALOG.find((m) => m.id === settings.selectedMode) || SCREENSAVER_CATALOG[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      className="relative rounded-3xl p-6 sm:p-9 bg-gradient-to-br from-[#12162a]/90 via-[#0e1222]/85 to-[#080b16]/95 border border-white/[0.12] shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-2xl overflow-hidden"
    >
      {/* Background Soft Neon Light Bleed */}
      <div className="absolute top-0 right-0 w-[460px] h-[460px] bg-sky-500/15 rounded-full blur-[110px] pointer-events-none -mr-28 -mt-28" />
      <div className="absolute bottom-0 left-1/3 w-[340px] h-[340px] bg-purple-500/12 rounded-full blur-[90px] pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
        {/* Left Information Content */}
        <div className="space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/15 border border-sky-400/35 text-xs font-mono font-medium text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span className="tracking-wider">STAY AWAKE & DISPLAY CARE ENGINE</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-display font-extrabold tracking-tight text-white leading-tight">
            Keep Screen Awake While You Work
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            Hardware-level keep-awake via the Screen Wake Lock API. Smoothly transitions into full cinematic 3D WebGL or zero-resource OLED sleep environments when idle.
          </p>

          {/* Quick Metrics Badges */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-200 bg-white/[0.04] px-4 py-2 rounded-xl border border-white/[0.09] backdrop-blur-md">
              <Layers className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-slate-400">Target:</span>
              <strong className="text-white font-semibold">{activeCatalog.title}</strong>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-200 bg-white/[0.04] px-4 py-2 rounded-xl border border-white/[0.09] backdrop-blur-md">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">Engine:</span>
              <strong className="text-white font-semibold">{activeCatalog.engine}</strong>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-200 bg-white/[0.04] px-4 py-2 rounded-xl border border-white/[0.09] backdrop-blur-md">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Session:</span>
              <strong className="text-white font-semibold">{formattedTime}</strong>
            </div>
          </div>
        </div>

        {/* Right CTA Interaction Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full lg:w-auto">
          {/* Manual Wake Lock Toggle */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={toggleLock}
            className={`w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl border text-xs font-mono font-semibold transition-all ${
              wakeLockStatus === 'active'
                ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/60 wake-lock-active-halo shadow-[0_0_24px_rgba(16,185,129,0.35)]'
                : 'bg-white/[0.04] text-slate-300 border-white/[0.12] hover:bg-white/[0.08] hover:text-white'
            } backdrop-blur-md cursor-pointer`}
          >
            {wakeLockStatus === 'active' ? (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>WAKE LOCK: ACTIVE</span>
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 text-slate-400" />
                <span>Enable Wake Lock</span>
              </>
            )}
          </motion.button>

          {/* Primary Launch Screensaver CTA with Surface Shine */}
          <motion.button
            whileHover={{ scale: 1.04, boxShadow: '0 0 35px rgba(56,189,248,0.55)' }}
            whileTap={{ scale: 0.96 }}
            onClick={startScreensaver}
            className="btn-shine w-full sm:w-auto flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 text-white text-xs font-display font-bold uppercase tracking-wider shadow-[0_0_30px_rgba(56,189,248,0.4)] border border-sky-300/40 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white stroke-none" />
            <span>Launch Screensaver</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
export default StayAwakeHero;
