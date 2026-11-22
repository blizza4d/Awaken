import { create } from 'zustand';
import { SpatialSceneId, EngineTelemetry, PostFXSettings } from '../engine/types';

const STORAGE_KEY = 'awaken_spatial_v5';

interface PersistedPrefs {
  activeScene: SpatialSceneId;
  postFX: PostFXSettings;
  showClockInImmersion: boolean;
  clock24h: boolean;
  brightness: number;
  wakeLockPreferred: boolean;
  strictNoHud: boolean;
  oledClockOpacity: number;
}

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
};

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
  audioEnabled: boolean;
  wakeLockStatus: 'active' | 'inactive' | 'unsupported';
  telemetry: EngineTelemetry;
  noHud: boolean;
  noHudRevealed: boolean;

  // Actions
  setActiveScene: (id: SpatialSceneId) => void;
  launchSceneWithFlip: (id: SpatialSceneId) => void;
  setImmersed: (immersed: boolean) => void;
  toggleImmersed: () => void;
  setSettingsOpen: (open: boolean) => void;
  setAudioEnabled: (enabled: boolean) => void;
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
  });
}

export const useSpatialStore = create<SpatialState>((set, get) => ({
  ...initial,
  isImmersed: false,
  expandingSceneId: null,
  settingsOpen: false,
  audioEnabled: false,
  wakeLockStatus: 'inactive',
  noHud: false,
  noHudRevealed: false,
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
  setAudioEnabled: (enabled) => set({ audioEnabled: enabled }),
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
}));
