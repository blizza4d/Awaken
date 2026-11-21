import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

export function useVisibility() {
  const { setPaused, isScreensaverActive } = useAppStore();

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setPaused(true);
      } else if (isScreensaverActive) {
        setPaused(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [setPaused, isScreensaverActive]);
}
