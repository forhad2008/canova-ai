/**
 * Real-time Web Audio API Ambient Soundscape Generator
 * Pure client-side synthesis for zero-latency, offline focus audio.
 */

export type SoundscapeType = 'off' | 'rain' | 'whitenoise' | 'cafe' | 'binaural';

export interface SoundscapeOption {
  id: SoundscapeType;
  label: string;
  icon: string;
  description: string;
}

export const SOUNDSCAPE_OPTIONS: SoundscapeOption[] = [
  { id: 'off', label: 'Muted', icon: '🔇', description: 'No ambient sound' },
  { id: 'rain', label: 'Rainfall', icon: '🌧️', description: 'Soothing rain drops & soft rumble' },
  { id: 'whitenoise', label: 'White Noise', icon: '🎧', description: 'Smooth acoustic masking' },
  { id: 'cafe', label: 'Cafe Hum', icon: '☕', description: 'Warm ambient coffee shop atmosphere' },
  { id: 'binaural', label: 'Alpha Beat', icon: '🧠', description: '40Hz cognitive focus frequency' },
];

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private currentSoundscape: SoundscapeType = 'off';
  private masterGain: GainNode | null = null;
  private activeNodes: (AudioNode | { stop: () => void })[] = [];
  private volume: number = 0.5;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentSoundscape(): SoundscapeType {
    return this.currentSoundscape;
  }

  public stopAll() {
    this.activeNodes.forEach((node) => {
      try {
        if ('stop' in node && typeof node.stop === 'function') {
          node.stop();
        } else if ('disconnect' in node && typeof node.disconnect === 'function') {
          node.disconnect();
        }
      } catch {}
    });
    this.activeNodes = [];
    this.currentSoundscape = 'off';
  }

  public setSoundscape(type: SoundscapeType) {
    this.initCtx();
    if (!this.ctx) return;

    this.stopAll();
    this.currentSoundscape = type;

    if (type === 'off') return;

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
    this.activeNodes.push(this.masterGain);

    switch (type) {
      case 'rain':
        this.generateRainSound();
        break;
      case 'whitenoise':
        this.generateWhiteNoiseSound();
        break;
      case 'cafe':
        this.generateCafeSound();
        break;
      case 'binaural':
        this.generateBinauralSound();
        break;
    }
  }

  // Helper: Create a 3-second noise buffer
  private createNoiseBuffer(color: 'white' | 'pink' | 'brown'): AudioBuffer {
    if (!this.ctx) throw new Error('No Audio Context');

    const bufferSize = this.ctx.sampleRate * 3;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;

      if (color === 'white') {
        data[i] = white * 0.15;
      } else if (color === 'pink') {
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.02;
        b6 = white * 0.115926;
      } else if (color === 'brown') {
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 0.8;
      }
    }

    return buffer;
  }

  // Rain Sound Generator
  private generateRainSound() {
    if (!this.ctx || !this.masterGain) return;

    // Pink noise base for rain patter
    const buffer = this.createNoiseBuffer('pink');
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    // Filter to simulate raindrops on glass/roof
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;
    filter.Q.value = 0.8;

    noiseSource.connect(filter);
    filter.connect(this.masterGain);

    noiseSource.start();
    this.activeNodes.push(noiseSource, filter);

    // Low rumble oscillator
    const rumbleSource = this.ctx.createBufferSource();
    rumbleSource.buffer = this.createNoiseBuffer('brown');
    rumbleSource.loop = true;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 250;

    rumbleSource.connect(lowpass);
    lowpass.connect(this.masterGain);

    rumbleSource.start();
    this.activeNodes.push(rumbleSource, lowpass);
  }

  // White Noise Generator
  private generateWhiteNoiseSound() {
    if (!this.ctx || !this.masterGain) return;

    const buffer = this.createNoiseBuffer('pink');
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    const lowpass = this.ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 3500;

    noiseSource.connect(lowpass);
    lowpass.connect(this.masterGain);

    noiseSource.start();
    this.activeNodes.push(noiseSource, lowpass);
  }

  // Cafe Ambience Generator
  private generateCafeSound() {
    if (!this.ctx || !this.masterGain) return;

    const buffer = this.createNoiseBuffer('brown');
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    // Lowpass filter for warm room ambience
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    // Gentle LFO gain swell for ambient chatter modulation
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.3; // 0.3 Hz swell

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 0.08;

    lfo.connect(lfoGain);

    noiseSource.connect(filter);
    filter.connect(this.masterGain);

    lfo.start();
    noiseSource.start();
    this.activeNodes.push(noiseSource, filter, lfo, lfoGain);
  }

  // Binaural Focus Beats (220 Hz & 230 Hz = 10 Hz Alpha beat)
  private generateBinauralSound() {
    if (!this.ctx || !this.masterGain) return;

    const oscLeft = this.ctx.createOscillator();
    const oscRight = this.ctx.createOscillator();

    oscLeft.type = 'sine';
    oscRight.type = 'sine';

    oscLeft.frequency.value = 220; // 220 Hz
    oscRight.frequency.value = 230; // 230 Hz -> 10Hz Alpha Focus beat

    const gainNode = this.ctx.createGain();
    gainNode.gain.value = 0.12;

    oscLeft.connect(gainNode);
    oscRight.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscLeft.start();
    oscRight.start();
    this.activeNodes.push(oscLeft, oscRight, gainNode);
  }
}

export const ambientEngine = new AmbientSoundEngine();
