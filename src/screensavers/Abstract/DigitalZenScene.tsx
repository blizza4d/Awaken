import React, { useEffect, useState } from 'react';

export const DigitalZenScene: React.FC = () => {
  const [breathPhase, setBreathPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');

  useEffect(() => {
    const cycle = () => {
      setBreathPhase('Inhale');
      setTimeout(() => {
        setBreathPhase('Hold');
        setTimeout(() => {
          setBreathPhase('Exhale');
        }, 3500);
      }, 3500);
    };

    cycle();
    const interval = setInterval(cycle, 10500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full bg-[#05070c] flex items-center justify-center overflow-hidden">
      {/* Background Soft Breathing Radial Gradient */}
      <div className="absolute w-[80vw] h-[80vw] max-w-[900px] max-h-[900px] rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.12)_0%,rgba(168,85,247,0.06)_40%,transparent_70%)] animate-pulse duration-[7000ms] blur-3xl pointer-events-none" />

      {/* 3D Gyroscope Concentric Rings Stage */}
      <div className="relative w-80 sm:w-96 h-80 sm:h-96 [perspective:1000px] flex items-center justify-center">
        {/* Ring 1 - Cyan */}
        <div
          className="absolute w-72 sm:w-80 h-72 sm:h-80 rounded-full border border-sky-400/35 shadow-[0_0_30px_rgba(56,189,248,0.25)] animate-spin"
          style={{
            animationDuration: '28s',
            transform: 'rotateX(65deg) rotateY(20deg)'
          }}
        />

        {/* Ring 2 - Purple */}
        <div
          className="absolute w-56 sm:w-64 h-56 sm:h-64 rounded-full border border-purple-400/35 shadow-[0_0_30px_rgba(168,85,247,0.25)] animate-spin"
          style={{
            animationDuration: '20s',
            animationDirection: 'reverse',
            transform: 'rotateX(25deg) rotateY(65deg)'
          }}
        />

        {/* Ring 3 - Emerald */}
        <div
          className="absolute w-40 sm:w-48 h-40 sm:h-48 rounded-full border border-emerald-400/35 shadow-[0_0_25px_rgba(16,185,129,0.25)] animate-spin"
          style={{
            animationDuration: '14s',
            transform: 'rotateX(45deg) rotateY(45deg)'
          }}
        />

        {/* Core Glowing Orb */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-400 shadow-[0_0_60px_rgba(56,189,248,0.7),0_0_100px_rgba(168,85,247,0.4)] animate-pulse duration-[3500ms]" />
      </div>

      {/* Breath Pacer Guidance */}
      <div className="absolute bottom-16 sm:bottom-24 flex flex-col items-center">
        <div className="text-sm uppercase tracking-[0.3em] font-mono text-cyan-300/80 font-medium animate-pulse duration-[3500ms]">
          {breathPhase}
        </div>
        <div className="text-[11px] uppercase tracking-widest font-mono text-slate-500 mt-1">
          Rhythmic Focus • Digital Zen
        </div>
      </div>
    </div>
  );
};

export default DigitalZenScene;
