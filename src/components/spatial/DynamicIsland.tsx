import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpatialStore } from '../../store/useSpatialStore';
import { useSpatialWakeLock } from '../../hooks/useSpatialWakeLock';
import { useFullscreen } from '../../hooks/useFullscreen';
import { SPATIAL_SCENES, getSceneMeta } from '../../engine/sceneCatalog';
import { spatialAudio } from '../../engine/spatialAudio';
import {
  Play,
  LayoutGrid,
  Lock,
  Unlock,
  Settings,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
} from 'lucide-react';

export const DynamicIsland: React.FC = () => {
  const {
    activeScene,
    setActiveScene,
    isImmersed,
    toggleImmersed,
    setImmersed,
    settingsOpen,
    setSettingsOpen,
    audioEnabled,
    setAudioEnabled,
    telemetry,
    noHud,
    toggleNoHud,
    noHudRevealed,
    strictNoHud,
  } = useSpatialStore();

  const { wakeLockStatus, toggleWakeLock } = useSpatialWakeLock();
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const idleTimerRef = useRef<number | null>(null);
  const pillsRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement | null>(null);

  const meta = getSceneMeta(activeScene);
  const isOled = activeScene === 'oled-void' || telemetry.isOledVoid;
  const isHiddenByNoHud = noHud && (strictNoHud || !noHudRevealed);

  // Smoothly auto-center the active pill inside the scrollable dock strip
  useEffect(() => {
    if (activeBtnRef.current) {
      activeBtnRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeScene, isExpanded]);

  // Sync generative Web Audio soundscape with active scene
  useEffect(() => {
    if (audioEnabled) {
      spatialAudio.start(activeScene, 0.42);
    } else {
      spatialAudio.stop();
    }
    return () => {
      if (!useSpatialStore.getState().audioEnabled) {
        spatialAudio.stop();
      }
    };
  }, [audioEnabled, activeScene]);

  // Auto-collapse Dynamic Island into a sleek pill after 3.8s of inactivity
  useEffect(() => {
    const resetIdleTimer = () => {
      setIsExpanded(true);
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current);
      }
      idleTimerRef.current = window.setTimeout(() => {
        if (!useSpatialStore.getState().settingsOpen) {
          setIsExpanded(false);
        }
      }, 3800);
    };

    resetIdleTimer();
    window.addEventListener('pointermove', resetIdleTimer, { passive: true });
    window.addEventListener('keydown', resetIdleTimer);

    return () => {
      window.removeEventListener('pointermove', resetIdleTimer);
      window.removeEventListener('keydown', resetIdleTimer);
      if (idleTimerRef.current !== null) {
        window.clearTimeout(idleTimerRef.current);
      }
    };
  }, [isImmersed]);

  // Keep expanded while hovering or while settings popover is open
  const showExpanded = isExpanded || isHovering || settingsOpen;

  return (
    <div
      className={`fixed bottom-5 sm:bottom-7 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center max-w-[96vw] transition-all duration-500 ${
        isHiddenByNoHud
          ? 'opacity-0 pointer-events-none translate-y-4'
          : 'opacity-100 pointer-events-none translate-y-0'
      }`}
    >
      <motion.div
        layout
        onPointerEnter={() => setIsHovering(true)}
        onPointerLeave={() => setIsHovering(false)}
        onClick={() => {
          if (!showExpanded) setIsExpanded(true);
        }}
        transition={{
          layout: { type: 'spring', stiffness: 380, damping: 32 },
        }}
        style={{
          ['--island-accent' as string]: meta.accentPrimary,
          ['--island-accent-2' as string]: meta.accentSecondary,
        }}
        className={`dynamic-island pointer-events-auto flex items-center rounded-full ${
          showExpanded ? 'px-2.5 sm:px-3.5 py-2 gap-1.5 sm:gap-2.5' : 'px-4 py-2 gap-3 cursor-pointer'
        }`}
      >
        {/* Always-visible chromatic status dot & active scene indicator */}
        <motion.div layout="position" className="flex items-center gap-2 pl-1">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{
              backgroundColor: meta.accentPrimary,
              boxShadow: `0 0 14px ${meta.accentPrimary}`,
            }}
          />
          {!showExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2.5 whitespace-nowrap"
            >
              <span className="font-display font-semibold text-xs text-white tracking-wide">
                {meta.title}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              {isOled ? (
                <span className="font-mono text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  0% GPU • IDLE
                </span>
              ) : (
                <span className="font-mono text-[10px] text-cyan-300 font-semibold">
                  {telemetry.fps} FPS
                </span>
              )}
              {wakeLockStatus === 'active' && (
                <span
                  className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]"
                  title="Screen Wake Lock Active"
                />
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Expanded Dynamic Island Command Controls */}
        <AnimatePresence mode="popLayout">
          {showExpanded && (
            <motion.div
              key="island-controls"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.22 }}
              className="flex items-center gap-1.5 sm:gap-2"
            >
              {/* Scene Switcher Pills with Edge Fade Mask & Wheel Scrolling */}
              <div
                ref={pillsRef}
                onWheel={(e) => {
                  if (pillsRef.current && e.deltaY !== 0) {
                    pillsRef.current.scrollLeft += e.deltaY * 0.85;
                  }
                }}
                style={{
                  maskImage: 'linear-gradient(to right, transparent, black 14px, black calc(100% - 14px), transparent)',
                  WebkitMaskImage: 'linear-gradient(to right, transparent, black 14px, black calc(100% - 14px), transparent)',
                }}
                className="hidden md:flex items-center px-2 py-1 rounded-full bg-white/[0.06] border border-white/10 max-w-[36vw] lg:max-w-[46vw] xl:max-w-[56vw] 2xl:max-w-[66vw] overflow-x-auto scrollbar-none flex-nowrap scroll-smooth"
              >
                {SPATIAL_SCENES.map((s) => {
                  const selected = s.id === activeScene;
                  return (
                    <button
                      key={s.id}
                      ref={selected ? (el) => { activeBtnRef.current = el; } : null}
                      onClick={() => setActiveScene(s.id)}
                      className={`relative px-2.5 py-1 rounded-full text-[11px] font-display font-semibold transition-colors cursor-pointer whitespace-nowrap flex-shrink-0 ${
                        selected ? 'text-white' : 'text-slate-300/75 hover:text-white'
                      }`}
                    >
                      {selected && (
                        <motion.span
                          layoutId="islandActiveScenePill"
                          className="absolute inset-0 rounded-full border"
                          style={{
                            backgroundColor: `${s.accentPrimary}28`,
                            borderColor: `${s.accentPrimary}88`,
                            boxShadow: `0 0 16px ${s.accentPrimary}35`,
                          }}
                          transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-1.5">
                        {s.id === 'oled-void' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        )}
                        {s.title}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="hidden md:block w-px h-5 bg-white/15" />

              {/* Primary Launch / Spaces Toggle */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleImmersed}
                className="spatial-btn-sheen flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-display font-bold tracking-wide text-white border cursor-pointer whitespace-nowrap"
                style={{
                  background: isImmersed
                    ? 'rgba(255, 255, 255, 0.12)'
                    : `linear-gradient(135deg, ${meta.accentPrimary}, ${meta.accentSecondary})`,
                  borderColor: isImmersed ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.35)',
                  boxShadow: isImmersed ? 'none' : `0 0 22px ${meta.accentPrimary}55`,
                }}
              >
                {isImmersed ? (
                  <>
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Spaces</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white stroke-none" />
                    <span>Launch</span>
                  </>
                )}
              </motion.button>

              {/* Hardware Screen Wake Lock Toggle */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => void toggleWakeLock()}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                  wakeLockStatus === 'active'
                    ? 'bg-emerald-500/20 border-emerald-400/70 text-emerald-200 wake-halo-active'
                    : 'bg-white/[0.06] border-white/12 text-slate-300 hover:text-white hover:bg-white/12'
                }`}
                title="Toggle Screen Wake Lock API"
              >
                {wakeLockStatus === 'active' ? (
                  <>
                    <Lock className="w-3.5 h-3.5 text-emerald-300" />
                    <span className="hidden sm:inline">Wake Lock</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-slate-400" />
                    <span className="hidden sm:inline">Unlocked</span>
                  </>
                )}
              </motion.button>

              {/* Ambient Soundscape Toggle */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`p-2 rounded-full border transition-colors cursor-pointer ${
                  audioEnabled
                    ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-200'
                    : 'bg-white/[0.06] border-white/12 text-slate-300 hover:text-white hover:bg-white/12'
                }`}
                title="Toggle Spatial Ambient Audio"
                aria-label="Toggle Ambient Audio"
              >
                {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </motion.button>

              {/* No-HUD / Pure Cinema Display Mode Toggle */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  toggleNoHud();
                  if (!noHud && !isImmersed) {
                    setImmersed(true);
                  }
                }}
                className={`p-2 rounded-full border transition-colors cursor-pointer ${
                  noHud
                    ? 'bg-amber-500/25 border-amber-400/80 text-amber-200'
                    : 'bg-white/[0.06] border-white/12 text-slate-300 hover:text-white hover:bg-white/12'
                }`}
                title="No-HUD / Pure Cinema Mode (H)"
                aria-label="No-HUD / Pure Cinema Mode"
              >
                {noHud ? <Eye className="w-3.5 h-3.5 text-amber-300" /> : <EyeOff className="w-3.5 h-3.5" />}
              </motion.button>

              {/* Fullscreen Toggle */}
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={toggleFullscreen}
                className="p-2 rounded-full bg-white/[0.06] border border-white/12 text-slate-300 hover:text-white hover:bg-white/12 transition-colors cursor-pointer"
                title="Toggle Fullscreen (F)"
                aria-label="Toggle Fullscreen"
              >
                {isFullscreen ? (
                  <Minimize2 className="w-3.5 h-3.5 text-cyan-300" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </motion.button>

              {/* Post-FX & Pipeline Settings Trigger */}
              <motion.button
                whileHover={{ scale: 1.08, rotate: 28 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => setSettingsOpen(!settingsOpen)}
                className={`p-2 rounded-full border transition-colors cursor-pointer ${
                  settingsOpen
                    ? 'bg-white/20 border-white/40 text-white'
                    : 'bg-white/[0.06] border-white/12 text-slate-300 hover:text-white hover:bg-white/12'
                }`}
                title="Render Pipeline Settings (S)"
                aria-label="Render Settings"
              >
                <Settings className="w-3.5 h-3.5" />
              </motion.button>

              {/* Live Engine Telemetry Chip */}
              {isOled ? (
                <div className="hidden lg:flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full bg-black/40 border border-emerald-500/40 font-mono text-[10px] text-emerald-300 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-emerald-300">0% GPU • IDLE</span>
                  <span className="text-white/25">•</span>
                  <span className="text-emerald-400/80">RAF STOPPED</span>
                </div>
              ) : (
                <div className="hidden lg:flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full bg-black/35 border border-white/10 font-mono text-[10px] text-slate-300 whitespace-nowrap">
                  <span
                    className={
                      telemetry.fps < 45 ? 'text-amber-300 font-bold' : 'text-emerald-300 font-bold'
                    }
                  >
                    {telemetry.fps} FPS
                  </span>
                  <span className="text-white/25">•</span>
                  <span className="text-cyan-300">{telemetry.pixelRatio.toFixed(1)}x</span>
                  <span className="text-white/25">•</span>
                  <span>{(telemetry.activeInstances / 1000).toFixed(0)}K</span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default DynamicIsland;
