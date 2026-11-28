import { useEffect } from 'react';
import { useSpatialStore } from '../store/useSpatialStore';
import { useFullscreen } from './useFullscreen';
import { SpatialSceneId } from '../engine/types';

const ALL_SCENES: SpatialSceneId[] = [
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
  'oled-void',
];

export function useGlobalKeyboardShortcuts(): void {
  const activeScene = useSpatialStore((s) => s.activeScene);
  const setActiveScene = useSpatialStore((s) => s.setActiveScene);
  const toggleAudioEnabled = useSpatialStore((s) => s.toggleAudioEnabled);
  const toggleNoHud = useSpatialStore((s) => s.toggleNoHud);
  const toggleShortcutsOpen = useSpatialStore((s) => s.toggleShortcutsOpen);
  const setShortcutsOpen = useSpatialStore((s) => s.setShortcutsOpen);
  const setSettingsOpen = useSpatialStore((s) => s.setSettingsOpen);
  const toggleImmersed = useSpatialStore((s) => s.toggleImmersed);

  const { toggleFullscreen } = useFullscreen();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing inside an input or form field
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      // Check key
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const currentIdx = ALL_SCENES.indexOf(activeScene);
        const nextIdx = (currentIdx + 1) % ALL_SCENES.length;
        setActiveScene(ALL_SCENES[nextIdx]);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const currentIdx = ALL_SCENES.indexOf(activeScene);
        const prevIdx = (currentIdx - 1 + ALL_SCENES.length) % ALL_SCENES.length;
        setActiveScene(ALL_SCENES[prevIdx]);
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        toggleImmersed();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        toggleNoHud();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleAudioEnabled();
      } else if (e.key === 'o' || e.key === 'O') {
        e.preventDefault();
        setActiveScene('oled-void');
      } else if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault();
        toggleShortcutsOpen();
      } else if (e.key === 'Escape') {
        setShortcutsOpen(false);
        setSettingsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeScene,
    setActiveScene,
    toggleAudioEnabled,
    toggleNoHud,
    toggleShortcutsOpen,
    setShortcutsOpen,
    setSettingsOpen,
    toggleImmersed,
    toggleFullscreen,
  ]);
}
