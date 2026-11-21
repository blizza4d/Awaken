import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useWakeLock } from '../../hooks/useWakeLock';
import { useSessionTimer } from '../../hooks/useSessionTimer';
import {
  ShieldCheck,
  Zap,
  Lock,
  Unlock,
  Sun,
  Activity,
  Cpu,
  RotateCcw,
  Clock,
  Sparkles
} from 'lucide-react';

export const HardwareTelemetryHud: React.FC = () => {
  const { settings, updateSetting } = useAppStore();
  const { wakeLockStatus, toggleLock } = useWakeLock();
  const { formattedTime } = useSessionTimer();

  // Simulated live subpixel drift coordinates
  const [driftCoords, setDriftCoords] = useState({ x: 1.4, y: -0.8 });

  useEffect(() => {
    const interval = setInterval(() => {
      setDriftCoords({
        x: Number(((Math.random() - 0.5) * 3).toFixed(1)),
        y: Number(((Math.random() - 0.5) * 3).toFixed(1))
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* 1. Screen Wake Lock Hardware Guard */}
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-display font-bold text-white">Hardware Wake Lock</h3>
              <p className="text-[11px] font-mono text-slate-400">Screen Keep-Alive API</p>
            </div>
          </div>

          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
              wakeLockStatus === 'active'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-white/5 text-slate-400 border-white/10'
            }`}
          >
            {wakeLockStatus === 'active' ? 'ENGAGED' : 'STANDBY'}
          </span>
        </div>

        <div className="my-4 space-y-2 text-xs font-mono">
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Lock Session:</span>
            <span className="font-bold text-white">{formattedTime}</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">Visibility Auto-Reacquire:</span>
            <span className="text-emerald-400 font-semibold">ENABLED</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={toggleLock}
          className={`w-full py-2.5 rounded-xl border text-xs font-mono font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            wakeLockStatus === 'active'
              ? 'bg-emerald-950/50 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
              : 'bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          {wakeLockStatus === 'active' ? (
            <>
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>DISENGAGE WAKE LOCK</span>
            </>
          ) : (
            <>
              <Unlock className="w-3.5 h-3.5 text-slate-400" />
              <span>ENGAGE HARDWARE LOCK</span>
            </>
          )}
        </motion.button>
      </motion.div>

      {/* 2. OLED Anti-Burn-In Orbital Radar */}
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-display font-bold text-white">OLED Care Radar</h3>
              <p className="text-[11px] font-mono text-slate-400">9-Zone Subpixel Drift</p>
            </div>
          </div>

          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-400/40">
            PROTECTING
          </span>
        </div>

        {/* Radar Graphic and telemetry */}
        <div className="my-3 flex items-center justify-between px-2">
          {/* Animated Mini Radar */}
          <div className="relative w-16 h-16 rounded-full border border-sky-400/30 flex items-center justify-center bg-sky-950/20">
            <div className="absolute inset-2 rounded-full border border-sky-400/20" />
            <div className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
            {/* Radar scanner line */}
            <div className="absolute inset-0 rounded-full radar-sweep border-r-2 border-sky-400/60" />
          </div>

          <div className="text-right space-y-1 text-xs font-mono">
            <div className="text-slate-400 text-[10px]">CURRENT DRIFT OFFSET</div>
            <div className="text-white font-bold text-sm tracking-wider">
              ΔX: <span className="text-sky-300">{driftCoords.x > 0 ? `+${driftCoords.x}` : driftCoords.x}px</span>
            </div>
            <div className="text-white font-bold text-sm tracking-wider">
              ΔY: <span className="text-sky-300">{driftCoords.y > 0 ? `+${driftCoords.y}` : driftCoords.y}px</span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Cycle Interval:</span>
          <span className="text-slate-200 font-semibold">{settings.burnInIntervalMinutes} Minutes</span>
        </div>
      </motion.div>

      {/* 3. Output Intensity & Profile Switcher */}
      <motion.div
        whileHover={{ y: -3 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col justify-between"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sun className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-display font-bold text-white">Intensity & Profile</h3>
              <p className="text-[11px] font-mono text-slate-400">Hardware Render Pipeline</p>
            </div>
          </div>

          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-400/40 uppercase">
            {settings.performanceProfile}
          </span>
        </div>

        <div className="my-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-slate-300">Display Dimmer:</span>
            <span className="font-bold text-white">{settings.brightness}%</span>
          </div>
          <input
            type="range"
            min={15}
            max={100}
            value={settings.brightness}
            onChange={(e) => updateSetting('brightness', Number(e.target.value))}
            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-400"
          />
        </div>

        {/* 3 Profile Buttons */}
        <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/5">
          {(['eco', 'balanced', 'cinematic'] as const).map((p) => (
            <button
              key={p}
              onClick={() => updateSetting('performanceProfile', p)}
              className={`py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                settings.performanceProfile === p
                  ? 'bg-purple-500/25 border border-purple-400/60 text-purple-200 shadow-sm'
                  : 'bg-white/5 border border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
export default HardwareTelemetryHud;
