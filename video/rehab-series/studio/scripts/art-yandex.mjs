// Иллюстрации через Yandex AI Studio (Alice AI ART, OpenAI-совместимый Images API) → JPG/PNG.
// Ключ и каталог берутся из .env (YANDEX_SPEECHKIT_API_KEY, YANDEX_FOLDER_ID) и никуда не выводятся.
//
//   node scripts/art-yandex.mjs --prompt "..." --out public/stock/yandex/Y1-name.png [--size 1024x1024] [--model aliceai-image-art-3.0]
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';

const ENDPOINT = 'https://ai.api.cloud.yandex.net/v1/images/generations';

function env(name) {
  if (!existsSync('.env')) throw new Error('Нет файла .env в папке video-studio');
  const v = readFileSync('.env', 'utf8').match(new RegExp(`${name}\\s*=\\s*["']?([A-Za-z0-9_\\-.]+)`))?.[1];
  if (!v) throw new Error(`В .env нет ${name}`);
  return v;
}

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, all) => (v.startsWith('--') ? [...a, [v.slice(2), all[i + 1]?.startsWith('--') ? true : all[i + 1] ?? true]] : a), []));
const key = env('YANDEX_SPEECHKIT_API_KEY');
const folder = env('YANDEX_FOLDER_ID');
const model = `art://${folder}/${args.model ?? 'aliceai-image-art-3.0'}`;
const prompt = String(args.prompt).slice(0, 500);   // ограничение API — 500 символов

const request = () => fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Authorization: `Api-Key ${key}`, 'OpenAI-Project': folder },
  body: JSON.stringify({ model, prompt, size: args.size ?? '1024x1024' }),
});
// Через VPN соединение рвётся — повторяем только сетевые ошибки
let res, body;
for (let attempt = 1; ; attempt++) {
  try { res = await request(); body = await res.text(); break; }
  catch (e) { if (attempt >= 6) throw e; await new Promise(r => setTimeout(r, 1500 * attempt)); }
}
if (!res.ok) { console.error(`Alice AI ART ${res.status}: ${body.slice(0, 400)}`); process.exit(1); }
const b64 = JSON.parse(body)?.data?.[0]?.b64_json;
if (!b64) { console.error(`Нет картинки в ответе: ${body.slice(0, 300)}`); process.exit(1); }
mkdirSync(path.dirname(args.out), { recursive: true });
writeFileSync(args.out, Buffer.from(b64, 'base64'));
console.log(`${args.out}: готово (${(Buffer.from(b64, 'base64').length / 1024).toFixed(0)} КБ)`);
