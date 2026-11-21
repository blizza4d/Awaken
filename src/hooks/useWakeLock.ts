import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';

export function useWakeLock() {
  const wakeLockSentinelRef = useRef<WakeLockSentinel | null>(null);
  const { settings, wakeLockStatus, setWakeLockStatus } = useAppStore();

  const isSupported = typeof navigator !== 'undefined' && 'wakeLock' in navigator;

  const requestLock = useCallback(async () => {
    if (!settings.wakeLockEnabled) return false;
    if (!isSupported) {
      setWakeLockStatus('unsupported');
      return false;
    }
    if (wakeLockSentinelRef.current !== null) {
      return true; // already active
    }

    try {
      const sentinel = await navigator.wakeLock.request('screen');
      sentinel.addEventListener('release', () => {
        wakeLockSentinelRef.current = null;
        setWakeLockStatus('inactive');
      });
      wakeLockSentinelRef.current = sentinel;
      setWakeLockStatus('active');
      return true;
    } catch (err: any) {
      console.warn('[WakeLock] Request failed:', err?.name, err?.message);
      setWakeLockStatus('error');
      return false;
    }
  }, [settings.wakeLockEnabled, isSupported, setWakeLockStatus]);

  const releaseLock = useCallback(async () => {
    if (wakeLockSentinelRef.current) {
      try {
        await wakeLockSentinelRef.current.release();
      } catch (err) {
        console.warn('[WakeLock] Release error:', err);
      }
      wakeLockSentinelRef.current = null;
    }
    setWakeLockStatus('inactive');
  }, [setWakeLockStatus]);

  const toggleLock = useCallback(async () => {
    if (wakeLockStatus === 'active') {
      await releaseLock();
    } else {
      await requestLock();
    }
  }, [wakeLockStatus, releaseLock, requestLock]);

  // Re-acquire lock when page becomes visible
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && settings.wakeLockEnabled) {
        requestLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [settings.wakeLockEnabled, requestLock]);

  return {
    isSupported,
    wakeLockStatus,
    requestLock,
    releaseLock,
    toggleLock
  };
}
