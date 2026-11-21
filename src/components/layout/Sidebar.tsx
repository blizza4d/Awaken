import React from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import { NavTab } from '../../types/screensaver';
import {
  LayoutDashboard,
  Tv,
  Zap,
  Bookmark,
  Settings,
  Sparkles,
  ShieldCheck,
  Activity
} from 'lucide-react';

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

export const Sidebar: React.FC = () => {
  const { currentTab, setCurrentTab, settings, setSettingsModalOpen } = useAppStore();

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'screensavers', label: 'Screensavers', icon: Tv, badge: '10' },
    { id: 'stay-awake', label: 'Stay Awake', icon: Zap },
    { id: 'favorites', label: 'Favorites', icon: Bookmark, badge: settings.favorites.length > 0 ? settings.favorites.length.toString() : undefined },
    { id: 'settings', label: 'Preferences', icon: Settings }
  ];

  const handleNavClick = (id: NavTab) => {
    if (id === 'settings') {
      setSettingsModalOpen(true);
    } else {
      setCurrentTab(id);
    }
  };

  return (
    <aside className="w-64 h-screen bg-[#070914]/85 border-r border-white/[0.09] flex flex-col justify-between p-4 flex-shrink-0 select-none backdrop-blur-2xl z-20">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <motion.div
            whileHover={{ rotate: 180, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-400 via-blue-600 to-indigo-600 flex items-center justify-center shadow-[0_0_24px_rgba(56,189,248,0.5)] border border-sky-300/40 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-display font-extrabold tracking-wider text-white">
                AWAKEN
              </h1>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">
                PRO 4.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-tight">Cinematic Display Suite</p>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="space-y-1.5">
          <div className="px-3 py-1 text-[10px] uppercase tracking-widest font-mono text-slate-400 font-bold">
            WORKSPACE NAVIGATION
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id && item.id !== 'settings';
            return (
              <motion.button
                key={item.id}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleNavClick(item.id)}
                className={`relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 overflow-hidden ${
                  isActive
                    ? 'text-white font-semibold bg-gradient-to-r from-sky-500/20 via-sky-500/10 to-transparent border border-sky-500/35 shadow-[0_0_20px_rgba(56,189,248,0.15)]'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.05] border border-transparent'
                }`}
              >
                {/* Active Indicator Bar on Left Border */}
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarIndicator"
                    className="absolute left-0 inset-y-1.5 w-1 rounded-r-full bg-gradient-to-b from-sky-300 to-blue-500 shadow-[0_0_12px_#38bdf8]"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}

                <div className="flex items-center gap-3 z-10 pl-1">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-sky-400' : 'text-slate-400 group-hover:text-white'
                    }`}
                  />
                  <span className="tracking-wide">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold z-10 ${
                      isActive
                        ? 'bg-sky-500/30 text-sky-200 border border-sky-400/40'
                        : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* OLED & Hardware Protection Status Widget */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] space-y-2.5 backdrop-blur-md">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-200 flex items-center gap-2 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            OLED Pixel Care
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            ACTIVE
          </span>
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          Dynamic subpixel translation active to eliminate static phosphor retention.
        </p>
        <div className="flex items-center justify-between pt-1 border-t border-white/[0.06] text-[10px] font-mono text-slate-400">
          <span>Engine Drift:</span>
          <span className="text-sky-300 font-semibold">±2px / 60s</span>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
