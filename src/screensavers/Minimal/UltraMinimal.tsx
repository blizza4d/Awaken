import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';

const OLED_ZONES = [
  { top: '20%', left: '20%' },
  { top: '20%', left: '50%' },
  { top: '20%', left: '80%' },
  { top: '50%', left: '20%' },
  { top: '50%', left: '50%' },
  { top: '50%', left: '80%' },
  { top: '80%', left: '20%' },
  { top: '80%', left: '50%' },
  { top: '80%', left: '80%' }
];

export const UltraMinimal: React.FC = () => {
  const { settings } = useAppStore();
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [zoneIndex, setZoneIndex] = useState<number>(4);

  // Clock update aligned to minute boundary (zero continuous loop)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      let ampm = '';
      if (!settings.clock24h) {
        ampm = hours >= 12 ? ' PM' : ' AM';
        hours = hours % 12 || 12;
      }
      setTime(`${String(hours).padStart(2, '0')}:${minutes}${ampm}`);
      setDate(now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }));
    };

    updateTime();

    // Align to the next full minute
    const now = new Date();
    const msToNextMinute = (60 - now.getSeconds()) * 1000;
    const timeout = setTimeout(() => {
      updateTime();
      const interval = setInterval(updateTime, 60000);
      return () => clearInterval(interval);
    }, msToNextMinute);

    return () => clearTimeout(timeout);
  }, [settings.clock24h]);

  // OLED Burn-In protection zone repositioning
  useEffect(() => {
    if (!settings.burnInProtection) return;

    const intervalMs = Math.max(1, settings.burnInIntervalMinutes) * 60 * 1000;
    const interval = setInterval(() => {
      setZoneIndex((prev) => (prev + 1) % OLED_ZONES.length);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [settings.burnInProtection, settings.burnInIntervalMinutes]);

  const currentZone = OLED_ZONES[zoneIndex];
  const opacity = settings.clockOpacity / 100;

  return (
    <div className="absolute inset-0 bg-black flex items-center justify-center overflow-hidden pointer-events-none">
      {settings.clockEnabled && (
        <div
          className="absolute flex flex-col items-center justify-center transition-all duration-[3000ms] ease-out"
          style={{
            top: currentZone.top,
            left: currentZone.left,
            transform: 'translate(-50%, -50%)',
            opacity: opacity
          }}
        >
          <div className="text-4xl sm:text-5xl font-light tracking-wider font-mono text-white/90">
            {time}
          </div>
          {settings.clockDate && (
            <div className="text-xs uppercase tracking-widest text-white/50 mt-2 font-mono">
              {date}
            </div>
          )}
          <div className="mt-4 flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-mono tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            OLED STANDBY • 0% CPU
          </div>
        </div>
      )}
    </div>
  );
};

export default UltraMinimal;
