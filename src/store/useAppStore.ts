import { create } from 'zustand';
import {
  AppSettings,
  NavTab,
  ScreensaverId,
  WakeLockStatus,
  PostProcessingConfig
} from '../types/screensaver';

const STORAGE_KEY = 'awaken_v4_store';

const defaultSettings: AppSettings = {
  selectedMode: 'minimal',
  performanceProfile: 'cinematic',
  postProcessing: {
    bloom: true,
    bloomIntensity: 1.25,
    antiAliasing: true,
    resolutionScale: 1.0,
    chromaticAberration: true
  },
  wakeLockEnabled: true,
  clockEnabled: true,
  clock24h: true,
  clockSeconds: false,
  clockDate: true,
  clockOpacity: 40,
  brightness: 100,
  burnInProtection: true,
  burnInIntervalMinutes: 2,
  mountainPalette: 'midnight',
  autoFullscreenOnLaunch: false,
  autoCycleMinutes: 0,
  soundEnabled: false,
  soundVolume: 35,
  favorites: ['minimal', 'cyberpunk', 'space', 'night-drive', 'rainy-window']
};

function loadStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...defaultSettings,
        ...parsed,
        postProcessing: {
          ...defaultSettings.postProcessing,
          ...(parsed.postProcessing || {})
        }
      };
    }
  } catch (e) {
    console.warn('[AwakenStore] LocalStorage error', e);
  }
  return defaultSettings;
}

function persistSettings(settings: AppSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('[AwakenStore] Failed saving settings', e);
  }
}

interface AppState {
  settings: AppSettings;
  currentTab: NavTab;
  isScreensaverActive: boolean;
  isPaused: boolean;
  wakeLockStatus: WakeLockStatus;
  sessionStartTime: number | null;
  sessionSeconds: number;
  isHudVisible: boolean;
  settingsModalOpen: boolean;

  // Actions
  setCurrentTab: (tab: NavTab) => void;
  selectMode: (modeId: ScreensaverId) => void;
  startScreensaver: () => void;
  exitScreensaver: () => void;
  togglePause: () => void;
  setPaused: (paused: boolean) => void;
  setWakeLockStatus: (status: WakeLockStatus) => void;
  setHudVisible: (visible: boolean) => void;
  setSettingsModalOpen: (open: boolean) => void;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  updatePostProcessing: (updates: Partial<PostProcessingConfig>) => void;
  toggleFavorite: (modeId: ScreensaverId) => void;
  incrementSessionTime: () => void;
  resetToDefaults: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  settings: loadStoredSettings(),
  currentTab: 'overview',
  isScreensaverActive: false,
  isPaused: false,
  wakeLockStatus: 'inactive',
  sessionStartTime: null,
  sessionSeconds: 0,
  isHudVisible: false,
  settingsModalOpen: false,

  setCurrentTab: (tab) => set({ currentTab: tab }),

  selectMode: (modeId) => {
    const updated = { ...get().settings, selectedMode: modeId };
    persistSettings(updated);
    set({ settings: updated });
  },

  startScreensaver: () => {
    set({
      isScreensaverActive: true,
      isPaused: false,
      sessionStartTime: Date.now(),
      sessionSeconds: 0,
      isHudVisible: true
    });
  },

  exitScreensaver: () => {
    set({
      isScreensaverActive: false,
      isPaused: false,
      isHudVisible: false
    });
  },

  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),

  setPaused: (paused) => set({ isPaused: paused }),

  setWakeLockStatus: (status) => set({ wakeLockStatus: status }),

  setHudVisible: (visible) => set({ isHudVisible: visible }),

  setSettingsModalOpen: (open) => set({ settingsModalOpen: open }),

  updateSetting: (key, value) => {
    const updated = { ...get().settings, [key]: value };
    persistSettings(updated);
    set({ settings: updated });
  },

  updatePostProcessing: (updates) => {
    const current = get().settings;
    const updated = {
      ...current,
      postProcessing: {
        ...current.postProcessing,
        ...updates
      }
    };
    persistSettings(updated);
    set({ settings: updated });
  },

  toggleFavorite: (modeId) => {
    const { settings } = get();
    const favs = settings.favorites.includes(modeId)
      ? settings.favorites.filter((id) => id !== modeId)
      : [...settings.favorites, modeId];
    const updated = { ...settings, favorites: favs };
    persistSettings(updated);
    set({ settings: updated });
  },

  incrementSessionTime: () => set((state) => ({ sessionSeconds: state.sessionSeconds + 1 })),

  resetToDefaults: () => {
    persistSettings(defaultSettings);
    set({ settings: defaultSettings });
  }
}));
