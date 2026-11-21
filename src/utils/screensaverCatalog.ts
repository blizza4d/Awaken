import { ScreensaverMeta } from '../types/screensaver';

export const SCREENSAVER_CATALOG: ScreensaverMeta[] = [
  {
    id: 'minimal',
    title: 'Ultra Minimal',
    category: 'ultra-low',
    tag: 'OLED Zero-Load',
    description: 'Pitch-black (#000000) pure standby display. Digital clock updates strictly once per minute with 9-zone subpixel anti-retention shifting. 0% GPU and ~0.01% CPU consumption.',
    engine: 'Zero-Resource DOM',
    resourceUsage: 'Ultra Low (~0.01%)',
    is3D: false,
    featured: true
  },
  {
    id: 'cyberpunk',
    title: 'Cyberpunk City 2.0',
    category: 'cinematic',
    tag: 'Next-Gen WebGL',
    description: 'Procedural neon metropolis with InstancedMesh skyscrapers, custom glowing window matrix shaders, volumetric atmospheric fog, flying hover spinners, and UnrealBloom post-processing.',
    engine: 'Three.js WebGL',
    resourceUsage: 'High Performance',
    is3D: true,
    featured: true
  },
  {
    id: 'night-drive',
    title: 'Autonomous Night Drive',
    category: 'cinematic',
    tag: 'Dynamic Shaders',
    description: '3D perspective highway with curved road vertex displacement, specular road wetness, dual headlight volumetric illumination, cat-eye reflectors, motion-blurred streetlights, and red taillights ahead.',
    engine: 'Three.js WebGL',
    resourceUsage: 'High Performance',
    is3D: true,
    featured: true
  },
  {
    id: 'space',
    title: 'Deep Space Explorer',
    category: 'cinematic',
    tag: 'Cosmic Shaders',
    description: 'Photorealistic gas giant planet with custom Fresnel atmospheric scattering shaders, procedural particle dust rings casting orbital shadows, and a 10,000+ depth-layered starfield with spectral temperatures.',
    engine: 'Three.js WebGL',
    resourceUsage: 'High Performance',
    is3D: true,
    featured: true
  },
  {
    id: 'rainy-window',
    title: 'Cozy Rainy Window',
    category: 'relaxing',
    tag: 'Physics Canvas',
    description: 'Rain droplets sliding down glass with surface-tension physics, trail condensation, and light refraction. Overlooks blurry bokeh city lights with a warm candle, sleeping cat, and occasional distant lightning.',
    engine: 'Canvas 2D',
    resourceUsage: 'Lightweight',
    is3D: false,
    featured: true
  },
  {
    id: 'fireplace',
    title: 'Fireplace & Winter Cabin',
    category: 'relaxing',
    tag: 'Cozy Hearth',
    description: 'Intimate timber cabin fireplace with multi-layered procedural animated flame tongues, glowing pulsing embers, ambient warm light cast, and a side cabin window overlooking softly falling winter snow.',
    engine: 'Canvas 2D',
    resourceUsage: 'Lightweight',
    is3D: false
  },
  {
    id: 'northern-lights',
    title: 'Northern Lights',
    category: 'nature',
    tag: 'Aurora Borealis',
    description: 'Ethereal curtains of shifting emerald, cyan, and violet aurora borealis waving across an arctic night sky, with mountain silhouettes and mirror reflections over a calm frozen lake.',
    engine: 'Canvas 2D',
    resourceUsage: 'Balanced',
    is3D: false
  },
  {
    id: 'aquarium',
    title: 'Aquarium Sanctuary',
    category: 'relaxing',
    tag: 'Marine Ecosystem',
    description: 'Tranquil deep ocean aquarium with multiple fish species swimming with independent schooling and tail-wag physics, a soaring manta ray, rising effervescent bubbles, and underwater sun caustics.',
    engine: 'Canvas 2D',
    resourceUsage: 'Lightweight',
    is3D: false
  },
  {
    id: 'mountain-escape',
    title: 'Mountain Escape',
    category: 'nature',
    tag: 'Alpine Landscape',
    description: 'Layered mountain silhouettes with drifting cloud mist, glowing celestial body, and calm lake water ripple reflections. Offers 3 selectable palettes: Midnight Mountains, Golden Sunset, and Snowy Winter Night.',
    engine: 'Canvas 2D',
    resourceUsage: 'Lightweight',
    is3D: false
  },
  {
    id: 'digital-zen',
    title: 'Digital Zen',
    category: 'abstract',
    tag: 'Hypnotic Geometry',
    description: 'Harmonic 3D concentric gyroscope rings rotating on multiple axes around a breathing chromatic core orb, accompanied by a guided breath pacer (Inhale / Exhale) for instant calm and visual elegance.',
    engine: 'Three.js WebGL',
    resourceUsage: 'Lightweight',
    is3D: true
  }
];
