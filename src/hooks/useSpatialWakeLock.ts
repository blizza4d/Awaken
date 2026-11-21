import { useEffect, useRef, useCallback } from 'react';
import { useSpatialStore } from '../store/useSpatialStore';

export function useSpatialWakeLock() {
  const sentinelRef = useRef<WakeLockSentinel | null>(null);
  const { wakeLockStatus, wakeLockPreferred, setWakeLockStatus, setWakeLockPreferred } =
    useSpatialStore();

  const requestLock = useCallback(async () => {
    if (!('wakeLock' in navigator)) {
      setWakeLockStatus('unsupported');
      return;
    }
    try {
      if (sentinelRef.current && !sentinelRef.current.released) {
        setWakeLockStatus('active');
        return;
      }
      const sentinel = await navigator.wakeLock.request('screen');
      sentinelRef.current = sentinel;
      setWakeLockStatus('active');

      sentinel.addEventListener('release', () => {
        if (sentinelRef.current === sentinel) {
          sentinelRef.current = null;
          setWakeLockStatus('inactive');
        }
      });
    } catch {
      setWakeLockStatus('inactive');
    }
  }, [setWakeLockStatus]);

  const releaseLock = useCallback(async () => {
    if (sentinelRef.current) {
      try {
        await sentinelRef.current.release();
      } catch {
        // Already released
      }
      sentinelRef.current = null;
    }
    setWakeLockStatus('inactive');
  }, [setWakeLockStatus]);

  const toggleWakeLock = useCallback(async () => {
    if (wakeLockStatus === 'active') {
      setWakeLockPreferred(false);
      await releaseLock();
    } else {
      setWakeLockPreferred(true);
      await requestLock();
    }
  }, [wakeLockStatus, setWakeLockPreferred, releaseLock, requestLock]);

  // Auto-acquire on mount if preferred & reacquire on visibilitychange
  useEffect(() => {
    if (wakeLockPreferred) {
      void requestLock();
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && useSpatialStore.getState().wakeLockPreferred) {
        void requestLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [wakeLockPreferred, requestLock]);

  return { wakeLockStatus, toggleWakeLock, requestLock, releaseLock };
}
