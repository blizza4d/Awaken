import { SceneMeta } from './types';

export const SPATIAL_SCENES: SceneMeta[] = [
  {
    id: 'carina-nebula',
    title: 'Carina Nebula',
    subtitle: 'Volumetric Deep Space Pillars',
    category: 'DEEP SPACE // VOLUMETRIC',
    badge: '32K STARS • FBM NOISE',
    description:
      'Hypnotic slow drift through glowing interstellar dust clouds rendered via layered volumetric noise shaders (deep indigo, cosmic teal, warm amber gold) and 32,000+ spectral stars.',
    shaderTech: 'Volumetric FBM Slabs • Spectral Twinkle • Soft Alpha',
    oledProfile: 'Deep Interstellar Black • Weightless Drift',
    accentPrimary: '#2dd4bf', // Teal
    accentSecondary: '#6366f1', // Indigo
    accentTertiary: '#f59e0b', // Amber
    bloom: { strength: 0.30, radius: 0.50, threshold: 0.88 },
    exposure: 0.76,
  },
  {
    id: 'binary-pulsar',
    title: 'Binary Pulsar',
    subtitle: 'Relativistic Polar Plasma Jets',
    category: 'ASTROPHYSICS // RELATIVISTIC',
    badge: 'SHOCK JETS • ROCHE STREAM',
    description:
      'Rapidly orbiting binary neutron star system projecting luminous relativistic plasma jets from magnetic poles, surrounded by magnetic flux loops and Roche-lobe mass transfer.',
    shaderTech: 'Emissive Plasma Shaders • Helical Jet Beams • Fresnel Limb',
    oledProfile: 'High-Contrast Void • Intense Core Radiance',
    accentPrimary: '#00f0ff', // Cyan
    accentSecondary: '#ec4899', // Magenta
    accentTertiary: '#facc15', // Gold
    bloom: { strength: 0.32, radius: 0.48, threshold: 0.90 },
    exposure: 0.78,
  },
  {
    id: 'saturnian-orbit',
    title: 'Saturnian Orbit',
    subtitle: 'Ringed Gas Giant Eclipsed Horizon',
    category: 'SOLAR SYSTEM // PHOTOREALISTIC',
    badge: 'MUTUAL SHADOWS • CASSINI GAP',
    description:
      'Massive procedural gas giant with turbulent banded atmospheric wind shear, blue-gold Rayleigh scattering rim, and dense planetary rings casting crisp mutual shadows with the planet.',
    shaderTech: 'Banded Zonal Shear • Ray-Plane Ring Shadows • Rayleigh Limb',
    oledProfile: 'Eclipsed Nightside #000000 • Milky Way Band',
    accentPrimary: '#f59e0b', // Amber
    accentSecondary: '#38bdf8', // Azure
    accentTertiary: '#fde68a', // Cream
    bloom: { strength: 0.26, radius: 0.45, threshold: 0.90 },
    exposure: 0.76,
  },
  {
    id: 'event-horizon',
    title: 'Event Horizon',
    subtitle: 'Schwarzschild Gravitational Lensing',
    category: 'SPACE // RAYMARCHED',
    badge: 'GEODESIC SHADER',
    description:
      'Photorealistic supermassive black hole integrating curved null geodesics via full-screen fragment raymarching. Bends starlight into Einstein rings around a Doppler-beamed swirling volumetric accretion disk.',
    shaderTech: 'Raymarched Lensing • Doppler Disk • 45K Plasma',
    oledProfile: 'True Event Horizon Black • Orbital Motion',
    accentPrimary: '#ff6a00',
    accentSecondary: '#38bdf8',
    accentTertiary: '#fde047',
    bloom: { strength: 0.35, radius: 0.48, threshold: 0.90 },
    exposure: 0.75,
  },
  {
    id: 'fluid-data',
    title: 'Fluid Data',
    subtitle: 'Bioluminescent Curl-Noise Fiber Optics',
    category: 'ABSTRACT // OLED SAFE',
    badge: '110K INSTANCES',
    description:
      'Divergence-free 3D Simplex curl-noise particle stream on pitch-black OLED obsidian. Shifts smoothly between deep cyan, electric violet, and molten gold with a 10-minute anti-burn-in orbital drift.',
    shaderTech: 'GPU Curl Noise • InstancedMesh • HDR Bloom',
    oledProfile: '10-Min Lissajous Drift • True #000000',
    accentPrimary: '#00f0ff',
    accentSecondary: '#8b5cf6',
    accentTertiary: '#fbbf24',
    bloom: { strength: 0.28, radius: 0.45, threshold: 0.90 },
    exposure: 0.76,
  },
  {
    id: 'volumetric-megacity',
    title: 'Volumetric Megacity',
    subtitle: 'Rain-Drenched Neon Drone Descent',
    category: 'CYBERPUNK // HIGH FIDELITY',
    badge: 'PBR WETNESS',
    description:
      'High-altitude autonomous drone flight through instanced megastructures with specular rain-wetness PBR maps, randomized emissive windows, neon-absorbing FogExp2, wind-driven rain sheets, and rooftop splash ripples.',
    shaderTech: 'PBR Wetness Maps • FogExp2 • GLSL Rain + Splashes',
    oledProfile: 'Dynamic Camera Pan • ACESFilmic',
    accentPrimary: '#ff2a85',
    accentSecondary: '#00f0ff',
    accentTertiary: '#ff9f1c',
    bloom: { strength: 0.32, radius: 0.48, threshold: 0.88 },
    exposure: 0.80,
  },
  {
    id: 'deep-void-drift',
    title: 'Deep Void Drift',
    subtitle: 'Empty Space Wanderer',
    category: 'COSMIC // MEDITATIVE',
    badge: 'SPARSE VOID • OLED SAFE',
    description:
      'A quiet, meditative drift through vast, mostly empty intergalactic space. Solitary pinpoint stars emerge and fade without popping, punctuated by rare distant galaxies, binary pairs, and red giants.',
    shaderTech: 'Sparse Pinpoints • Distance Fade • FBM Void Dust',
    oledProfile: 'Near-Pitch Black #010205 • True Deep Blacks',
    accentPrimary: '#a78bfa',
    accentSecondary: '#38bdf8',
    accentTertiary: '#f87171',
    bloom: { strength: 0.24, radius: 0.42, threshold: 0.92 },
    exposure: 0.72,
  },
  {
    id: 'midnight-cruise',
    title: 'Midnight Cruise',
    subtitle: 'Side-View Casual Night Drive',
    category: 'ATMOSPHERIC // LO-FI',
    badge: 'WET ASPHALT • PARALLAX',
    description:
      'Relaxing late-night drive viewed from a side-tracking perspective. Minimalist dark GT car with subtle suspension bounce glides past rhythmic sodium and LED streetlights on wet reflective asphalt.',
    shaderTech: 'Wet Road Shaders • Volumetric Headlights • Multi-Layer Parallax',
    oledProfile: 'Night Cruise Silhouette • Deep Midnight Blue',
    accentPrimary: '#f59e0b',
    accentSecondary: '#38bdf8',
    accentTertiary: '#ef4444',
    bloom: { strength: 0.30, radius: 0.50, threshold: 0.88 },
    exposure: 0.80,
  },
  {
    id: 'moonlit-shore',
    title: 'Moonlit Shore',
    subtitle: 'Crashing Ocean Waves',
    category: 'SEASCAPE // PROCEDURAL',
    badge: 'GERSTNER WAVES • SSS FOAM',
    description:
      'Tranquil twilight beach with procedural 8-wave Gerstner ocean swells crashing onto dark sand. Features dynamic wave crest foam, deep-teal subsurface scattering, and shimmering moonlit specular reflections.',
    shaderTech: 'Multi-Wave Gerstner • Analytic Normals • Wet Sand Mask',
    oledProfile: 'Twilight Ocean • Moon Glint Track',
    accentPrimary: '#38bdf8',
    accentSecondary: '#2dd4bf',
    accentTertiary: '#e0f2fe',
    bloom: { strength: 0.82, radius: 0.52, threshold: 0.52 },
    exposure: 1.04,
  },
  {
    id: 'arctic-aurora',
    title: 'Arctic Aurora',
    subtitle: 'Volumetric Polar Fjord',
    category: 'ATMOSPHERE // VOLUMETRIC',
    badge: 'RAYMARCHED AURORA • FJORD REFLECTION',
    description:
      'Multi-step raymarched volumetric aurora borealis curtains rippling from emerald green through arctic teal into high-altitude violet, mirrored dynamically across a calm glacial fjord with jagged mountain silhouettes and twilight stars.',
    shaderTech: 'Volumetric Raymarching • Curl Noise • Glacial Reflection',
    oledProfile: 'Deep Polar Night • Reflective Glacial Obsidian',
    accentPrimary: '#1df2a0',
    accentSecondary: '#14b5d0',
    accentTertiary: '#8c46ff',
    bloom: { strength: 0.30, radius: 0.48, threshold: 0.88 },
    exposure: 0.78,
  },
  {
    id: 'nocturne-glass',
    title: 'Nocturne Glass',
    subtitle: 'Refractive Rainy Window & City Bokeh',
    category: 'URBAN & NOCTURNE // MACRO',
    badge: '3-TIER RAIN • OPTICAL REFRACTION',
    description:
      'Cozy cinema-camera macro view through a rain-streaked window onto out-of-focus city neon bokeh. Features sliding hero gravity droplets shedding micro-trails, optical refraction normals, frosted condensation glass, and warm distant lightning.',
    shaderTech: 'Analytic Normal Refraction • Multi-Scale Drops • Dual-Bokeh',
    oledProfile: 'Rainy Condensation • Deep Amber & Taillight Glow',
    accentPrimary: '#f59e0b',
    accentSecondary: '#06b6d4',
    accentTertiary: '#ef4444',
    bloom: { strength: 0.26, radius: 0.45, threshold: 0.88 },
    exposure: 0.80,
  },
  {
    id: 'abyssal-drift',
    title: 'Abyssal Drift',
    subtitle: 'Bioluminescent Deep-Sea Twilight Zone',
    category: 'OCEAN // BIOLUMINESCENCE',
    badge: 'ORGANIC PULSE • FRESNEL JELLY',
    description:
      'Weightless oceanic journey through the deep twilight zone (#01040b) featuring translucent, bioluminescent jellyfish pulsing organically with trailing fluid-drag tentacles, marine snow particles, and glowing plankton.',
    shaderTech: 'Rhythmic Bell Propulsion • Subsurface Fresnel • Marine Snow',
    oledProfile: 'Near-Pitch Abyss #01040b • Radiant Cyan-Magenta',
    accentPrimary: '#18e8ff',
    accentSecondary: '#d946ef',
    accentTertiary: '#2b5cff',
    bloom: { strength: 0.26, radius: 0.45, threshold: 0.90 },
    exposure: 0.76,
  },
  {
    id: 'oled-void',
    title: 'OLED Void',
    subtitle: 'Absolute Zero Resource Mode',
    category: 'OLED CARE // 0% GPU',
    badge: '0.01% CPU • 0% GPU',
    description:
      'Pure pitch-black (#000000) standby display with full WebGL teardown. Digital clock updates strictly once per minute without a per-second loop, shifting across 9 safe zones every 3–5 minutes to eliminate pixel retention.',
    shaderTech: 'Zero WebGL • Pure DOM • Minute-Synced Timer',
    oledProfile: '9-Zone Translation • True #000000 • Virtual 0% Energy',
    accentPrimary: '#10b981', // Emerald
    accentSecondary: '#059669',
    accentTertiary: '#34d399',
    bloom: { strength: 0, radius: 0, threshold: 1 },
    exposure: 1.0,
    isOledVoid: true,
  },
];

export function getSceneMeta(id: string): SceneMeta {
  return SPATIAL_SCENES.find((s) => s.id === id) || SPATIAL_SCENES[0];
}
