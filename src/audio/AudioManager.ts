export type SoundEffect = 'touch' | 'interaction' | 'dialogue' | 'terminal-open' | 'terminal-close' | 'reward' | 'gate-open' | 'locked';

type AudioContextConstructor = new () => AudioContext;

/**
 * Effets courts générés localement par Web Audio. Aucun fichier distant ou
 * asset tiers n'est requis ; le contexte est créé uniquement après une action
 * utilisateur afin de respecter les politiques d'autoplay des navigateurs.
 */
export class AudioManager {
  private context?: AudioContext;
  private enabled = true;
  private volume = 0.16;

  public setEnabled(enabled: boolean): void { this.enabled = enabled; }

  public play(effect: SoundEffect): void {
    if (!this.enabled || typeof globalThis === 'undefined') return;
    const context = this.getContext();
    if (!context) return;
    if (context.state === 'suspended') void context.resume();

    switch (effect) {
      case 'touch': this.tone(context, 190, 0.045, 'triangle', 0.55); break;
      case 'interaction': this.tone(context, 420, 0.09, 'sine', 0.72); break;
      case 'dialogue': this.tone(context, 330, 0.08, 'sine', 0.48); break;
      case 'terminal-open':
        this.tone(context, 280, 0.08, 'square', 0.42);
        this.tone(context, 420, 0.1, 'square', 0.34, 0.07);
        break;
      case 'terminal-close': this.tone(context, 320, 0.08, 'square', 0.32); break;
      case 'reward':
        this.tone(context, 520, 0.1, 'triangle', 0.62);
        this.tone(context, 780, 0.14, 'triangle', 0.5, 0.09);
        break;
      case 'gate-open':
        this.tone(context, 360, 0.12, 'sine', 0.48);
        this.tone(context, 540, 0.14, 'sine', 0.42, 0.1);
        this.tone(context, 720, 0.2, 'sine', 0.36, 0.2);
        break;
      case 'locked': this.tone(context, 115, 0.12, 'sawtooth', 0.42); break;
    }
  }

  private getContext(): AudioContext | undefined {
    if (this.context) return this.context;
    const runtime = globalThis as typeof globalThis & { webkitAudioContext?: AudioContextConstructor };
    const Context = runtime.AudioContext as AudioContextConstructor | undefined ?? runtime.webkitAudioContext;
    if (!Context) return undefined;
    try {
      this.context = new Context();
      return this.context;
    } catch {
      return undefined;
    }
  }

  private tone(context: AudioContext, frequency: number, duration: number, type: OscillatorType, level: number, delay = 0): void {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime + delay;
    const end = start + duration;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.001, this.volume * level), start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(end + 0.02);
  }
}

export const audioManager = new AudioManager();
