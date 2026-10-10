// Озвучка выпуска по сценарию: реплики «**Голос:**» по сценам → WAV по сценам,
// склейка с паузами, тайминги сцен для анимации, отдельная вертикальная версия.
//   node scripts/episode-voice.mjs episodes/01-chto-takoe-mr
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const SR = 48000;
const LEAD_IN = 0.4, PAUSE = 0.7, TAIL = 1.0;   // секунды тишины: в начале, между сценами, в конце

const dir = process.argv[2];
if (!dir) throw new Error('Укажите папку выпуска: episodes/<номер-название>');
const md = readFileSync(path.join(dir, 'script.md'), 'utf8');
const voiceDir = path.join(dir, 'voice');
mkdirSync(voiceDir, { recursive: true });

// Разбор сценария
const [main, vertical = ''] = md.split(/^## Вертикальная версия.*$/m);
const scenes = [...main.matchAll(/^### (Сцена [^\n]+)\n\*\*Голос:\*\* ([^\n]+)/gm)]
  .map((m, i) => ({ id: `scene-${String(i + 1).padStart(2, '0')}`, title: m[1].replace(/\s*\([\d:–-]+\)$/, ''), text: m[2].trim() }));
const vText = vertical.match(/^\*\*Голос:\*\* ([^\n]+)/m)?.[1]?.trim();
if (!scenes.length) throw new Error('В сценарии не найдено ни одной реплики «**Голос:**»');

function tts(id, text) {
  const txt = path.join(voiceDir, `${id}.txt`), wav = path.join(voiceDir, `${id}.wav`);
  writeFileSync(txt, text + '\n');
  execFileSync('node', ['scripts/tts-yandex.mjs', '--text-file', txt, '--out', wav], { stdio: ['ignore', 'pipe', 'inherit'] });
  return readFileSync(wav).subarray(44);   // наш собственный WAV: 44 байта заголовка, PCM 16 бит моно
}
const silence = s => Buffer.alloc(Math.round(s * SR) * 2);
function writeWav(file, pcm) {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVE', 8); h.write('fmt ', 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
  writeFileSync(file, Buffer.concat([h, pcm]));
  execFileSync('npx', ['remotion', 'ffmpeg', '-y', '-loglevel', 'error', '-i', file, '-b:a', '192k', file.replace(/\.wav$/, '.mp3')]);
}

// Основная версия
const parts = [silence(LEAD_IN)];
let t = LEAD_IN;
const timings = [];
for (const s of scenes) {
  const pcm = tts(s.id, s.text);
  const dur = pcm.length / 2 / SR;
  timings.push({ id: s.id, title: s.title, start: +t.toFixed(3), end: +(t + dur).toFixed(3), text: s.text });
  console.log(`${s.title}: ${dur.toFixed(1)} с`);
  parts.push(pcm, silence(PAUSE));
  t += dur + PAUSE;
}
parts.pop(); parts.push(silence(TAIL));
const total = t - PAUSE + TAIL;
writeWav(path.join(voiceDir, 'full.wav'), Buffer.concat(parts));
writeFileSync(path.join(voiceDir, 'timings.json'), JSON.stringify({ sampleRate: SR, duration: +total.toFixed(3), scenes: timings }, null, 2));
console.log(`Основная версия: ${total.toFixed(1)} с`);

// Вертикальная версия
if (vText) {
  const pcm = tts('vertical', vText);
  writeWav(path.join(voiceDir, 'vertical-full.wav'), Buffer.concat([silence(LEAD_IN), pcm, silence(TAIL)]));
  console.log(`Вертикальная версия: ${(LEAD_IN + pcm.length / 2 / SR + TAIL).toFixed(1)} с`);
}
