import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { SCREENSAVER_CATALOG } from '../../utils/screensaverCatalog';
import { audioSynthesizer } from '../../utils/audioSynthesis';

// 2D & Zero-Resource DOM modes imported synchronously (zero Three.js payload!)
import UltraMinimal from '../../screensavers/Minimal/UltraMinimal';
import RainyWindowScene from '../../screensavers/RainyWindow/RainyWindowScene';
import FireplaceCabinScene from '../../screensavers/Fireplace/FireplaceCabinScene';
import NorthernLightsScene from '../../screensavers/NorthernLights/NorthernLightsScene';
import AquariumScene from '../../screensavers/Aquarium/AquariumScene';
import MountainEscapeScene from '../../screensavers/MountainEscape/MountainEscapeScene';

// DYNAMIC LAZY IMPORT FOR 3D THREE.JS SCENES:
// Three.js, EffectComposer, and WebGL contexts are ONLY downloaded and loaded when a 3D mode is activated!
const CyberpunkCityScene = React.lazy(() => import('../../screensavers/Cyberpunk/CyberpunkCityScene'));
const NightDriveScene = React.lazy(() => import('../../screensavers/NightDrive/NightDriveScene'));
const SpaceExplorerScene = React.lazy(() => import('../../screensavers/Space/SpaceExplorerScene'));
const DigitalZenScene = React.lazy(() => import('../../screensavers/Abstract/DigitalZenScene'));

import {
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  Lock,
  Sun,
  X,
  Pause,
  Play,
  Mountain,
  Loader2
} from 'lucide-react';

export const ScreensaverHost: React.FC = () => {
  const {
    settings,
    isScreensaverActive,
    isPaused,
    wakeLockStatus,
    exitScreensaver,
    selectMode,
    togglePause,
    updateSetting
  } = useAppStore();

  const [hudVisible, setHudVisible] = useState<boolean>(true);
  const [hudTimeout, setHudTimeoutState] = useState<any>(null);
  const [clockShift, setClockShift] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  const currentModeId = settings.selectedMode;
  const currentCatalogItem =
    SCREENSAVER_CATALOG.find((m) => m.id === currentModeId) || SCREENSAVER_CATALOG[0];
  const currentIndex = SCREENSAVER_CATALOG.findIndex((m) => m.id === currentModeId);

  // Auto-hide HUD on mouse inactivity
  const showHudTemporarily = useCallback(() => {
    setHudVisible(true);
    if (hudTimeout) clearTimeout(hudTimeout);
    const timeout = setTimeout(() => {
      setHudVisible(false);
    }, 3200);
    setHudTimeoutState(timeout);
  }, [hudTimeout]);

  useEffect(() => {
    showHudTemporarily();
    const handleMove = () => showHudTemporarily();
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchstart', handleMove);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchstart', handleMove);
      if (hudTimeout) clearTimeout(hudTimeout);
    };
  }, []);

  // Clock Update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      let ampm = '';
      if (!settings.clock24h) {
        ampm = hours >= 12 ? ' PM' : ' AM';
        hours = hours % 12 || 12;
      }
      const timeStr = `${String(hours).padStart(2, '0')}:${minutes}${
        settings.clockSeconds ? `:${seconds}` : ''
      }${ampm}`;
      setCurrentTime(timeStr);
      setCurrentDate(
        now.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, settings.clockSeconds ? 500 : 1000);
    return () => clearInterval(interval);
  }, [settings.clock24h, settings.clockSeconds]);

  // OLED Subpixel Clock Shifting
  useEffect(() => {
    if (!settings.burnInProtection) return;
    const intervalMs = Math.max(1, settings.burnInIntervalMinutes) * 60 * 1000;
    const shiftInterval = setInterval(() => {
      setClockShift({
        x: (Math.random() - 0.5) * 40,
        y: (Math.random() - 0.5) * 30
      });
    }, intervalMs);

    return () => clearInterval(shiftInterval);
  }, [settings.burnInProtection, settings.burnInIntervalMinutes]);

  // Ambient Sound Synthesis Sync
  useEffect(() => {
    if (settings.soundEnabled) {
      audioSynthesizer.play(currentModeId, settings.soundVolume);
    } else {
      audioSynthesizer.stop();
    }
    return () => {
      audioSynthesizer.stop();
    };
  }, [settings.soundEnabled, currentModeId, settings.soundVolume]);

  // Keyboard navigation during screensaver
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isScreensaverActive) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        exitScreensaver();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePause();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevIdx =
          (currentIndex - 1 + SCREENSAVER_CATALOG.length) % SCREENSAVER_CATALOG.length;
        selectMode(SCREENSAVER_CATALOG[prevIdx].id);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const nextIdx = (currentIndex + 1) % SCREENSAVER_CATALOG.length;
        selectMode(SCREENSAVER_CATALOG[nextIdx].id);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        updateSetting('brightness', Math.min(100, settings.brightness + 10));
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        updateSetting('brightness', Math.max(15, settings.brightness - 10));
      } else if (e.key === 'c' || e.key === 'C') {
        updateSetting('clockEnabled', !settings.clockEnabled);
      } else if (e.key === 'm' || e.key === 'M') {
        updateSetting('soundEnabled', !settings.soundEnabled);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isScreensaverActive,
    currentIndex,
    settings.brightness,
    settings.clockEnabled,
    settings.soundEnabled,
    exitScreensaver,
    togglePause,
    selectMode,
    updateSetting
  ]);

  const cycleMountainPalette = () => {
    const palettes: ('midnight' | 'sunset' | 'winter')[] = [
      'midnight',
      'sunset',
      'winter'
    ];
    const nextIdx = (palettes.indexOf(settings.mountainPalette) + 1) % palettes.length;
    updateSetting('mountainPalette', palettes[nextIdx]);
  };

  const dimmerOpacity = ((100 - settings.brightness) / 100).toFixed(2);
  const clockOpacity = (settings.clockOpacity / 100).toFixed(2);

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden bg-black select-none ${
        !hudVisible ? 'hide-cursor' : ''
      }`}
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest('.screensaver-hud')) {
          showHudTemporarily();
        }
      }}
      onDoubleClick={(e) => {
        if (!(e.target as HTMLElement).closest('.screensaver-hud')) {
          exitScreensaver();
        }
      }}
    >
      {/* 1. MOUNT ONLY CURRENT ACTIVE ENVIRONMENT (ZERO RESOURCE OVERHEAD FOR INACTIVE SCENES) */}
      {currentModeId === 'minimal' && <UltraMinimal />}
      {currentModeId === 'rainy-window' && <RainyWindowScene />}
      {currentModeId === 'fireplace' && <FireplaceCabinScene />}
      {currentModeId === 'northern-lights' && <NorthernLightsScene />}
      {currentModeId === 'aquarium' && <AquariumScene />}
      {currentModeId === 'mountain-escape' && <MountainEscapeScene />}

      {/* DYNAMIC THREE.JS SCENES WITH SUSPENSE FALLBACK */}
      {currentModeId === 'cyberpunk' && (
        <Suspense
          fallback={
            <div className="absolute inset-0 bg-[#06020e] flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
              <span className="font-mono text-xs uppercase tracking-widest text-sky-300">
                Initializing WebGL Cyberpunk 2.0...
              </span>
            </div>
          }
        >
          <CyberpunkCityScene />
        </Suspense>
      )}

      {currentModeId === 'night-drive' && (
        <Suspense
          fallback={
            <div className="absolute inset-0 bg-[#040610] flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
              <span className="font-mono text-xs uppercase tracking-widest text-sky-300">
                Warping Highway Geometry...
              </span>
            </div>
          }
        >
          <NightDriveScene />
        </Suspense>
      )}

      {currentModeId === 'space' && (
        <Suspense
          fallback={
            <div className="absolute inset-0 bg-[#020308] flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
              <span className="font-mono text-xs uppercase tracking-widest text-sky-300">
                Generating 10,000+ Stellar Particles...
              </span>
            </div>
          }
        >
          <SpaceExplorerScene />
        </Suspense>
      )}

      {currentModeId === 'digital-zen' && (
        <Suspense
          fallback={
            <div className="absolute inset-0 bg-[#05070c] flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
              <span className="font-mono text-xs uppercase tracking-widest text-sky-300">
                Calibrating 3D Gyroscope...
              </span>
            </div>
          }
        >
          <DigitalZenScene />
        </Suspense>
      )}

      {/* 2. HARDWARE-LIKE DIMMER OVERLAY */}
      <div
        className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-300 z-30"
        style={{ opacity: dimmerOpacity }}
      />

      {/* 3. PAUSE BADGE */}
      {isPaused && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-40 px-4 py-1.5 rounded-full glass-panel border border-amber-500/30 text-amber-400 font-mono text-xs tracking-widest uppercase flex items-center gap-2">
          <Pause className="w-3.5 h-3.5" />
          Animation Paused • [Space] to Resume
        </div>
      )}

      {/* 4. OVERLAY DIGITAL CLOCK (Non-minimal modes only) */}
      {currentModeId !== 'minimal' && settings.clockEnabled && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-35 transition-transform duration-[2000ms] ease-out"
          style={{
            transform: `translate(${clockShift.x}px, ${clockShift.y}px)`,
            opacity: clockOpacity
          }}
        >
          <div className="text-6xl sm:text-7xl font-light tracking-tight font-mono text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]">
            {currentTime}
          </div>
          {settings.clockDate && (
            <div className="text-sm font-light uppercase tracking-[0.25em] text-white/70 mt-2 font-mono drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
              {currentDate}
            </div>
          )}
        </div>
      )}

      {/* 5. FLOATING GLASSMORPHIC HUD DOCK */}
      <div
        className={`screensaver-hud absolute bottom-8 left-1/2 -translate-x-1/2 z-50 glass-panel rounded-full px-5 py-2.5 flex items-center gap-4 transition-all duration-300 shadow-[0_16px_40px_rgba(0,0,0,0.8)] ${
          hudVisible
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Mode Switcher */}
        <div className="flex items-center gap-2 border-r border-white/10 pr-3">
          <button
            onClick={() => {
              const prevIdx =
                (currentIndex - 1 + SCREENSAVER_CATALOG.length) %
                SCREENSAVER_CATALOG.length;
              selectMode(SCREENSAVER_CATALOG[prevIdx].id);
            }}
            className="w-7 h-7 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
            title="Previous Mode (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-white tracking-wide min-w-[130px] text-center">
            {currentCatalogItem.title}
          </span>
          <button
            onClick={() => {
              const nextIdx = (currentIndex + 1) % SCREENSAVER_CATALOG.length;
              selectMode(SCREENSAVER_CATALOG[nextIdx].id);
            }}
            className="w-7 h-7 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
            title="Next Mode (Right Arrow)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mode 8 Mountain Theme Cycler */}
        {currentModeId === 'mountain-escape' && (
          <button
            onClick={cycleMountainPalette}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 text-xs text-sky-300 border border-sky-400/30 transition-colors"
            title="Cycle Palette (Midnight / Sunset / Winter)"
          >
            <Mountain className="w-3.5 h-3.5" />
            <span className="capitalize">{settings.mountainPalette}</span>
          </button>
        )}

        {/* Sound Toggle */}
        <button
          onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition-colors ${
            settings.soundEnabled
              ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40'
              : 'bg-white/5 text-slate-400 hover:text-white'
          }`}
          title="Toggle Synthesized Audio (M)"
        >
          {settings.soundEnabled ? (
            <Volume2 className="w-3.5 h-3.5" />
          ) : (
            <VolumeX className="w-3.5 h-3.5" />
          )}
          <span>{settings.soundEnabled ? 'Audio On' : 'Muted'}</span>
        </button>

        {/* Wake Lock Status Indicator */}
        <div
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono ${
            wakeLockStatus === 'active'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              : 'bg-white/5 text-slate-400'
          }`}
          title="Screen Wake Lock Status"
        >
          <Lock className="w-3.5 h-3.5" />
          <span>{wakeLockStatus === 'active' ? 'Awake' : 'Idle'}</span>
        </div>

        {/* Dimmer Slider */}
        <div className="flex items-center gap-2 pl-2 border-l border-white/10" title="Screen Dimmer">
          <Sun className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="range"
            min={15}
            max={100}
            value={settings.brightness}
            onChange={(e) => updateSetting('brightness', Number(e.target.value))}
            className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-sky-400"
          />
        </div>

        {/* Pause / Play */}
        <button
          onClick={togglePause}
          className="w-7 h-7 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
          title="Pause / Resume (Space)"
        >
          {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
        </button>

        {/* Exit Button */}
        <button
          onClick={exitScreensaver}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors"
          title="Exit to Dashboard (Esc)"
        >
          <X className="w-3.5 h-3.5" />
          <span>Exit</span>
        </button>
      </div>
    </div>
  );
};
export default ScreensaverHost;
