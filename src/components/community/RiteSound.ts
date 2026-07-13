/**
 * Ritual sound — WebAudio only, synthesized, strictly OFF by default.
 * The AudioContext is created lazily inside the user's enable gesture.
 */
export class RiteSound {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  enabled = false;

  enable(): void {
    if (!this.ctx) {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.32;
      this.master.connect(this.ctx.destination);
    }
    void this.ctx.resume();
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
    if (this.ctx && this.ctx.state === "running") void this.ctx.suspend();
  }

  dispose(): void {
    this.enabled = false;
    if (this.ctx) void this.ctx.close();
    this.ctx = null;
    this.master = null;
  }

  private noise(dur: number): AudioBufferSourceNode | null {
    if (!this.ctx) return null;
    const len = Math.max(1, Math.floor(this.ctx.sampleRate * dur));
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    return src;
  }

  /** A blunt impact: filtered noise crack + a falling sub thud. */
  strike(n: number): void {
    if (!this.enabled || !this.ctx || !this.master) return;
    const t = this.ctx.currentTime;

    const noise = this.noise(0.22);
    if (noise) {
      const lp = this.ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(900 + n * 250, t);
      lp.frequency.exponentialRampToValueAtTime(120, t + 0.2);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.7, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      noise.connect(lp).connect(g).connect(this.master);
      noise.start(t);
      noise.stop(t + 0.24);
    }

    const osc = this.ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(120 + n * 14, t);
    osc.frequency.exponentialRampToValueAtTime(38, t + 0.28);
    const og = this.ctx.createGain();
    og.gain.setValueAtTime(0.55, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc.connect(og).connect(this.master);
    osc.start(t);
    osc.stop(t + 0.32);
  }

  /** The break: a longer rubble wash plus scattered mineral pings. */
  shatter(): void {
    if (!this.enabled || !this.ctx || !this.master) return;
    const t = this.ctx.currentTime;

    const noise = this.noise(0.8);
    if (noise) {
      const lp = this.ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.setValueAtTime(2400, t);
      lp.frequency.exponentialRampToValueAtTime(90, t + 0.75);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.8, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
      noise.connect(lp).connect(g).connect(this.master);
      noise.start(t);
      noise.stop(t + 0.85);
    }

    for (let i = 0; i < 6; i++) {
      const osc = this.ctx.createOscillator();
      osc.type = "triangle";
      const f = 700 + Math.random() * 2100;
      const at = t + 0.03 + Math.random() * 0.35;
      osc.frequency.setValueAtTime(f, at);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(0.12, at + 0.008);
      g.gain.exponentialRampToValueAtTime(0.001, at + 0.25);
      osc.connect(g).connect(this.master);
      osc.start(at);
      osc.stop(at + 0.3);
    }
  }

  /** The gilding: slow molten shimmer — detuned partials blooming. */
  gild(): void {
    if (!this.enabled || !this.ctx || !this.master) return;
    const t = this.ctx.currentTime;
    const partials = [261.6, 392.0, 523.3, 659.3, 784.0];
    partials.forEach((f, i) => {
      if (!this.ctx || !this.master) return;
      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(f * (1 + (Math.random() - 0.5) * 0.004), t);
      const g = this.ctx.createGain();
      const peak = 0.05 - i * 0.006;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.015), t + 0.5 + i * 0.22);
      g.gain.exponentialRampToValueAtTime(0.001, t + 3.4 + i * 0.3);
      osc.connect(g).connect(this.master);
      osc.start(t);
      osc.stop(t + 4.2);
    });

    const noise = this.noise(1.6);
    if (noise) {
      const hp = this.ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.setValueAtTime(5200, t);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.035, t + 0.7);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.6);
      noise.connect(hp).connect(g).connect(this.master);
      noise.start(t);
      noise.stop(t + 1.7);
    }
  }
}
