import { SpatialSceneId } from '../engine/types';

export class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentSceneId: SpatialSceneId | null = null;
  private currentChannelGain: GainNode | null = null;
  private currentNodes: AudioNode[] = [];
  private fadingNodes: { nodes: AudioNode[]; gain: GainNode; timer: number }[] = [];

  private isEnabled = false;
  private volume = 0.35;
  private pinkNoiseBuffer: AudioBuffer | null = null;
  private brownNoiseBuffer: AudioBuffer | null = null;
  private isSuspendedByVisibility = false;

  constructor() {
    // Listen for visibility change for strict battery/hardware hygiene
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  private getAudioContext(): AudioContext | null {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;

      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.generateNoiseBuffers(this.ctx);
    }
    return this.ctx;
  }

  /**
   * Pre-computes 4-second seamless pink & brown noise buffers once.
   * Reused across all scenes to prevent heavy per-sample ScriptProcessor loops.
   */
  private generateNoiseBuffers(ctx: AudioContext): void {
    const sampleRate = ctx.sampleRate;
    const bufferSize = sampleRate * 4;

    // 1. Pink Noise (Paul Kellet's filter method)
    this.pinkNoiseBuffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const pinkData = this.pinkNoiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      pinkData[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }

    // 2. Brown Noise (Leaky Brownian Integration)
    this.brownNoiseBuffer = ctx.createBuffer(1, bufferSize, sampleRate);
    const brownData = this.brownNoiseBuffer.getChannelData(0);
    let lastBrown = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastBrown = (lastBrown + 0.025 * white) / 1.025;
      brownData[i] = lastBrown * 3.2;
    }
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.masterGain && this.isEnabled && this.currentSceneId !== 'oled-void') {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(this.volume, now + 0.1);
    }
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (enabled) {
      const ctx = this.getAudioContext();
      if (!ctx || !this.masterGain) return;

      if (ctx.state === 'suspended') {
        void ctx.resume();
      }

      const now = ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.linearRampToValueAtTime(this.volume, now + 0.4);

      if (this.currentSceneId && this.currentSceneId !== 'oled-void') {
        this.startSceneSoundscape(this.currentSceneId, 1.0);
      }
    } else {
      this.fadeToSilenceAndSuspend(300);
    }
  }

  public setScene(sceneId: SpatialSceneId): void {
    if (this.currentSceneId === sceneId) return;
    this.currentSceneId = sceneId;

    if (!this.isEnabled || sceneId === 'oled-void') {
      if (sceneId === 'oled-void') {
        this.fadeToSilenceAndSuspend(300);
      }
      return;
    }

    this.startSceneSoundscape(sceneId, 1.5);
  }

  private fadeToSilenceAndSuspend(durationMs: number): void {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const durationSec = durationMs / 1000;

    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(Math.max(0.0001, this.masterGain.gain.value), now);
    this.masterGain.gain.linearRampToValueAtTime(0.0001, now + durationSec);

    window.setTimeout(() => {
      if ((!this.isEnabled || this.currentSceneId === 'oled-void') && this.ctx && this.ctx.state === 'running') {
        void this.ctx.suspend();
      }
    }, durationMs + 50);
  }

  private handleVisibilityChange = (): void => {
    if (document.hidden) {
      if (this.isEnabled && this.ctx && this.ctx.state === 'running') {
        this.isSuspendedByVisibility = true;
        this.fadeToSilenceAndSuspend(300);
      }
    } else {
      if (this.isEnabled && this.isSuspendedByVisibility) {
        this.isSuspendedByVisibility = false;
        if (this.ctx && this.currentSceneId !== 'oled-void') {
          void this.ctx.resume().then(() => {
            if (this.masterGain && this.ctx) {
              const now = this.ctx.currentTime;
              this.masterGain.gain.cancelScheduledValues(now);
              this.masterGain.gain.linearRampToValueAtTime(this.volume, now + 0.4);
            }
          });
        }
      }
    }
  };

  /**
   * Crossfades between soundscapes over crossfadeSec (1.5 seconds)
   */
  private startSceneSoundscape(sceneId: SpatialSceneId, crossfadeSec: number): void {
    const ctx = this.getAudioContext();
    if (!ctx || !this.masterGain) return;

    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    const now = ctx.currentTime;

    // 1. Crossfade out previous channel
    if (this.currentChannelGain && this.currentNodes.length > 0) {
      const oldGain = this.currentChannelGain;
      const oldNodes = this.currentNodes;
      oldGain.gain.cancelScheduledValues(now);
      oldGain.gain.setValueAtTime(oldGain.gain.value, now);
      oldGain.gain.linearRampToValueAtTime(0.0001, now + crossfadeSec);

      const timer = window.setTimeout(() => {
        for (const node of oldNodes) {
          try {
            if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
              (node as AudioScheduledSourceNode).stop();
            }
            node.disconnect();
          } catch {
            // Ignore already disposed nodes
          }
        }
        oldGain.disconnect();
      }, crossfadeSec * 1000 + 100);

      this.fadingNodes.push({ nodes: oldNodes, gain: oldGain, timer });
    }

    // 2. Create new channel gain node
    const newChannelGain = ctx.createGain();
    newChannelGain.gain.setValueAtTime(0.0001, now);
    newChannelGain.gain.linearRampToValueAtTime(1.0, now + crossfadeSec);
    newChannelGain.connect(this.masterGain);

    this.currentChannelGain = newChannelGain;
    this.currentNodes = [];

    // 3. Synthesize tailored procedural DSP graph for the scene
    this.buildSceneDSP(sceneId, ctx, newChannelGain, now);
  }

  private buildSceneDSP(
    sceneId: SpatialSceneId,
    ctx: AudioContext,
    channel: GainNode,
    now: number
  ): void {
    if (sceneId === 'moonlit-shore') {
      // Dual-LFO band-passed pink/brown noise rolling surf swells & soft foam hiss
      if (this.pinkNoiseBuffer && this.brownNoiseBuffer) {
        // Deep swell
        const swellSrc = ctx.createBufferSource();
        swellSrc.buffer = this.brownNoiseBuffer;
        swellSrc.loop = true;

        const swellFilter = ctx.createBiquadFilter();
        swellFilter.type = 'lowpass';
        swellFilter.frequency.setValueAtTime(280, now);

        const swellGain = ctx.createGain();
        swellGain.gain.setValueAtTime(0.25, now);

        // Slow 7.5s primary wave swell LFO
        const lfo1 = ctx.createOscillator();
        lfo1.type = 'sine';
        lfo1.frequency.setValueAtTime(0.133, now); // ~7.5s
        const lfo1Gain = ctx.createGain();
        lfo1Gain.gain.setValueAtTime(0.22, now);
        lfo1.connect(lfo1Gain).connect(swellGain.gain);

        swellSrc.connect(swellFilter).connect(swellGain).connect(channel);
        swellSrc.start();
        lfo1.start();

        // High foam hiss
        const foamSrc = ctx.createBufferSource();
        foamSrc.buffer = this.pinkNoiseBuffer;
        foamSrc.loop = true;

        const foamFilter = ctx.createBiquadFilter();
        foamFilter.type = 'bandpass';
        foamFilter.frequency.setValueAtTime(1100, now);
        foamFilter.Q.setValueAtTime(0.8, now);

        const foamGain = ctx.createGain();
        foamGain.gain.setValueAtTime(0.08, now);

        // Secondary 11s foam swell LFO
        const lfo2 = ctx.createOscillator();
        lfo2.type = 'sine';
        lfo2.frequency.setValueAtTime(0.091, now);
        const lfo2Gain = ctx.createGain();
        lfo2Gain.gain.setValueAtTime(0.07, now);
        lfo2.connect(lfo2Gain).connect(foamGain.gain);

        foamSrc.connect(foamFilter).connect(foamGain).connect(channel);
        foamSrc.start();
        lfo2.start();

        // Sub-bass shore rumble
        const sub = ctx.createOscillator();
        sub.type = 'sine';
        sub.frequency.setValueAtTime(42, now);
        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.18, now);
        sub.connect(subGain).connect(channel);
        sub.start();

        this.currentNodes.push(
          swellSrc, swellFilter, swellGain, lfo1, lfo1Gain,
          foamSrc, foamFilter, foamGain, lfo2, lfo2Gain,
          sub, subGain
        );
      }
    } else if (sceneId === 'midnight-cruise') {
      // Warm low-pass cabin/asphalt hum (~55–90 Hz filtered noise + subtle harmonic drone)
      // + gentle periodic stereo Doppler whooshes
      if (this.brownNoiseBuffer) {
        const roadNoise = ctx.createBufferSource();
        roadNoise.buffer = this.brownNoiseBuffer;
        roadNoise.loop = true;

        const roadFilter = ctx.createBiquadFilter();
        roadFilter.type = 'lowpass';
        roadFilter.frequency.setValueAtTime(80, now);

        const roadGain = ctx.createGain();
        roadGain.gain.setValueAtTime(0.32, now);

        roadNoise.connect(roadFilter).connect(roadGain).connect(channel);
        roadNoise.start();

        // Engine cabin drone (65 Hz + 130 Hz harmonics)
        const engine1 = ctx.createOscillator();
        engine1.type = 'triangle';
        engine1.frequency.setValueAtTime(65.4, now);
        const engine1Gain = ctx.createGain();
        engine1Gain.gain.setValueAtTime(0.12, now);

        const engine2 = ctx.createOscillator();
        engine2.type = 'sine';
        engine2.frequency.setValueAtTime(130.8, now);
        const engine2Gain = ctx.createGain();
        engine2Gain.gain.setValueAtTime(0.06, now);

        engine1.connect(engine1Gain).connect(channel);
        engine2.connect(engine2Gain).connect(channel);
        engine1.start();
        engine2.start();

        // Passing streetlight whoosh LFO (~0.52 Hz cycle matches shader speed)
        const whooshSrc = ctx.createBufferSource();
        whooshSrc.buffer = this.pinkNoiseBuffer!;
        whooshSrc.loop = true;

        const whooshFilter = ctx.createBiquadFilter();
        whooshFilter.type = 'bandpass';
        whooshFilter.frequency.setValueAtTime(450, now);
        whooshFilter.Q.setValueAtTime(1.8, now);

        const whooshGain = ctx.createGain();
        whooshGain.gain.setValueAtTime(0.01, now);

        const whooshLfo = ctx.createOscillator();
        whooshLfo.type = 'sine';
        whooshLfo.frequency.setValueAtTime(0.52, now);
        const whooshLfoGain = ctx.createGain();
        whooshLfoGain.gain.setValueAtTime(0.07, now);
        whooshLfo.connect(whooshLfoGain).connect(whooshGain.gain);

        whooshSrc.connect(whooshFilter).connect(whooshGain).connect(channel);
        whooshSrc.start();
        whooshLfo.start();

        // Late-night minor 7th mellow synth chord (D-F-A-C)
        const chord = [146.83, 174.61, 220.0, 261.63];
        const chordNodes: AudioNode[] = [];
        for (const f of chord) {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now);
          const g = ctx.createGain();
          g.gain.setValueAtTime(0.045, now);
          osc.connect(g).connect(channel);
          osc.start();
          chordNodes.push(osc, g);
        }

        this.currentNodes.push(
          roadNoise, roadFilter, roadGain,
          engine1, engine1Gain, engine2, engine2Gain,
          whooshSrc, whooshFilter, whooshGain, whooshLfo, whooshLfoGain,
          ...chordNodes
        );
      }
    } else if (sceneId === 'nocturne-glass' || sceneId === 'volumetric-megacity') {
      // Soft rain-on-glass filtered pink noise + randomized droplet micro-taps + distant low-pass thunder
      if (this.pinkNoiseBuffer) {
        // Continuous rain bed
        const rainSrc = ctx.createBufferSource();
        rainSrc.buffer = this.pinkNoiseBuffer;
        rainSrc.loop = true;

        const rainFilter = ctx.createBiquadFilter();
        rainFilter.type = 'bandpass';
        rainFilter.frequency.setValueAtTime(1150, now);
        rainFilter.Q.setValueAtTime(0.7, now);

        const rainGain = ctx.createGain();
        rainGain.gain.setValueAtTime(sceneId === 'volumetric-megacity' ? 0.22 : 0.16, now);

        rainSrc.connect(rainFilter).connect(rainGain).connect(channel);
        rainSrc.start();

        // Interior room tone
        const roomHum = ctx.createOscillator();
        roomHum.type = 'sine';
        roomHum.frequency.setValueAtTime(sceneId === 'volumetric-megacity' ? 55.0 : 65.4, now);
        const roomGain = ctx.createGain();
        roomGain.gain.setValueAtTime(0.12, now);
        roomHum.connect(roomGain).connect(channel);
        roomHum.start();

        // Distant low-pass atmospheric thunder rumble LFO
        if (this.brownNoiseBuffer) {
          const thunderSrc = ctx.createBufferSource();
          thunderSrc.buffer = this.brownNoiseBuffer;
          thunderSrc.loop = true;

          const thunderFilter = ctx.createBiquadFilter();
          thunderFilter.type = 'lowpass';
          thunderFilter.frequency.setValueAtTime(75, now);

          const thunderGain = ctx.createGain();
          thunderGain.gain.setValueAtTime(0.02, now);

          // Very slow 0.04 Hz pulse (~25s) for distant rumble swell
          const thunderLfo = ctx.createOscillator();
          thunderLfo.type = 'sine';
          thunderLfo.frequency.setValueAtTime(0.04, now);
          const thunderLfoGain = ctx.createGain();
          thunderLfoGain.gain.setValueAtTime(0.08, now);
          thunderLfo.connect(thunderLfoGain).connect(thunderGain.gain);

          thunderSrc.connect(thunderFilter).connect(thunderGain).connect(channel);
          thunderSrc.start();
          thunderLfo.start();

          this.currentNodes.push(thunderSrc, thunderFilter, thunderGain, thunderLfo, thunderLfoGain);
        }

        this.currentNodes.push(rainSrc, rainFilter, rainGain, roomHum, roomGain);
      }
    } else if (sceneId === 'abyssal-drift' || sceneId === 'fluid-data') {
      // Deep muffled underwater sub-bass ambience (<140 Hz brown noise) with harmonic shimmer
      if (this.brownNoiseBuffer) {
        const subSrc = ctx.createBufferSource();
        subSrc.buffer = this.brownNoiseBuffer;
        subSrc.loop = true;

        const subFilter = ctx.createBiquadFilter();
        subFilter.type = 'lowpass';
        subFilter.frequency.setValueAtTime(110, now);

        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.35, now);

        subSrc.connect(subFilter).connect(subGain).connect(channel);
        subSrc.start();

        // Deep aquatic sub-drone (Eb1 = 38.89 Hz)
        const drone = ctx.createOscillator();
        drone.type = 'sine';
        drone.frequency.setValueAtTime(38.89, now);
        const droneGain = ctx.createGain();
        droneGain.gain.setValueAtTime(0.22, now);
        drone.connect(droneGain).connect(channel);
        drone.start();

        // Shimmer tones (crystal overtones)
        const shimmers = [293.66, 440.0, 587.33, 880.0];
        const shimmerNodes: AudioNode[] = [];
        for (let i = 0; i < shimmers.length; i++) {
          const osc = ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(shimmers[i], now);

          const g = ctx.createGain();
          g.gain.setValueAtTime(0.02, now);

          const lfo = ctx.createOscillator();
          lfo.type = 'sine';
          lfo.frequency.setValueAtTime(0.07 + i * 0.03, now);
          const lg = ctx.createGain();
          lg.gain.setValueAtTime(0.02, now);
          lfo.connect(lg).connect(g.gain);

          osc.connect(g).connect(channel);
          osc.start();
          lfo.start();
          shimmerNodes.push(osc, g, lfo, lg);
        }

        this.currentNodes.push(subSrc, subFilter, subGain, drone, droneGain, ...shimmerNodes);
      }
    } else {
      // Arctic Aurora, Event Horizon, Carina Nebula, Saturnian Orbit, Binary Pulsar, Deep Void Drift:
      // Slow-evolving ethereal generative harmonic pad (detuned low-gain sine/triangle oscillators
      // through a warm low-pass filter and subtle delay)
      const root = sceneId === 'event-horizon' ? 43.65 : sceneId === 'carina-nebula' ? 52.0 : 55.0;
      const ratios = [1.0, 1.5, 2.0, 2.75, 4.0];

      const padFilter = ctx.createBiquadFilter();
      padFilter.type = 'lowpass';
      padFilter.frequency.setValueAtTime(360, now);
      padFilter.connect(channel);

      const oscNodes: AudioNode[] = [];
      for (let i = 0; i < ratios.length; i++) {
        const osc = ctx.createOscillator();
        osc.type = i % 2 === 0 ? 'sine' : 'triangle';
        // Gentle micro-detuning (+-0.4 Hz) for rich chorus warmth
        const detune = (i - 2) * 0.35;
        osc.frequency.setValueAtTime(root * ratios[i] + detune, now);

        const g = ctx.createGain();
        g.gain.setValueAtTime(i === 0 ? 0.22 : 0.05, now);

        // Slow organic modulation LFO
        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.05 + i * 0.02, now);
        const lfoG = ctx.createGain();
        lfoG.gain.setValueAtTime(0.03, now);
        lfo.connect(lfoG).connect(g.gain);

        osc.connect(g).connect(padFilter);
        osc.start();
        lfo.start();
        oscNodes.push(osc, g, lfo, lfoG);
      }

      this.currentNodes.push(padFilter, ...oscNodes);
    }
  }

  /**
   * Plays a calming harmonic Tibetan singing-bowl chime for Focus Timer completions.
   */
  public playSingingBowl(): void {
    const ctx = this.getAudioContext();
    if (!ctx || !this.isEnabled) return;

    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    const now = ctx.currentTime;
    const fundamental = 216.0; // Warm A3
    const overtones = [1.0, 2.76, 5.4, 8.93];
    const decays = [4.5, 3.8, 2.6, 1.8];
    const amplitudes = [0.28, 0.14, 0.07, 0.03];

    for (let i = 0; i < overtones.length; i++) {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(fundamental * overtones[i], now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(amplitudes[i], now + 0.04); // Instant strike
      gain.gain.exponentialRampToValueAtTime(0.0001, now + decays[i]); // Natural decay

      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + decays[i] + 0.1);
    }
  }

  public destroy(): void {
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    }
    for (const fading of this.fadingNodes) {
      window.clearTimeout(fading.timer);
    }
    this.fadingNodes = [];
    if (this.ctx) {
      void this.ctx.close();
      this.ctx = null;
    }
    this.masterGain = null;
    this.currentChannelGain = null;
    this.currentNodes = [];
  }
}

export const ambientAudio = new AmbientAudioEngine();
