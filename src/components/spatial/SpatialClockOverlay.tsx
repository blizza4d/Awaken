import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpatialStore } from '../../store/useSpatialStore';
import { ambientAudio } from '../../audio/AmbientAudioEngine';

export const SpatialClockOverlay: React.FC = () => {
  const {
    showClockInImmersion,
    clock24h,
    clockTheme,
    clockShowDate,
    clockShowSeconds,
    clockOpacity,
    isImmersed,
    noHud,
    noHudRevealed,
    strictNoHud,
    activeScene,
    focusActive,
    focusRemaining,
    focusDuration,
    focusIsBreak,
    tickFocus,
  } = useSpatialStore();

  const [timeText, setTimeText] = useState('');
  const [secondsText, setSecondsText] = useState('');
  const [dateText, setDateText] = useState('');
  const [drift, setDrift] = useState({ x: 0, y: 0 });

  const prevRemainingRef = useRef<number>(focusRemaining);

  // Time & Date Formatter
  useEffect(() => {
    const update = () => {
      const now = new Date();
      let h = now.getHours();
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      let suffix = '';
      if (!clock24h) {
        suffix = h >= 12 ? ' PM' : ' AM';
        h = h % 12 || 12;
      }
      setTimeText(`${String(h).padStart(2, '0')}:${m}${suffix}`);
      setSecondsText(`:${s}`);
      setDateText(
        now.toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        })
      );
    };

    update();
    const interval = clockShowSeconds ? 250 : 1000;
    const timer = window.setInterval(update, interval);
    return () => window.clearInterval(timer);
  }, [clock24h, clockShowSeconds]);

  // Focus Timer 1-second Interval & Singing Bowl Chime
  useEffect(() => {
    if (!focusActive) return;

    const interval = window.setInterval(() => {
      tickFocus();
    }, 1000);

    return () => window.clearInterval(interval);
  }, [focusActive, tickFocus]);

  // Chime singing bowl when a focus or break block concludes
  useEffect(() => {
    if (focusActive && prevRemainingRef.current === 1 && focusRemaining > 1) {
      ambientAudio.playSingingBowl();
    }
    prevRemainingRef.current = focusRemaining;
  }, [focusRemaining, focusActive]);

  // Subtle 9-zone OLED pixel-care drift every 90 seconds
  useEffect(() => {
    const driftTimer = window.setInterval(() => {
      setDrift({
        x: Math.round((Math.random() - 0.5) * 44),
        y: Math.round((Math.random() - 0.5) * 28),
      });
    }, 90_000);
    return () => window.clearInterval(driftTimer);
  }, []);

  if (
    !isImmersed ||
    !showClockInImmersion ||
    clockTheme === 'hidden' ||
    activeScene === 'oled-void' ||
    (noHud && (strictNoHud || !noHudRevealed))
  ) {
    return null;
  }

  // Theme-specific font styling
  let fontClasses = 'font-display font-light tracking-[-0.04em]';
  if (clockTheme === 'editorial-serif') {
    fontClasses = 'font-serif font-extralight italic tracking-tight';
  } else if (clockTheme === 'mono-telemetry') {
    fontClasses = 'font-mono font-medium tracking-normal tabular-nums';
  } else if (clockTheme === 'centered-hero') {
    fontClasses = 'font-display font-thin tracking-[-0.06em]';
  }

  const isCentered = clockTheme === 'centered-hero';

  // Format Focus Countdown (mm:ss)
  const focusMins = Math.floor(focusRemaining / 60);
  const focusSecs = String(focusRemaining % 60).padStart(2, '0');
  const focusProgress = Math.max(0, Math.min(1, 1 - focusRemaining / focusDuration));

  return (
    <motion.div
      initial={{ opacity: 0, y: isCentered ? 0 : -12, scale: isCentered ? 0.96 : 1 }}
      animate={{
        opacity: clockOpacity,
        x: drift.x,
        y: drift.y,
        scale: 1,
      }}
      exit={{ opacity: 0, y: isCentered ? 0 : -12 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed z-20 pointer-events-none select-none ${
        isCentered
          ? 'inset-0 flex flex-col items-center justify-center p-6 text-center'
          : 'top-9 left-9 sm:top-12 sm:left-12 p-4 rounded-3xl'
      }`}
      style={{
        background: isCentered
          ? 'transparent'
          : 'radial-gradient(circle at 20% 30%, rgba(0, 0, 0, 0.45) 0%, rgba(0, 0, 0, 0.15) 55%, transparent 75%)',
      }}
    >
      {/* Time Display */}
      <div
        className={`${fontClasses} text-white/95 leading-none flex items-baseline justify-center`}
        style={{
          fontSize: isCentered
            ? 'clamp(3.8rem, 11vw, 9.5rem)'
            : 'clamp(2.5rem, 5.2vw, 4.75rem)',
          textShadow: '0 2px 20px rgba(0, 0, 0, 0.8), 0 0 35px rgba(0, 0, 0, 0.65)',
        }}
      >
        <span>{timeText}</span>
        {clockShowSeconds && (
          <span
            className="font-mono text-white/55 ml-1.5"
            style={{ fontSize: isCentered ? '0.35em' : '0.45em' }}
          >
            {secondsText}
          </span>
        )}
      </div>

      {/* Date Display */}
      {clockShowDate && (
        <div
          className={`font-mono uppercase tracking-[0.22em] text-white/70 mt-2 ${
            isCentered ? 'text-xs sm:text-base' : 'text-xs sm:text-sm'
          }`}
          style={{ textShadow: '0 2px 14px rgba(0, 0, 0, 0.8), 0 0 24px rgba(0, 0, 0, 0.65)' }}
        >
          {dateText}
        </div>
      )}

      {/* Focus Timer Pill & Hairline Progress Indicator */}
      <AnimatePresence>
        {focusActive && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.92 }}
            className={`mt-3.5 inline-flex flex-col items-center pointer-events-auto ${
              isCentered ? 'mx-auto' : ''
            }`}
          >
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-white/15 backdrop-blur-md shadow-lg">
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${
                  focusIsBreak ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
              />
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-slate-300">
                {focusIsBreak ? 'Break' : 'Focus'}
              </span>
              <span className="font-mono text-xs font-semibold text-white tracking-wide">
                {focusMins}:{focusSecs}
              </span>
            </div>

            {/* Hairline Progress Bar */}
            <div className="w-24 h-0.5 mt-1.5 bg-white/15 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${
                  focusIsBreak ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.round(focusProgress * 100)}%` }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SpatialClockOverlay;
