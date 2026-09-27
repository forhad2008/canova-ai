import { triggerHaptic } from './useHaptics';

/**
 * Pure Web Audio API Synthesizer for tactile UI clicks and rewards.
 * Zero external audio files required.
 */

class SoundEffectsManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Soft tactile click for neumorphic buttons
  public playClick() {
    triggerHaptic('light');
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {}
  }

  // Rewarding harmonic chime for task completions & success
  public playSuccess() {
    triggerHaptic('success');
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 chord

      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.05);

        gain.gain.setValueAtTime(0.06, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + i * 0.05);
        osc.stop(now + i * 0.05 + 0.3);
      });
    } catch {}
  }

  // Pirates of the Caribbean Theme ("He's a Pirate") synthesized melody for alarms
  public playPiratesTheme() {
    triggerHaptic('warning');
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Pirates motif notes: D4, F4, G4, G4, G4, A4, Bb4, Bb4, Bb4, C5, A4, A4, G4, F4, G4...
      const themeNotes: Array<{ freq: number; dur: number; offset: number }> = [
        { freq: 293.66, dur: 0.11, offset: 0.0 },   // D4
        { freq: 349.23, dur: 0.11, offset: 0.11 },  // F4
        { freq: 392.00, dur: 0.22, offset: 0.22 },  // G4
        { freq: 392.00, dur: 0.11, offset: 0.44 },  // G4
        { freq: 392.00, dur: 0.11, offset: 0.55 },  // G4
        { freq: 440.00, dur: 0.11, offset: 0.66 },  // A4
        { freq: 466.16, dur: 0.22, offset: 0.77 },  // Bb4
        { freq: 466.16, dur: 0.11, offset: 0.99 },  // Bb4
        { freq: 466.16, dur: 0.11, offset: 1.10 },  // Bb4
        { freq: 523.25, dur: 0.11, offset: 1.21 },  // C5
        { freq: 440.00, dur: 0.22, offset: 1.32 },  // A4
        { freq: 440.00, dur: 0.11, offset: 1.54 },  // A4
        { freq: 392.00, dur: 0.11, offset: 1.65 },  // G4
        { freq: 349.23, dur: 0.11, offset: 1.76 },  // F4
        { freq: 392.00, dur: 0.35, offset: 1.87 },  // G4
        { freq: 293.66, dur: 0.11, offset: 2.25 },  // D4
        { freq: 349.23, dur: 0.11, offset: 2.36 },  // F4
        { freq: 392.00, dur: 0.22, offset: 2.47 },  // G4
        { freq: 392.00, dur: 0.11, offset: 2.69 },  // G4
        { freq: 392.00, dur: 0.11, offset: 2.80 },  // G4
        { freq: 523.25, dur: 0.11, offset: 2.91 },  // C5
        { freq: 587.33, dur: 0.22, offset: 3.02 },  // D5
        { freq: 587.33, dur: 0.11, offset: 3.24 },  // D5
        { freq: 587.33, dur: 0.11, offset: 3.35 },  // D5
        { freq: 698.46, dur: 0.11, offset: 3.46 },  // F5
        { freq: 659.25, dur: 0.22, offset: 3.57 },  // E5
        { freq: 659.25, dur: 0.11, offset: 3.79 },  // E5
        { freq: 587.33, dur: 0.11, offset: 3.90 },  // D5
        { freq: 523.25, dur: 0.11, offset: 4.01 },  // C5
        { freq: 587.33, dur: 0.45, offset: 4.12 },  // D5 grand crescendo
      ];

      themeNotes.forEach((n) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(n.freq, now + n.offset);

        gain.gain.setValueAtTime(0.08, now + n.offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.offset + n.dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + n.offset);
        osc.stop(now + n.offset + n.dur + 0.04);
      });
    } catch {}
  }

  // Task reminder alarm chime (plays Pirates of the Caribbean theme)
  public playAlarm() {
    this.playPiratesTheme();
  }
}

export const soundFx = new SoundEffectsManager();
