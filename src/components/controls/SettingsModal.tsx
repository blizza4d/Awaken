import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../store/useAppStore';
import {
  X,
  RotateCcw,
  Check,
  Cpu,
  Clock,
  Shield,
  Volume2,
  Sliders,
  Sparkles
} from 'lucide-react';

export const SettingsModal: React.FC = () => {
  const {
    settings,
    settingsModalOpen,
    setSettingsModalOpen,
    updateSetting,
    updatePostProcessing,
    resetToDefaults
  } = useAppStore();

  if (!settingsModalOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-2xl flex items-center justify-center p-4"
        onClick={() => setSettingsModalOpen(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 18 }}
          transition={{ type: 'spring', stiffness: 360, damping: 28 }}
          className="relative w-full max-w-xl max-h-[85vh] bg-[#0c101d]/95 border border-white/15 rounded-3xl shadow-[0_24px_70px_rgba(0,0,0,0.85)] backdrop-blur-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-white/[0.09] flex items-center justify-between bg-[#111628]/80 backdrop-blur-md">
            <div>
              <h3 className="text-base font-display font-extrabold text-white tracking-wide flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                Application Preferences
              </h3>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                Graphics Pipeline & Display Configuration
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSettingsModalOpen(false)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>

          {/* Modal Content Scrollable Area */}
          <div className="p-6 overflow-y-auto space-y-6 text-xs font-sans">
            {/* Section: WebGL Post-Processing Pipeline */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sky-400 font-mono font-bold uppercase tracking-wider text-[11px]">
                <Sliders className="w-4 h-4" />
                <span>Cinematic WebGL Shaders & Post-Processing</span>
              </div>

              <div className="space-y-3 bg-white/[0.03] p-4 rounded-2xl border border-white/[0.08]">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="font-semibold text-white">UnrealBloom Glow</div>
                    <div className="text-[11px] text-slate-300">
                      High-luminance bloom on neon windows, laser contrails & headlights
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.postProcessing.bloom}
                    onChange={(e) => updatePostProcessing({ bloom: e.target.checked })}
                    className="w-4 h-4 accent-sky-400 rounded cursor-pointer"
                  />
                </label>

                {settings.postProcessing.bloom && (
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <div className="font-medium text-slate-200">Bloom Radiance Intensity</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {settings.postProcessing.bloomIntensity}x emission factor
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={2.5}
                      step={0.1}
                      value={settings.postProcessing.bloomIntensity}
                      onChange={(e) =>
                        updatePostProcessing({ bloomIntensity: Number(e.target.value) })
                      }
                      className="w-32 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-sky-400"
                    />
                  </div>
                )}

                <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-white/[0.06]">
                  <div>
                    <div className="font-semibold text-white">Hardware Anti-Aliasing (MSAA)</div>
                    <div className="text-[11px] text-slate-300">
                      Smooth edges on procedural skyscrapers and planetary rings
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.postProcessing.antiAliasing}
                    onChange={(e) => updatePostProcessing({ antiAliasing: e.target.checked })}
                    className="w-4 h-4 accent-sky-400 rounded cursor-pointer"
                  />
                </label>

                <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
                  <div>
                    <div className="font-semibold text-white">Resolution Render Scale</div>
                    <div className="text-[11px] text-slate-300">
                      {Math.round(settings.postProcessing.resolutionScale * 100)}% viewport pixel density
                    </div>
                  </div>
                  <select
                    value={settings.postProcessing.resolutionScale}
                    onChange={(e) =>
                      updatePostProcessing({ resolutionScale: Number(e.target.value) })
                    }
                    className="bg-[#181d2f] text-white border border-white/20 px-3 py-1.5 rounded-lg text-xs font-mono cursor-pointer"
                  >
                    <option value={0.75}>75% (Performance)</option>
                    <option value={1.0}>100% (Native)</option>
                    <option value={1.25}>125% (Super-Sampled)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section: Performance Profile */}
            <div className="space-y-3 pt-3 border-t border-white/[0.08]">
              <div className="flex items-center gap-2 text-sky-400 font-mono font-bold uppercase tracking-wider text-[11px]">
                <Cpu className="w-4 h-4" />
                <span>Performance Profile</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {(['eco', 'balanced', 'cinematic'] as const).map((p) => (
                  <motion.button
                    key={p}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => updateSetting('performanceProfile', p)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      settings.performanceProfile === p
                        ? 'bg-sky-500/20 border-sky-400 text-white shadow-[0_0_18px_rgba(56,189,248,0.25)]'
                        : 'bg-white/[0.03] border-white/[0.09] text-slate-300 hover:bg-white/[0.07] hover:text-white'
                    }`}
                  >
                    <div className="font-bold capitalize text-white mb-0.5">{p}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {p === 'eco' && 'No WebGL • 0% GPU'}
                      {p === 'balanced' && '30 FPS • Balanced'}
                      {p === 'cinematic' && '60 FPS • Max Visuals'}
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Section: Clock & Overlay */}
            <div className="space-y-3 pt-3 border-t border-white/[0.08]">
              <div className="flex items-center gap-2 text-sky-400 font-mono font-bold uppercase tracking-wider text-[11px]">
                <Clock className="w-4 h-4" />
                <span>Clock & Telemetry</span>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="font-semibold text-white">Enable Digital Clock</div>
                    <div className="text-[11px] text-slate-300">Display live clock in screensaver scenes</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.clockEnabled}
                    onChange={(e) => updateSetting('clockEnabled', e.target.checked)}
                    className="w-4 h-4 accent-sky-400 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="font-semibold text-white">24-Hour Format</div>
                    <div className="text-[11px] text-slate-300">14:30 vs 2:30 PM</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.clock24h}
                    onChange={(e) => updateSetting('clock24h', e.target.checked)}
                    className="w-4 h-4 accent-sky-400 rounded cursor-pointer"
                  />
                </label>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">Clock Opacity</div>
                    <div className="text-[11px] text-slate-300">{settings.clockOpacity}% dim level</div>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={settings.clockOpacity}
                    onChange={(e) => updateSetting('clockOpacity', Number(e.target.value))}
                    className="w-32 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                </div>
              </div>
            </div>

            {/* Section: OLED Care & Dimmer */}
            <div className="space-y-3 pt-3 border-t border-white/[0.08]">
              <div className="flex items-center gap-2 text-sky-400 font-mono font-bold uppercase tracking-wider text-[11px]">
                <Shield className="w-4 h-4" />
                <span>OLED Care & Hardware Protection</span>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="font-semibold text-white">OLED Burn-In Subpixel Shifting</div>
                    <div className="text-[11px] text-slate-300">
                      Gradually drifts persistent text positions across 9 safe screen zones
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.burnInProtection}
                    onChange={(e) => updateSetting('burnInProtection', e.target.checked)}
                    className="w-4 h-4 accent-sky-400 rounded cursor-pointer"
                  />
                </label>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">Display Dimmer Level</div>
                    <div className="text-[11px] text-slate-300">{settings.brightness}% output intensity</div>
                  </div>
                  <input
                    type="range"
                    min={15}
                    max={100}
                    value={settings.brightness}
                    onChange={(e) => updateSetting('brightness', Number(e.target.value))}
                    className="w-32 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                </div>
              </div>
            </div>

            {/* Section: Audio Synthesis */}
            <div className="space-y-3 pt-3 border-t border-white/[0.08]">
              <div className="flex items-center gap-2 text-sky-400 font-mono font-bold uppercase tracking-wider text-[11px]">
                <Volume2 className="w-4 h-4" />
                <span>Procedural Web Audio</span>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="font-semibold text-white">Enable Ambient Soundscapes</div>
                    <div className="text-[11px] text-slate-300">
                      Real-time synthesized rain, fire, and cosmic drone
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
                    className="w-4 h-4 accent-sky-400 rounded cursor-pointer"
                  />
                </label>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">Volume</div>
                    <div className="text-[11px] text-slate-300">{settings.soundVolume}%</div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={settings.soundVolume}
                    onChange={(e) => updateSetting('soundVolume', Number(e.target.value))}
                    className="w-32 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-sky-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 border-t border-white/[0.09] bg-[#111628]/80 backdrop-blur-md flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={resetToDefaults}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-mono text-xs transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSettingsModalOpen(false)}
              className="btn-shine flex items-center gap-1.5 px-6 py-2 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-display font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(56,189,248,0.4)] cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Done</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
export default SettingsModal;
