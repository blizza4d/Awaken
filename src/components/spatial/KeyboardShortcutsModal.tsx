import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpatialStore } from '../../store/useSpatialStore';
import { Keyboard, X, Sparkles } from 'lucide-react';

const SHORTCUTS = [
  { key: '← / →', label: 'Previous / Next screensaver', category: 'Navigation' },
  { key: 'Space', label: 'Pause / Resume scene motion', category: 'Playback' },
  { key: 'F', label: 'Toggle Fullscreen display', category: 'Display' },
  { key: 'H', label: 'Toggle No-HUD / Pure Cinema mode', category: 'Display' },
  { key: 'M', label: 'Toggle Ambient Audio Soundscape', category: 'Audio' },
  { key: 'O', label: 'Instant OLED Void standby (0% GPU)', category: 'Power' },
  { key: '?', label: 'Open / Close Shortcuts guide', category: 'Help' },
  { key: 'Esc', label: 'Close modals / Restore HUD', category: 'System' },
];

export const KeyboardShortcutsModal: React.FC = () => {
  const { shortcutsOpen, setShortcutsOpen } = useSpatialStore();

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && shortcutsOpen) {
        setShortcutsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcutsOpen, setShortcutsOpen]);

  return (
    <AnimatePresence>
      {shortcutsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShortcutsOpen(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ type: 'spring', damping: 26, stiffness: 340 }}
            className="relative w-[min(92vw,480px)] rounded-3xl p-6 sm:p-7 bg-zinc-950/90 border border-white/15 text-white shadow-2xl backdrop-blur-xl z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                  <Keyboard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base tracking-tight text-white flex items-center gap-2">
                    Keyboard Command Sheet
                    <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                  </h3>
                  <p className="font-mono text-[10px] text-slate-400 tracking-wider uppercase">
                    Desktop Quick Controls
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShortcutsOpen(false)}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
                aria-label="Close shortcuts modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Shortcut Grid */}
            <div className="mt-4 space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {SHORTCUTS.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.04] border border-white/8 hover:bg-white/[0.08] transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-lg bg-white/10 text-slate-300">
                      {s.category}
                    </span>
                    <span className="text-xs text-slate-200 font-medium">{s.label}</span>
                  </div>
                  <kbd className="px-2.5 py-1 rounded-xl bg-black/60 border border-white/20 font-mono text-[11px] font-bold text-cyan-300 shadow-inner">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-5 pt-3.5 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-200">?</kbd> anytime to toggle</span>
              <span className="text-emerald-400/80">Awaken v2.5</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default KeyboardShortcutsModal;
