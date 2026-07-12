/**
 * THE SIGNAL — WebAudio drone/static synth.
 * Strictly OFF by default; only constructed on an explicit user gesture
 * (the AUDIO toggle). No audio files exist — everything is synthesized.
 */
export class SignalAudio {
  private ctx: AudioContext;
  private master: GainNode;
  private noiseGain: GainNode;
  private droneA: OscillatorNode;
  private droneB: OscillatorNode;
  private bed = 0.012;
  private disposed = false;

  constructor() {
    this.ctx = new AudioContext();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.ctx.destination);

    // Static bed: looped brown-ish noise through a bandpass.
    const len = this.ctx.sampleRate * 2;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.03 * white) / 1.03;
      d[i] = (white * 0.35 + last * 2.2) * 0.5;
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    const bp = this.ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 1500;
    bp.Q.value = 0.7;
    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.value = this.bed;
    src.connect(bp);
    bp.connect(this.noiseGain);
    this.noiseGain.connect(this.master);
    src.start();

    // Sub drone: two detuned saws through a slowly-breathing lowpass.
    const lp = this.ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 260;
    lp.Q.value = 2;
    const droneGain = this.ctx.createGain();
    droneGain.gain.value = 0.055;
    lp.connect(droneGain);
    droneGain.connect(this.master);
    this.droneA = this.ctx.createOscillator();
    this.droneA.type = "sawtooth";
    this.droneA.detune.value = -6;
    this.droneB = this.ctx.createOscillator();
    this.droneB.type = "sawtooth";
    this.droneB.detune.value = 7;
    this.droneA.connect(lp);
    this.droneB.connect(lp);
    this.droneA.start();
    this.droneB.start();

    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 0.09;
    const lfoAmt = this.ctx.createGain();
    lfoAmt.gain.value = 90;
    lfo.connect(lfoAmt);
    lfoAmt.connect(lp.frequency);
    lfo.start();
  }

  async start(ch: number): Promise<void> {
    if (this.disposed) return;
    this.tune(ch, true);
    await this.ctx.resume();
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setValueAtTime(Math.max(this.master.gain.value, 0.0001), t);
    this.master.gain.exponentialRampToValueAtTime(0.5, t + 0.5);
  }

  stop(): void {
    if (this.disposed) return;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setValueAtTime(Math.max(this.master.gain.value, 0.0001), t);
    this.master.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
    window.setTimeout(() => {
      if (!this.disposed && this.ctx.state === "running") void this.ctx.suspend();
    }, 350);
  }

  /** Retune the drone to a channel-derived pitch; fires a static burst. */
  tune(ch: number, silent = false): void {
    if (this.disposed) return;
    const f = 55 * Math.pow(2, (ch % 12) / 12);
    const t = this.ctx.currentTime;
    this.droneA.frequency.setTargetAtTime(f, t, 0.09);
    this.droneB.frequency.setTargetAtTime(f * 1.498, t, 0.14);
    this.bed = ch === 0 ? 0.05 : 0.012; // ghost carrier is mostly static
    if (silent) this.noiseGain.gain.setTargetAtTime(this.bed, t, 0.2);
    else this.burst();
  }

  burst(): void {
    if (this.disposed) return;
    const g = this.noiseGain.gain;
    const t = this.ctx.currentTime;
    g.cancelScheduledValues(t);
    g.setValueAtTime(0.22, t);
    g.exponentialRampToValueAtTime(Math.max(this.bed, 0.0001), t + 0.45);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.ctx.close().catch(() => {});
  }
}
