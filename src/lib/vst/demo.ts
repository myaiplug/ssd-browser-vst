function noise(i: number) {
  const x = Math.sin(i * 127.1) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

export function makeDemoBuffer(ctx: BaseAudioContext) {
  const sr = ctx.sampleRate;
  const seconds = 4;
  const n = Math.floor(sr * seconds);
  const buffer = ctx.createBuffer(2, n, sr);
  const L = buffer.getChannelData(0);
  const R = buffer.getChannelData(1);
  const beat = 60 / 90;
  const melody = [329.63, 392, 440, 493.88, 440, 392, 349.23, 329.63];

  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const beatIndex = Math.floor(t / beat);
    const beatT = t % beat;
    const inBar = beatIndex % 4;
    let s = 0;

    if (inBar === 0 || inBar === 2) {
      const k = Math.exp(-beatT * 16);
      const f = 46 + 110 * Math.exp(-beatT * 20);
      s += Math.sin(2 * Math.PI * f * t) * k * 0.72;
    }
    if (inBar === 1 || inBar === 3) {
      s += noise(i) * Math.exp(-beatT * 12) * 0.32;
    }
    const eighth = t % (beat / 2);
    if (eighth < 0.035) s += noise(i + 9) * (1 - eighth / 0.035) * 0.07;

    s += Math.sin(2 * Math.PI * 41.2 * t) * Math.exp(-beatT * 2.8) * 0.34;

    const f0 = melody[beatIndex % melody.length];
    const vEnv = Math.sin(Math.PI * Math.min(1, beatT / (beat * 0.9))) ** 0.55;
    const vib = 1 + 0.004 * Math.sin(2 * Math.PI * 5.2 * t);
    s += Math.sin(2 * Math.PI * f0 * vib * t) * 0.18 * vEnv;
    s += Math.sin(2 * Math.PI * f0 * 2 * vib * t) * 0.05 * vEnv;
    s += Math.sin(2 * Math.PI * f0 * 3.02 * t) * 0.025 * vEnv;
    s += noise(i + 3) * 0.012;

    const pan = 0.06 * Math.sin((2 * Math.PI * t) / seconds);
    L[i] = Math.tanh(s * (0.9 - pan));
    R[i] = Math.tanh(s * (0.9 + pan));
  }
  return buffer;
}
