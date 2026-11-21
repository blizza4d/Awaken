import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSpatialStore } from '../../store/useSpatialStore';

export const SpatialClockOverlay: React.FC = () => {
  const { showClockInImmersion, clock24h, isImmersed, noHud, activeScene } = useSpatialStore();
  const [timeText, setTimeText] = useState('');
  const [dateText, setDateText] = useState('');
  const [drift, setDrift] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      let h = now.getHours();
      const m = String(now.getMinutes()).padStart(2, '0');
      let suffix = '';
      if (!clock24h) {
        suffix = h >= 12 ? ' PM' : ' AM';
        h = h % 12 || 12;
      }
      setTimeText(`${String(h).padStart(2, '0')}:${m}${suffix}`);
      setDateText(
        now.toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        })
      );
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [clock24h]);

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

  if (!isImmersed || !showClockInImmersion || noHud || activeScene === 'oled-void') return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 0.72, x: drift.x, y: drift.y }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-9 left-9 sm:top-12 sm:left-12 z-20 pointer-events-none select-none"
    >
      <div
        className="font-display font-light tracking-[-0.04em] text-white/90 leading-none"
        style={{
          fontSize: 'clamp(2.5rem, 5.2vw, 4.75rem)',
          textShadow: '0 4px 28px rgba(0, 0, 0, 0.72)',
        }}
      >
        {timeText}
      </div>
      <div
        className="font-mono text-xs sm:text-sm uppercase tracking-[0.22em] text-white/60 mt-1.5"
        style={{ textShadow: '0 2px 14px rgba(0, 0, 0, 0.8)' }}
      >
        {dateText}
      </div>
    </motion.div>
  );
};

export default SpatialClockOverlay;
