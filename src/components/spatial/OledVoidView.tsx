import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSpatialStore } from '../../store/useSpatialStore';

interface SafeZone {
  x: string;
  y: string;
  align: 'left' | 'center' | 'right';
}

const SAFE_ZONES: SafeZone[] = [
  { x: '7vw', y: '8vh', align: 'left' },
  { x: '42vw', y: '8vh', align: 'center' },
  { x: '68vw', y: '8vh', align: 'right' },
  { x: '7vw', y: '42vh', align: 'left' },
  { x: '42vw', y: '42vh', align: 'center' },
  { x: '68vw', y: '42vh', align: 'right' },
  { x: '7vw', y: '72vh', align: 'left' },
  { x: '42vw', y: '72vh', align: 'center' },
  { x: '68vw', y: '72vh', align: 'right' },
];

export const OledVoidView: React.FC = () => {
  const { clock24h, oledClockOpacity, activeScene, clockTheme, clockShowDate } = useSpatialStore();
  const [zoneIndex, setZoneIndex] = useState(0);

  const [timeState, setTimeState] = useState(() => {
    const now = new Date();
    let h = now.getHours();
    const m = String(now.getMinutes()).padStart(2, '0');
    let suffix = '';
    if (!clock24h) {
      suffix = h >= 12 ? ' PM' : ' AM';
      h = h % 12 || 12;
    }
    return {
      time: `${String(h).padStart(2, '0')}:${m}${suffix}`,
      date: now.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      }),
    };
  });

  // Zero-loop: update strictly on the minute boundary, then every 60s
  useEffect(() => {
    let intervalId: number | null = null;

    const updateTime = () => {
      const now = new Date();
      let h = now.getHours();
      const m = String(now.getMinutes()).padStart(2, '0');
      let suffix = '';
      if (!clock24h) {
        suffix = h >= 12 ? ' PM' : ' AM';
        h = h % 12 || 12;
      }
      setTimeState({
        time: `${String(h).padStart(2, '0')}:${m}${suffix}`,
        date: now.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
      });
    };

    const now = new Date();
    const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds() + 25;

    const timeoutId = window.setTimeout(() => {
      updateTime();
      intervalId = window.setInterval(updateTime, 60000);
    }, msToNextMinute);

    return () => {
      window.clearTimeout(timeoutId);
      if (intervalId !== null) window.clearInterval(intervalId);
    };
  }, [clock24h]);

  // OLED Burn-In Protection: shift across 9 safe screen zones every 3.5 minutes (210,000ms)
  useEffect(() => {
    const shiftInterval = window.setInterval(() => {
      setZoneIndex((prev) => (prev + 1) % SAFE_ZONES.length);
    }, 210_000);

    return () => window.clearInterval(shiftInterval);
  }, []);

  if (activeScene !== 'oled-void' || clockTheme === 'hidden') return null;

  const currentZone = SAFE_ZONES[zoneIndex];

  let fontClasses = 'font-display font-extralight tracking-tight';
  if (clockTheme === 'editorial-serif') {
    fontClasses = 'font-serif font-extralight italic tracking-tight';
  } else if (clockTheme === 'mono-telemetry') {
    fontClasses = 'font-mono font-medium tracking-normal';
  } else if (clockTheme === 'centered-hero') {
    fontClasses = 'font-display font-thin tracking-[-0.05em]';
  }

  return (
    <div
      className="fixed inset-0 bg-[#000000] z-10 pointer-events-none select-none overflow-hidden"
      style={{ backgroundColor: '#000000' }}
    >
      <motion.div
        animate={{
          left: currentZone.x,
          top: currentZone.y,
          opacity: oledClockOpacity,
        }}
        transition={{
          duration: 3.2,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="absolute flex flex-col"
        style={{
          textAlign: currentZone.align,
          alignItems:
            currentZone.align === 'center'
              ? 'center'
              : currentZone.align === 'right'
              ? 'flex-end'
              : 'flex-start',
        }}
      >
        <div
          className={`${fontClasses} text-white leading-none tabular-nums`}
          style={{
            fontSize: clockTheme === 'centered-hero'
              ? 'clamp(3.5rem, 8vw, 7.5rem)'
              : 'clamp(2.75rem, 6vw, 5.5rem)',
          }}
        >
          {timeState.time}
        </div>
        {clockShowDate && (
          <div className="font-mono text-xs sm:text-sm uppercase tracking-[0.24em] text-white/70 mt-2">
            {timeState.date}
          </div>
        )}
        <div className="flex items-center gap-2 mt-3 font-mono text-[10px] tracking-[0.18em] uppercase text-emerald-400/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 animate-pulse" />
          <span>0% GPU • IDLE • OLED SAFEGUARD #{zoneIndex + 1}/9</span>
        </div>
      </motion.div>
    </div>
  );
};

export default OledVoidView;
