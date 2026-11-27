import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpatialStore } from '../../store/useSpatialStore';
import { Sliders, Cpu, Sparkles, Clock, Sun, X, Gauge, EyeOff, Zap } from 'lucide-react';

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
    brightness,
    setBrightness,
    telemetry,
    strictNoHud,
    setStrictNoHud,
    oledClockOpacity,
    setOledClockOpacity,
    powerProfile,
    setPowerProfile,
    activeScene,
  } = useSpatialStore();

  const isOled = activeScene === 'oled-void' || telemetry.isOledVoid;

  return (
    <AnimatePresence>
      {settingsOpen && (
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.94, filter: 'blur(12px)' }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: 14, scale: 0.94, filter: 'blur(10px)' }}
          transition={{ type: 'spring', stiffness: 360, damping: 28 }}
          className="spatial-popover fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-[min(92vw,440px)] rounded-3xl p-5 sm:p-6 text-xs text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-400/15 border border-cyan-300/35 flex items-center justify-center text-cyan-300">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm tracking-tight text-white">
                  Spatial Render Pipeline
                </h3>
                <p className="font-mono text-[10px] text-slate-400 uppercase tracking-wider">
                  ACESFilmic • UnrealBloom • SMAA
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

          <div className="mt-4 space-y-4 max-h-[55vh] overflow-y-auto pr-1">
            {/* Post-Processing Sliders */}
            <div className="space-y-3">
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

            {/* Display & Hardware Governor */}
            <div className="pt-3 border-t border-white/10 space-y-3">
              <div className="flex items-center gap-1.5 spatial-micro text-violet-300 font-semibold">
                <Gauge className="w-3.5 h-3.5" />
                <span>Hardware Governor &amp; Display</span>
              </div>

              {/* Power Profile / FPS Limiter */}
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

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="font-medium text-white">Dynamic Resolution (&lt; 45 FPS)</div>
                  <div className="text-[11px] text-slate-400">
                    Auto-scales DPR &amp; InstancedMesh count
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={postFX.dynamicResolution}
                  onChange={(e) => updatePostFX({ dynamicResolution: e.target.checked })}
                  className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                />
              </label>

              <div className="space-y-1.5">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-300" /> Display Dimmer
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

              <label className="flex items-center justify-between cursor-pointer">
                <span className="flex items-center gap-1.5 text-slate-200">
                  <Clock className="w-3.5 h-3.5 text-cyan-300" /> Immersive Clock
                </span>
                <input
                  type="checkbox"
                  checked={showClockInImmersion}
                  onChange={(e) => setShowClockInImmersion(e.target.checked)}
                  className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                />
              </label>

              {showClockInImmersion && (
                <label className="flex items-center justify-between cursor-pointer pl-5">
                  <span className="text-slate-300">24-Hour Format</span>
                  <input
                    type="checkbox"
                    checked={clock24h}
                    onChange={(e) => setClock24h(e.target.checked)}
                    className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                  />
                </label>
              )}

              {/* OLED Void Clock Opacity */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between font-mono text-[11px]">
                  <span className="text-slate-300">OLED Void Clock Opacity</span>
                  <span className="text-white font-semibold">{Math.round(oledClockOpacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min={0.15}
                  max={0.60}
                  step={0.05}
                  value={oledClockOpacity}
                  onChange={(e) => setOledClockOpacity(Number(e.target.value))}
                  className="w-full h-1.5 bg-white/15 rounded-full appearance-none cursor-pointer accent-emerald-400"
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

            {/* Live WebGL Memory & Lifecycle Telemetry */}
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
