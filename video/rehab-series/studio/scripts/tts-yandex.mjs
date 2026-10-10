// Озвучка текста через Yandex SpeechKit (API v3) → WAV 48 кГц.
// Ключ берётся из .env (YANDEX_SPEECHKIT_API_KEY) и никуда не выводится.
//
//   node scripts/tts-yandex.mjs --text-file voice/sample.txt --voice alena --role good --out out/voices/alena.wav
//   node scripts/tts-yandex.mjs --samples voice/sample.txt      # пробы нескольких голосов для слепого выбора
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const SR = 48000;
const ENDPOINT = 'https://tts.api.cloud.yandex.net/tts/v3/utteranceSynthesis';

// Кандидаты для слепого прослушивания: спокойные, тёплые интонации
const SAMPLE_VOICES = [
  { voice: 'alena', role: 'good' },
  { voice: 'dasha', role: 'friendly' },
  { voice: 'marina', role: 'friendly' },
  { voice: 'ermil', role: 'good' },
  { voice: 'alexander', role: 'good' },
  { voice: 'anton', role: 'good' },
];

function loadKey() {
  if (!existsSync('.env')) throw new Error('Нет файла .env в папке video-studio');
  // Терпимо к опечаткам вокруг: лишние символы, пробелы, кавычки
  const key = readFileSync('.env', 'utf8').match(/YANDEX_SPEECHKIT_API_KEY\s*=\s*["']?([A-Za-z0-9_\-.]+)/)?.[1];
  if (!key) throw new Error('В .env пустой YANDEX_SPEECHKIT_API_KEY');
  return key;
}

async function synthesize(text, { voice, role, speed = 0.95 }, key) {
  const hints = [{ voice }, { speed }];
  if (role) hints.push({ role });
  const request = () => fetch(ENDPOINT, {
    method: 'POST',
    headers: { Authorization: `Api-Key ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text,
      hints,
      outputAudioSpec: { rawAudio: { audioEncoding: 'LINEAR16_PCM', sampleRateHertz: SR } },
      loudnessNormalizationType: 'LUFS',
      unsafeMode: true,
    }),
  });
  // Соединение через VPN иногда рвётся на рукопожатии — повторяем только сетевые ошибки
  let res;
  for (let attempt = 1; ; attempt++) {
    try { res = await request(); break; }
    catch (e) { if (attempt >= 6) throw e; await new Promise(r => setTimeout(r, 800 * attempt)); }
  }
  const body = await res.text();
  if (!res.ok) throw new Error(`SpeechKit ${res.status}: ${body.slice(0, 300)}`);
  // Ответ — поток JSON-объектов по строкам, в каждом кусок аудио в base64
  const chunks = body.split('\n').filter(Boolean)
    .map(l => JSON.parse(l)?.result?.audioChunk?.data).filter(Boolean)
    .map(b => Buffer.from(b, 'base64'));
  return Buffer.concat(chunks);
}

function wav(pcm) {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVE', 8); h.write('fmt ', 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, all) => (v.startsWith('--') ? [...a, [v.slice(2), all[i + 1]?.startsWith('--') ? true : all[i + 1] ?? true]] : a), []));
const key = loadKey();

if (args.samples) {
  const text = readFileSync(args.samples, 'utf8').trim();
  const dir = 'out/voices';
  mkdirSync(dir, { recursive: true });
  const mapping = {};
  for (const [i, v] of SAMPLE_VOICES.entries()) {
    const name = `Голос ${i + 1}`;
    let pcm;
    try { pcm = await synthesize(text, v, key); }
    catch (e) { console.log(`${name}: ${v.voice}/${v.role} — ${e.message}; пробую без амплуа`); pcm = await synthesize(text, { ...v, role: null }, key); v.role = null; }
    const wavPath = path.join(dir, `${name}.wav`);
    writeFileSync(wavPath, wav(pcm));
    execFileSync('npx', ['remotion', 'ffmpeg', '-y', '-loglevel', 'error', '-i', wavPath, '-b:a', '192k', path.join(dir, `${name}.mp3`)]);
    mapping[name] = v;
    console.log(`${name}: готово, ${(pcm.length / 2 / SR).toFixed(1)} с`);
  }
  writeFileSync(path.join(dir, 'mapping.json'), JSON.stringify(mapping, null, 2));
} else {
  const text = args.text ?? readFileSync(args['text-file'], 'utf8').trim();
  const pcm = await synthesize(text, { voice: args.voice ?? 'alena', role: args.role === true ? null : args.role, speed: Number(args.speed ?? 0.95) }, key);
  mkdirSync(path.dirname(args.out), { recursive: true });
  writeFileSync(args.out, wav(pcm));
  console.log(`${args.out}: ${(pcm.length / 2 / SR).toFixed(1)} с`);
}
