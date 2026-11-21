import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

export function useSessionTimer() {
  const { isScreensaverActive, isPaused, incrementSessionTime, sessionSeconds } = useAppStore();

  useEffect(() => {
    if (!isScreensaverActive || isPaused) return;

    const timer = setInterval(() => {
      incrementSessionTime();
    }, 1000);

    return () => clearInterval(timer);
  }, [isScreensaverActive, isPaused, incrementSessionTime]);

  const formatSessionTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
    }
    return `${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  return {
    sessionSeconds,
    formattedTime: formatSessionTime(sessionSeconds)
  };
}
