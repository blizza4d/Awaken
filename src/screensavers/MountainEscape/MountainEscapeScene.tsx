import React from 'react';
import { useAppStore } from '../../store/useAppStore';

export const MountainEscapeScene: React.FC = () => {
  const { settings } = useAppStore();
  const theme = settings.mountainPalette || 'midnight';

  // Theme palettes
  const palettes = {
    midnight: {
      sky: 'bg-gradient-to-b from-[#02050e] via-[#091329] to-[#152342]',
      celestial: 'bg-slate-100 shadow-[0_0_40px_rgba(255,255,255,0.8),0_0_80px_rgba(56,189,248,0.4)]',
      farMt: '#0d1a33',
      midMt: '#081022',
      foreMt: '#040914',
      lake: 'from-[#071022] to-[#020409]',
      reflOpacity: 0.4
    },
    sunset: {
      sky: 'bg-gradient-to-b from-[#3b0764] via-[#9a3412] to-[#ea580c]',
      celestial: 'bg-amber-200 shadow-[0_0_60px_rgba(251,191,36,0.9),0_0_110px_rgba(234,88,12,0.6)]',
      farMt: '#431407',
      midMt: '#270c04',
      foreMt: '#130502',
      lake: 'from-[#3b1206] to-[#0f0402]',
      reflOpacity: 0.55
    },
    winter: {
      sky: 'bg-gradient-to-b from-[#070d18] via-[#122035] to-[#20344f]',
      celestial: 'bg-slate-200 shadow-[0_0_35px_rgba(226,232,240,0.8)]',
      farMt: '#1c2e47',
      midMt: '#101c2e',
      foreMt: '#070c14',
      lake: 'from-[#0e1929] to-[#040810]',
      reflOpacity: 0.45
    }
  };

  const p = palettes[theme];

  return (
    <div className={`absolute inset-0 w-full h-full overflow-hidden ${p.sky} transition-colors duration-1000`}>
      {/* Sky & Celestial Orb (Moon or Setting Sun) */}
      <div className="absolute inset-0 h-[65%] overflow-hidden">
        {/* Celestial Orb */}
        <div
          className={`absolute top-[14%] right-[22%] w-20 h-20 rounded-full ${p.celestial} transition-all duration-1000`}
        />

        {/* Drifting Clouds */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_30%_60%,rgba(255,255,255,0.4)_0%,transparent_60%)] animate-pulse duration-[8000ms]" />

        {/* Layered Mountains SVG */}
        <svg
          className="absolute bottom-0 inset-x-0 w-full h-[72%] transition-all duration-1000"
          viewBox="0 0 1440 400"
          preserveAspectRatio="none"
        >
          {/* Distant Mountain Range */}
          <polygon
            points="0,400 0,180 180,90 340,210 520,70 720,220 940,80 1120,200 1300,60 1440,160 1440,400"
            fill={p.farMt}
            opacity="0.65"
          />
          {/* Midground Jagged Mountain Range */}
          <polygon
            points="0,400 0,240 140,150 290,260 480,130 680,270 880,140 1060,260 1260,120 1440,230 1440,400"
            fill={p.midMt}
            opacity="0.85"
          />
          {/* Foreground Pine Forest Edge */}
          <polygon
            points="0,400 0,310 100,240 220,330 380,220 540,320 720,210 900,310 1080,200 1240,320 1380,230 1440,280 1440,400"
            fill={p.foreMt}
          />
        </svg>
      </div>

      {/* Alpine Lake Reflection (Lower 35%) */}
      <div className={`absolute bottom-0 inset-x-0 h-[35%] bg-gradient-to-b ${p.lake} border-t border-white/10 overflow-hidden`}>
        {/* Inverted Mountain Reflection */}
        <div className="absolute inset-x-0 top-0 h-full scale-y-[-1] blur-[2px]" style={{ opacity: p.reflOpacity }}>
          <svg className="w-full h-full" viewBox="0 0 1440 400" preserveAspectRatio="none">
            <polygon
              points="0,400 0,240 140,150 290,260 480,130 680,270 880,140 1060,260 1260,120 1440,230 1440,400"
              fill={p.farMt}
            />
          </svg>
        </div>

        {/* Shimmering Horizontal Water Ripples */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(180deg,rgba(255,255,255,0.04)_0px,rgba(255,255,255,0.04)_2px,transparent_2px,transparent_12px)] opacity-50" />
      </div>
    </div>
  );
};

export default MountainEscapeScene;
