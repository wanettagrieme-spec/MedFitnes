// Фоновая музыка под голос: тихий эмбиент без ударных (пэд + редкие «колокольчики»), синтез — прав третьих лиц нет.
//   node scripts/music-bed.mjs <секунды> <out.wav>
import { writeFileSync } from 'node:fs';

const SR = 48000, DUR = Number(process.argv[2] || 150), N = Math.round(SR * DUR), OUT = process.argv[3] || 'music-bed.wav';
const TAU = Math.PI * 2;
const mtof = m => 440 * Math.pow(2, (m - 69) / 12);
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
let seed = 7; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const L = new Float32Array(N), R = new Float32Array(N);

class LP { constructor(f) { this.k = 1 - Math.exp(-TAU * f / SR); this.y = 0; } run(x) { return (this.y += this.k * (x - this.y)); } }

// Аккорды по 8 с: Emaj9 → C#m7 → Amaj9 → Bsus4 (по кругу)
const CHORDS = [[52, 59, 63, 66, 68], [49, 56, 59, 64, 68], [45, 57, 61, 64, 68], [47, 59, 64, 66, 71]];
const CH = 8;
for (let c = 0; c * CH < DUR + CH; c++) {
  const t0 = c * CH, notes = CHORDS[c % 4];
  for (const m of notes) {
    const f = mtof(m), voices = [-6, 0, 6].map(d => ({ f: f * Math.pow(2, d / 1200), ph: rnd(), p: rnd() * 2 - 1 })), lpL = new LP(900), lpR = new LP(900);
    const i0 = Math.round(t0 * SR), i1 = Math.min(N, Math.round((t0 + CH + 2.5) * SR));
    for (let i = i0; i < i1; i++) {
      const t = i / SR - t0, env = smooth(t / 2.5) * (t > CH ? smooth(1 - (t - CH) / 2.5) : 1);
      let l = 0, r = 0;
      for (const v of voices) { v.ph += v.f / SR; v.ph -= Math.floor(v.ph); const s = 2 * v.ph - 1; l += s * (0.5 - v.p * 0.4); r += s * (0.5 + v.p * 0.4); }
      L[i] += lpL.run(l) * env * 0.02; R[i] += lpR.run(r) * env * 0.02;
    }
  }
  // редкие мягкие «колокольчики» по тонам аккорда
  for (let k = 0; k < 4; k++) {
    if (rnd() < 0.35) continue;
    const m = notes[1 + Math.floor(rnd() * 4)] + 12, f = mtof(m), t1 = t0 + k * 2 + rnd() * 0.3, pan = rnd() * 1.2 - 0.6;
    const i0 = Math.round(t1 * SR), i1 = Math.min(N, i0 + 3 * SR);
    for (let i = i0; i < i1; i++) {
      const t = (i - i0) / SR, env = clamp(t / 0.004) * Math.exp(-t / 0.9);
      const s = Math.sin(TAU * f * t + 1.2 * Math.exp(-t / 0.25) * Math.sin(TAU * f * t)) * env * 0.05;
      L[i] += s * (0.5 - pan / 2); R[i] += s * (0.5 + pan / 2);
    }
  }
}

// Простая реверберация (несколько гребёнчатых фильтров)
const rev = (x, delays) => { const out = new Float32Array(N); for (const d of delays) { const n = Math.round(d * SR), buf = new Float32Array(n); let idx = 0, lp = 0; for (let i = 0; i < N; i++) { const y = buf[idx]; lp += 0.6 * (y - lp); buf[idx] = x[i] + lp * 0.82; idx = (idx + 1) % n; out[i] += y / delays.length; } } return out; };
const rl = rev(L, [0.0297, 0.0371, 0.0411, 0.0437]), rr = rev(R, [0.0313, 0.0359, 0.0397, 0.0451]);
let pk = 0;
for (let i = 0; i < N; i++) { L[i] += rl[i] * 0.6; R[i] += rr[i] * 0.6; pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i])); }
const g = 0.7 / pk;
const buf = Buffer.alloc(44 + N * 4);
buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVE', 8); buf.write('fmt ', 12); buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22); buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34);
buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  const t = i / SR, fade = smooth(t / 2) * smooth((DUR - t) / 3);
  buf.writeInt16LE(Math.round(clamp(L[i] * g * fade, -1, 1) * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(clamp(R[i] * g * fade, -1, 1) * 32767), 46 + i * 4);
}
writeFileSync(OUT, buf);
console.log(`${OUT}: ${DUR} с`);
