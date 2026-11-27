import * as THREE from 'three';

export type SpatialSceneId =
  | 'fluid-data'
  | 'volumetric-megacity'
  | 'event-horizon'
  | 'carina-nebula'
  | 'binary-pulsar'
  | 'saturnian-orbit'
  | 'deep-void-drift'
  | 'midnight-cruise'
  | 'moonlit-shore'
  | 'arctic-aurora'
  | 'nocturne-glass'
  | 'abyssal-drift'
  | 'oled-void';

export type PowerProfile = 'eco' | 'smooth' | 'native';

export interface BloomPreset {
  strength: number;
  radius: number;
  threshold: number;
}

export interface SceneMeta {
  id: SpatialSceneId;
  title: string;
  subtitle: string;
  category: string;
  badge: string;
  description: string;
  shaderTech: string;
  oledProfile: string;
  accentPrimary: string;
  accentSecondary: string;
  accentTertiary: string;
  bloom: BloomPreset;
  exposure: number;
  isOledVoid?: boolean;
}

export interface EngineTelemetry {
  fps: number;
  pixelRatio: number;
  qualityScale: number;
  activeInstances: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  sceneId: SpatialSceneId;
  isOledVoid?: boolean;
}

export interface PostFXSettings {
  bloomMultiplier: number;
  filmGrain: number;
  chromaticAberration: number;
  dynamicResolution: boolean;
}

export interface ISpatialScene {
  readonly id: SpatialSceneId;
  readonly scene: THREE.Scene;
  readonly camera: THREE.PerspectiveCamera;
  readonly bloomPreset: BloomPreset;
  readonly exposure: number;
  readonly isFullScreenShader?: boolean;
  init(renderer: THREE.WebGLRenderer): void;
  update(delta: number, elapsed: number, pointer: THREE.Vector2): void;
  resize(width: number, height: number): void;
  setQuality(scale: number): void;
  getActiveInstanceCount(): number;
  dispose(): void;
}
