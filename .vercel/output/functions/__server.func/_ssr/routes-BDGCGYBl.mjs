import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Power, c as ChevronLeft, i as Redo2, l as ChevronDown, o as FolderOpen, r as Save, s as ChevronRight, t as Undo2 } from "../_libs/lucide-react.mjs";
import { t as create } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BDGCGYBl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function signed(db, digits = 1) {
	if (!Number.isFinite(db)) return "-inf";
	if (Math.abs(db) < .05) return 0 .toFixed(digits);
	return `${db > 0 ? "+" : ""}${db.toFixed(digits)}`;
}
function ampGain(v) {
	return .1 + v / 100 * 2.9;
}
function outputGain(v) {
	return v / 50 * (v / 50);
}
function hpfHz(v) {
	return 20 + v * 4.8;
}
function lpfHz(v) {
	return 2e3 + v * 200;
}
function delaySeconds(v) {
	return .1 + v / 100 * .9;
}
function gainDb(v) {
	return (v - 50) * .24;
}
function qFactor(v) {
	return .3 + v / 100 * 9.7;
}
function formatAmp(v) {
	return signed(20 * Math.log10(ampGain(v)));
}
function formatHpf(v) {
	return `${Math.round(hpfHz(v))}`;
}
function formatLpf(v) {
	const hz = lpfHz(v);
	return hz >= 1e3 ? `${(hz / 1e3).toFixed(1)}k` : `${Math.round(hz)}`;
}
function formatSub(v) {
	return signed(v / 10);
}
function formatOut(v) {
	const g = outputGain(v);
	if (g <= 1e-4) return "-inf";
	return signed(20 * Math.log10(g));
}
function formatGain(v) {
	return signed(gainDb(v));
}
function formatQ(v) {
	return qFactor(v).toFixed(1);
}
function formatTrim(v) {
	return signed((v - 50) * .24);
}
function formatLimiter(v) {
	if (v <= 0) return "0.0";
	return signed(-(v / 100) * 24);
}
function formatTilt(v) {
	return signed((v - 50) / 50 * 6);
}
function slug(name) {
	return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
var BANDS = [
	{
		hz: 60,
		label: "60",
		type: "lowshelf"
	},
	{
		hz: 200,
		label: "200",
		type: "peaking"
	},
	{
		hz: 800,
		label: "800",
		type: "peaking"
	},
	{
		hz: 2e3,
		label: "2k",
		type: "peaking"
	},
	{
		hz: 4e3,
		label: "4k",
		type: "peaking"
	},
	{
		hz: 8e3,
		label: "8k",
		type: "peaking"
	},
	{
		hz: 16e3,
		label: "16k",
		type: "highshelf"
	}
];
var FAMILIES = [
	"Vocals",
	"Low end",
	"Space",
	"Character",
	"Fix-it"
];
var zeros = () => [
	false,
	false,
	false,
	false,
	false,
	false,
	false
];
var fifties = () => [
	50,
	50,
	50,
	50,
	50,
	50,
	50
];
var NEUTRAL = {
	amp: 50,
	hpf: 75,
	lpf: 19,
	delay: 0,
	reverb: 0,
	sub: 0,
	flanger: 0,
	output: 50,
	input: 50,
	limiter: 0,
	tilt: 50,
	smooth: 0,
	depth: 50,
	spaceOn: true,
	harmOn: true,
	gains: fifties(),
	qs: fifties(),
	solos: zeros(),
	mutes: zeros(),
	bypass: false
};
function clamp100(n) {
	if (!Number.isFinite(n)) return 0;
	return Math.max(0, Math.min(100, Math.round(n)));
}
function patchFromRecipe(recipe) {
	return {
		amp: recipe.amp,
		hpf: recipe.hpf,
		lpf: recipe.lpf,
		delay: recipe.delay,
		reverb: recipe.reverb,
		sub: recipe.sub,
		flanger: recipe.flanger,
		output: recipe.output,
		input: 50,
		limiter: 0,
		tilt: 50,
		smooth: 0,
		depth: 50,
		spaceOn: true,
		harmOn: true,
		gains: recipe.eqGain.slice(),
		qs: recipe.eqQ.slice(),
		solos: zeros(),
		mutes: zeros(),
		bypass: false
	};
}
function sameRecipe(patch, recipe) {
	return [
		patch.amp === recipe.amp,
		patch.hpf === recipe.hpf,
		patch.lpf === recipe.lpf,
		patch.delay === recipe.delay,
		patch.reverb === recipe.reverb,
		patch.sub === recipe.sub,
		patch.flanger === recipe.flanger,
		patch.output === recipe.output,
		patch.gains.every((g, i) => g === recipe.eqGain[i]),
		patch.qs.every((q, i) => q === recipe.eqQ[i]),
		(patch.input ?? 50) === 50,
		(patch.limiter ?? 0) === 0,
		(patch.tilt ?? 50) === 50,
		(patch.smooth ?? 0) === 0,
		(patch.depth ?? 50) === 50,
		patch.spaceOn !== false,
		patch.harmOn !== false
	].every(Boolean) && !patch.bypass && patch.solos.every((s) => !s) && patch.mutes.every((m) => !m);
}
function isPatch(value) {
	if (!value || typeof value !== "object") return false;
	const v = value;
	return Array.isArray(v.gains) && v.gains.length === 7 && Array.isArray(v.qs) && v.qs.length === 7 && Array.isArray(v.solos) && Array.isArray(v.mutes) && typeof v.amp === "number" && typeof v.bypass === "boolean";
}
function mag(c, w) {
	const c1 = Math.cos(w);
	const s1 = Math.sin(w);
	const c2 = Math.cos(2 * w);
	const s2 = Math.sin(2 * w);
	const nr = c.b0 + c.b1 * c1 + c.b2 * c2;
	const ni = -c.b1 * s1 - c.b2 * s2;
	const dr = 1 + c.a1 * c1 + c.a2 * c2;
	const di = -c.a1 * s1 - c.a2 * s2;
	const den = dr * dr + di * di;
	if (den <= 1e-12) return 0;
	return Math.sqrt((nr * nr + ni * ni) / den);
}
function normalize(b0, b1, b2, a0, a1, a2) {
	return {
		b0: b0 / a0,
		b1: b1 / a0,
		b2: b2 / a0,
		a1: a1 / a0,
		a2: a2 / a0
	};
}
function peaking(f0, q, db, sr) {
	const A = Math.pow(10, db / 40);
	const w0 = 2 * Math.PI * f0 / sr;
	const cos = Math.cos(w0);
	const alpha = Math.sin(w0) / (2 * Math.max(.05, q));
	return normalize(1 + alpha * A, -2 * cos, 1 - alpha * A, 1 + alpha / A, -2 * cos, 1 - alpha / A);
}
function shelf(kind, f0, db, sr) {
	const A = Math.pow(10, db / 40);
	const w0 = 2 * Math.PI * f0 / sr;
	const cos = Math.cos(w0);
	const alpha = Math.sin(w0) / 2 * Math.sqrt((A + 1 / A) * 0 + 2);
	const two = 2 * Math.sqrt(A) * alpha;
	const ap = A + 1;
	const am = A - 1;
	if (kind === "low") return normalize(A * (ap - am * cos + two), 2 * A * (am - ap * cos), A * (ap - am * cos - two), ap + am * cos + two, -2 * (am + ap * cos), ap + am * cos - two);
	return normalize(A * (ap + am * cos + two), -2 * A * (am + ap * cos), A * (ap + am * cos - two), ap - am * cos + two, 2 * (am - ap * cos), ap - am * cos - two);
}
function pass(kind, f0, sr) {
	const w0 = 2 * Math.PI * Math.min(f0, sr / 2 - 20) / sr;
	const cos = Math.cos(w0);
	const alpha = Math.sin(w0) / 1.414;
	if (kind === "low") {
		const b0 = (1 - cos) / 2;
		return normalize(b0, 1 - cos, b0, 1 + alpha, -2 * cos, 1 - alpha);
	}
	const b0 = (1 + cos) / 2;
	return normalize(b0, -(1 + cos), b0, 1 + alpha, -2 * cos, 1 - alpha);
}
function shapedBand(patch, index) {
	const depth = (patch.depth ?? 50) / 50;
	const tilt = ((patch.tilt ?? 50) - 50) / 50;
	const weight = index / 6 * 2 - 1;
	let db = gainDb(patch.gains[index]) * depth + tilt * weight * 6;
	const anySolo = patch.solos.some(Boolean);
	if (patch.bypass) db = 0;
	else if (patch.mutes[index] || anySolo && !patch.solos[index]) db = -60;
	const smooth = (patch.smooth ?? 0) / 100;
	const q = qFactor(patch.qs[index]) * (1 - smooth) + .7 * smooth;
	return {
		db,
		q
	};
}
function responseDb(patch, freq, sampleRate) {
	const sr = sampleRate;
	const w = 2 * Math.PI * freq / sr;
	let db = 20 * Math.log10(Math.max(1e-6, ampGain(patch.amp) * outputGain(patch.output)));
	for (let i = 0; i < BANDS.length; i++) {
		const band = BANDS[i];
		const shaped = shapedBand(patch, i);
		const coef = band.type === "lowshelf" ? shelf("low", band.hz, shaped.db, sr) : band.type === "highshelf" ? shelf("high", band.hz, shaped.db, sr) : peaking(band.hz, shaped.q, shaped.db, sr);
		db += 20 * Math.log10(Math.max(1e-8, mag(coef, w)));
	}
	if (patch.sub > 0) db += 20 * Math.log10(Math.max(1e-8, mag(shelf("low", 80, patch.sub / 10, sr), w)));
	db += 20 * Math.log10(Math.max(1e-8, mag(pass("high", hpfHz(patch.hpf), sr), w)));
	db += 20 * Math.log10(Math.max(1e-8, mag(pass("low", lpfHz(patch.lpf), sr), w)));
	return db;
}
function storedBandDb(patch, index) {
	return gainDb(patch.gains[index]);
}
function noise(i) {
	const x = Math.sin(i * 127.1) * 43758.5453;
	return (x - Math.floor(x)) * 2 - 1;
}
function makeDemoBuffer(ctx) {
	const sr = ctx.sampleRate;
	const seconds = 4;
	const n = Math.floor(sr * seconds);
	const buffer = ctx.createBuffer(2, n, sr);
	const L = buffer.getChannelData(0);
	const R = buffer.getChannelData(1);
	const beat = 60 / 90;
	const melody = [
		329.63,
		392,
		440,
		493.88,
		440,
		392,
		349.23,
		329.63
	];
	for (let i = 0; i < n; i++) {
		const t = i / sr;
		const beatIndex = Math.floor(t / beat);
		const beatT = t % beat;
		const inBar = beatIndex % 4;
		let s = 0;
		if (inBar === 0 || inBar === 2) {
			const k = Math.exp(-beatT * 16);
			const f = 46 + 110 * Math.exp(-beatT * 20);
			s += Math.sin(2 * Math.PI * f * t) * k * .72;
		}
		if (inBar === 1 || inBar === 3) s += noise(i) * Math.exp(-beatT * 12) * .32;
		const eighth = t % (beat / 2);
		if (eighth < .035) s += noise(i + 9) * (1 - eighth / .035) * .07;
		s += Math.sin(2 * Math.PI * 41.2 * t) * Math.exp(-beatT * 2.8) * .34;
		const f0 = melody[beatIndex % melody.length];
		const vEnv = Math.sin(Math.PI * Math.min(1, beatT / (beat * .9))) ** .55;
		const vib = 1 + .004 * Math.sin(2 * Math.PI * 5.2 * t);
		s += Math.sin(2 * Math.PI * f0 * vib * t) * .18 * vEnv;
		s += Math.sin(2 * Math.PI * f0 * 2 * vib * t) * .05 * vEnv;
		s += Math.sin(2 * Math.PI * f0 * 3.02 * t) * .025 * vEnv;
		s += noise(i + 3) * .012;
		const pan = .06 * Math.sin(2 * Math.PI * t / seconds);
		L[i] = Math.tanh(s * (.9 - pan));
		R[i] = Math.tanh(s * (.9 + pan));
	}
	return buffer;
}
function impulse(ctx) {
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
function createGraph(ctx) {
	const eqs = BANDS.map((band, index) => {
		const filter = ctx.createBiquadFilter();
		filter.type = index === 0 ? "lowshelf" : index === 6 ? "highshelf" : "peaking";
		filter.frequency.value = band.hz;
		filter.Q.value = 1;
		filter.gain.value = 0;
		return filter;
	});
	const delay = ctx.createDelay(2);
	const flangerDelay = ctx.createDelay(.02);
	const flangerLfo = ctx.createOscillator();
	const flangerDepth = ctx.createGain();
	flangerDepth.gain.value = .002;
	flangerLfo.frequency.value = .5;
	const delayFb = ctx.createGain();
	delayFb.gain.value = .3;
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
		comp: ctx.createDynamicsCompressor()
	};
}
function connect(g, from, to) {
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
function apply(g, patch, ctx, ramp) {
	const now = ctx.currentTime;
	const set = (param, value) => {
		const safe = Number.isFinite(value) ? value : 0;
		if (ramp <= 0) param.setValueAtTime(safe, now);
		else param.setTargetAtTime(safe, now, ramp);
	};
	const nyquist = ctx.sampleRate / 2 - 40;
	const inDb = ((patch.input ?? 50) - 50) * .24;
	set(g.input.gain, 10 ** (inDb / 20));
	set(g.amp.gain, .1 + patch.amp / 100 * 2.9);
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
	set(g.delayMix.gain, patch.delay / 100 * space);
	set(g.reverbMix.gain, patch.reverb / 150 * space);
	set(g.sub.gain, patch.sub / 10 * harm);
	set(g.flangerMix.gain, patch.flanger / 100 * harm);
	set(g.flangerLfo.frequency, .2 + patch.flanger / 100 * 2);
	set(g.output.gain, patch.output / 50 * (patch.output / 50));
	const lim = patch.limiter ?? 0;
	g.comp.threshold.value = lim <= 0 ? 0 : -(lim / 100) * 24;
	g.comp.ratio.value = lim <= 0 ? 1 : 1 + lim / 100 * 16;
	g.comp.knee.value = lim <= 0 ? 0 : 8;
	g.comp.attack.value = .003;
	g.comp.release.value = .18;
}
var SpectralEngine = class {
	ctx = null;
	nodes = null;
	source = null;
	buffer = null;
	inAn = null;
	outAn = null;
	inTime = /* @__PURE__ */ new Float32Array(1024);
	outTime = /* @__PURE__ */ new Float32Array(1024);
	patch = NEUTRAL;
	origin = "none";
	sampleRate() {
		return this.ctx?.sampleRate ?? 48e3;
	}
	async ensure() {
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
		this.inAn.smoothingTimeConstant = .82;
		this.outAn.smoothingTimeConstant = .78;
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
		} catch {}
		apply(g, this.patch, this.ctx, 0);
	}
	setPatch(patch) {
		this.patch = patch;
		if (this.ctx && this.nodes) apply(this.nodes, patch, this.ctx, .03);
	}
	armDemo() {
		if (!this.ctx) return;
		this.buffer = makeDemoBuffer(this.ctx);
		this.origin = "demo";
	}
	async loadFile(file) {
		await this.ensure();
		const copy = await file.arrayBuffer();
		const audio = await this.ctx.decodeAudioData(copy);
		this.buffer = audio;
		this.origin = "file";
		if (this.source != null) await this.play();
		return {
			duration: audio.duration,
			rate: audio.sampleRate,
			channels: audio.numberOfChannels
		};
	}
	async play() {
		await this.ensure();
		if (!this.buffer) this.armDemo();
		if (this.ctx.state === "suspended") await this.ctx.resume();
		this.stopSource();
		const src = this.ctx.createBufferSource();
		src.buffer = this.buffer;
		src.loop = true;
		src.connect(this.nodes.input);
		src.start();
		this.source = src;
	}
	pause() {
		this.stopSource();
	}
	stopSource() {
		if (!this.source) return;
		try {
			this.source.stop();
		} catch {}
		try {
			this.source.disconnect();
		} catch {}
		this.source = null;
	}
	readSpectrum(target, into) {
		const node = target === "in" ? this.inAn : this.outAn;
		if (!node) {
			into.fill(0);
			return;
		}
		node.getByteFrequencyData(into);
	}
	waveform(target, into) {
		const node = target === "in" ? this.inAn : this.outAn;
		if (!node) {
			into.fill(0);
			return;
		}
		node.getFloatTimeDomainData(into);
	}
	level(target) {
		const node = target === "in" ? this.inAn : this.outAn;
		const buf = target === "in" ? this.inTime : this.outTime;
		if (!node) return {
			rms: 0,
			peak: 0
		};
		node.getFloatTimeDomainData(buf);
		let sum = 0;
		let peak = 0;
		for (let i = 0; i < buf.length; i++) {
			const v = buf[i];
			sum += v * v;
			const a = Math.abs(v);
			if (a > peak) peak = a;
		}
		return {
			rms: Math.min(1, Math.sqrt(sum / buf.length) * 3.4),
			peak
		};
	}
	async render() {
		await this.ensure();
		if (!this.buffer) this.armDemo();
		const audio = this.buffer;
		const patch = this.patch;
		const delayTime = delaySeconds(patch.delay);
		let tail = 0;
		if (patch.delay > 0) tail = Math.max(tail, delayTime * 6);
		if (patch.reverb > 0) tail = Math.max(tail, 2.2);
		if (patch.flanger > 0) tail = Math.max(tail, .05);
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
		} catch {}
		source.start(0);
		return offline.startRendering();
	}
};
var engine = new SpectralEngine();
var qFlat = [
	7,
	7,
	7,
	7,
	7,
	7,
	7
];
var RECIPES = [
	{
		id: "air-lift",
		name: "Air Lift",
		family: "Vocals",
		description: "Gentle 8k and 16k air with a mild 80 Hz rumble cut. Low end stays flat.",
		amp: 31,
		hpf: 13,
		lpf: 100,
		delay: 0,
		reverb: 6,
		sub: 0,
		flanger: 0,
		output: 50,
		eqGain: [
			50,
			50,
			50,
			52,
			55,
			60,
			64
		],
		eqQ: qFlat
	},
	{
		id: "de-box",
		name: "De-Box",
		family: "Vocals",
		description: "Scoops boxy 200 to 800 Hz buildup and opens the top a touch.",
		amp: 33,
		hpf: 15,
		lpf: 100,
		delay: 0,
		reverb: 0,
		sub: 0,
		flanger: 0,
		output: 50,
		eqGain: [
			50,
			42,
			38,
			50,
			52,
			54,
			56
		],
		eqQ: [
			7,
			12,
			9,
			7,
			7,
			7,
			7
		]
	},
	{
		id: "phone-hook",
		name: "Phone Hook",
		family: "Vocals",
		description: "Telephone band, about 300 Hz to 3.4 kHz, with a pushed 800 Hz to 2 kHz honk.",
		amp: 40,
		hpf: 58,
		lpf: 7,
		delay: 0,
		reverb: 4,
		sub: 0,
		flanger: 0,
		output: 54,
		eqGain: [
			30,
			40,
			62,
			66,
			54,
			40,
			35
		],
		eqQ: [
			7,
			9,
			12,
			10,
			9,
			7,
			7
		]
	},
	{
		id: "adlib-throw",
		name: "Ad-lib Throw",
		family: "Vocals",
		description: "Brighter, thinner ad-lib thrown back with a long echo and hall wash.",
		amp: 31,
		hpf: 25,
		lpf: 92,
		delay: 38,
		reverb: 40,
		sub: 0,
		flanger: 0,
		output: 46,
		eqGain: [
			44,
			44,
			48,
			56,
			58,
			60,
			60
		],
		eqQ: qFlat
	},
	{
		id: "whisper-double",
		name: "Whisper Double",
		family: "Vocals",
		description: "Soft, airy double. Lower level, presence lift, light echo and room.",
		amp: 24,
		hpf: 30,
		lpf: 85,
		delay: 12,
		reverb: 18,
		sub: 0,
		flanger: 6,
		output: 48,
		eqGain: [
			44,
			46,
			48,
			54,
			60,
			58,
			56
		],
		eqQ: [
			7,
			7,
			7,
			7,
			8,
			7,
			7
		]
	},
	{
		id: "808-weight",
		name: "808 Weight",
		family: "Low end",
		description: "Heavy sub shelf, top rolled toward 8 kHz, small 800 Hz dip for clean weight.",
		amp: 31,
		hpf: 2,
		lpf: 30,
		delay: 0,
		reverb: 0,
		sub: 60,
		flanger: 0,
		output: 44,
		eqGain: [
			58,
			50,
			42,
			48,
			50,
			50,
			50
		],
		eqQ: [
			7,
			7,
			10,
			7,
			7,
			7,
			7
		]
	},
	{
		id: "sub-glue",
		name: "Sub Glue",
		family: "Low end",
		description: "Moderate sub with a touch of 60 and 200 Hz, plus a tiny short echo.",
		amp: 31,
		hpf: 3,
		lpf: 70,
		delay: 4,
		reverb: 0,
		sub: 35,
		flanger: 0,
		output: 46,
		eqGain: [
			55,
			54,
			48,
			50,
			50,
			50,
			50
		],
		eqQ: [
			7,
			6,
			7,
			7,
			7,
			7,
			7
		]
	},
	{
		id: "kick-room",
		name: "Kick Room",
		family: "Low end",
		description: "Short room and a slight echo. 800 Hz box cut, 2 to 4 kHz beater punch.",
		amp: 33,
		hpf: 6,
		lpf: 60,
		delay: 6,
		reverb: 18,
		sub: 15,
		flanger: 0,
		output: 48,
		eqGain: [
			55,
			46,
			44,
			56,
			54,
			50,
			50
		],
		eqQ: [
			7,
			12,
			9,
			12,
			10,
			7,
			7
		]
	},
	{
		id: "tight-bass",
		name: "Tight Bass",
		family: "Low end",
		description: "High pass near 68 Hz, controlled sub, mud cut at 200 and 800 Hz. Dry.",
		amp: 31,
		hpf: 10,
		lpf: 45,
		delay: 0,
		reverb: 0,
		sub: 20,
		flanger: 0,
		output: 50,
		eqGain: [
			52,
			40,
			44,
			52,
			50,
			50,
			50
		],
		eqQ: [
			7,
			12,
			10,
			7,
			7,
			7,
			7
		]
	},
	{
		id: "small-booth",
		name: "Small Booth",
		family: "Space",
		description: "Low, short reverb and a hint of echo. A tight vocal booth.",
		amp: 31,
		hpf: 12,
		lpf: 85,
		delay: 3,
		reverb: 12,
		sub: 0,
		flanger: 0,
		output: 50,
		eqGain: [
			50,
			48,
			50,
			52,
			52,
			52,
			52
		],
		eqQ: qFlat
	},
	{
		id: "dark-hall",
		name: "Dark Hall",
		family: "Space",
		description: "Big reverb wash with the top cut near 6 kHz and less air.",
		amp: 31,
		hpf: 18,
		lpf: 20,
		delay: 10,
		reverb: 85,
		sub: 0,
		flanger: 0,
		output: 44,
		eqGain: [
			48,
			48,
			50,
			48,
			44,
			38,
			34
		],
		eqQ: qFlat
	},
	{
		id: "slapback-rap",
		name: "Slapback Rap",
		family: "Space",
		description: "One quick slap near 0.2 s, almost no reverb, a bit of 2 to 4 kHz edge.",
		amp: 31,
		hpf: 18,
		lpf: 90,
		delay: 14,
		reverb: 2,
		sub: 0,
		flanger: 0,
		output: 50,
		eqGain: [
			48,
			48,
			48,
			54,
			54,
			52,
			52
		],
		eqQ: qFlat
	},
	{
		id: "ping-pong-hook",
		name: "Ping-Pong Hook",
		family: "Space",
		description: "Long echo near 0.6 s and a big hall for hooks. Delay stays mono so it holds in the center.",
		amp: 31,
		hpf: 22,
		lpf: 88,
		delay: 55,
		reverb: 45,
		sub: 0,
		flanger: 0,
		output: 42,
		eqGain: [
			46,
			46,
			48,
			54,
			56,
			56,
			56
		],
		eqQ: qFlat
	},
	{
		id: "lofi-room",
		name: "Lo-fi Room",
		family: "Character",
		description: "Muffled top near 4.4 kHz, thin lows, low-mid bump, light wobble and room.",
		amp: 34,
		hpf: 30,
		lpf: 12,
		delay: 6,
		reverb: 28,
		sub: 0,
		flanger: 15,
		output: 50,
		eqGain: [
			46,
			54,
			56,
			50,
			44,
			40,
			38
		],
		eqQ: qFlat
	},
	{
		id: "tape-wobble",
		name: "Tape Wobble",
		family: "Character",
		description: "Flanger warble near 1 Hz with a soft rolled top and a little warmth.",
		amp: 31,
		hpf: 10,
		lpf: 32,
		delay: 0,
		reverb: 8,
		sub: 10,
		flanger: 45,
		output: 44,
		eqGain: [
			52,
			52,
			50,
			48,
			46,
			44,
			42
		],
		eqQ: qFlat
	},
	{
		id: "syrup-haze",
		name: "Syrup Haze",
		family: "Character",
		description: "Slow flanger, deep reverb, dark low pass near 5.6 kHz. Pairs with ScrewAI.",
		amp: 31,
		hpf: 8,
		lpf: 18,
		delay: 16,
		reverb: 55,
		sub: 25,
		flanger: 20,
		output: 42,
		eqGain: [
			54,
			54,
			50,
			46,
			44,
			40,
			38
		],
		eqQ: qFlat
	},
	{
		id: "radio-break",
		name: "Radio Break",
		family: "Character",
		description: "Band-limited radio, about 260 Hz to 4.4 kHz. Hot mids, amp pushed, output trimmed.",
		amp: 70,
		hpf: 50,
		lpf: 12,
		delay: 0,
		reverb: 6,
		sub: 0,
		flanger: 0,
		output: 36,
		eqGain: [
			35,
			42,
			64,
			62,
			52,
			40,
			38
		],
		eqQ: [
			7,
			9,
			10,
			9,
			7,
			7,
			7
		]
	},
	{
		id: "harsh-sample-tamer",
		name: "Harsh Sample Tamer",
		family: "Fix-it",
		description: "Broad cuts across 2 to 8 kHz plus a mild 13 kHz low pass for brittle samples.",
		amp: 31,
		hpf: 6,
		lpf: 55,
		delay: 0,
		reverb: 0,
		sub: 0,
		flanger: 0,
		output: 52,
		eqGain: [
			50,
			50,
			50,
			44,
			40,
			42,
			46
		],
		eqQ: [
			7,
			7,
			7,
			9,
			10,
			9,
			7
		]
	},
	{
		id: "mud-cut",
		name: "Mud Cut",
		family: "Fix-it",
		description: "Clears 200 to 800 Hz mud with a slight high pass near 87 Hz. Top stays open.",
		amp: 33,
		hpf: 14,
		lpf: 100,
		delay: 0,
		reverb: 0,
		sub: 0,
		flanger: 0,
		output: 50,
		eqGain: [
			50,
			40,
			42,
			51,
			50,
			51,
			51
		],
		eqQ: [
			7,
			10,
			9,
			7,
			7,
			7,
			7
		]
	},
	{
		id: "wide-mono-safe",
		name: "Wide-but-Mono-Safe",
		family: "Fix-it",
		description: "Width from a moderate hall and a light echo only. No flanger, so it holds up in mono.",
		amp: 31,
		hpf: 12,
		lpf: 92,
		delay: 8,
		reverb: 20,
		sub: 0,
		flanger: 0,
		output: 48,
		eqGain: [
			50,
			48,
			50,
			52,
			52,
			54,
			54
		],
		eqQ: qFlat
	}
];
function recipeById(id) {
	if (!id) return null;
	return RECIPES.find((recipe) => recipe.id === id) ?? null;
}
var KEY = "spectral-space-v1";
function numbers(patch) {
	return {
		...patch,
		amp: clamp100(patch.amp),
		hpf: clamp100(patch.hpf),
		lpf: clamp100(patch.lpf),
		delay: clamp100(patch.delay),
		reverb: clamp100(patch.reverb),
		sub: clamp100(patch.sub),
		flanger: clamp100(patch.flanger),
		output: clamp100(patch.output),
		input: clamp100(patch.input ?? 50),
		limiter: clamp100(patch.limiter ?? 0),
		tilt: clamp100(patch.tilt ?? 50),
		smooth: clamp100(patch.smooth ?? 0),
		depth: clamp100(patch.depth ?? 50),
		spaceOn: patch.spaceOn !== false,
		harmOn: patch.harmOn !== false,
		gains: patch.gains.map(clamp100),
		qs: patch.qs.map(clamp100)
	};
}
function meta(patch, recipeId) {
	const recipe = recipeById(recipeId);
	return {
		patch,
		recipeId,
		edited: recipe ? !sameRecipe(patch, recipe) : false
	};
}
var useVst = create((set, get) => ({
	patch: NEUTRAL,
	recipeId: null,
	edited: false,
	status: "Demo bed ready. Load a file when you want a master.",
	playing: false,
	rendering: false,
	hint: "Drag a node on the curve. Up is gain, sideways is width.",
	hydrated: false,
	commit: (patch, recipeId) => {
		const next = numbers(patch);
		const id = recipeId === void 0 ? get().recipeId : recipeId;
		engine.setPatch(next);
		set(meta(next, id));
	},
	applyRecipe: (id) => {
		const recipe = recipeById(id);
		if (!recipe) return;
		const patch = patchFromRecipe(recipe);
		engine.setPatch(patch);
		set({
			...meta(patch, id),
			status: `${recipe.name} · ${recipe.family}`,
			hint: recipe.description
		});
	},
	reset: () => {
		const patch = {
			...NEUTRAL,
			gains: NEUTRAL.gains.slice(),
			qs: NEUTRAL.qs.slice(),
			solos: NEUTRAL.solos.slice(),
			mutes: NEUTRAL.mutes.slice()
		};
		engine.setPatch(patch);
		set({
			patch,
			recipeId: null,
			edited: false,
			status: "Init. Filters open from the factory marks.",
			hint: "Pick a space recipe, or twist from here."
		});
	},
	setGain: (index, value) => {
		const gains = get().patch.gains.slice();
		gains[index] = value;
		get().commit({
			...get().patch,
			gains
		});
	},
	setQ: (index, value) => {
		const qs = get().patch.qs.slice();
		qs[index] = value;
		get().commit({
			...get().patch,
			qs
		});
	},
	toggleSolo: (index) => {
		const solos = get().patch.solos.slice();
		solos[index] = !solos[index];
		get().commit({
			...get().patch,
			solos
		});
	},
	toggleMute: (index) => {
		const mutes = get().patch.mutes.slice();
		mutes[index] = !mutes[index];
		get().commit({
			...get().patch,
			mutes
		});
	},
	toggleBypass: () => {
		const patch = {
			...get().patch,
			bypass: !get().patch.bypass
		};
		get().commit(patch);
		set({ status: patch.bypass ? "EQ bypass. Filters, space, and level stay in." : "EQ back in the chain." });
	},
	setPlaying: (playing) => set({ playing }),
	setRendering: (rendering) => set({ rendering }),
	setStatus: (status) => set({ status }),
	setHint: (hint) => set({ hint }),
	markHydrated: () => set({ hydrated: true })
}));
function loadSession() {
	try {
		const raw = localStorage.getItem(KEY);
		if (!raw) return null;
		const data = JSON.parse(raw);
		if (!isPatch(data.patch)) return null;
		const patch = {
			...NEUTRAL,
			...data.patch,
			gains: data.patch.gains.slice(),
			qs: data.patch.qs.slice(),
			solos: data.patch.solos.slice(),
			mutes: data.patch.mutes.slice(),
			input: data.patch.input ?? 50,
			limiter: data.patch.limiter ?? 0,
			tilt: data.patch.tilt ?? 50,
			smooth: data.patch.smooth ?? 0,
			depth: data.patch.depth ?? 50,
			spaceOn: data.patch.spaceOn !== false,
			harmOn: data.patch.harmOn !== false
		};
		const recipeId = typeof data.recipeId === "string" ? data.recipeId : null;
		return {
			patch,
			recipeId: recipeById(recipeId) ? recipeId : null
		};
	} catch {
		return null;
	}
}
function saveSession(patch, recipeId) {
	localStorage.setItem(KEY, JSON.stringify({
		patch,
		recipeId
	}));
}
var MIN_F = 20;
var MAX_F = 2e4;
function xOf(freq, width) {
	const t = Math.log(freq / MIN_F) / Math.log(MAX_F / MIN_F);
	return Math.min(width, Math.max(0, t * width));
}
function yOfDb(db, height) {
	return (1 - (Math.max(-18, Math.min(18, db)) + 18) / 36) * (height - 16) + 8;
}
function dbOfY(y, height) {
	const t = 1 - (y - 8) / (height - 16);
	return -18 + Math.max(0, Math.min(1, t)) * 36;
}
function token(name, fallback) {
	return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}
function Spectrum({ className, onPick }) {
	const canvasRef = (0, import_react.useRef)(null);
	const hits = (0, import_react.useRef)([]);
	const drag = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const inBins = /* @__PURE__ */ new Uint8Array(1024);
		const outBins = /* @__PURE__ */ new Uint8Array(1024);
		let frame = 0;
		const draw = () => {
			const rect = canvas.getBoundingClientRect();
			const dpr = Math.min(2, window.devicePixelRatio || 1);
			const width = Math.max(1, rect.width);
			const height = Math.max(1, rect.height);
			if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
				canvas.width = Math.floor(width * dpr);
				canvas.height = Math.floor(height * dpr);
			}
			const ctx = canvas.getContext("2d");
			if (!ctx) return;
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			const brass = token("--color-brass", "#d4b483");
			const ivory = token("--color-ivory", "#f3efe6");
			const muted = token("--color-muted", "#8d877c");
			const line = token("--color-line", "#2e2a24");
			const inset = token("--color-inset", "#0a0908");
			ctx.fillStyle = inset;
			ctx.fillRect(0, 0, width, height);
			ctx.strokeStyle = line;
			ctx.lineWidth = 1;
			for (const db of [
				-12,
				0,
				12
			]) {
				const y = yOfDb(db, height);
				ctx.beginPath();
				ctx.moveTo(0, y);
				ctx.lineTo(width, y);
				ctx.stroke();
			}
			const sr = engine.sampleRate();
			const nyquist = sr / 2;
			engine.readSpectrum("in", inBins);
			engine.readSpectrum("out", outBins);
			const pathFor = (bins) => {
				ctx.beginPath();
				for (let x = 0; x <= width; x += 2) {
					const freq = MIN_F * (MAX_F / MIN_F) ** (x / width);
					const bin = Math.round(freq / nyquist * (bins.length - 1));
					const mag = bins[Math.max(0, Math.min(bins.length - 1, bin))] / 255;
					const y = height - mag * (height - 10);
					if (x === 0) ctx.moveTo(x, y);
					else ctx.lineTo(x, y);
				}
			};
			pathFor(inBins);
			ctx.strokeStyle = muted;
			ctx.globalAlpha = .45;
			ctx.lineWidth = 1;
			ctx.stroke();
			pathFor(outBins);
			ctx.strokeStyle = brass;
			ctx.globalAlpha = .95;
			ctx.lineWidth = 1.5;
			ctx.stroke();
			ctx.lineTo(width, height);
			ctx.lineTo(0, height);
			ctx.closePath();
			ctx.fillStyle = brass;
			ctx.globalAlpha = .12;
			ctx.fill();
			ctx.globalAlpha = 1;
			const patch = useVst.getState().patch;
			ctx.beginPath();
			const steps = Math.max(48, Math.floor(width / 4));
			for (let i = 0; i <= steps; i++) {
				const x = i / steps * width;
				const freq = MIN_F * (MAX_F / MIN_F) ** (x / Math.max(1, width));
				const y = yOfDb(responseDb(patch, Math.min(freq, nyquist - 30), sr), height);
				if (i === 0) ctx.moveTo(x, y);
				else ctx.lineTo(x, y);
			}
			ctx.strokeStyle = ivory;
			ctx.lineWidth = 1.8;
			ctx.shadowColor = ivory;
			ctx.shadowBlur = 6;
			ctx.stroke();
			ctx.shadowBlur = 0;
			ctx.font = "11px IBM Plex Mono, ui-monospace, monospace";
			ctx.fillStyle = muted;
			const nextHits = [];
			BANDS.forEach((band, index) => {
				const x = xOf(band.hz, width);
				const y = yOfDb(storedBandDb(patch, index), height);
				nextHits.push({
					index,
					x,
					y
				});
				ctx.beginPath();
				ctx.arc(x, y, 5, 0, Math.PI * 2);
				const dim = patch.mutes[index] || patch.solos.some(Boolean) && !patch.solos[index];
				ctx.fillStyle = dim ? inset : brass;
				ctx.fill();
				ctx.lineWidth = 1.5;
				ctx.strokeStyle = ivory;
				ctx.stroke();
				ctx.fillStyle = muted;
				ctx.fillText(band.label, x - 8, height - 4);
			});
			hits.current = nextHits;
			frame = requestAnimationFrame(draw);
		};
		draw();
		return () => cancelAnimationFrame(frame);
	}, []);
	const pointer = (event) => {
		const rect = event.currentTarget.getBoundingClientRect();
		return {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top,
			h: rect.height
		};
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref: canvasRef,
		className: className ?? "h-44 w-full touch-none rounded-xl bg-inset lg:h-56",
		"aria-label": "Spectrum and EQ curve. Drag a node up for gain, sideways for Q.",
		onPointerDown: (event) => {
			const p = pointer(event);
			const hit = hits.current.find((node) => (node.x - p.x) ** 2 + (node.y - p.y) ** 2 < 784);
			if (!hit) return;
			onPick?.(hit.index);
			event.currentTarget.setPointerCapture(event.pointerId);
			const q = useVst.getState().patch.qs[hit.index];
			drag.current = {
				index: hit.index,
				q,
				x: event.clientX
			};
		},
		onPointerMove: (event) => {
			if (!drag.current) return;
			const p = pointer(event);
			const gain = clamp100(dbOfY(p.y, p.h) / .24 + 50);
			const q = clamp100(drag.current.q + (event.clientX - drag.current.x) * (event.shiftKey ? .08 : .22));
			const state = useVst.getState();
			const gains = state.patch.gains.slice();
			const qs = state.patch.qs.slice();
			gains[drag.current.index] = gain;
			qs[drag.current.index] = q;
			state.commit({
				...state.patch,
				gains,
				qs
			});
		},
		onPointerUp: () => {
			drag.current = null;
		},
		onPointerCancel: () => {
			drag.current = null;
		},
		onDoubleClick: (event) => {
			const p = pointer(event);
			const hit = hits.current.find((node) => (node.x - p.x) ** 2 + (node.y - p.y) ** 2 < 784);
			if (!hit) return;
			onPick?.(hit.index);
			const state = useVst.getState();
			const gains = state.patch.gains.slice();
			const qs = state.patch.qs.slice();
			gains[hit.index] = 50;
			qs[hit.index] = 7;
			state.commit({
				...state.patch,
				gains,
				qs
			});
		}
	});
}
function writeString(view, offset, text) {
	for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i));
}
function bufferToWav(buffer, bits) {
	const channels = buffer.numberOfChannels;
	const length = buffer.length;
	const block = channels * (bits / 8);
	const dataSize = length * block;
	const array = new ArrayBuffer(44 + dataSize);
	const view = new DataView(array);
	writeString(view, 0, "RIFF");
	view.setUint32(4, 36 + dataSize, true);
	writeString(view, 8, "WAVE");
	writeString(view, 12, "fmt ");
	view.setUint32(16, 16, true);
	view.setUint16(20, 1, true);
	view.setUint16(22, channels, true);
	view.setUint32(24, buffer.sampleRate, true);
	view.setUint32(28, buffer.sampleRate * block, true);
	view.setUint16(32, block, true);
	view.setUint16(34, bits, true);
	writeString(view, 36, "data");
	view.setUint32(40, dataSize, true);
	const data = Array.from({ length: channels }, (_, c) => buffer.getChannelData(c));
	let p = 44;
	for (let i = 0; i < length; i++) for (let c = 0; c < channels; c++) {
		const s = Math.max(-1, Math.min(1, data[c][i]));
		if (bits === 16) {
			view.setInt16(p, s < 0 ? s * 32768 : s * 32767, true);
			p += 2;
		} else {
			const v = s < 0 ? Math.round(s * 8388608) : Math.round(s * 8388607);
			view.setUint8(p, v & 255);
			view.setUint8(p + 1, v >> 8 & 255);
			view.setUint8(p + 2, v >> 16 & 255);
			p += 3;
		}
	}
	return new Blob([array], { type: "audio/wav" });
}
function downloadBlob(blob, filename) {
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	a.remove();
	setTimeout(() => URL.revokeObjectURL(url), 1500);
}
function clone(patch) {
	return {
		...patch,
		gains: patch.gains.slice(),
		qs: patch.qs.slice(),
		solos: patch.solos.slice(),
		mutes: patch.mutes.slice()
	};
}
function db(text) {
	return text === "-inf" ? "-inf" : `${text} dB`;
}
function hz(text) {
	return text.includes("k") ? text : `${text} Hz`;
}
function pct(value) {
	return `${value.toFixed(1)} %`;
}
function fit(canvas) {
	const rect = canvas.getBoundingClientRect();
	const dpr = Math.min(2, window.devicePixelRatio || 1);
	const w = Math.max(1, rect.width);
	const h = Math.max(1, rect.height);
	const pw = Math.floor(w * dpr);
	const ph = Math.floor(h * dpr);
	if (canvas.width !== pw || canvas.height !== ph) {
		canvas.width = pw;
		canvas.height = ph;
	}
	const ctx = canvas.getContext("2d");
	if (!ctx) return null;
	ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	return {
		ctx,
		w,
		h
	};
}
function paintVar(canvas, name, fallback) {
	return getComputedStyle(canvas).getPropertyValue(name).trim() || fallback;
}
function Orb({ live }) {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const canvas = ref.current;
		if (!canvas) return;
		const data = /* @__PURE__ */ new Float32Array(1024);
		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		let frame = 0;
		let t = .4;
		const draw = () => {
			if (!reduce) t += .016;
			const box = fit(canvas);
			if (!box) return;
			const { ctx, w, h } = box;
			ctx.clearRect(0, 0, w, h);
			engine.waveform("out", data);
			let energy = 0;
			for (let i = 0; i < data.length; i += 4) energy += data[i] * data[i];
			energy = Math.min(1, Math.sqrt(energy / (data.length / 4)) * 5);
			const sig = paintVar(canvas, "--sig", "#7ad0ff");
			const sig2 = paintVar(canvas, "--sig-2", "#b388ff");
			const n = 140;
			const pts = [];
			for (let i = 0; i < n; i++) {
				const x = i / 139;
				const env = Math.sin(Math.PI * x);
				const idle = Math.sin(x * Math.PI * 2.2 + t * .8) * .22 + Math.sin(x * 54 + t * 3.1) * .2 * env + Math.exp(-((x - .38) ** 2) / .004) * .55 + Math.exp(-((x - .62) ** 2) / .006) * .28;
				const sample = data[Math.floor(x * (data.length - 1))] ?? 0;
				const amp = idle * (1 - energy) + sample * 1.15 * energy;
				pts.push([x * w, (.52 - amp * .34) * h]);
			}
			const grad = ctx.createLinearGradient(0, 0, w, 0);
			grad.addColorStop(0, sig);
			grad.addColorStop(.45, "#f4f8ff");
			grad.addColorStop(1, sig2);
			ctx.beginPath();
			pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
			ctx.strokeStyle = grad;
			ctx.lineWidth = 2.4;
			ctx.lineJoin = "round";
			ctx.shadowColor = sig;
			ctx.shadowBlur = live ? 18 : 12;
			ctx.stroke();
			ctx.lineWidth = 1.2;
			ctx.shadowBlur = 0;
			ctx.globalAlpha = .9;
			ctx.stroke();
			ctx.globalAlpha = 1;
			ctx.fillStyle = "#f7fbff";
			for (let i = 0; i < 6; i++) {
				const x = .12 + i * .15;
				const env = Math.sin(Math.PI * x);
				const y = .52 - (Math.sin(x * Math.PI * 2.2 + t * .8) * .22 + Math.sin(x * 8) * .05) * env;
				ctx.beginPath();
				ctx.arc(x * w, y * h, 3.1, 0, Math.PI * 2);
				ctx.fill();
			}
			frame = requestAnimationFrame(draw);
		};
		draw();
		return () => cancelAnimationFrame(frame);
	}, [live]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		className: "orb-canvas",
		"aria-hidden": "true"
	});
}
function Flow() {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const canvas = ref.current;
		if (!canvas) return;
		const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
		let frame = 0;
		let t = 0;
		const draw = () => {
			if (!reduce) t += .012;
			const box = fit(canvas);
			if (!box) return;
			const { ctx, w, h } = box;
			const patch = useVst.getState().patch;
			const sig = paintVar(canvas, "--sig", "#7ad0ff");
			ctx.clearRect(0, 0, w, h);
			const amp = .16 + patch.reverb / 100 * .2 + patch.delay / 100 * .1;
			const speed = .6 + patch.hpf / 180;
			for (let line = 0; line < 7; line++) {
				ctx.beginPath();
				ctx.strokeStyle = line === 3 ? "#f4f8ff" : sig;
				ctx.globalAlpha = line === 3 ? .95 : .28 + line * .06;
				ctx.lineWidth = line === 3 ? 1.7 : 1;
				for (let x = 0; x <= w; x += 3) {
					const u = x / w;
					const y = h * .52 + Math.sin(u * Math.PI * (2.2 + patch.lpf / 90) + t * speed + line * .4) * h * amp + Math.sin(u * 8 + line) * h * .025;
					if (x === 0) ctx.moveTo(x, y);
					else ctx.lineTo(x, y);
				}
				ctx.stroke();
			}
			ctx.globalAlpha = 1;
			frame = requestAnimationFrame(draw);
		};
		draw();
		return () => cancelAnimationFrame(frame);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		"aria-hidden": "true"
	});
}
function Bars() {
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		const canvas = ref.current;
		if (!canvas) return;
		const bins = /* @__PURE__ */ new Uint8Array(1024);
		let frame = 0;
		const draw = () => {
			const box = fit(canvas);
			if (!box) return;
			const { ctx, w, h } = box;
			const sig = paintVar(canvas, "--sig", "#7ad0ff");
			const sig2 = paintVar(canvas, "--sig-2", "#b388ff");
			ctx.clearRect(0, 0, w, h);
			engine.readSpectrum("out", bins);
			const count = 28;
			const gap = 2;
			const bw = (w - 54) / count;
			const shape = [
				.35,
				.55,
				.42,
				.7,
				.48,
				.86,
				.6,
				.74,
				.4,
				.9,
				.52,
				.66,
				.38,
				.8,
				.58,
				.44,
				.72,
				.5,
				.84,
				.46,
				.63,
				.4,
				.77,
				.55,
				.36,
				.68,
				.5,
				.42
			];
			for (let i = 0; i < count; i++) {
				const start = Math.floor(i / count * 220);
				const end = Math.floor((i + 1) / count * 220);
				let peak = 0;
				for (let b = start; b < end; b++) if (bins[b] > peak) peak = bins[b];
				const liveMag = peak / 255;
				const mag = liveMag > .04 ? liveMag : shape[i];
				const bh = Math.max(3, mag * (h - 8));
				const grad = ctx.createLinearGradient(0, h, 0, h - bh);
				grad.addColorStop(0, sig2);
				grad.addColorStop(.7, sig);
				grad.addColorStop(1, "#f4f8ff");
				ctx.fillStyle = grad;
				ctx.globalAlpha = .55 + mag * .45;
				ctx.fillRect(i * (bw + gap), h - bh, Math.max(1, bw), bh);
			}
			ctx.globalAlpha = 1;
			frame = requestAnimationFrame(draw);
		};
		draw();
		return () => cancelAnimationFrame(frame);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
		ref,
		"aria-hidden": "true"
	});
}
function setNum(key, value) {
	const state = useVst.getState();
	state.commit({
		...state.patch,
		[key]: value
	});
}
function Steel({ label, value, display, size = "md", tone = "steel", reset = 50, dim = false, inline = false, onChange }) {
	const drag = (0, import_react.useRef)(null);
	const angle = -135 + value / 100 * 270;
	const style = { "--p": `${value / 100 * 75}%` };
	const move = (event) => {
		if (!drag.current) return;
		const scale = event.shiftKey ? .12 : .38;
		onChange(clamp100(drag.current.v + (drag.current.y - event.clientY) * scale));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `steel steel-${size} ${inline ? "steel-inline" : ""}`,
		"data-tone": tone,
		"data-dim": dim ? "1" : "0",
		style,
		children: [
			inline ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "steel-label",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "steel-face",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "steel-ring" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "steel-cap",
					role: "slider",
					"aria-label": label,
					"aria-valuemin": 0,
					"aria-valuemax": 100,
					"aria-valuenow": Math.round(value),
					"aria-valuetext": display,
					onPointerDown: (event) => {
						event.currentTarget.setPointerCapture(event.pointerId);
						drag.current = {
							y: event.clientY,
							v: value
						};
					},
					onPointerMove: move,
					onPointerUp: () => {
						drag.current = null;
					},
					onPointerCancel: () => {
						drag.current = null;
					},
					onDoubleClick: () => onChange(reset),
					onKeyDown: (event) => {
						const step = event.shiftKey ? 1 : 2;
						if (event.key === "ArrowUp" || event.key === "ArrowRight") {
							event.preventDefault();
							onChange(clamp100(value + step));
						} else if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
							event.preventDefault();
							onChange(clamp100(value - step));
						}
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "steel-sheen" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "steel-rotor",
						style: { transform: `rotate(${angle}deg)` },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "steel-needle" })
					})]
				})]
			}),
			inline ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mini-copy",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mini-label",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "steel-read",
					children: display
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "steel-read",
				children: display
			})
		]
	});
}
function Vfader({ label, value, display, reset = 50, onChange }) {
	const track = (0, import_react.useRef)(null);
	const fromY = (clientY) => {
		const rect = track.current?.getBoundingClientRect();
		if (!rect) return value;
		return clamp100((1 - (clientY - rect.top) / rect.height) * 100);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "vf",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: label }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref: track,
				className: "vf-track",
				role: "slider",
				tabIndex: 0,
				"aria-label": label,
				"aria-valuemin": 0,
				"aria-valuemax": 100,
				"aria-valuenow": Math.round(value),
				"aria-valuetext": display,
				onPointerDown: (event) => {
					event.currentTarget.setPointerCapture(event.pointerId);
					onChange(fromY(event.clientY));
				},
				onPointerMove: (event) => {
					if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
					onChange(fromY(event.clientY));
				},
				onDoubleClick: () => onChange(reset),
				onKeyDown: (event) => {
					const step = event.shiftKey ? 1 : 2;
					if (event.key === "ArrowUp") {
						event.preventDefault();
						onChange(clamp100(value + step));
					} else if (event.key === "ArrowDown") {
						event.preventDefault();
						onChange(clamp100(value - step));
					}
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { style: { top: `${100 - value}%` } })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: display })
		]
	});
}
function Rail({ side, label, value, display, onChange }) {
	const track = (0, import_react.useRef)(null);
	const level = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		let frame = 0;
		const tick = () => {
			const { rms } = engine.level(side);
			if (level.current) level.current.style.height = `${Math.max(0, Math.min(100, rms * 100))}%`;
			frame = requestAnimationFrame(tick);
		};
		frame = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(frame);
	}, [side]);
	const fromY = (clientY) => {
		const rect = track.current?.getBoundingClientRect();
		if (!rect) return value;
		return clamp100((1 - (clientY - rect.top) / rect.height) * 100);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `rail rail-${side}`,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "rail-label",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "rail-read",
				children: display
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: track,
				className: "rail-track",
				role: "slider",
				tabIndex: 0,
				"aria-label": label,
				"aria-valuemin": 0,
				"aria-valuemax": 100,
				"aria-valuenow": Math.round(value),
				"aria-valuetext": display,
				onPointerDown: (event) => {
					event.currentTarget.setPointerCapture(event.pointerId);
					onChange(fromY(event.clientY));
				},
				onPointerMove: (event) => {
					if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
					onChange(fromY(event.clientY));
				},
				onDoubleClick: () => onChange(50),
				onKeyDown: (event) => {
					const step = event.shiftKey ? 1 : 2;
					if (event.key === "ArrowUp") {
						event.preventDefault();
						onChange(clamp100(value + step));
					} else if (event.key === "ArrowDown") {
						event.preventDefault();
						onChange(clamp100(value - step));
					}
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "rail-leds" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						ref: level,
						className: "rail-level"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rail-cap",
						style: { top: `${100 - value}%` }
					})
				]
			})
		]
	});
}
function Face() {
	const fileRef = (0, import_react.useRef)(null);
	const popRef = (0, import_react.useRef)(null);
	const past = (0, import_react.useRef)([]);
	const future = (0, import_react.useRef)([]);
	const lock = (0, import_react.useRef)(false);
	const gesture = (0, import_react.useRef)(false);
	const timer = (0, import_react.useRef)(0);
	const historyApi = (0, import_react.useRef)({
		undo: () => {},
		redo: () => {}
	});
	const [face, setFace] = (0, import_react.useState)("dark");
	const [over, setOver] = (0, import_react.useState)(false);
	const [menu, setMenu] = (0, import_react.useState)(false);
	const [band, setBand] = (0, import_react.useState)(3);
	const [canUndo, setCanUndo] = (0, import_react.useState)(false);
	const [canRedo, setCanRedo] = (0, import_react.useState)(false);
	const patch = useVst((s) => s.patch);
	const recipeId = useVst((s) => s.recipeId);
	const edited = useVst((s) => s.edited);
	const status = useVst((s) => s.status);
	const playing = useVst((s) => s.playing);
	const rendering = useVst((s) => s.rendering);
	(0, import_react.useEffect)(() => {
		const next = localStorage.getItem("hrw-face") === "light" ? "light" : "dark";
		document.documentElement.dataset.face = next;
		setFace(next);
	}, []);
	(0, import_react.useEffect)(() => {
		return useVst.subscribe((state, prev) => {
			if (state.patch === prev.patch || lock.current) return;
			if (!gesture.current) {
				past.current.push(prev.patch);
				if (past.current.length > 60) past.current.shift();
				future.current = [];
				gesture.current = true;
				setCanUndo(true);
				setCanRedo(false);
			}
			window.clearTimeout(timer.current);
			timer.current = window.setTimeout(() => {
				gesture.current = false;
			}, 480);
		});
	}, []);
	(0, import_react.useEffect)(() => {
		const saved = loadSession();
		if (saved) {
			useVst.getState().commit(saved.patch, saved.recipeId);
			useVst.getState().setStatus(saved.recipeId ? "Session restored." : "Manual session restored.");
		}
		useVst.getState().markHydrated();
	}, []);
	(0, import_react.useEffect)(() => {
		if (!useVst.getState().hydrated) return;
		const id = window.setTimeout(() => saveSession(patch, recipeId), 280);
		return () => window.clearTimeout(id);
	}, [patch, recipeId]);
	(0, import_react.useEffect)(() => {
		if (!menu) return;
		const close = () => setMenu(false);
		window.addEventListener("click", close);
		return () => window.removeEventListener("click", close);
	}, [menu]);
	function undo() {
		window.clearTimeout(timer.current);
		gesture.current = false;
		const prev = past.current.pop();
		if (!prev || !isPatch(prev)) {
			setCanUndo(past.current.length > 0);
			return;
		}
		lock.current = true;
		future.current.push(useVst.getState().patch);
		useVst.getState().commit(clone(prev));
		lock.current = false;
		setCanUndo(past.current.length > 0);
		setCanRedo(true);
	}
	function redo() {
		window.clearTimeout(timer.current);
		gesture.current = false;
		const next = future.current.pop();
		if (!next || !isPatch(next)) {
			setCanRedo(future.current.length > 0);
			return;
		}
		lock.current = true;
		past.current.push(useVst.getState().patch);
		useVst.getState().commit(clone(next));
		lock.current = false;
		setCanUndo(true);
		setCanRedo(future.current.length > 0);
	}
	historyApi.current.undo = undo;
	historyApi.current.redo = redo;
	(0, import_react.useEffect)(() => {
		const onKey = (event) => {
			if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "z") return;
			const tag = event.target?.tagName;
			if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
			event.preventDefault();
			if (event.shiftKey) historyApi.current.redo();
			else historyApi.current.undo();
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	function toggleFace() {
		const next = face === "dark" ? "light" : "dark";
		setFace(next);
		document.documentElement.dataset.face = next;
		localStorage.setItem("hrw-face", next);
	}
	function stepRecipe(dir) {
		const current = useVst.getState().recipeId;
		const index = RECIPES.findIndex((item) => item.id === current);
		const next = index < 0 ? dir > 0 ? 0 : RECIPES.length - 1 : (index + dir + RECIPES.length) % RECIPES.length;
		useVst.getState().applyRecipe(RECIPES[next].id);
	}
	function setPresence(value) {
		const state = useVst.getState();
		const gains = state.patch.gains.slice();
		gains[4] = value;
		gains[5] = value;
		state.commit({
			...state.patch,
			gains
		});
	}
	async function engage() {
		const state = useVst.getState();
		try {
			if (state.playing) {
				engine.pause();
				state.setPlaying(false);
				state.setStatus("Paused.");
				return;
			}
			await engine.play();
			useVst.getState().setPlaying(true);
			useVst.getState().setStatus(engine.origin === "file" ? "Processing the loaded file." : "Processing the demo bed.");
		} catch {
			useVst.getState().setStatus("Audio could not start. Try the N button again.");
		}
	}
	async function onFile(file) {
		useVst.getState().setStatus("Reading audio.");
		try {
			const info = await engine.loadFile(file);
			const rate = (info.rate / 1e3).toFixed(1);
			useVst.getState().setStatus(`${file.name} · ${info.duration.toFixed(1)} s · ${rate} kHz`);
			if (useVst.getState().playing) useVst.getState().setPlaying(true);
		} catch {
			useVst.getState().setStatus("That file did not decode.");
		}
	}
	async function exportWav(bits) {
		const state = useVst.getState();
		if (state.rendering) return;
		state.setRendering(true);
		state.setStatus(bits === 24 ? "Rendering 24-bit master." : "Rendering 16-bit master.");
		setMenu(false);
		try {
			const rendered = await engine.render();
			const name = `harmonic-${slug(recipeById(useVst.getState().recipeId)?.name ?? "init")}${bits === 24 ? "-24bit" : ""}.wav`;
			downloadBlob(bufferToWav(rendered, bits), name);
			useVst.getState().setStatus(engine.origin === "file" ? `Exported ${name}.` : `Exported the demo bed as ${name}.`);
			if (useVst.getState().playing) useVst.getState().setPlaying(true);
		} catch {
			useVst.getState().setStatus("Render failed.");
		} finally {
			useVst.getState().setRendering(false);
		}
	}
	const presence = Math.round(((patch.gains[4] ?? 50) + (patch.gains[5] ?? 50)) / 2);
	const lpfText = formatLpf(patch.lpf);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "stage",
		onDragOver: (event) => {
			event.preventDefault();
			setOver(true);
		},
		onDragLeave: () => setOver(false),
		onDrop: (event) => {
			event.preventDefault();
			setOver(false);
			const file = event.dataTransfer.files?.[0];
			if (file) onFile(file);
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "warp",
			"data-over": over ? "1" : "0",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "warp-bar",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "warp-id",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "warp-brand",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "NoDAW" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("small", { children: "Labs" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "hair" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
									className: "warp-title",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Harmonic" }), " RealityWarp"]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "preset-nav",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "step-btn",
									"aria-label": "Previous recipe",
									onClick: () => stepRecipe(-1),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
										size: 18,
										"aria-hidden": "true"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "preset-pill",
									"data-edited": edited ? "1" : "0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
										"aria-label": "Space recipe",
										value: recipeId ?? "",
										onChange: (event) => {
											const id = event.target.value;
											if (!id) useVst.getState().reset();
											else useVst.getState().applyRecipe(id);
										},
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "",
											children: "Init"
										}), FAMILIES.map((family) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("optgroup", {
											label: family,
											children: RECIPES.filter((item) => item.family === family).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
												value: item.id,
												children: item.name
											}, item.id))
										}, family))]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, {
										className: "preset-caret",
										size: 14,
										"aria-hidden": "true"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "step-btn",
									"aria-label": "Next recipe",
									onClick: () => stepRecipe(1),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
										size: 18,
										"aria-hidden": "true"
									})
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "bar-tools",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "hair" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "tool-pop",
									ref: popRef,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "icon-btn",
										"aria-label": "Export WAV",
										"aria-expanded": menu,
										onClick: (event) => {
											event.stopPropagation();
											setMenu((open) => !open);
										},
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, {
											size: 16,
											"aria-hidden": "true"
										})
									}), menu ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "export-pop",
										onClick: (event) => event.stopPropagation(),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											disabled: rendering,
											onClick: () => void exportWav(16),
											children: "16-bit WAV"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											disabled: rendering,
											onClick: () => void exportWav(24),
											children: "24-bit WAV"
										})]
									}) : null]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "icon-btn",
									"aria-label": "Load audio",
									onClick: () => fileRef.current?.click(),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderOpen, {
										size: 16,
										"aria-hidden": "true"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "icon-btn",
									"aria-label": "Undo",
									disabled: !canUndo,
									onClick: undo,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, {
										size: 16,
										"aria-hidden": "true"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "icon-btn",
									"aria-label": "Redo",
									disabled: !canRedo,
									onClick: redo,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Redo2, {
										size: 16,
										"aria-hidden": "true"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "hair" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									className: "light-toggle",
									"aria-pressed": face === "light",
									onClick: toggleFace,
									children: ["Light", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "toggle-track",
										"aria-hidden": "true",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "toggle-knob" })
									})]
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "live",
					"aria-live": "polite",
					children: status
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "hero",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rail-in",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rail, {
								side: "in",
								label: "Input",
								value: patch.input,
								display: db(formatTrim(patch.input)),
								onChange: (value) => setNum("input", value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "well well-l",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Steel, {
								label: "Drive",
								size: "lg",
								tone: "cyan",
								value: patch.amp,
								display: db(formatAmp(patch.amp)),
								reset: 31,
								onChange: (value) => setNum("amp", value)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pair",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Steel, {
									label: "Character",
									value: patch.flanger,
									display: pct(patch.flanger),
									reset: 0,
									dim: !patch.harmOn,
									onChange: (value) => setNum("flanger", value)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Steel, {
									label: "Presence",
									value: presence,
									display: pct(presence),
									onChange: setPresence
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "orb-wrap",
							"data-on": playing ? "1" : "0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "orb",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Orb, { live: playing }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "orb-glass" })]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "n-badge",
								"data-engage": true,
								"data-on": playing ? "1" : "0",
								"aria-pressed": playing,
								onClick: () => void engage(),
								children: "N"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "well well-r",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Steel, {
								label: "Warp",
								size: "lg",
								tone: "violet",
								value: patch.reverb,
								display: pct(patch.reverb / 150 * 100),
								reset: 0,
								dim: !patch.spaceOn,
								onChange: (value) => setNum("reverb", value)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pair",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Steel, {
									label: "Mix",
									value: patch.delay,
									display: pct(patch.delay),
									reset: 0,
									dim: !patch.spaceOn,
									onChange: (value) => setNum("delay", value)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Steel, {
									label: "Limiter",
									value: patch.limiter,
									display: db(formatLimiter(patch.limiter)),
									reset: 0,
									onChange: (value) => setNum("limiter", value)
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rail-out",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rail, {
								side: "out",
								label: "Output",
								value: patch.output,
								display: db(formatOut(patch.output)),
								onChange: (value) => setNum("output", value)
							})
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bays",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "bay",
							"data-on": patch.bypass ? "0" : "1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bay-head",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "power",
									"data-on": patch.bypass ? "0" : "1",
									"aria-pressed": !patch.bypass,
									"aria-label": "Spectral shaping power",
									onClick: () => useVst.getState().toggleBypass(),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Power, {
										size: 15,
										"aria-hidden": "true"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "bay-label",
									children: "Spectral Shaping"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bay-body spec",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "screen",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Spectrum, {
											className: "h-full w-full touch-none",
											onPick: setBand
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "v-faders",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Vfader, {
												label: "Tilt",
												value: patch.tilt,
												display: db(formatTilt(patch.tilt)),
												onChange: (value) => setNum("tilt", value)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Vfader, {
												label: "Smooth",
												value: patch.smooth,
												display: pct(patch.smooth),
												reset: 0,
												onChange: (value) => setNum("smooth", value)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Vfader, {
												label: "Depth",
												value: patch.depth,
												display: pct(patch.depth),
												onChange: (value) => setNum("depth", value)
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "band-row",
										children: BANDS.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "band-pick",
											"data-on": index === band ? "1" : "0",
											"data-solo": patch.solos[index] ? "1" : "0",
											"data-mute": patch.mutes[index] ? "1" : "0",
											"aria-pressed": index === band,
											onClick: () => setBand(index),
											children: item.label
										}, item.hz))
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "bay",
							"data-on": patch.spaceOn ? "1" : "0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bay-head",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "power",
									"data-on": patch.spaceOn ? "1" : "0",
									"aria-pressed": patch.spaceOn,
									"aria-label": "Temporal flow power",
									onClick: () => {
										const state = useVst.getState();
										const spaceOn = !state.patch.spaceOn;
										state.commit({
											...state.patch,
											spaceOn
										});
										state.setStatus(spaceOn ? "Temporal flow is in. Delay and hall return." : "Temporal flow bypassed. Delay and hall are muted.");
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Power, {
										size: 15,
										"aria-hidden": "true"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "bay-label",
									children: "Temporal Flow"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bay-body stack",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "screen",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flow, {})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "bay-knobs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Steel, {
											inline: true,
											size: "sm",
											label: "HPF",
											value: patch.hpf,
											display: hz(formatHpf(patch.hpf)),
											reset: 0,
											onChange: (value) => setNum("hpf", value)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Steel, {
											inline: true,
											size: "sm",
											label: "LPF",
											value: patch.lpf,
											display: hz(lpfText),
											reset: 100,
											onChange: (value) => setNum("lpf", value)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Steel, {
											inline: true,
											size: "sm",
											label: "Sub",
											value: patch.sub,
											display: db(formatSub(patch.sub)),
											reset: 0,
											dim: !patch.harmOn,
											onChange: (value) => setNum("sub", value)
										})
									]
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
							className: "bay",
							"data-on": patch.harmOn ? "1" : "0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bay-head",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "power",
									"data-on": patch.harmOn ? "1" : "0",
									"aria-pressed": patch.harmOn,
									"aria-label": "Harmonic engine power",
									onClick: () => {
										const state = useVst.getState();
										const harmOn = !state.patch.harmOn;
										state.commit({
											...state.patch,
											harmOn
										});
										state.setStatus(harmOn ? "Harmonic engine is in. Sub and character return." : "Harmonic engine bypassed. Sub and character are muted.");
									},
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Power, {
										size: 15,
										"aria-hidden": "true"
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "bay-label",
									children: "Harmonic Engine"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "bay-body",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "screen",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bars, {})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mini-stack",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Steel, {
											inline: true,
											size: "sm",
											label: "Band",
											value: Math.round(band / 6 * 100),
											display: BANDS[band].label,
											onChange: (value) => setBand(Math.max(0, Math.min(6, Math.round(value / 100 * 6))))
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Steel, {
											inline: true,
											size: "sm",
											label: "Gain",
											value: patch.gains[band] ?? 50,
											display: db(formatGain(patch.gains[band] ?? 50)),
											onChange: (value) => useVst.getState().setGain(band, value)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Steel, {
											inline: true,
											size: "sm",
											label: "Q",
											value: patch.qs[band] ?? 50,
											display: formatQ(patch.qs[band] ?? 50),
											reset: 7,
											onChange: (value) => useVst.getState().setQ(band, value)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flag-row",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "flag",
												"data-on": patch.solos[band] ? "1" : "0",
												"aria-pressed": patch.solos[band],
												onClick: () => useVst.getState().toggleSolo(band),
												children: "Solo"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "flag",
												"data-on": patch.mutes[band] ? "1" : "0",
												"aria-pressed": patch.mutes[band],
												onClick: () => useVst.getState().toggleMute(band),
												children: "Mute"
											})]
										})
									]
								})]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
					className: "warp-foot",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "foot-note",
							children: "NoDAW Labs · Advanced Audio Processing"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "foot-mid",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
								className: "pulse",
								viewBox: "0 0 64 16",
								"aria-hidden": "true",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
									d: "M0 8 H16 L22 8 L26 3 L32 13 L38 8 H46 L50 6 L54 8 H64",
									fill: "none",
									stroke: "currentColor",
									strokeWidth: "1.4"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mark",
								children: "Sound without limits"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "ver",
							children: ["v2.0.0 ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("i", {
								className: "led",
								"data-on": playing ? "1" : "0"
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					ref: fileRef,
					type: "file",
					accept: "audio/*,video/mp4,video/quicktime,video/webm,.wav,.mp3,.m4a,.aac,.flac,.aif,.aiff,.ogg,.opus,.caf",
					hidden: true,
					onChange: (event) => {
						const file = event.target.files?.[0];
						if (file) onFile(file);
						event.target.value = "";
					}
				})
			]
		})
	});
}
function Suite() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Face, {});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Suite, {});
}
//#endregion
export { Home as component };
