// Синтез саундтрека 10 с под ролик «Медицинская реабилитация». 48 кГц, стерео, 24-bit WAV.
// usage: node music.mjs <out.wav>
import { writeFileSync } from 'node:fs';

const SR = 48000, DUR = 10, N = SR * DUR;
const OUT = process.argv[2] || 'soundtrack.wav';
const TAU = Math.PI * 2;
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const idx = t => Math.round(t * SR);
function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rnd = mulberry32(2024);
const noise = () => rnd() * 2 - 1;
const pan = p => [Math.cos((p + 1) * Math.PI / 4), Math.sin((p + 1) * Math.PI / 4)];
const db = x => 20 * Math.log10(Math.max(x, 1e-12));

// ---------- привязка к видео ----------
const BEAT = 0.5;                       // 120 BPM
const T_IN = 2.9;                       // первая доля бита
const T_HIT = 8.9;                      // кольцо замкнулось — кульминация
const ecgT = x => 0.15 + (x + 150) / (1920 + 1450) * 3.05;   // когда голова ЭКГ проходит x
const ECG_BELLS = [[140, 71], [560, 76], [980, 78], [1400, 80], [1820, 83]]
  .map(([x, m]) => ({ t: ecgT(x), m, p: (x / 1920 * 2 - 1) * .8 }));
const T_SPIKE = ecgT(560);

const CHORDS = [
  { t0: 0.0, t1: 2.9, pad: [52, 59, 66, 71] },                                   // E add9 без терции — «воздух»
  { t0: 2.9, t1: 4.9, pad: [52, 59, 64, 66, 68], bass: 40, arp: [64, 68, 71, 76] }, // E add9
  { t0: 4.9, t1: 6.9, pad: [49, 56, 59, 64, 68], bass: 37, arp: [61, 64, 68, 73] }, // C#m7
  { t0: 6.9, t1: 7.9, pad: [57, 61, 64, 68, 71], bass: 33, arp: [64, 69, 73, 76] }, // Amaj9
  { t0: 7.9, t1: 8.4, pad: [59, 64, 66, 71], bass: 35, arp: [64, 66, 71, 76] },     // Bsus4
  { t0: 8.4, t1: 8.9, pad: [59, 63, 66, 71], bass: 35, arp: [63, 66, 71, 75] },     // B
  { t0: 8.9, t1: 10.0, pad: [52, 59, 63, 66, 68, 71], bass: 40 },                   // Emaj9 — финал
];

// ---------- DSP ----------
class Biquad {
  constructor() { this.x1 = this.x2 = this.y1 = this.y2 = 0; }
  set(type, f, q) {
    const w = TAU * Math.min(f, SR * .45) / SR, c = Math.cos(w), s = Math.sin(w), a = s / (2 * q);
    let b0, b1, b2;
    if (type === 'lp') { b0 = (1 - c) / 2; b1 = 1 - c; b2 = b0; }
    else if (type === 'hp') { b0 = (1 + c) / 2; b1 = -(1 + c); b2 = b0; }
    else { b0 = a; b1 = 0; b2 = -a; }
    const a0 = 1 + a;
    this.b0 = b0 / a0; this.b1 = b1 / a0; this.b2 = b2 / a0; this.a1 = -2 * c / a0; this.a2 = (1 - a) / a0;
    return this;
  }
  run(x) {
    const y = this.b0 * x + this.b1 * this.x1 + this.b2 * this.x2 - this.a1 * this.y1 - this.a2 * this.y2;
    this.x2 = this.x1; this.x1 = x; this.y2 = this.y1; this.y1 = y; return y;
  }
}
function polyblep(t, dt) {
  if (t < dt) { t /= dt; return t + t - t * t - 1; }
  if (t > 1 - dt) { t = (t - 1) / dt; return t * t + t + t + 1; }
  return 0;
}

// ---------- стемы ----------
const STEMS = {};
const stem = (name, rev, dly) => (STEMS[name] = { L: new Float32Array(N), R: new Float32Array(N), rev, dly });
const S = {
  pad: stem('pad', .35, 0), bass: stem('bass', 0, 0), kick: stem('kick', .03, 0),
  perc: stem('perc', .22, .1), arp: stem('arp', .3, .45), bells: stem('bells', .5, .35), fx: stem('fx', .3, 0),
};
const DUCK = new Float32Array(N).fill(1);
const put = (st, i, l, r) => { if (i >= 0 && i < N) { st.L[i] += l; st.R[i] += r; } };

// ---------- инструменты ----------
function padCutoff(t) {
  if (t < T_IN) return 220 * Math.pow(3000 / 220, Math.pow(t / T_IN, 1.4));   // 220 → 3000 Гц, раскрытие во вступлении
  if (t < T_HIT) return 3000 + 400 * Math.sin((t - T_IN) * 1.6);
  return 4200;
}
function padNote(st, m, t0, t1, amp, att, rel) {
  const f = mtof(m), i0 = idx(t0), i1 = Math.min(N, idx(t1 + rel));
  const vs = [-9, 0, 9].map((c, k) => ({ f: f * Math.pow(2, c / 1200), ph: rnd(), g: pan([-.75, 0, .75][k]) }));
  const fl = [new Biquad(), new Biquad()], fr = [new Biquad(), new Biquad()];
  for (let i = i0; i < i1; i++) {
    const t = i / SR;
    if (((i - i0) & 31) === 0) { const fc = padCutoff(t); for (const b of [...fl, ...fr]) b.set('lp', fc, .6); }
    const env = smooth((t - t0) / att) * (t > t1 ? smooth(1 - (t - t1) / rel) : 1);
    let l = 0, r = 0;
    for (const v of vs) {
      const dt = v.f / SR; v.ph += dt; if (v.ph >= 1) v.ph -= 1;
      const s = 2 * v.ph - 1 - polyblep(v.ph, dt);
      l += s * v.g[0]; r += s * v.g[1];
    }
    put(st, i, fl[1].run(fl[0].run(l)) * env * amp, fr[1].run(fr[0].run(r)) * env * amp);
  }
}
function bassNote(st, m, t0, t1, amp) {
  const f = mtof(m), i0 = idx(t0), i1 = Math.min(N, idx(t1 + .15));
  let ph = 0;
  for (let i = i0; i < i1; i++) {
    const t = i / SR, env = clamp((t - t0) / .012) * (t > t1 ? clamp(1 - (t - t1) / .15) : 1);
    ph += f / SR;
    const s = Math.tanh(1.4 * (Math.sin(TAU * ph) + .28 * Math.sin(2 * TAU * ph) + .08 * Math.sin(3 * TAU * ph)));
    put(st, i, s * env * amp, s * env * amp);
  }
}
// FM: e-piano (ratio 1) и колокольчики (ratio 3.5)
function fm(st, t0, m, amp, p, o = {}) {
  const { ratio = 1, index = 1.5, idxDecay = .2, decay = .8, tine = 0, len = decay * 5 } = o;
  const f = mtof(m), i0 = idx(t0), i1 = Math.min(N, i0 + Math.round(len * SR)), [gl, gr] = pan(p);
  for (let i = Math.max(0, i0); i < i1; i++) {
    const tt = (i - i0) / SR;
    const env = clamp(tt / .002) * Math.exp(-tt / decay);
    let s = Math.sin(TAU * f * tt + index * Math.exp(-tt / idxDecay) * Math.sin(TAU * f * ratio * tt));
    if (tine) s += tine * Math.sin(TAU * f * 4 * tt) * Math.exp(-tt / .02);
    put(st, i, s * env * amp * gl, s * env * amp * gr);
  }
}
function kick(st, t0, amp, duck = .5) {
  const i0 = idx(t0); let ph = 0;
  for (let i = i0; i < Math.min(N, i0 + .5 * SR); i++) {
    const tt = (i - i0) / SR;
    ph += (46 + 110 * Math.exp(-tt / .03)) / SR;
    const s = Math.sin(TAU * ph) * clamp(tt / .0015) * Math.exp(-tt / .17) + noise() * Math.exp(-tt / .002) * .25;
    put(st, i, s * amp, s * amp);
    DUCK[i] = Math.min(DUCK[i], 1 - duck * Math.exp(-tt / .1) * clamp(tt / .005));
  }
}
function heartbeat(st, t0, amp) {
  const i0 = idx(t0), lp = new Biquad().set('lp', 180, .7); let ph = 0;
  for (let i = i0; i < Math.min(N, i0 + .4 * SR); i++) {
    const tt = (i - i0) / SR;
    ph += (40 + 45 * Math.exp(-tt / .05)) / SR;
    const s = lp.run(Math.sin(TAU * ph) * clamp(tt / .006) * Math.exp(-tt / .12));
    put(st, i, s * amp, s * amp);
  }
}
function snap(st, t0, amp, p = 0, fc = 1800) {
  const i0 = idx(t0), bp = new Biquad().set('bp', fc, 1.1), [gl, gr] = pan(p);
  for (let i = i0; i < Math.min(N, i0 + .35 * SR); i++) {
    const tt = (i - i0) / SR;
    const env = Math.exp(-tt / .004) + (tt > .01 ? .6 * Math.exp(-(tt - .01) / .004) : 0) + (tt > .02 ? .9 * Math.exp(-(tt - .02) / .07) : 0);
    const s = bp.run(noise()) * env * amp;
    put(st, i, s * gl, s * gr);
  }
}
function hat(st, t0, amp, p = 0) {
  const i0 = idx(t0), hp = new Biquad().set('hp', 7000, .7), [gl, gr] = pan(p);
  for (let i = i0; i < Math.min(N, i0 + .15 * SR); i++) {
    const tt = (i - i0) / SR, s = hp.run(noise()) * clamp(tt / .001) * Math.exp(-tt / .03) * amp;
    put(st, i, s * gl, s * gr);
  }
}
function sweep(st, t0, t1, f0, f1, ampFn, q, p0, p1) {
  const i0 = idx(t0), i1 = Math.min(N, idx(t1)), bl = new Biquad(), br = new Biquad();
  for (let i = i0; i < i1; i++) {
    const x = (i - i0) / (i1 - i0);
    if (((i - i0) & 15) === 0) { const fc = f0 * Math.pow(f1 / f0, x); bl.set('bp', fc, q); br.set('bp', fc, q); }
    const a = ampFn(x), [gl, gr] = pan(p0 + (p1 - p0) * x);
    put(st, i, bl.run(noise()) * a * gl, br.run(noise()) * a * gr);
  }
}
function impact(st, t0, amp) {
  const i0 = idx(t0), hl = new Biquad().set('hp', 4000, .7), hr = new Biquad().set('hp', 4000, .7);
  let ph = 0;
  for (let i = i0; i < N; i++) {
    const tt = (i - i0) / SR;
    ph += (34 + 30 * Math.exp(-tt / .15)) / SR;
    const boom = Math.sin(TAU * ph) * clamp(tt / .003) * Math.exp(-tt / .8);
    const ce = clamp(tt / .002) * Math.exp(-tt / 1.0) * .3;
    put(st, i, (boom + hl.run(noise()) * ce) * amp, (boom + hr.run(noise()) * ce) * amp);
  }
}

// ---------- аранжировка ----------
// пэд
CHORDS.forEach((c, k) => {
  const att = k === 0 ? 2.2 : .25, rel = k === CHORDS.length - 1 ? .3 : .6;
  c.pad.forEach(m => padNote(S.pad, m, c.t0, c.t1, k === 0 ? .011 : .03, att, rel));
});
// бас (одинаковые соседние ноты склеиваем)
for (let k = 0; k < CHORDS.length; k++) {
  const c = CHORDS[k]; if (!c.bass) continue;
  let t1 = c.t1; while (CHORDS[k + 1] && CHORDS[k + 1].bass === c.bass) t1 = CHORDS[++k].t1;
  bassNote(S.bass, c.bass, c.t0, t1, .5);
}
// интро: удар сердца в момент пика ЭКГ + колокольчики на каждом всплеске
heartbeat(S.fx, T_SPIKE, .9); heartbeat(S.fx, T_SPIKE + .17, .6);
ECG_BELLS.forEach(b => fm(S.bells, b.t, b.m, .28, b.p, { ratio: 3.5, index: 2.2, idxDecay: .4, decay: 1.3 }));
sweep(S.fx, 2.0, T_IN, 700, 6000, x => .10 * Math.pow(x, 2.5), 1.4, -.3, .3);       // подъём к первой доле
// заголовок: мягкий «вжух» слева направо
sweep(S.fx, 3.02, 3.62, 400, 2600, x => .14 * Math.pow(Math.sin(Math.PI * x), 2), 1.2, -.2, .7);
// барабаны
const kicks = [2.9, 3.9, 4.9, 5.4, 5.9, 6.4, 6.9, 7.4, 7.9];
kicks.forEach((t, k) => kick(S.kick, t, k < 2 ? .8 : 1));
[4.4, 5.4, 6.4, 7.4].forEach(t => snap(S.perc, t, t === 4.4 ? .5 : 1, .05));
[8.4, 8.525, 8.65, 8.775].forEach((t, k) => snap(S.perc, t, .45 + k * .18, k % 2 ? .25 : -.25, 1500 + k * 300));  // сбивка
for (let t = 4.9 + .25; t < 8.4; t += BEAT) hat(S.perc, t, .5, (Math.round(t * 2) % 2 ? .3 : -.3));
for (let t = 4.9; t < 8.4; t += BEAT) hat(S.perc, t, .18, 0);
// арпеджио: такт 1 четвертями, дальше восьмыми
for (const c of CHORDS) {
  if (!c.arp) continue;
  const step = c.t0 < 4.9 ? BEAT : BEAT / 2, pat = step === BEAT ? [0, 2, 1, 3] : [0, 1, 2, 3, 1, 2, 3, 2];
  for (let t = c.t0, n = 0; t < c.t1 - 1e-6; t += step, n++) {
    const onBeat = Math.abs(((t - T_IN) / BEAT) % 2) < 1e-6;
    const vel = (onBeat ? 1 : .72) * (.92 + rnd() * .12);
    fm(S.arp, t, c.arp[pat[n % pat.length]], .5 * vel, n % 2 ? .3 : -.3, { index: 1.3, idxDecay: .18, decay: .55, tine: .15 });
  }
}
// плашки: три коротких «поп»
[[5.30, 88, .3], [5.46, 92, .45], [5.62, 95, .6]].forEach(([t, m, p]) => fm(S.bells, t, m, .22, p, { ratio: 2, index: 1, idxDecay: .05, decay: .22 }));
// кульминация: подъём, удар, аккорд-«перебор», искра сверху
sweep(S.fx, 7.9, T_HIT - .02, 500, 7000, x => .16 * Math.pow(x, 2.2), 1.6, -.4, .4);
impact(S.fx, T_HIT, .9);
kick(S.kick, T_HIT, 1, .35);
[64, 68, 71, 75, 78, 83].forEach((m, k) => fm(S.bells, T_HIT + k * .03, m, .32, -.5 + k * .2, { index: 1.2, idxDecay: .3, decay: 1.6, tine: .1 }));
fm(S.bells, T_HIT + .2, 88, .25, .4, { ratio: 3.5, index: 2, idxDecay: .4, decay: 1.4 });

// ---------- сведение ----------
const peak = st => { let p = 0; for (const a of [st.L, st.R]) for (const v of a) p = Math.max(p, Math.abs(v)); return p; };
const activeRms = st => { let s = 0, n = 0; for (const a of [st.L, st.R]) for (const v of a) if (Math.abs(v) > 1e-4) { s += v * v; n++; } return Math.sqrt(s / Math.max(n, 1)); };
for (const k of ['pad', 'bass']) for (let i = 0; i < N; i++) { S[k].L[i] *= DUCK[i]; S[k].R[i] *= DUCK[i]; }

// цели в dBFS (до финальной нормализации): rms — для протяжных, peak — для ударных
const TARGET = { pad: ['rms', -23.5], bass: ['rms', -25.5], kick: ['peak', -9], perc: ['peak', -15], arp: ['peak', -13], bells: ['peak', -11], fx: ['peak', -10] };
const report = [];
for (const [k, [mode, tgt]] of Object.entries(TARGET)) {
  const lvl = mode === 'rms' ? activeRms(S[k]) : peak(S[k]);
  S[k].gain = Math.pow(10, (tgt - db(lvl)) / 20);
  report.push(`${k.padEnd(5)} ${mode} ${db(lvl).toFixed(1)} → ${tgt} dB (gain ${db(S[k].gain).toFixed(1)} dB)`);
}

const sendRev = [new Float32Array(N), new Float32Array(N)], sendDly = [new Float32Array(N), new Float32Array(N)];
const mixL = new Float32Array(N), mixR = new Float32Array(N);
for (const st of Object.values(STEMS)) for (let i = 0; i < N; i++) {
  const l = st.L[i] * st.gain, r = st.R[i] * st.gain;
  mixL[i] += l; mixR[i] += r;
  sendRev[0][i] += l * st.rev; sendRev[1][i] += r * st.rev;
  sendDly[0][i] += l * st.dly; sendDly[1][i] += r * st.dly;
}

// пинг-понг дилей 3/16 (0.375 с)
const D = Math.round(.375 * SR), fb = .38, dl = [new Float32Array(N), new Float32Array(N)];
let lpL = 0, lpR = 0; const k1 = 1 - Math.exp(-TAU * 3500 / SR);
for (let i = 0; i < N; i++) {
  const yl = i >= D ? dl[0][i - D] : 0, yr = i >= D ? dl[1][i - D] : 0;
  lpL += k1 * (yl - lpL); lpR += k1 * (yr - lpR);
  dl[0][i] = (sendDly[0][i] + sendDly[1][i]) * .5 + lpR * fb;
  dl[1][i] = lpL * fb;
}
const dlyOut = { L: new Float32Array(N), R: new Float32Array(N) };
for (let i = D; i < N; i++) { dlyOut.L[i] = dl[0][i - D]; dlyOut.R[i] = dl[1][i - D]; sendRev[0][i] += dlyOut.L[i] * .3; sendRev[1][i] += dlyOut.R[i] * .3; }

// Freeverb
class Comb { constructor(n) { this.b = new Float32Array(n); this.i = 0; this.s = 0; } run(x, f, d) { const y = this.b[this.i]; this.s = y * (1 - d) + this.s * d; this.b[this.i] = x + this.s * f; if (++this.i >= this.b.length) this.i = 0; return y; } }
class AP { constructor(n) { this.b = new Float32Array(n); this.i = 0; } run(x) { const b = this.b[this.i]; this.b[this.i] = x + b * .5; if (++this.i >= this.b.length) this.i = 0; return b - x; } }
const sc = SR / 44100, CT = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617], AT = [556, 441, 341, 225];
const mk = sp => ({ c: CT.map(n => new Comb(Math.round((n + sp) * sc))), a: AT.map(n => new AP(Math.round((n + sp) * sc))) });
const rvL = mk(0), rvR = mk(23), PRE = Math.round(.02 * SR);
const revOut = { L: new Float32Array(N), R: new Float32Array(N) };
for (let i = 0; i < N; i++) {
  const x = i >= PRE ? (sendRev[0][i - PRE] + sendRev[1][i - PRE]) * .015 : 0;
  let l = 0, r = 0;
  for (const c of rvL.c) l += c.run(x, .885, .35);
  for (const c of rvR.c) r += c.run(x, .885, .35);
  for (const a of rvL.a) l = a.run(l);
  for (const a of rvR.a) r = a.run(r);
  revOut.L[i] = l; revOut.R[i] = r;
}
const rg = Math.pow(10, (-25 - db(activeRms(revOut))) / 20), dg = Math.pow(10, (-19 - db(peak(dlyOut))) / 20);
report.push(`reverb return gain ${db(rg).toFixed(1)} dB, delay return gain ${db(dg).toFixed(1)} dB`);

// мастер: HPF 28 Гц → мягкая сатурация → нормализация −1 dBFS → фейды
const hpL = [new Biquad().set('hp', 28, .7), new Biquad().set('hp', 28, .7)], hpR = [new Biquad().set('hp', 28, .7), new Biquad().set('hp', 28, .7)];
for (let i = 0; i < N; i++) {
  mixL[i] = hpL[1].run(hpL[0].run(mixL[i] + revOut.L[i] * rg + dlyOut.L[i] * dg));
  mixR[i] = hpR[1].run(hpR[0].run(mixR[i] + revOut.R[i] * rg + dlyOut.R[i] * dg));
}
let pk = 0; for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(mixL[i]), Math.abs(mixR[i]));
const DRIVE = 1.0, sat = x => Math.tanh(DRIVE * x / pk) / Math.tanh(DRIVE);
let pk2 = 0;
for (let i = 0; i < N; i++) { mixL[i] = sat(mixL[i]); mixR[i] = sat(mixR[i]); pk2 = Math.max(pk2, Math.abs(mixL[i]), Math.abs(mixR[i])); }
const norm = Math.pow(10, -1 / 20) / pk2;
for (let i = 0; i < N; i++) {
  const t = i / SR, g = norm * smooth(t / .03) * (t > 9.3 ? .5 + .5 * Math.cos(Math.PI * clamp((t - 9.3) / .7)) : 1);
  mixL[i] *= g; mixR[i] *= g;
}

// 24-bit WAV
const dataLen = N * 2 * 3, buf = Buffer.alloc(44 + dataLen);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + dataLen, 4); buf.write('WAVE', 8); buf.write('fmt ', 12);
buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 6, 28); buf.writeUInt16LE(6, 32); buf.writeUInt16LE(24, 34); buf.write('data', 36); buf.writeUInt32LE(dataLen, 40);
let o = 44;
for (let i = 0; i < N; i++) for (const a of [mixL, mixR]) { buf.writeIntLE(Math.round(clamp(a[i], -1, 1) * 8388607), o, 3); o += 3; }
writeFileSync(OUT, buf);
console.log(report.join('\n'));
console.log(`T_SPIKE=${T_SPIKE.toFixed(3)} bells at ${ECG_BELLS.map(b => b.t.toFixed(2)).join(', ')}`);
console.log('written', OUT);
