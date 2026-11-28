import { useEffect, useRef } from 'react';
import { useSpatialStore } from '../store/useSpatialStore';
import { SpatialSceneId } from '../engine/types';

const ALL_WEBGL_SCENES: SpatialSceneId[] = [
  'arctic-aurora',
  'moonlit-shore',
  'midnight-cruise',
  'nocturne-glass',
  'event-horizon',
  'volumetric-megacity',
  'carina-nebula',
  'binary-pulsar',
  'saturnian-orbit',
  'abyssal-drift',
  'fluid-data',
  'deep-void-drift',
];

function intervalToMs(val: string): number {
  switch (val) {
    case '5m':
      return 5 * 60 * 1000;
    case '15m':
      return 15 * 60 * 1000;
    case '30m':
      return 30 * 60 * 1000;
    case '60m':
      return 60 * 60 * 1000;
    default:
      return 0;
  }
}

function sleepDurationToMs(val: string): number {
  switch (val) {
    case '30m':
      return 30 * 60 * 1000;
    case '1h':
      return 60 * 60 * 1000;
    case '2h':
      return 120 * 60 * 1000;
    default:
      return 0;
  }
}

export function useCinemaTour(): void {
  const activeScene = useSpatialStore((s) => s.activeScene);
  const setActiveScene = useSpatialStore((s) => s.setActiveScene);
  const autoCycleInterval = useSpatialStore((s) => s.autoCycleInterval);
  const autoCycleFavoritesOnly = useSpatialStore((s) => s.autoCycleFavoritesOnly);
  const autoCycleShuffle = useSpatialStore((s) => s.autoCycleShuffle);
  const favoriteScenes = useSpatialStore((s) => s.favoriteScenes);
  const sleepTimer = useSpatialStore((s) => s.sleepTimer);
  const setSleepTimer = useSpatialStore((s) => s.setSleepTimer);

  const cycleTimerRef = useRef<number | null>(null);
  const sleepTimerRef = useRef<number | null>(null);

  // 1. Cinema Tour (Auto-Cycle Playlist)
  useEffect(() => {
    if (cycleTimerRef.current !== null) {
      window.clearTimeout(cycleTimerRef.current);
      cycleTimerRef.current = null;
    }

    const intervalMs = intervalToMs(autoCycleInterval);
    // Never auto-cycle out of OLED Void or when auto-cycle is disabled
    if (intervalMs <= 0 || activeScene === 'oled-void') return;

    cycleTimerRef.current = window.setTimeout(() => {
      if (document.hidden) return; // Pause countdown while tab is hidden

      const candidates = autoCycleFavoritesOnly && favoriteScenes.length > 0
        ? favoriteScenes.filter((id) => id !== 'oled-void')
        : ALL_WEBGL_SCENES;

      if (candidates.length <= 1) return;

      let nextScene: SpatialSceneId;
      if (autoCycleShuffle) {
        const pool = candidates.filter((id) => id !== activeScene);
        nextScene = pool[Math.floor(Math.random() * pool.length)] || candidates[0];
      } else {
        const currentIndex = candidates.indexOf(activeScene);
        const nextIndex = (currentIndex + 1) % candidates.length;
        nextScene = candidates[nextIndex];
      }

      setActiveScene(nextScene);
    }, intervalMs);

    return () => {
      if (cycleTimerRef.current !== null) {
        window.clearTimeout(cycleTimerRef.current);
        cycleTimerRef.current = null;
      }
    };
  }, [activeScene, autoCycleInterval, autoCycleFavoritesOnly, autoCycleShuffle, favoriteScenes, setActiveScene]);

  // 2. Auto-OLED Sleep Timer
  useEffect(() => {
    if (sleepTimerRef.current !== null) {
      window.clearTimeout(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }

    const sleepMs = sleepDurationToMs(sleepTimer);
    if (sleepMs <= 0 || activeScene === 'oled-void') return;

    sleepTimerRef.current = window.setTimeout(() => {
      setActiveScene('oled-void');
      setSleepTimer('off'); // Reset sleep timer once reached
    }, sleepMs);

    return () => {
      if (sleepTimerRef.current !== null) {
        window.clearTimeout(sleepTimerRef.current);
        sleepTimerRef.current = null;
      }
    };
  }, [activeScene, sleepTimer, setActiveScene, setSleepTimer]);
}
