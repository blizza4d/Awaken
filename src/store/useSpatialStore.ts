import { create } from 'zustand';
import {
  SpatialSceneId,
  EngineTelemetry,
  PostFXSettings,
  PowerProfile,
  ClockTheme,
  AutoCycleInterval,
  SleepTimerDuration,
  FocusModeType,
} from '../engine/types';

const STORAGE_KEY = 'awaken_spatial_v6';

interface PersistedPrefs {
  activeScene: SpatialSceneId;
  postFX: PostFXSettings;
  showClockInImmersion: boolean;
  clock24h: boolean;
  brightness: number;
  wakeLockPreferred: boolean;
  strictNoHud: boolean;
  oledClockOpacity: number;
  powerProfile: PowerProfile;
  audioEnabled: boolean;
  audioVolume: number;
  autoCycleInterval: AutoCycleInterval;
  autoCycleFavoritesOnly: boolean;
  autoCycleShuffle: boolean;
  favoriteScenes: SpatialSceneId[];
  sleepTimer: SleepTimerDuration;
  clockTheme: ClockTheme;
  clockShowDate: boolean;
  clockShowSeconds: boolean;
  clockOpacity: number;
  motionSpeed: number;
  ambientDimmer: number;
  subtleParallax: boolean;
}

const ALL_SCENE_IDS: SpatialSceneId[] = [
  'fluid-data',
  'volumetric-megacity',
  'event-horizon',
  'carina-nebula',
  'binary-pulsar',
  'saturnian-orbit',
  'deep-void-drift',
  'midnight-cruise',
  'moonlit-shore',
  'arctic-aurora',
  'nocturne-glass',
  'abyssal-drift',
  'oled-void',
];

const defaultFavorites: SpatialSceneId[] = [
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

const defaultPrefs: PersistedPrefs = {
  activeScene: 'event-horizon',
  postFX: {
    bloomMultiplier: 1.0,
    filmGrain: 0.024,
    chromaticAberration: 0.0018,
    dynamicResolution: true,
  },
  showClockInImmersion: true,
  clock24h: true,
  brightness: 100,
  wakeLockPreferred: true,
  strictNoHud: false,
  oledClockOpacity: 0.30,
  powerProfile: 'smooth',
  audioEnabled: false,
  audioVolume: 0.35,
  autoCycleInterval: 'off',
  autoCycleFavoritesOnly: false,
  autoCycleShuffle: false,
  favoriteScenes: defaultFavorites,
  sleepTimer: 'off',
  clockTheme: 'minimal-sans',
  clockShowDate: true,
  clockShowSeconds: false,
  clockOpacity: 0.85,
  motionSpeed: 1.0,
  ambientDimmer: 1.0,
  subtleParallax: true,
};

function loadPrefs(): PersistedPrefs {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        ...defaultPrefs,
        ...parsed,
        activeScene: ALL_SCENE_IDS.includes(parsed.activeScene)
          ? parsed.activeScene
          : defaultPrefs.activeScene,
        favoriteScenes: Array.isArray(parsed.favoriteScenes)
          ? parsed.favoriteScenes.filter((id: SpatialSceneId) => ALL_SCENE_IDS.includes(id))
          : defaultPrefs.favoriteScenes,
        postFX: {
          ...defaultPrefs.postFX,
          ...(parsed.postFX || {}),
        },
      };
    }
  } catch {
    // Ignore storage access errors
  }
  return defaultPrefs;
}

function savePrefs(prefs: PersistedPrefs): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage quota errors
  }
}

export interface SpatialState extends PersistedPrefs {
  isImmersed: boolean;
  expandingSceneId: SpatialSceneId | null;
  settingsOpen: boolean;
  shortcutsOpen: boolean;
  wakeLockStatus: 'active' | 'inactive' | 'unsupported';
  telemetry: EngineTelemetry;
  noHud: boolean;
  noHudRevealed: boolean;

  // Focus / Pomodoro Mode
  focusActive: boolean;
  focusMode: FocusModeType;
  focusDuration: number;
  focusRemaining: number;
  focusIsBreak: boolean;

  // Actions
  setActiveScene: (id: SpatialSceneId) => void;
  launchSceneWithFlip: (id: SpatialSceneId) => void;
  setImmersed: (immersed: boolean) => void;
  toggleImmersed: () => void;
  setSettingsOpen: (open: boolean) => void;
  setShortcutsOpen: (open: boolean) => void;
  toggleShortcutsOpen: () => void;
  setAudioEnabled: (enabled: boolean) => void;
  toggleAudioEnabled: () => void;
  setAudioVolume: (volume: number) => void;
  setWakeLockStatus: (status: 'active' | 'inactive' | 'unsupported') => void;
  setWakeLockPreferred: (preferred: boolean) => void;
  updatePostFX: (partial: Partial<PostFXSettings>) => void;
  setShowClockInImmersion: (show: boolean) => void;
  setClock24h: (use24h: boolean) => void;
  setBrightness: (val: number) => void;
  setTelemetry: (t: EngineTelemetry) => void;
  setNoHud: (noHud: boolean) => void;
  toggleNoHud: () => void;
  setNoHudRevealed: (revealed: boolean) => void;
  setStrictNoHud: (strict: boolean) => void;
  setOledClockOpacity: (opacity: number) => void;
  setPowerProfile: (profile: PowerProfile) => void;

  // Cinema Tour & Sleep Timer
  setAutoCycleInterval: (val: AutoCycleInterval) => void;
  setAutoCycleFavoritesOnly: (val: boolean) => void;
  setAutoCycleShuffle: (val: boolean) => void;
  toggleFavoriteScene: (id: SpatialSceneId) => void;
  setSleepTimer: (val: SleepTimerDuration) => void;

  // Clock Customization
  setClockTheme: (theme: ClockTheme) => void;
  setClockShowDate: (show: boolean) => void;
  setClockShowSeconds: (show: boolean) => void;
  setClockOpacity: (opacity: number) => void;

  // Atmosphere Tuning & Parallax
  setMotionSpeed: (speed: number) => void;
  setAmbientDimmer: (dimmer: number) => void;
  setSubtleParallax: (parallax: boolean) => void;

  // Focus Mode Actions
  startFocus: (mode?: FocusModeType, customMinutes?: number) => void;
  pauseFocus: () => void;
  resumeFocus: () => void;
  resetFocus: () => void;
  tickFocus: () => void;
}

const initial = loadPrefs();

function persistFromState(s: SpatialState): void {
  savePrefs({
    activeScene: s.activeScene,
    postFX: s.postFX,
    showClockInImmersion: s.showClockInImmersion,
    clock24h: s.clock24h,
    brightness: s.brightness,
    wakeLockPreferred: s.wakeLockPreferred,
    strictNoHud: s.strictNoHud,
    oledClockOpacity: s.oledClockOpacity,
    powerProfile: s.powerProfile,
    audioEnabled: s.audioEnabled,
    audioVolume: s.audioVolume,
    autoCycleInterval: s.autoCycleInterval,
    autoCycleFavoritesOnly: s.autoCycleFavoritesOnly,
    autoCycleShuffle: s.autoCycleShuffle,
    favoriteScenes: s.favoriteScenes,
    sleepTimer: s.sleepTimer,
    clockTheme: s.clockTheme,
    clockShowDate: s.clockShowDate,
    clockShowSeconds: s.clockShowSeconds,
    clockOpacity: s.clockOpacity,
    motionSpeed: s.motionSpeed,
    ambientDimmer: s.ambientDimmer,
    subtleParallax: s.subtleParallax,
  });
}

export const useSpatialStore = create<SpatialState>((set, get) => ({
  ...initial,
  isImmersed: false,
  expandingSceneId: null,
  settingsOpen: false,
  shortcutsOpen: false,
  wakeLockStatus: 'inactive',
  noHud: false,
  noHudRevealed: false,
  focusActive: false,
  focusMode: '25/5',
  focusDuration: 25 * 60,
  focusRemaining: 25 * 60,
  focusIsBreak: false,
  telemetry: {
    fps: 60,
    pixelRatio: Math.min(window.devicePixelRatio || 1, 2),
    qualityScale: 1.0,
    activeInstances: 45000,
    drawCalls: 2,
    triangles: 45000,
    geometries: 2,
    textures: 0,
    sceneId: initial.activeScene,
  },

  setActiveScene: (id) => {
    set({ activeScene: id });
    persistFromState(get());
  },

  launchSceneWithFlip: (id) => {
    set({
      activeScene: id,
      expandingSceneId: id,
      isImmersed: true,
      settingsOpen: false,
    });
    persistFromState(get());
  },

  setImmersed: (immersed) =>
    set({
      isImmersed: immersed,
      expandingSceneId: immersed ? get().activeScene : null,
      settingsOpen: immersed ? false : get().settingsOpen,
    }),

  toggleImmersed: () => {
    const next = !get().isImmersed;
    set({
      isImmersed: next,
      expandingSceneId: next ? get().activeScene : null,
      settingsOpen: next ? false : get().settingsOpen,
    });
  },

  setSettingsOpen: (open) => set({ settingsOpen: open }),
  setShortcutsOpen: (open) => set({ shortcutsOpen: open }),
  toggleShortcutsOpen: () => set((s) => ({ shortcutsOpen: !s.shortcutsOpen })),

  setAudioEnabled: (enabled) => {
    set({ audioEnabled: enabled });
    persistFromState(get());
  },
  toggleAudioEnabled: () => {
    set((s) => ({ audioEnabled: !s.audioEnabled }));
    persistFromState(get());
  },
  setAudioVolume: (volume) => {
    const clamped = Math.max(0, Math.min(1, volume));
    set({ audioVolume: clamped });
    persistFromState(get());
  },

  setWakeLockStatus: (status) => set({ wakeLockStatus: status }),
  setWakeLockPreferred: (preferred) => {
    set({ wakeLockPreferred: preferred });
    persistFromState(get());
  },

  updatePostFX: (partial) => {
    const nextPostFX = { ...get().postFX, ...partial };
    set({ postFX: nextPostFX });
    persistFromState(get());
  },

  setShowClockInImmersion: (show) => {
    set({ showClockInImmersion: show });
    persistFromState(get());
  },
  setClock24h: (use24h) => {
    set({ clock24h: use24h });
    persistFromState(get());
  },
  setBrightness: (val) => {
    set({ brightness: Math.max(20, Math.min(100, val)) });
    persistFromState(get());
  },
  setTelemetry: (telemetry) => set({ telemetry }),

  setNoHud: (noHud) => set({ noHud }),
  toggleNoHud: () => set((s) => ({ noHud: !s.noHud, noHudRevealed: false })),
  setNoHudRevealed: (noHudRevealed) => set({ noHudRevealed }),
  setStrictNoHud: (strictNoHud) => {
    set({ strictNoHud });
    persistFromState(get());
  },
  setOledClockOpacity: (oledClockOpacity) => {
    const clamped = Math.max(0.1, Math.min(1.0, oledClockOpacity));
    set({ oledClockOpacity: clamped });
    persistFromState(get());
  },
  setPowerProfile: (powerProfile) => {
    set({ powerProfile });
    persistFromState(get());
  },

  // Cinema Tour & Sleep Timer Actions
  setAutoCycleInterval: (autoCycleInterval) => {
    set({ autoCycleInterval });
    persistFromState(get());
  },
  setAutoCycleFavoritesOnly: (autoCycleFavoritesOnly) => {
    set({ autoCycleFavoritesOnly });
    persistFromState(get());
  },
  setAutoCycleShuffle: (autoCycleShuffle) => {
    set({ autoCycleShuffle });
    persistFromState(get());
  },
  toggleFavoriteScene: (id) => {
    const current = get().favoriteScenes;
    const exists = current.includes(id);
    const updated = exists ? current.filter((x) => x !== id) : [...current, id];
    set({ favoriteScenes: updated });
    persistFromState(get());
  },
  setSleepTimer: (sleepTimer) => {
    set({ sleepTimer });
    persistFromState(get());
  },

  // Clock Customization Actions
  setClockTheme: (clockTheme) => {
    set({ clockTheme });
    persistFromState(get());
  },
  setClockShowDate: (clockShowDate) => {
    set({ clockShowDate });
    persistFromState(get());
  },
  setClockShowSeconds: (clockShowSeconds) => {
    set({ clockShowSeconds });
    persistFromState(get());
  },
  setClockOpacity: (clockOpacity) => {
    const clamped = Math.max(0.15, Math.min(1.0, clockOpacity));
    set({ clockOpacity: clamped });
    persistFromState(get());
  },

  // Atmosphere Tuning & Parallax Actions
  setMotionSpeed: (motionSpeed) => {
    const clamped = Math.max(0.25, Math.min(2.0, motionSpeed));
    set({ motionSpeed: clamped });
    persistFromState(get());
  },
  setAmbientDimmer: (ambientDimmer) => {
    const clamped = Math.max(0.40, Math.min(1.20, ambientDimmer));
    set({ ambientDimmer: clamped });
    persistFromState(get());
  },
  setSubtleParallax: (subtleParallax) => {
    set({ subtleParallax });
    persistFromState(get());
  },

  // Focus Mode Actions
  startFocus: (mode = '25/5', customMinutes) => {
    let dur = 25 * 60;
    if (mode === '50/10') dur = 50 * 60;
    else if (mode === 'custom' && customMinutes) dur = Math.max(1, customMinutes) * 60;

    set({
      focusActive: true,
      focusMode: mode,
      focusDuration: dur,
      focusRemaining: dur,
      focusIsBreak: false,
    });
  },
  pauseFocus: () => set({ focusActive: false }),
  resumeFocus: () => set({ focusActive: true }),
  resetFocus: () =>
    set((s) => ({
      focusActive: false,
      focusRemaining: s.focusDuration,
      focusIsBreak: false,
    })),
  tickFocus: () => {
    const s = get();
    if (!s.focusActive) return;
    if (s.focusRemaining > 1) {
      set({ focusRemaining: s.focusRemaining - 1 });
    } else {
      // Switch between focus and break
      const nextIsBreak = !s.focusIsBreak;
      let nextDuration = 5 * 60;
      if (nextIsBreak) {
        nextDuration = s.focusMode === '50/10' ? 10 * 60 : 5 * 60;
      } else {
        nextDuration = s.focusDuration;
      }
      set({
        focusIsBreak: nextIsBreak,
        focusRemaining: nextDuration,
      });
    }
  },
}));
