// PDF-прогон печатных форм — запуск из корня проекта:
//   node tests/print_pdf.mjs [--printable=225] [путь к html]
//
// Утверждения о печати доказываются PDF, а не чтением CSS (урок v2_244).
// Для каждой формы:
//  1. предпросмотр в карте (#inlinePrintRoot + @media print) → PDF;
//  2. сохраняемый лист (buildStandalonePrintDocument + standalonePrintCss) → PDF;
//  3. сравнение: число страниц и число залитых клеток графика в обоих местах
//     (в v2_249 сохранённый лист потерял ВСЕ заливки — клинические данные);
//  4. ч/б «ксерокс» (grayscale contrast brightness) — PNG первой страницы листа.
// --printable=225 имитирует чужой принтер с меньшей печатной высотой (мм).
// Демо-данные: 12 строк МКФ получают определители, чтобы графику было что заливать.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const args = process.argv.slice(2);
const printable = +((args.find((a) => a.startsWith('--printable=')) || '').split('=')[1] || 0);
const HTML = resolve(args.find((a) => !a.startsWith('--')) || resolve(ROOT, 'app/icf-singapore.html'));
const OUT = resolve(HERE, 'out', 'print');
mkdirSync(OUT, { recursive: true });

const FORMS = [
  ['protokol', 'printMdrkProtocol()'],
  ['grafika', 'printGraphicIcf()'],
  ['taktika', 'printTaktikaFrm()'],
  ['paket', 'printCorePackage()'],
];
const pageCss = printable ? `@page{size:210mm ${printable}mm !important}` : '';
const countPages = (buf) => (buf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
const XEROX = 'grayscale(1) contrast(1.6) brightness(1.12)';

// Сколько клеток графика реально залито (фон не белый и не прозрачный)
const filledCells = (scope) => [...document.querySelectorAll(scope + ' .g-cell')].filter((c) => {
  const b = getComputedStyle(c).backgroundColor;
  return b && !/rgba\(0, 0, 0, 0\)|rgb\(255, 255, 255\)|transparent/.test(b);
}).length;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const ctx = await browser.newContext();
await ctx.addInitScript(() => { window.alert = () => {}; window.confirm = () => true; window.print = () => {}; window.open = () => null; });
const app = await ctx.newPage();
await app.goto(pathToFileURL(HTML).href, { waitUntil: 'load', timeout: 180000 });
const demo = await app.evaluate(() => {
  try {
    const list = typeof rows !== 'undefined' && Array.isArray(rows) ? rows : null;
    if (!list) return 'строки МКФ не найдены (переменная rows) — графика без демо-данных';
    list.slice(0, 12).forEach((r, i) => { r.admR = String(1 + (i % 4)); r.disR = String(i % 3); if ('admK' in r) { r.admK = r.admR; r.disK = r.disR; } });
    if (typeof render === 'function') render();
    return 'демо-определители в 12 строках МКФ';
  } catch (e) { return 'демо-данные не заполнены: ' + e.message; }
});

const lines = [`# PDF-прогон печати — ${new Date().toLocaleString('ru-RU')}`, '',
  `Файл: \`${HTML.replace(ROOT + '/', '')}\` · ${printable ? `имитация печатной высоты ${printable} мм` : 'A4 по CSS файла'} · ${demo}`, '',
  '| Форма | Стр. предпросмотр | Стр. сохранённый лист | Заливок графика: предпросмотр / лист | Вывод |', '|---|---|---|---|---|'];
let fails = 0;

for (const [name, call] of FORMS) {
  const r = await app.evaluate((call) => {
    const root = document.getElementById('inlinePrintRoot'); if (root) root.innerHTML = '';
    try { eval(call); } catch (e) { return { err: e.message }; }
    const html = (document.getElementById('inlinePrintRoot') || {}).innerHTML || '';
    return { html, label: typeof LAST_PRINT_LABEL !== 'undefined' ? LAST_PRINT_LABEL : 'print' };
  }, call);
  if (r.err || !r.html) { lines.push(`| ${name} | — | — | — | ❌ ${r.err || 'пустой предпросмотр'} |`); fails++; continue; }

  // 1. предпросмотр в карте, печатные стили самого файла
  await app.emulateMedia({ media: 'print' });
  if (pageCss) await app.addStyleTag({ content: pageCss });
  const inlineFill = await app.evaluate(filledCells, '#inlinePrintRoot');
  const pInline = await app.pdf({ path: resolve(OUT, `${name}.predprosmotr.pdf`), preferCSSPageSize: true, printBackground: true });
  await app.emulateMedia({ media: 'screen' });

  // 2. сохраняемый лист — отдельный документ со standalonePrintCss()
  const doc = await app.evaluate(([h, l]) => buildStandalonePrintDocument(h, l), [r.html, r.label]);
  writeFileSync(resolve(OUT, `${name}.list.html`), doc);
  const sheet = await ctx.newPage();
  await sheet.setContent(doc, { waitUntil: 'load' });
  await sheet.emulateMedia({ media: 'print' });
  if (pageCss) await sheet.addStyleTag({ content: pageCss });
  const sheetFill = await sheet.evaluate(filledCells, '.print-root');
  const pSheet = await sheet.pdf({ path: resolve(OUT, `${name}.list.pdf`), preferCSSPageSize: true, printBackground: true });
  // 4. ч/б «ксерокс» первой страницы
  await sheet.addStyleTag({ content: `html{filter:${XEROX}}` });
  await sheet.screenshot({ path: resolve(OUT, `${name}.list.chb.png`), fullPage: false });
  await sheet.close();

  const a = countPages(pInline), b = countPages(pSheet);
  const verdict = [];
  if (inlineFill > 0 && sheetFill < inlineFill * 0.5) verdict.push('❌ сохранённый лист потерял заливки графика (класс v2_249)');
  if (Math.abs(a - b) > 1) verdict.push(`⚠️ страницы расходятся (${a} и ${b}) — открыть оба PDF: различие бывает задуманным (у листа свои размеры шрифта), а бывает признаком правки не во всех трёх местах`);
  if (verdict.some((v) => v.startsWith('❌'))) fails++;
  lines.push(`| ${name} | ${a} | ${b} | ${inlineFill} / ${sheetFill} | ${verdict.join('; ') || '✅'} |`);
}
await browser.close();

lines.push('', 'Файлы: `tests/out/print/` — PDF обоих мест, HTML сохранённого листа, PNG ч/б первой страницы.',
  'Смотреть глазами обязательно: тест ловит потерю заливок и расхождение страниц, но не «некрасиво» и не пустой первый лист — это видно только в PDF.');
writeFileSync(resolve(HERE, 'out', 'print-report.md'), lines.join('\n') + '\n');
console.log(lines.join('\n'));
process.exit(fails ? 1 : 0);
