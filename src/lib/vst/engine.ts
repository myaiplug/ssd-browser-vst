import { shapedBand } from "@/lib/vst/curve";
import { makeDemoBuffer } from "@/lib/vst/demo";
import { delaySeconds, hpfHz, lpfHz } from "@/lib/vst/format";
import { BANDS, NEUTRAL, type Patch } from "@/lib/vst/types";

type Graph = {
  input: GainNode;
  amp: GainNode;
  eqs: BiquadFilterNode[];
  sub: BiquadFilterNode;
  hpf: BiquadFilterNode;
  lpf: BiquadFilterNode;
  delay: DelayNode;
  delayFb: GainNode;
  delayMix: GainNode;
  reverb: ConvolverNode;
  reverbMix: GainNode;
  flangerDelay: DelayNode;
  flangerLfo: OscillatorNode;
  flangerDepth: GainNode;
  flangerMix: GainNode;
  output: GainNode;
  comp: DynamicsCompressorNode;
};

function impulse(ctx: BaseAudioContext) {
  const length = Math.floor(ctx.sampleRate * 2);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);
  for (let i = 0; i < length; i++) {
    const env = (1 - i / length) ** 2;
    left[i] = (Math.random() * 2 - 1) * env;
    right[i] = (Math.random() * 2 - 1) * env;
  }
  return buffer;
}

function createGraph(ctx: BaseAudioContext): Graph {
  const eqs = BANDS.map((band, index) => {
    const filter = ctx.createBiquadFilter();
    filter.type = index === 0 ? "lowshelf" : index === 6 ? "highshelf" : "peaking";
    filter.frequency.value = band.hz;
    filter.Q.value = 1;
    filter.gain.value = 0;
    return filter;
  });
  const delay = ctx.createDelay(2);
  const flangerDelay = ctx.createDelay(0.02);
  const flangerLfo = ctx.createOscillator();
  const flangerDepth = ctx.createGain();
  flangerDepth.gain.value = 0.002;
  flangerLfo.frequency.value = 0.5;
  const delayFb = ctx.createGain();
  delayFb.gain.value = 0.3;
  const sub = ctx.createBiquadFilter();
  sub.type = "lowshelf";
  sub.frequency.value = 80;
  const hpf = ctx.createBiquadFilter();
  hpf.type = "highpass";
  const lpf = ctx.createBiquadFilter();
  lpf.type = "lowpass";
  return {
    input: ctx.createGain(),
    amp: ctx.createGain(),
    eqs,
    sub,
    hpf,
    lpf,
    delay,
    delayFb,
    delayMix: ctx.createGain(),
    reverb: ctx.createConvolver(),
    reverbMix: ctx.createGain(),
    flangerDelay,
    flangerLfo,
    flangerDepth,
    flangerMix: ctx.createGain(),
    output: ctx.createGain(),
    comp: ctx.createDynamicsCompressor(),
  };
}

function connect(g: Graph, from: AudioNode, to: AudioNode) {
  from.connect(g.input);
  g.input.connect(g.amp);
  g.amp.connect(g.eqs[0]);
  for (let i = 0; i < g.eqs.length - 1; i++) g.eqs[i].connect(g.eqs[i + 1]);
  g.eqs[g.eqs.length - 1].connect(g.sub);
  g.sub.connect(g.hpf);
  g.hpf.connect(g.lpf);
  g.lpf.connect(g.output);
  g.lpf.connect(g.delay);
  g.lpf.connect(g.reverb);
  g.lpf.connect(g.flangerDelay);
  g.delay.connect(g.delayFb);
  g.delayFb.connect(g.delay);
  g.delay.connect(g.delayMix);
  g.delayMix.connect(g.output);
  g.reverb.connect(g.reverbMix);
  g.reverbMix.connect(g.output);
  g.flangerLfo.connect(g.flangerDepth);
  g.flangerDepth.connect(g.flangerDelay.delayTime);
  g.flangerDelay.connect(g.flangerMix);
  g.flangerMix.connect(g.output);
  g.output.connect(g.comp);
  g.comp.connect(to);
}

function apply(g: Graph, patch: Patch, ctx: BaseAudioContext, ramp: number) {
  const now = ctx.currentTime;
  const set = (param: AudioParam, value: number) => {
    const safe = Number.isFinite(value) ? value : 0;
    if (ramp <= 0) param.setValueAtTime(safe, now);
    else param.setTargetAtTime(safe, now, ramp);
  };
  const nyquist = ctx.sampleRate / 2 - 40;
  const inDb = ((patch.input ?? 50) - 50) * 0.24;
  set(g.input.gain, 10 ** (inDb / 20));
  set(g.amp.gain, 0.1 + (patch.amp / 100) * 2.9);
  for (let i = 0; i < 7; i++) {
    const shaped = shapedBand(patch, i);
    set(g.eqs[i].gain, shaped.db);
    g.eqs[i].Q.value = shaped.q;
  }
  set(g.hpf.frequency, Math.min(nyquist, Math.max(10, hpfHz(patch.hpf))));
  set(g.lpf.frequency, Math.min(nyquist, Math.max(200, lpfHz(patch.lpf))));
  set(g.delay.delayTime, delaySeconds(patch.delay));
  const space = patch.spaceOn === false ? 0 : 1;
  const harm = patch.harmOn === false ? 0 : 1;
  set(g.delayMix.gain, (patch.delay / 100) * space);
  set(g.reverbMix.gain, (patch.reverb / 150) * space);
  set(g.sub.gain, (patch.sub / 10) * harm);
  set(g.flangerMix.gain, (patch.flanger / 100) * harm);
  set(g.flangerLfo.frequency, 0.2 + (patch.flanger / 100) * 2);
  set(g.output.gain, (patch.output / 50) * (patch.output / 50));
  const lim = patch.limiter ?? 0;
  g.comp.threshold.value = lim <= 0 ? 0 : -(lim / 100) * 24;
  g.comp.ratio.value = lim <= 0 ? 1 : 1 + (lim / 100) * 16;
  g.comp.knee.value = lim <= 0 ? 0 : 8;
  g.comp.attack.value = 0.003;
  g.comp.release.value = 0.18;
}

class SpectralEngine {
  private ctx: AudioContext | null = null;
  private nodes: Graph | null = null;
  private source: AudioBufferSourceNode | null = null;
  private buffer: AudioBuffer | null = null;
  private inAn: AnalyserNode | null = null;
  private outAn: AnalyserNode | null = null;
  private inTime = new Float32Array(1024);
  private outTime = new Float32Array(1024);
  patch: Patch = NEUTRAL;
  origin: "none" | "demo" | "file" = "none";

  sampleRate() {
    return this.ctx?.sampleRate ?? 48000;
  }

  private async ensure() {
    if (this.ctx) {
      if (this.ctx.state === "suspended") await this.ctx.resume();
      return;
    }
    this.ctx = new AudioContext();
    this.nodes = createGraph(this.ctx);
    this.nodes.reverb.buffer = impulse(this.ctx);
    this.inAn = this.ctx.createAnalyser();
    this.outAn = this.ctx.createAnalyser();
    this.inAn.fftSize = 2048;
    this.outAn.fftSize = 2048;
    this.inAn.smoothingTimeConstant = 0.82;
    this.outAn.smoothingTimeConstant = 0.78;
    this.inAn.minDecibels = -96;
    this.outAn.minDecibels = -96;
    this.inAn.maxDecibels = -12;
    this.outAn.maxDecibels = -12;
    const g = this.nodes;
    g.input.connect(this.inAn);
    this.inAn.connect(g.amp);
    g.amp.connect(g.eqs[0]);
    for (let i = 0; i < g.eqs.length - 1; i++) g.eqs[i].connect(g.eqs[i + 1]);
    g.eqs[g.eqs.length - 1].connect(g.sub);
    g.sub.connect(g.hpf);
    g.hpf.connect(g.lpf);
    g.lpf.connect(g.output);
    g.lpf.connect(g.delay);
    g.lpf.connect(g.reverb);
    g.lpf.connect(g.flangerDelay);
    g.delay.connect(g.delayFb);
    g.delayFb.connect(g.delay);
    g.delay.connect(g.delayMix);
    g.delayMix.connect(g.output);
    g.reverb.connect(g.reverbMix);
    g.reverbMix.connect(g.output);
    g.flangerLfo.connect(g.flangerDepth);
    g.flangerDepth.connect(g.flangerDelay.delayTime);
    g.flangerDelay.connect(g.flangerMix);
    g.flangerMix.connect(g.output);
    g.output.connect(g.comp);
    g.comp.connect(this.outAn);
    this.outAn.connect(this.ctx.destination);
    try {
      g.flangerLfo.start();
    } catch {
      /* already running */
    }
    apply(g, this.patch, this.ctx, 0);
  }

  setPatch(patch: Patch) {
    this.patch = patch;
    if (this.ctx && this.nodes) apply(this.nodes, patch, this.ctx, 0.03);
  }

  armDemo() {
    if (!this.ctx) return;
    this.buffer = makeDemoBuffer(this.ctx);
    this.origin = "demo";
  }

  async loadFile(file: File) {
    await this.ensure();
    const copy = await file.arrayBuffer();
    const audio = await this.ctx!.decodeAudioData(copy);
    this.buffer = audio;
    this.origin = "file";
    const wasPlaying = this.source != null;
    if (wasPlaying) await this.play();
    return { duration: audio.duration, rate: audio.sampleRate, channels: audio.numberOfChannels };
  }

  async play() {
    await this.ensure();
    if (!this.buffer) this.armDemo();
    if (this.ctx!.state === "suspended") await this.ctx!.resume();
    this.stopSource();
    const src = this.ctx!.createBufferSource();
    src.buffer = this.buffer;
    src.loop = true;
    src.connect(this.nodes!.input);
    src.start();
    this.source = src;
  }

  pause() {
    this.stopSource();
  }

  private stopSource() {
    if (!this.source) return;
    try {
      this.source.stop();
    } catch {
      /* already stopped */
    }
    try {
      this.source.disconnect();
    } catch {
      /* already disconnected */
    }
    this.source = null;
  }

  readSpectrum(target: "in" | "out", into: Uint8Array) {
    const node = target === "in" ? this.inAn : this.outAn;
    if (!node) {
      into.fill(0);
      return;
    }
    node.getByteFrequencyData(into as Uint8Array<ArrayBuffer>);
  }

  waveform(target: "in" | "out", into: Float32Array) {
    const node = target === "in" ? this.inAn : this.outAn;
    if (!node) {
      into.fill(0);
      return;
    }
    node.getFloatTimeDomainData(into as Float32Array<ArrayBuffer>);
  }

  level(target: "in" | "out") {
    const node = target === "in" ? this.inAn : this.outAn;
    const buf = target === "in" ? this.inTime : this.outTime;
    if (!node) return { rms: 0, peak: 0 };
    node.getFloatTimeDomainData(buf as Float32Array<ArrayBuffer>);
    let sum = 0;
    let peak = 0;
    for (let i = 0; i < buf.length; i++) {
      const v = buf[i];
      sum += v * v;
      const a = Math.abs(v);
      if (a > peak) peak = a;
    }
    return { rms: Math.min(1, Math.sqrt(sum / buf.length) * 3.4), peak };
  }

  async render() {
    await this.ensure();
    if (!this.buffer) this.armDemo();
    const audio = this.buffer!;
    const patch = this.patch;
    const delayTime = delaySeconds(patch.delay);
    let tail = 0;
    if (patch.delay > 0) tail = Math.max(tail, delayTime * 6);
    if (patch.reverb > 0) tail = Math.max(tail, 2.2);
    if (patch.flanger > 0) tail = Math.max(tail, 0.05);
    const sr = audio.sampleRate;
    const length = audio.length + Math.ceil(tail * sr);
    const offline = new OfflineAudioContext(2, length, sr);
    const g = createGraph(offline);
    g.reverb.buffer = impulse(offline);
    const source = offline.createBufferSource();
    source.buffer = audio;
    connect(g, source, offline.destination);
    apply(g, patch, offline, 0);
    try {
      g.flangerLfo.start(0);
    } catch {
      /* ignore */
    }
    source.start(0);
    return offline.startRendering();
  }
}

export const engine = new SpectralEngine();
