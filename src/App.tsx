import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { useSpatialStore } from './store/useSpatialStore';
import { SPATIAL_SCENES, getSceneMeta } from './engine/sceneCatalog';
import { SpatialCanvas } from './components/spatial/SpatialCanvas';
import { SpatialPortalCard } from './components/spatial/SpatialPortalCard';
import { DynamicIsland } from './components/spatial/DynamicIsland';
import { SpatialSettingsPopover } from './components/spatial/SpatialSettingsPopover';
import { SpatialClockOverlay } from './components/spatial/SpatialClockOverlay';
import { OledVoidView } from './components/spatial/OledVoidView';
import { KeyboardShortcutsModal } from './components/spatial/KeyboardShortcutsModal';
import { useCinemaTour } from './hooks/useCinemaTour';
import { useGlobalKeyboardShortcuts } from './hooks/useGlobalKeyboardShortcuts';
import { Sparkles, Radio, Eye } from 'lucide-react';

type SpaceCategory = 'all' | 'space' | 'atmosphere' | 'urban' | 'abstract';

const CATEGORY_MAP: Record<SpaceCategory, string[]> = {
  all: [],
  space: ['carina-nebula', 'binary-pulsar', 'saturnian-orbit', 'event-horizon', 'deep-void-drift'],
  atmosphere: ['arctic-aurora', 'moonlit-shore', 'abyssal-drift'],
  urban: ['volumetric-megacity', 'midnight-cruise', 'nocturne-glass'],
  abstract: ['fluid-data', 'oled-void'],
};

const CATEGORIES = [
  { id: 'all' as const, label: 'All Spaces', count: 13 },
  { id: 'space' as const, label: 'Space & Cosmos', count: 5 },
  { id: 'atmosphere' as const, label: 'Atmosphere & Ocean', count: 3 },
  { id: 'urban' as const, label: 'Urban & Drive', count: 3 },
  { id: 'abstract' as const, label: 'Abstract & OLED', count: 2 },
] as const;

export const App: React.FC = () => {
  const {
    activeScene,
    setActiveScene,
    isImmersed,
    expandingSceneId,
    launchSceneWithFlip,
    setImmersed,
    toggleImmersed,
    settingsOpen,
    setSettingsOpen,
    telemetry,
    noHud,
    setNoHud,
    toggleNoHud,
    noHudRevealed,
    setNoHudRevealed,
    strictNoHud,
  } = useSpatialStore();

  const [cursorHidden, setCursorHidden] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<SpaceCategory>('all');
  const revealTimerRef = useRef<number | null>(null);

  // Activate Cinema Tour playlist & OLED Sleep Timer
  useCinemaTour();

  // Activate global keyboard navigation (Arrows, Space, F, H, M, O, ?)
  useGlobalKeyboardShortcuts();

  const filteredScenes = selectedCategory === 'all'
    ? SPATIAL_SCENES
    : SPATIAL_SCENES.filter((s) => CATEGORY_MAP[selectedCategory].includes(s.id));

  // Auto-hide cursor after 2s of inactivity during immersion or No-HUD
  useEffect(() => {
    if (!isImmersed && !noHud) {
      setCursorHidden(false);
      return;
    }

    let timer = window.setTimeout(() => setCursorHidden(true), 2000);
    const onMove = () => {
      setCursorHidden(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setCursorHidden(true), 2000);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.clearTimeout(timer);
    };
  }, [isImmersed, noHud]);

  // Auto-reveal HUD on mouse move/tap in No-HUD mode (if not in Strict No-HUD)
  const triggerAutoReveal = useCallback(() => {
    if (!noHud || strictNoHud) return;

    setNoHudRevealed(true);
    if (revealTimerRef.current !== null) {
      window.clearTimeout(revealTimerRef.current);
    }
    revealTimerRef.current = window.setTimeout(() => {
      setNoHudRevealed(false);
    }, 3000);
  }, [noHud, strictNoHud, setNoHudRevealed]);

  useEffect(() => {
    if (!noHud) {
      setNoHudRevealed(false);
      if (revealTimerRef.current !== null) {
        window.clearTimeout(revealTimerRef.current);
      }
      return;
    }

    window.addEventListener('pointermove', triggerAutoReveal, { passive: true });
    window.addEventListener('pointerdown', triggerAutoReveal, { passive: true });

    return () => {
      window.removeEventListener('pointermove', triggerAutoReveal);
      window.removeEventListener('pointerdown', triggerAutoReveal);
      if (revealTimerRef.current !== null) {
        window.clearTimeout(revealTimerRef.current);
      }
    };
  }, [noHud, triggerAutoReveal, setNoHudRevealed]);

  // Synchronous keyboard shortcuts & Fullscreen request
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        toggleImmersed();
      } else if (e.key === 'Escape') {
        if (noHud) {
          setNoHud(false);
        } else if (settingsOpen) {
          setSettingsOpen(false);
        } else if (document.fullscreenElement) {
          void document.exitFullscreen?.();
        } else if (isImmersed) {
          setImmersed(false);
        }
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        toggleNoHud();
      } else if (e.key === 's' || e.key === 'S') {
        setSettingsOpen(!settingsOpen);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        // Synchronous call in user event handler
        if (!document.fullscreenElement) {
          void document.documentElement.requestFullscreen?.().catch((err) => {
            console.warn('[Fullscreen] request error:', err);
          });
        } else {
          void document.exitFullscreen?.().catch((err) => {
            console.warn('[Fullscreen] exit error:', err);
          });
        }
      } else if (e.key === '1') {
        setActiveScene('fluid-data');
      } else if (e.key === '2') {
        setActiveScene('volumetric-megacity');
      } else if (e.key === '3') {
        setActiveScene('event-horizon');
      } else if (e.key === '4') {
        setActiveScene('carina-nebula');
      } else if (e.key === '5') {
        setActiveScene('binary-pulsar');
      } else if (e.key === '6') {
        setActiveScene('saturnian-orbit');
      } else if (e.key === '7') {
        setActiveScene('deep-void-drift');
      } else if (e.key === '8') {
        setActiveScene('midnight-cruise');
      } else if (e.key === '9') {
        setActiveScene('moonlit-shore');
      } else if (e.key === '0') {
        setActiveScene('oled-void');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    isImmersed,
    settingsOpen,
    noHud,
    setImmersed,
    setSettingsOpen,
    toggleImmersed,
    toggleNoHud,
    setNoHud,
    setActiveScene,
  ]);

  const activeMeta = getSceneMeta(activeScene);
  const isOled = activeScene === 'oled-void' || telemetry.isOledVoid;

  return (
    <div
      className={`relative w-full h-full overflow-hidden bg-black text-white select-none ${
        cursorHidden ? 'spatial-hide-cursor' : ''
      }`}
    >
      {/* 1. Persistent Live 3D WebGL + EffectComposer Viewport */}
      <SpatialCanvas />

      {/* 2. Absolute Minimum Resource OLED Void View */}
      <OledVoidView />

      {/* 3. Floating "Exit No-HUD" Auto-Reveal Pill */}
      <AnimatePresence>
        {noHud && noHudRevealed && !strictNoHud && (
          <motion.button
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={() => setNoHud(false)}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-black/70 border border-white/20 backdrop-blur-xl shadow-2xl text-xs font-mono font-medium text-white/90 hover:bg-white/10 hover:border-white/35 transition-all cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-300" />
            <span>EXIT NO-HUD (H / ESC)</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* 4. Spatial UI & FLIP Expansion Layer */}
      <LayoutGroup>
        <AnimatePresence mode="sync">
          {!isImmersed && !noHud ? (
            <motion.div
              key="spatial-browser-layer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{
                opacity: 0,
                transition: { duration: 0.52, ease: [0.16, 1, 0.3, 1] },
              }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="spatial-backdrop-layer fixed inset-0 z-10 flex flex-col justify-between overflow-y-auto px-5 sm:px-10 lg:px-14 pt-6 sm:pt-9 pb-28"
            >
              {/* Minimalist Floating Spatial Header (Zero Opaque Bars) */}
              <header className="w-full max-w-7xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-2xl flex items-center justify-center border border-white/25 backdrop-blur-xl shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${activeMeta.accentPrimary}55, ${activeMeta.accentSecondary}55)`,
                      boxShadow: `0 0 28px ${activeMeta.accentPrimary}44`,
                    }}
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span
                      className="font-display font-bold text-base sm:text-lg tracking-tight text-white"
                      style={{ textShadow: '0 2px 14px rgba(0,0,0,0.75)' }}
                    >
                      AWAKEN
                    </span>
                    <span className="spatial-micro text-white/65 font-semibold">SPATIAL 5.0</span>
                  </div>
                </div>

                {/* Live Shader Pipeline Status Pill */}
                <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/15 backdrop-blur-xl font-mono text-[11px] text-white/85">
                  <Radio
                    className="w-3.5 h-3.5 animate-pulse"
                    style={{ color: activeMeta.accentPrimary }}
                  />
                  <span className="hidden sm:inline text-white/60">LIVE CANVAS:</span>
                  <span className="font-semibold text-white">{activeMeta.title}</span>
                  <span className="text-white/25 hidden md:inline">•</span>
                  {isOled ? (
                    <span className="hidden md:inline text-emerald-400 font-semibold">
                      0% GPU • IDLE
                    </span>
                  ) : (
                    <span className="hidden md:inline text-emerald-300 font-semibold">
                      {telemetry.fps} FPS
                    </span>
                  )}
                </div>
              </header>

              {/* Centerpiece Fluid Typography + 7 Flagship Spatial Portals */}
              <main className="w-full max-w-7xl mx-auto my-auto py-8 sm:py-10 space-y-8 sm:space-y-10">
                <div className="max-w-2xl space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.07] border border-white/15 backdrop-blur-md">
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        backgroundColor: activeMeta.accentPrimary,
                        boxShadow: `0 0 10px ${activeMeta.accentPrimary}`,
                      }}
                    />
                    <span className="spatial-micro text-white/85 font-semibold">
                      ACESFilmic WebGL2 • UnrealBloom • SMAA • Adaptive DPR • OLED Void
                    </span>
                  </div>

                  <h1 className="spatial-hero-title">
                    Spatial Ambient Environments
                  </h1>

                  <p className="spatial-subtitle">
                    Hover any portal to shift the live WebGL atmosphere beneath the glass. Click a
                    portal to expand seamlessly into pure fullscreen immersion. Press [H] for Pure
                    Cinema No-HUD mode.
                  </p>
                </div>

                {/* Categorized Spaces Filter Bar */}
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
                  {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`relative px-3.5 py-1.5 rounded-full text-xs font-display font-semibold transition-all cursor-pointer whitespace-nowrap flex-shrink-0 ${
                          isSelected
                            ? 'text-white'
                            : 'text-white/60 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10'
                        }`}
                      >
                        {isSelected && (
                          <motion.span
                            layoutId="activeCategoryPill"
                            className="absolute inset-0 rounded-full bg-white/15 border border-white/25 shadow-lg backdrop-blur-md"
                            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-1.5">
                          <span>{cat.label}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/80 font-mono">
                            {cat.count}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* 13 Flagship Spatial Cards Grid */}
                <section
                  aria-label="Flagship Spatial Environments"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6"
                >
                  {filteredScenes.map((scene, idx) => (
                    <SpatialPortalCard
                      key={scene.id}
                      scene={scene}
                      isActive={activeScene === scene.id}
                      index={idx}
                      onPreview={setActiveScene}
                      onLaunch={launchSceneWithFlip}
                    />
                  ))}
                </section>
              </main>

              {/* Subtle Bottom Spacer */}
              <div className="h-4" />
            </motion.div>
          ) : (
            /* FLIP Target Shell: Expands from clicked SpatialPortalCard to full viewport, then dissolves cleanly */
            expandingSceneId && (
              <motion.div
                key={`flip-expansion-${expandingSceneId}`}
                layoutId={`spatial-portal-${expandingSceneId}`}
                initial={{ opacity: 0.72, borderRadius: 28 }}
                animate={{
                  opacity: 0,
                  borderRadius: 0,
                  transition: {
                    layout: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
                    opacity: { duration: 0.62, delay: 0.08, ease: 'easeOut' },
                    borderRadius: { duration: 0.45 },
                  },
                }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-10 pointer-events-none border border-white/25 bg-white/[0.08] backdrop-blur-2xl"
              />
            )
          )}
        </AnimatePresence>
      </LayoutGroup>

      {/* 5. Subtle Floating OLED Subpixel Clock (Immersion Mode only) */}
      <SpatialClockOverlay />

      {/* 6. Contextual Render Pipeline Popover */}
      <SpatialSettingsPopover />

      {/* 7. Auto-Collapsing Floating Dynamic Island */}
      <DynamicIsland />

      {/* 8. Desktop Keyboard Command Sheet Modal */}
      <KeyboardShortcutsModal />
    </div>
  );
};

export default App;
