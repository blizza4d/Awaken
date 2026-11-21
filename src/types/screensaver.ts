export type ScreensaverId =
  | 'minimal'
  | 'cyberpunk'
  | 'night-drive'
  | 'space'
  | 'rainy-window'
  | 'fireplace'
  | 'northern-lights'
  | 'aquarium'
  | 'mountain-escape'
  | 'digital-zen';

export type PerformanceProfile = 'eco' | 'balanced' | 'cinematic';

export type MountainPalette = 'midnight' | 'sunset' | 'winter';

export type WakeLockStatus = 'unsupported' | 'active' | 'inactive' | 'error';

export type NavTab = 'overview' | 'screensavers' | 'stay-awake' | 'favorites' | 'settings';

export interface ScreensaverMeta {
  id: ScreensaverId;
  title: string;
  category: 'ultra-low' | 'cinematic' | 'relaxing' | 'nature' | 'abstract';
  tag: string;
  description: string;
  engine: 'Three.js WebGL' | 'Canvas 2D' | 'Zero-Resource DOM';
  resourceUsage: 'Ultra Low (~0.01%)' | 'Lightweight' | 'Balanced' | 'High Performance';
  is3D?: boolean;
  featured?: boolean;
}

export interface PostProcessingConfig {
  bloom: boolean;
  bloomIntensity: number; // 0.1 - 2.5
  antiAliasing: boolean;
  resolutionScale: number; // 0.5 - 2.0
  chromaticAberration: boolean;
}

export interface AppSettings {
  selectedMode: ScreensaverId;
  performanceProfile: PerformanceProfile;
  postProcessing: PostProcessingConfig;
  wakeLockEnabled: boolean;
  clockEnabled: boolean;
  clock24h: boolean;
  clockSeconds: boolean;
  clockDate: boolean;
  clockOpacity: number; // 10-100
  brightness: number;   // 15-100
  burnInProtection: boolean;
  burnInIntervalMinutes: number; // 1, 2, 5
  mountainPalette: MountainPalette;
  autoFullscreenOnLaunch: boolean;
  autoCycleMinutes: number; // 0 = off, 5, 15, 30
  soundEnabled: boolean;
  soundVolume: number; // 0-100
  favorites: ScreensaverId[];
}
