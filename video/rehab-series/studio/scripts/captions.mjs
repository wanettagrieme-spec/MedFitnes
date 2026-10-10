// Субтитры выпуска: время каждого слова — из Whisper по озвучке, сами слова — из утверждённого сценария
// (так в субтитрах нет ошибок распознавания). Пишет voice/captions.json и voice/vertical-captions.json.
//   node scripts/captions.mjs episodes/01-chto-takoe-mr
import { transcribe, toCaptions } from '@remotion/install-whisper-cpp';
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const MAX_PAGE_CHARS = 44;     // одна страница субтитров — до двух коротких строк
const PAUSE_BREAK_MS = 450;    // пауза в речи — повод начать новую страницу

const dir = process.argv[2];
if (!dir) throw new Error('Укажите папку выпуска');
const voiceDir = path.join(dir, 'voice');

const norm = w => w.toLowerCase().replace(/ё/g, 'е').replace(/[^\p{L}\p{N}]/gu, '');
// Слова сценария; одиночное тире приклеиваем к предыдущему слову («Ответ —»)
const words = text => text.replace(/\+/g, '').split(/\s+/).filter(Boolean)
  .reduce((acc, w) => (norm(w) ? [...acc, w] : (acc.length ? [...acc.slice(0, -1), acc.at(-1) + ' ' + w] : acc)), []);

function similarity(a, b) {
  if (a === b) return 1;
  const m = a.length, n = b.length, d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 1; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return 1 - d[m][n] / Math.max(m, n);
}

// Выравнивание слов сценария по словам Whisper (динамическое программирование)
function align(script, heard) {
  const S = script.map(norm), H = heard.map(w => norm(w.text));
  const n = S.length, m = H.length, INF = 1e9;
  const cost = Array.from({ length: n + 1 }, () => new Float64Array(m + 1).fill(INF));
  const back = Array.from({ length: n + 1 }, () => new Int8Array(m + 1));
  cost[0][0] = 0;
  for (let i = 0; i <= n; i++) for (let j = 0; j <= m; j++) {
    if (i < n && j < m) { const c = cost[i][j] + (1 - similarity(S[i], H[j])) * 1.5; if (c < cost[i + 1][j + 1]) { cost[i + 1][j + 1] = c; back[i + 1][j + 1] = 1; } }
    if (i < n) { const c = cost[i][j] + 1; if (c < cost[i + 1][j]) { cost[i + 1][j] = c; back[i + 1][j] = 2; } }
    if (j < m) { const c = cost[i][j] + 1; if (c < cost[i][j + 1]) { cost[i][j + 1] = c; back[i][j + 1] = 3; } }
  }
  const match = Array(n).fill(null);
  for (let i = n, j = m; i > 0 || j > 0;) {
    const b = back[i][j];
    if (b === 1) { match[i - 1] = j - 1; i--; j--; } else if (b === 2) i--; else j--;
  }
  // Слова без пары — время по соседям
  const out = script.map((text, i) => (match[i] !== null ? { text, startMs: heard[match[i]].startMs, endMs: heard[match[i]].endMs } : { text, startMs: null, endMs: null }));
  for (let i = 0; i < out.length; i++) if (out[i].startMs === null) {
    const prev = out.slice(0, i).reverse().find(w => w.endMs !== null), next = out.slice(i + 1).find(w => w.startMs !== null);
    const a = prev ? prev.endMs : 0, b = next ? next.startMs : a + 400;
    out[i].startMs = a; out[i].endMs = Math.max(a + 120, b);
  }
  return { words: out, matched: match.filter(x => x !== null).length };
}

// Страницы субтитров: режем по смысловым фразам (знаки препинания), длинную фразу — на равные по длине части
function pages(ws) {
  const len = arr => arr.map(w => w.text).join(' ').length;
  const phrases = [];
  let cur = [];
  for (const w of ws) { if (cur.length && cur.at(-1).scene !== w.scene) { phrases.push(cur); cur = []; } cur.push(w); if (/[.!?…:;,—]$/.test(w.text)) { phrases.push(cur); cur = []; } }
  if (cur.length) phrases.push(cur);
  const chunks = [];
  for (const ph of phrases) {
    const k = Math.ceil(len(ph) / MAX_PAGE_CHARS);
    if (k <= 1) { chunks.push(ph); continue; }
    // k частей примерно равной длины
    let start = 0;
    for (let part = 1; part < k; part++) {
      const target = (len(ph) * part) / k;
      let best = start + 1, bestDiff = Infinity;
      for (let j = start + 1; j < ph.length; j++) { const d = Math.abs(len(ph.slice(0, j)) - target) + (norm(ph[j - 1].text).length <= 2 ? 10 : 0); if (d < bestDiff) { bestDiff = d; best = j; } }   // предлог/союз не оставляем в конце строки
      chunks.push(ph.slice(start, best)); start = best;
    }
    chunks.push(ph.slice(start));
  }
  // Склеиваем соседние короткие куски, если вместе помещаются и между ними нет длинной паузы
  const res = [];
  for (const c of chunks) {
    const last = res.at(-1);
    const crossesScene = last && last.at(-1).scene !== c[0].scene;
    if (last && !crossesScene && len([...last, ...c]) <= MAX_PAGE_CHARS && c[0].startMs - last.at(-1).endMs < 600) last.push(...c);   // через границу сцен не склеиваем
    else res.push([...c]);
  }
  const out = res.map(p => ({ startMs: p[0].startMs, endMs: p.at(-1).endMs, text: p.map(w => w.text).join(' '), words: p }));
  // страница держится до начала следующей (без мигания), но не дольше 1,2 с после последнего слова
  out.forEach((p, i) => { const next = out[i + 1]; p.endMs = Math.min(next ? next.startMs : p.endMs + 1200, p.endMs + 1200); });
  return out;
}

async function run(wavName, text, outName, scenes = []) {
  const wav = path.join(voiceDir, wavName);
  if (!existsSync(wav)) return;
  const tmp = path.resolve(voiceDir, '_16k.wav');
  execFileSync('npx', ['remotion', 'ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-ar', '16000', '-ac', '1', tmp]);
  const json = await transcribe({ inputPath: tmp, whisperPath: path.resolve('whisper.cpp'), whisperCppVersion: '1.9.5', model: 'large-v3-turbo', tokenLevelTimestamps: true, language: 'ru', printOutput: false });
  unlinkSync(tmp);
  // Whisper отдаёт кусочки слов: кусочек с пробелом в начале начинает новое слово
  const heard = [];
  for (const c of toCaptions({ whisperCppOutput: json }).captions) {
    if (!heard.length || /^\s/.test(c.text)) heard.push({ text: c.text.trim(), startMs: c.startMs, endMs: c.endMs });
    else { heard.at(-1).text += c.text; heard.at(-1).endMs = c.endMs; }
  }
  for (let i = heard.length - 1; i >= 0; i--) if (!norm(heard[i].text)) heard.splice(i, 1);
  const script = words(text);
  const { words: ws, matched } = align(script, heard);
  // Привязка слов к сценам: число слов в каждой сцене известно из сценария; время — не раньше начала сцены
  if (scenes.length) {
    let k = 0;
    scenes.forEach((sc, si) => {
      for (let n = words(sc.text).length; n > 0 && k < ws.length; n--, k++) {
        const w = ws[k]; w.scene = si;
        w.startMs = Math.max(w.startMs, sc.start * 1000); w.endMs = Math.min(Math.max(w.endMs, w.startMs + 80), sc.end * 1000 + 150);
      }
    });
  }
  const pg = pages(ws);
  writeFileSync(path.join(voiceDir, outName), JSON.stringify({ words: ws, pages: pg }, null, 1));
  console.log(`${outName}: слов в сценарии ${script.length}, услышано ${heard.length}, сопоставлено ${matched}; страниц субтитров ${pg.length}`);
}

const timings = JSON.parse(readFileSync(path.join(voiceDir, 'timings.json'), 'utf8'));
await run('full.wav', timings.scenes.map(s => s.text).join(' '), 'captions.json', timings.scenes);
if (existsSync(path.join(voiceDir, 'vertical.txt'))) await run('vertical-full.wav', readFileSync(path.join(voiceDir, 'vertical.txt'), 'utf8'), 'vertical-captions.json');
