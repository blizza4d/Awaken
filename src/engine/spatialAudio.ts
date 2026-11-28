import { ambientAudio } from '../audio/AmbientAudioEngine';
import { SpatialSceneId } from './types';

class SpatialAudioBridge {
  public start(sceneId: SpatialSceneId, volume = 0.35): void {
    ambientAudio.setVolume(volume);
    ambientAudio.setEnabled(true);
    ambientAudio.setScene(sceneId);
  }

  public stop(): void {
    ambientAudio.setEnabled(false);
  }

  public getIsPlaying(): boolean {
    return true;
  }
}

export const spatialAudio = new SpatialAudioBridge();
