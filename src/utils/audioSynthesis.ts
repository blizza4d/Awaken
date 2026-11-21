import { ScreensaverId } from '../types/screensaver';

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeSource: AudioNode | null = null;
  private currentMode: ScreensaverId | null = null;

  private initContext() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    } catch (e) {
      console.warn('[SoundSynthesizer] Web Audio not available', e);
    }
  }

  setVolume(volumePercent: number) {
    if (!this.masterGain || !this.ctx) return;
    const gainVal = Math.max(0, Math.min(1, volumePercent / 100)) * 0.4;
    this.masterGain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
  }

  play(modeId: ScreensaverId, volumePercent: number) {
    this.stop();
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.setVolume(volumePercent);
    this.currentMode = modeId;

    try {
      const now = this.ctx.currentTime;

      if (modeId === 'rainy-window') {
        // Pink noise rain simulation
        const bufferSize = this.ctx.sampleRate * 2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          data[i] = (b0 + b1 + b2) * 0.12;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, now);

        noise.connect(filter);
        filter.connect(this.masterGain);
        noise.start();
        this.activeSource = noise;

      } else if (modeId === 'fireplace') {
        // Fireplace crackle & rumble
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(65, now);
        osc.connect(this.masterGain);
        osc.start();
        this.activeSource = osc;

      } else if (modeId === 'space' || modeId === 'digital-zen' || modeId === 'northern-lights') {
        // Binaural harmonic cosmic drone
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(108, now);

        const lfo = this.ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.18, now);
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(12, now);
        lfo.connect(osc.frequency);
        lfo.start();

        osc.connect(this.masterGain);
        osc.start();
        this.activeSource = osc;

      } else if (modeId === 'night-drive') {
        // Highway road drone
        const osc = this.ctx.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(52, now);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(220, now);

        osc.connect(filter);
        filter.connect(this.masterGain);
        osc.start();
        this.activeSource = osc;

      } else if (modeId === 'aquarium') {
        // Submerged underwater rumble
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(45, now);
        osc.connect(this.masterGain);
        osc.start();
        this.activeSource = osc;
      }
    } catch (err) {
      console.warn('[SoundSynthesizer] Audio generation error:', err);
    }
  }

  stop() {
    if (this.activeSource) {
      try {
        (this.activeSource as any).stop?.();
        this.activeSource.disconnect();
      } catch (e) {}
      this.activeSource = null;
    }
    this.currentMode = null;
  }
}

export const audioSynthesizer = new SoundSynthesizer();
