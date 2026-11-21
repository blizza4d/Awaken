import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { useWakeLock } from '../../hooks/useWakeLock';
import { useFullscreen } from '../../hooks/useFullscreen';
import { NavTab } from '../../types/screensaver';
import {
  Sparkles,
  Lock,
  Unlock,
  Maximize2,
  Minimize2,
  Settings as SettingsIcon,
  Play,
  Tv,
  Zap,
  Bookmark,
  LayoutDashboard
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentTab,
    setCurrentTab,
    startScreensaver,
    setSettingsModalOpen
  } = useAppStore();

  const { wakeLockStatus, toggleLock } = useWakeLock();
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const navLinks: { id: NavTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Theater', icon: LayoutDashboard },
    { id: 'screensavers', label: 'Scenes', icon: Tv },
    { id: 'stay-awake', label: 'Hardware', icon: Zap },
    { id: 'favorites', label: 'Favorites', icon: Bookmark }
  ];

  return (
    <header className="sticky top-0 z-40 w-full px-3 sm:px-6 py-3 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 p-2 sm:px-5 rounded-2xl glass-floating-dock overflow-hidden">
        {/* Brand Logo & Version */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <motion.div
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-400 via-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_0_16px_rgba(56,189,248,0.5)] border border-sky-300/40 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-white" />
          </motion.div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm sm:text-base font-display font-extrabold text-white tracking-wider">
              AWAKEN
            </span>
            <span className="hidden xs:inline-block text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
              PRO 4.0
            </span>
          </div>
        </div>

        {/* Center: Navigation Segmented Tabs */}
        <nav className="flex items-center p-1 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentTab === link.id;
            return (
              <motion.button
                key={link.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCurrentTab(link.id)}
                className={`relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeDockPill"
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-sky-500/30 to-blue-600/30 border border-sky-400/40 shadow-[0_0_10px_rgba(56,189,248,0.25)]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className={`w-3.5 h-3.5 z-10 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                <span className="z-10 hidden sm:inline">{link.label}</span>
              </motion.button>
            );
          })}
        </nav>

        {/* Right: Actions Cluster */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
          {/* Wake Lock Mini Pill */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={toggleLock}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-mono border transition-all cursor-pointer ${
              wakeLockStatus === 'active'
                ? 'bg-emerald-950/60 border-emerald-400/60 text-emerald-300 wake-lock-halo'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
            title="Toggle Hardware Screen Wake Lock API"
          >
            {wakeLockStatus === 'active' ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-bold text-emerald-300">ACTIVE</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                <span className="text-[11px] text-slate-400">IDLE</span>
              </>
            )}
          </motion.button>

          {/* Fullscreen & Settings Icon Capsule */}
          <div className="flex items-center p-0.5 sm:p-1 rounded-xl bg-white/5 border border-white/10 gap-0.5">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Fullscreen Mode (F)"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-sky-400" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 30 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSettingsModalOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Settings (S)"
            >
              <SettingsIcon className="w-3.5 h-3.5" />
            </motion.button>
          </div>

          {/* Primary Quick Launch Button */}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(56,189,248,0.5)' }}
            whileTap={{ scale: 0.95 }}
            onClick={startScreensaver}
            className="btn-laser flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 text-white font-display font-bold text-xs uppercase tracking-wider shadow-[0_0_14px_rgba(56,189,248,0.35)] border border-sky-300/40 cursor-pointer"
          >
            <Play className="w-3 h-3 fill-white stroke-none" />
            <span className="hidden md:inline">Launch</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
};
export default Header;
