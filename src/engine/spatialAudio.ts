import { SpatialSceneId } from './types';

class SpatialAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeNodes: AudioNode[] = [];
  private isPlaying = false;

  private ensureContext(): boolean {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return false;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.0;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return true;
  }

  public start(sceneId: SpatialSceneId, volume = 0.35): void {
    this.stop();
    if (sceneId === 'oled-void') return; // Absolute silence for OLED Void
    if (!this.ensureContext() || !this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(0.001, now);
    this.masterGain.gain.linearRampToValueAtTime(
      Math.max(0, Math.min(1, volume)) * 0.32,
      now + 0.9
    );
    this.isPlaying = true;

    if (sceneId === 'volumetric-megacity') {
      // Filtered pink-noise rain sheet + distant megacity synth hum
      const bufferLen = this.ctx.sampleRate * 3;
      const buffer = this.ctx.createBuffer(1, bufferLen, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferLen; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.997 * b0 + w * 0.05;
        b1 = 0.985 * b1 + w * 0.07;
        b2 = 0.95 * b2 + w * 0.14;
        data[i] = (b0 + b1 + b2) * 0.25;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(950, now);
      filter.Q.setValueAtTime(0.65, now);

      const drone = this.ctx.createOscillator();
      drone.type = 'sawtooth';
      drone.frequency.setValueAtTime(55, now);
      const droneFilter = this.ctx.createBiquadFilter();
      droneFilter.type = 'lowpass';
      droneFilter.frequency.setValueAtTime(140, now);
      const droneGain = this.ctx.createGain();
      droneGain.gain.setValueAtTime(0.18, now);

      noise.connect(filter).connect(this.masterGain);
      drone.connect(droneFilter).connect(droneGain).connect(this.masterGain);

      noise.start();
      drone.start();
      this.activeNodes.push(noise, filter, drone, droneFilter, droneGain);
    } else if (sceneId === 'event-horizon') {
      // Deep gravitational singularity sub-harmonic drone
      const freqs = [43.65, 65.41, 87.31, 130.81];
      for (const f of freqs) {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(f < 70 ? 0.26 : 0.1, now);

        osc.connect(gain).connect(this.masterGain);
        osc.start();
        this.activeNodes.push(osc, gain);
      }
    } else if (sceneId === 'binary-pulsar') {
      // Rapid rhythmic radio pulsar pulse (periodic harmonic chirp)
      const freqs = [58.27, 116.54, 233.08];
      for (const f of freqs) {
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now);

        // Amplitude modulated pulsating LFO
        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(3.2, now); // Pulsar spin rate ~3.2 Hz

        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(0.12, now);

        const oscGain = this.ctx.createGain();
        oscGain.gain.setValueAtTime(0.16, now);

        lfo.connect(lfoGain).connect(oscGain.gain);
        osc.connect(oscGain).connect(this.masterGain);

        osc.start();
        lfo.start();
        this.activeNodes.push(osc, lfo, lfoGain, oscGain);
      }
    } else if (sceneId === 'saturnian-orbit') {
      // Ethereal planetary resonance & solar wind whistle
      const freqs = [55.0, 110.0, 165.0, 277.18];
      for (const f of freqs) {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(f * 2.2, now);
        filter.Q.setValueAtTime(2.5, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.11, now);

        osc.connect(filter).connect(gain).connect(this.masterGain);
        osc.start();
        this.activeNodes.push(osc, filter, gain);
      }
    } else if (sceneId === 'carina-nebula') {
      // Warm cosmic deep-space celestial choral drone
      const freqs = [52.0, 78.0, 104.0, 156.0, 208.0];
      for (const f of freqs) {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(420, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.12, now);

        osc.connect(filter).connect(gain).connect(this.masterGain);
        osc.start();
        this.activeNodes.push(osc, filter, gain);
      }
    } else if (sceneId === 'deep-void-drift') {
      // Meditative deep-space sub-bass drone & sparse cosmic resonance
      const freqs = [38.89, 58.33, 77.78, 116.54];
      for (const f of freqs) {
        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(180, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(f < 50 ? 0.28 : 0.08, now);

        osc.connect(filter).connect(gain).connect(this.masterGain);
        osc.start();
        this.activeNodes.push(osc, filter, gain);
      }
    } else if (sceneId === 'midnight-cruise') {
      // Lo-fi warm tire hum on wet asphalt + mellow late-night synth chord
      const bufferLen = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferLen, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferLen; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.18;
      }
      const tireNoise = this.ctx.createBufferSource();
      tireNoise.buffer = buffer;
      tireNoise.loop = true;

      const tireFilter = this.ctx.createBiquadFilter();
      tireFilter.type = 'lowpass';
      tireFilter.frequency.setValueAtTime(260, now);

      const tireGain = this.ctx.createGain();
      tireGain.gain.setValueAtTime(0.18, now);
      tireNoise.connect(tireFilter).connect(tireGain).connect(this.masterGain);
      tireNoise.start();
      this.activeNodes.push(tireNoise, tireFilter, tireGain);

      // Warm nocturnal synth pad chords (D minor 7)
      const chord = [146.83, 174.61, 220.0, 261.63];
      for (const f of chord) {
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now);

        const padFilter = this.ctx.createBiquadFilter();
        padFilter.type = 'lowpass';
        padFilter.frequency.setValueAtTime(380, now);

        const padGain = this.ctx.createGain();
        padGain.gain.setValueAtTime(0.08, now);

        osc.connect(padFilter).connect(padGain).connect(this.masterGain);
        osc.start();
        this.activeNodes.push(osc, padFilter, padGain);
      }
    } else if (sceneId === 'moonlit-shore') {
      // Rhythmic rolling ocean wave surf with swell surges and receding foam hiss
      const bufferLen = this.ctx.sampleRate * 4;
      const buffer = this.ctx.createBuffer(1, bufferLen, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferLen; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.5;
      }
      const surfNoise = this.ctx.createBufferSource();
      surfNoise.buffer = buffer;
      surfNoise.loop = true;

      const surfFilter = this.ctx.createBiquadFilter();
      surfFilter.type = 'lowpass';
      surfFilter.frequency.setValueAtTime(650, now);

      // Slow 8-second swell surge LFO
      const lfo = this.ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.125, now); // ~8s wave period

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(0.14, now);

      const surfGain = this.ctx.createGain();
      surfGain.gain.setValueAtTime(0.18, now);

      lfo.connect(lfoGain).connect(surfGain.gain);
      surfNoise.connect(surfFilter).connect(surfGain).connect(this.masterGain);

      surfNoise.start();
      lfo.start();
      this.activeNodes.push(surfNoise, surfFilter, lfo, lfoGain, surfGain);

      // Gentle sub-bass ocean rumble
      const rumble = this.ctx.createOscillator();
      rumble.type = 'sine';
      rumble.frequency.setValueAtTime(48, now);
      const rumbleGain = this.ctx.createGain();
      rumbleGain.gain.setValueAtTime(0.16, now);
      rumble.connect(rumbleGain).connect(this.masterGain);
      rumble.start();
      this.activeNodes.push(rumble, rumbleGain);
    } else {
      // Fluid Data: Ethereal crystalline binaural harmonic pad
      const freqs = [110, 164.81, 220, 329.63, 440.5];
      for (const f of freqs) {
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(520, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.09, now);

        osc.connect(filter).connect(gain).connect(this.masterGain);
        osc.start();
        this.activeNodes.push(osc, filter, gain);
      }
    }
  }

  public stop(): void {
    this.isPlaying = false;
    for (const node of this.activeNodes) {
      try {
        if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
          (node as AudioScheduledSourceNode).stop();
        }
        node.disconnect();
      } catch {
        // Ignore already stopped audio nodes
      }
    }
    this.activeNodes = [];
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const spatialAudio = new SpatialAudioEngine();
