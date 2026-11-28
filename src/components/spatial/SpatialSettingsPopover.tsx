import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpatialStore } from '../../store/useSpatialStore';
import { usePwaInstall } from '../../hooks/usePwaInstall';
import {
  Sliders,
  Cpu,
  Sparkles,
  Clock,
  Sun,
  X,
  Gauge,
  EyeOff,
  Zap,
  Volume2,
  VolumeX,
  Repeat,
  Moon,
  Timer,
  Download,
  Check,
} from 'lucide-react';
import { ClockTheme, AutoCycleInterval, SleepTimerDuration, FocusModeType } from '../../engine/types';

export const SpatialSettingsPopover: React.FC = () => {
  const {
    settingsOpen,
    setSettingsOpen,
    postFX,
    updatePostFX,
    showClockInImmersion,
    setShowClockInImmersion,
    clock24h,
    setClock24h,
    clockTheme,
    setClockTheme,
    clockShowDate,
    setClockShowDate,
    clockShowSeconds,
    setClockShowSeconds,
    clockOpacity,
    setClockOpacity,
    brightness,
    setBrightness,
    telemetry,
    strictNoHud,
    setStrictNoHud,
    oledClockOpacity,
    setOledClockOpacity,
    powerProfile,
    setPowerProfile,
    audioEnabled,
    setAudioEnabled,
    audioVolume,
    setAudioVolume,
    autoCycleInterval,
    setAutoCycleInterval,
    autoCycleFavoritesOnly,
    setAutoCycleFavoritesOnly,
    autoCycleShuffle,
    setAutoCycleShuffle,
    sleepTimer,
    setSleepTimer,
    motionSpeed,
    setMotionSpeed,
    ambientDimmer,
    setAmbientDimmer,
    subtleParallax,
    setSubtleParallax,
    focusActive,
    focusMode,
    startFocus,
    pauseFocus,
    resumeFocus,
    resetFocus,
    activeScene,
  } = useSpatialStore();

  const { isInstallable, isStandalone, promptInstall } = usePwaInstall();
  const isOled = activeScene === 'oled-void' || telemetry.isOledVoid;

  const clockThemes: { id: ClockTheme; label: string }[] = [
    { id: 'minimal-sans', label: 'Minimal Sans' },
    { id: 'editorial-serif', label: 'Editorial Serif' },
    { id: 'mono-telemetry', label: 'Mono Telemetry' },
    { id: 'centered-hero', label: 'Centered Hero' },
    { id: 'hidden', label: 'Hidden' },
  ];

  const cycleOptions: { id: AutoCycleInterval; label: string }[] = [
    { id: 'off', label: 'Off' },
    { id: '5m', label: '5 min' },
    { id: '15m', label: '15 min' },
    { id: '30m', label: '30 min' },
    { id: '60m', label: '60 min' },
  ];

  const sleepOptions: { id: SleepTimerDuration; label: string }[] = [
    { id: 'off', label: 'Off' },
    { id: '30m', label: '30 min' },
    { id: '1h', label: '1 hr' },
    { id: '2h', label: '2 hr' },
  ];

  return (
    <AnimatePresence>
      {settingsOpen && (
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.94, filter: 'blur(12px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: 14, scale: 0.94, filter: 'blur(10px)' }}
          transition={{ type: 'spring', stiffness: 360, damping: 28 }}
          className="spatial-popover fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[min(94vw,460px)] rounded-3xl p-5 sm:p-6 text-xs text-white shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-400/15 border border-cyan-300/35 flex items-center justify-center text-cyan-300">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm tracking-tight text-white">
                  Spatial Display Suite
                </h3>
                <p className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                  Audio • Cinema Tour • Clock • Governor
                </p>
              </div>
            </div>
            <button
              onClick={() => setSettingsOpen(false)}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors cursor-pointer"
              aria-label="Close Settings"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 space-y-4 max-h-[62vh] overflow-y-auto pr-1">
            {/* SECTION 1: Procedural Web Audio Soundscape */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 spatial-micro text-cyan-300 font-semibold">
                  {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
                  <span>Procedural Soundscape (DSP)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className={`px-2 py-0.5 rounded-full font-mono text-[10px] font-semibold border transition-all cursor-pointer ${
                    audioEnabled
                      ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-200'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {audioEnabled ? 'Active' : 'Muted (M)'}
                </button>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-300">Master Soundscape Volume</span>
                  <span className="text-white font-semibold">{Math.round(audioVolume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.02}
                  value={audioVolume}
                  onChange={(e) => setAudioVolume(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/15 rounded-full appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>

            {/* SECTION 2: Cinema Tour & Sleep Timer */}
            <div className="pt-3 border-t border-white/10 space-y-3">
              <div className="flex items-center gap-1.5 spatial-micro text-purple-300 font-semibold">
                <Repeat className="w-3.5 h-3.5" />
                <span>Cinema Tour &amp; Sleep Timer</span>
              </div>

              {/* Auto-Cycle Interval */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-300">Auto-Cycle Playlist</span>
                  <span className="text-white font-semibold uppercase">{autoCycleInterval}</span>
                </div>
                <div className="grid grid-cols-5 gap-1 p-1 bg-white/5 rounded-2xl border border-white/10 font-mono text-[10px]">
                  {cycleOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setAutoCycleInterval(opt.id)}
                      className={`py-1 rounded-xl font-medium transition-all cursor-pointer text-center ${
                        autoCycleInterval === opt.id
                          ? 'bg-purple-500/25 border border-purple-400/50 text-purple-200 shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto-Cycle Flags */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <label className="flex items-center gap-2 cursor-pointer bg-white/5 p-2 rounded-xl border border-white/8 hover:bg-white/10 transition-colors">
                  <input
                    type="checkbox"
                    checked={autoCycleFavoritesOnly}
                    onChange={(e) => setAutoCycleFavoritesOnly(e.target.checked)}
                    className="w-3.5 h-3.5 accent-purple-400 rounded cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-300 font-medium">Favorites Only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-white/5 p-2 rounded-xl border border-white/8 hover:bg-white/10 transition-colors">
                  <input
                    type="checkbox"
                    checked={autoCycleShuffle}
                    onChange={(e) => setAutoCycleShuffle(e.target.checked)}
                    className="w-3.5 h-3.5 accent-purple-400 rounded cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-300 font-medium">Shuffle Order</span>
                </label>
              </div>

              {/* Sleep to OLED Void Timer */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Moon className="w-3.5 h-3.5 text-emerald-300" /> Sleep to OLED Void (0% GPU)
                  </span>
                  <span className="text-white font-semibold uppercase">{sleepTimer}</span>
                </div>
                <div className="grid grid-cols-4 gap-1 p-1 bg-white/5 rounded-2xl border border-white/10 font-mono text-[10px]">
                  {sleepOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSleepTimer(opt.id)}
                      className={`py-1 rounded-xl font-medium transition-all cursor-pointer text-center ${
                        sleepTimer === opt.id
                          ? 'bg-emerald-500/25 border border-emerald-400/50 text-emerald-200 shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 3: Ambient Desk-Clock & Focus Timer */}
            <div className="pt-3 border-t border-white/10 space-y-3">
              <div className="flex items-center gap-1.5 spatial-micro text-amber-300 font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>Ambient Desk-Clock &amp; Focus Timer</span>
              </div>

              {/* Clock Theme Selection */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-300">Clock Style</span>
                  <span className="text-white font-semibold capitalize">{clockTheme.replace('-', ' ')}</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-white/5 rounded-2xl border border-white/10 font-mono text-[10px]">
                  {clockThemes.map((th) => (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => setClockTheme(th.id)}
                      className={`py-1.5 rounded-xl font-medium transition-all cursor-pointer text-center ${
                        clockTheme === th.id
                          ? 'bg-amber-500/25 border border-amber-400/50 text-amber-200 shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {th.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clock Toggles */}
              <div className="grid grid-cols-3 gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer bg-white/5 p-2 rounded-xl border border-white/8">
                  <input
                    type="checkbox"
                    checked={clock24h}
                    onChange={(e) => setClock24h(e.target.checked)}
                    className="w-3.5 h-3.5 accent-amber-400 rounded cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-300 font-medium">24h Time</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer bg-white/5 p-2 rounded-xl border border-white/8">
                  <input
                    type="checkbox"
                    checked={clockShowDate}
                    onChange={(e) => setClockShowDate(e.target.checked)}
                    className="w-3.5 h-3.5 accent-amber-400 rounded cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-300 font-medium">Show Date</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer bg-white/5 p-2 rounded-xl border border-white/8">
                  <input
                    type="checkbox"
                    checked={clockShowSeconds}
                    onChange={(e) => setClockShowSeconds(e.target.checked)}
                    className="w-3.5 h-3.5 accent-amber-400 rounded cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-300 font-medium">Seconds</span>
                </label>
              </div>

              {/* Clock Opacity Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-300">Clock Opacity</span>
                  <span className="text-white font-semibold">{Math.round(clockOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.15}
                  max={1.0}
                  step={0.05}
                  value={clockOpacity}
                  onChange={(e) => setClockOpacity(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/15 rounded-full appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              {/* Focus / Pomodoro Timer */}
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-emerald-300">
                    <Timer className="w-3.5 h-3.5" />
                    <span>Minimal Focus Timer</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {focusActive ? (
                      <button
                        type="button"
                        onClick={pauseFocus}
                        className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-mono cursor-pointer"
                      >
                        Pause
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startFocus(focusMode)}
                        className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-mono cursor-pointer"
                      >
                        Start
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={resetFocus}
                      className="px-2 py-0.5 rounded-lg bg-white/10 text-slate-300 hover:text-white text-[10px] font-mono cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                  <button
                    type="button"
                    onClick={() => startFocus('25/5')}
                    className={`py-1 rounded-xl transition-all cursor-pointer text-center ${
                      focusMode === '25/5'
                        ? 'bg-emerald-500/25 border border-emerald-400/40 text-emerald-200'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    25m Focus / 5m Break
                  </button>
                  <button
                    type="button"
                    onClick={() => startFocus('50/10')}
                    className={`py-1 rounded-xl transition-all cursor-pointer text-center ${
                      focusMode === '50/10'
                        ? 'bg-emerald-500/25 border border-emerald-400/40 text-emerald-200'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    50m Focus / 10m Break
                  </button>
                </div>
              </div>
            </div>

            {/* SECTION 4: Atmosphere Tuning & Hardware Governor */}
            <div className="pt-3 border-t border-white/10 space-y-3">
              <div className="flex items-center gap-1.5 spatial-micro text-violet-300 font-semibold">
                <Gauge className="w-3.5 h-3.5" />
                <span>Atmosphere Tuning &amp; Hardware</span>
              </div>

              {/* Power Profile */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-cyan-300" /> Power Profile / FPS Target
                  </span>
                  <span className="text-white font-semibold uppercase">
                    {powerProfile === 'eco'
                      ? 'Eco 30 FPS'
                      : powerProfile === 'smooth'
                      ? 'Smooth 60 FPS'
                      : 'Native Uncapped'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-white/5 rounded-2xl border border-white/10 font-mono text-[10px]">
                  <button
                    type="button"
                    onClick={() => setPowerProfile('eco')}
                    className={`py-1.5 rounded-xl font-medium transition-all cursor-pointer text-center ${
                      powerProfile === 'eco'
                        ? 'bg-emerald-500/25 border border-emerald-400/50 text-emerald-200 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Eco 30 FPS
                  </button>
                  <button
                    type="button"
                    onClick={() => setPowerProfile('smooth')}
                    className={`py-1.5 rounded-xl font-medium transition-all cursor-pointer text-center ${
                      powerProfile === 'smooth'
                        ? 'bg-cyan-500/25 border border-cyan-400/50 text-cyan-200 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Smooth 60 FPS
                  </button>
                  <button
                    type="button"
                    onClick={() => setPowerProfile('native')}
                    className={`py-1.5 rounded-xl font-medium transition-all cursor-pointer text-center ${
                      powerProfile === 'native'
                        ? 'bg-violet-500/25 border border-violet-400/50 text-violet-200 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    Native Uncapped
                  </button>
                </div>
              </div>

              {/* Motion Speed */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-300">Motion Speed</span>
                  <span className="text-white font-semibold">{motionSpeed.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min={0.25}
                  max={2.0}
                  step={0.05}
                  value={motionSpeed}
                  onChange={(e) => setMotionSpeed(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/15 rounded-full appearance-none cursor-pointer accent-violet-400"
                />
              </div>

              {/* Ambient Dimmer */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-300">Room Ambient Dimmer</span>
                  <span className="text-white font-semibold">{Math.round(ambientDimmer * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.4}
                  max={1.2}
                  step={0.05}
                  value={ambientDimmer}
                  onChange={(e) => setAmbientDimmer(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/15 rounded-full appearance-none cursor-pointer accent-violet-400"
                />
              </div>

              {/* Subtle Parallax */}
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-medium text-white">Subtle Pointer Micro-Parallax</div>
                  <div className="text-[11px] text-slate-400">
                    Smoothly centers after 3s of inactivity
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={subtleParallax}
                  onChange={(e) => setSubtleParallax(e.target.checked)}
                  className="w-4 h-4 accent-violet-400 rounded cursor-pointer"
                />
              </label>

              {/* Display Dimmer */}
              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-300" /> Hardware Display Dimmer
                  </span>
                  <span className="text-white font-semibold">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={100}
                  step={1}
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/15 rounded-full appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              {/* Strict No-HUD Mode Toggle */}
              <label className="flex items-center justify-between cursor-pointer pt-1">
                <div>
                  <div className="font-medium text-white flex items-center gap-1.5">
                    <EyeOff className="w-3.5 h-3.5 text-amber-300" /> Strict No-HUD Mode
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Stay hidden until H or Esc (no reveal on mouse move)
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={strictNoHud}
                  onChange={(e) => setStrictNoHud(e.target.checked)}
                  className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                />
              </label>
            </div>

            {/* SECTION 5: Post-Processing Shaders */}
            <div className="pt-3 border-t border-white/10 space-y-3">
              <div className="flex items-center gap-1.5 spatial-micro text-cyan-300 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Post-Processing Shaders</span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-300">UnrealBloom Radiance</span>
                  <span className="text-white font-semibold">{postFX.bloomMultiplier.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min={0.25}
                  max={1.75}
                  step={0.05}
                  value={postFX.bloomMultiplier}
                  onChange={(e) => updatePostFX({ bloomMultiplier: Number(e.target.value) })}
                  className="w-full h-1.5 bg-white/15 rounded-full appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-300">Radial Chromatic Aberration</span>
                  <span className="text-white font-semibold">
                    {(postFX.chromaticAberration * 1000).toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={0.005}
                  step={0.0002}
                  value={postFX.chromaticAberration}
                  onChange={(e) => updatePostFX({ chromaticAberration: Number(e.target.value) })}
                  className="w-full h-1.5 bg-white/15 rounded-full appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-300">Organic Film Grain</span>
                  <span className="text-white font-semibold">
                    {Math.round(postFX.filmGrain * 1000)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={0.06}
                  step={0.002}
                  value={postFX.filmGrain}
                  onChange={(e) => updatePostFX({ filmGrain: Number(e.target.value) })}
                  className="w-full h-1.5 bg-white/15 rounded-full appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>

            {/* SECTION 6: PWA Desktop Install (if available) */}
            {isInstallable && (
              <div className="pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => void promptInstall()}
                  className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500/25 to-blue-500/25 border border-cyan-400/40 hover:border-cyan-300 flex items-center justify-center gap-2 text-cyan-200 font-display font-semibold transition-all cursor-pointer shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  <span>Install Awaken Desktop App</span>
                </button>
              </div>
            )}
            {isStandalone && (
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-emerald-400/80 px-1">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Desktop Standalone Mode
                </span>
                <span>PWA Active</span>
              </div>
            )}

            {/* SECTION 7: Live WebGL Memory & Lifecycle Telemetry */}
            <div className="pt-3 border-t border-white/10">
              <div className="flex items-center gap-1.5 spatial-micro text-emerald-300 font-semibold mb-2">
                <Cpu className="w-3.5 h-3.5" />
                <span>Engine Lifecycle &amp; Telemetry</span>
              </div>
              {isOled ? (
                <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 font-mono text-[11px] text-emerald-200 space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-emerald-300">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      OLED VOID (IDLE)
                    </span>
                    <span>0% GPU</span>
                  </div>
                  <p className="text-[10px] text-emerald-400/80 leading-relaxed">
                    WebGL canvas unmounted • RAF animation cancelled • Zero GPU memory allocations •
                    9-zone burn-in protection active.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 flex justify-between">
                    <span className="text-slate-400">FPS</span>
                    <span className="text-emerald-300 font-bold">{telemetry.fps}</span>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 flex justify-between">
                    <span className="text-slate-400">DPR</span>
                    <span className="text-cyan-300 font-bold">{telemetry.pixelRatio.toFixed(2)}x</span>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 flex justify-between">
                    <span className="text-slate-400">Geometries</span>
                    <span className="text-white font-bold">{telemetry.geometries}</span>
                  </div>
                  <div className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 flex justify-between">
                    <span className="text-slate-400">Textures</span>
                    <span className="text-white font-bold">{telemetry.textures}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SpatialSettingsPopover;
