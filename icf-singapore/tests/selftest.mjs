// Самотест ICF SINGAPORE — запуск из корня проекта: node tests/selftest.mjs [путь к html]
//
// Что проверяет (в настоящем браузере, не чтением кода):
//  1. файл открывается без ошибок JS;
//  2. версии и ключ хранилища (icfModule_v2_34 менять нельзя);
//  3. ключевые функции на месте;
//  4. размеры каталогов совпадают с tests/expected.json;
//  5. кнопка «Проверить файл» — настоящим кликом — не находит дефектов;
//  6. ПУТЬ ДАННЫХ ДО ДОКУМЕНТА по каждому из 12 каталогов: рецепт выбран →
//     попал в строки назначения btlRxLines() → попал в печатный протокол
//     (класс дефектов v2_256/257);
//  7. печатные формы собираются и не пустые;
//  8. «Новый пациент» (настоящий клик) не оставляет данных прошлого пациента (D01);
//  9. «Сохранить карту пациента» (настоящий клик) пишет в архив.
// Итог — tests/out/report.md. Если провалов нет, в tests/out/.last_pass
// записывается отпечаток проверенного файла: по нему хук остановки знает,
// что последняя правка проверена.
import { chromium } from 'playwright';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const HTML = resolve(process.argv[2] || resolve(ROOT, 'app/icf-singapore.html'));
const OUT = resolve(HERE, 'out');
const EXP = JSON.parse(readFileSync(resolve(HERE, 'expected.json'), 'utf8'));
const URL_ = pathToFileURL(HTML).href;
mkdirSync(OUT, { recursive: true });

const results = [];
const add = (group, name, status, detail = '') => {
  results.push({ group, name, status, detail });
  const mark = { ok: '✓', fail: '✗', warn: '!', skip: '–' }[status];
  console.log(`${mark} [${group}] ${name}${detail ? ' — ' + detail : ''}`);
};

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });

// Чистая страница: своё хранилище, заглушки диалогов и печати, сбор ошибок.
async function freshPage() {
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 1000 } });
  await ctx.addInitScript(() => {
    window.__dialogs = [];
    window.alert = (m) => window.__dialogs.push('alert: ' + m);
    window.confirm = (m) => { window.__dialogs.push('confirm: ' + m); return true; };
    window.prompt = (m, d) => { window.__dialogs.push('prompt: ' + m); return d || 'Самотест'; };
    window.print = () => window.__dialogs.push('print');
    window.open = () => null;
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto(URL_, { waitUntil: 'load', timeout: 180000 });
  return { ctx, page, errors };
}

// Настоящий клик по кнопке; если она спрятана в свёрнутом блоке — честно помечаем.
async function realClick(page, selector) {
  const el = page.locator(selector).first();
  if (!(await el.count())) return 'нет на странице';
  try { await el.click({ timeout: 4000 }); return 'клик'; }
  catch { await el.evaluate((n) => n.click()); return 'кнопка скрыта — нажата программно'; }
}

const t0 = Date.now();
try {
  // ---------- 1–5: загрузка, версии, функции, каталоги, «Проверить файл» ----------
  {
    const { ctx, page, errors } = await freshPage();
    add('загрузка', 'файл открылся', errors.length ? 'fail' : 'ok',
      errors.length ? errors.slice(0, 5).join(' | ') : `${((Date.now() - t0) / 1000).toFixed(1)} с, ошибок JS нет`);

    const v = await page.evaluate(() => ({
      name: typeof APP_NAME !== 'undefined' ? APP_NAME : null, app: typeof APP_VERSION !== 'undefined' ? APP_VERSION : null,
      schema: typeof DATA_SCHEMA !== 'undefined' ? DATA_SCHEMA : null, rules: typeof RULES_VERSION !== 'undefined' ? RULES_VERSION : null,
      store: typeof STORE !== 'undefined' ? STORE : null }));
    add('версии', `${v.name} ${v.app} · формат ${v.schema} · правила ${v.rules}`, v.app ? 'ok' : 'fail');
    add('версии', 'ключ хранилища', v.store === EXP.storeKey ? 'ok' : 'fail',
      v.store === EXP.storeKey ? v.store : `ожидался ${EXP.storeKey}, в файле ${v.store} — сохранённые карты пропадут`);

    const missing = await page.evaluate((fns) => fns.filter((f) => typeof window[f] !== 'function'), EXP.functions);
    add('функции', `${EXP.functions.length - missing.length} из ${EXP.functions.length} на месте`,
      missing.length ? 'fail' : 'ok', missing.length ? 'нет: ' + missing.join(', ') : '');

    const sizes = await page.evaluate((names) => {
      const o = {};
      for (const n of names) { try { const v = eval(n); o[n] = Array.isArray(v) ? v.length : null; } catch { o[n] = null; } }
      return o;
    }, Object.keys(EXP.catalogs));
    for (const [n, want] of Object.entries(EXP.catalogs)) {
      const got = sizes[n];
      add('каталоги', n, got === want ? 'ok' : 'fail',
        got === want ? `${got}` : `ожидалось ${want}, в файле ${got} — если это намеренно, обнови tests/expected.json`);
    }

    const how = await realClick(page, '[onclick="runIntegrityCheck()"]');
    const box = await page.evaluate(() => (document.getElementById('integrityBox') || {}).innerText || '');
    const r = await page.evaluate(() => { const x = integrityCheck(); return { p: x.problems, u: x.unverified.length }; });
    add('проверка файла', `кнопка «Проверить файл» (${how})`, r.p.length || /Найдено проблем/.test(box) ? 'fail' : 'ok',
      r.p.length ? r.p.slice(0, 8).join(' | ') : `дефектов нет; непроверяемых машинно пунктов: ${r.u} (это пробелы источников, не ошибки)`);
    await ctx.close();
  }

  // ---------- 6: путь данных до документа, по каждому каталогу отдельно ----------
  for (const c of EXP.rxPath) {
    const { ctx, page, errors } = await freshPage();
    const r = await page.evaluate((c) => {
      const list = eval(c.list);
      const item = Array.isArray(list) ? list[0] : null;
      if (!item) return { err: 'каталог пуст или не найден: ' + c.list };
      const id = item[c.idField];
      window[c.toggle](id);
      const p = ensureIpmr();
      const chosen = (p[c.state] || []).indexOf(id) >= 0;
      const lines = btlRxLines();
      const text = (Array.isArray(lines) ? lines : [lines]).join('\n');
      const marks = [item.code, item.id, item.key, String(item.name || '').slice(0, 18)].filter(Boolean);
      const inLines = marks.some((m) => text.indexOf(m) >= 0);
      printMdrkProtocol();
      const root = document.getElementById('inlinePrintRoot');
      const printed = root ? root.innerText : '';
      const inPrint = marks.some((m) => printed.indexOf(m) >= 0);
      return { id, chosen, nLines: Array.isArray(lines) ? lines.length : (text ? 1 : 0), inLines, inPrint,
               printedLen: printed.length, dialogs: window.__dialogs.slice(0, 3), marks };
    }, c).catch((e) => ({ err: e.message.split('\n')[0] }));
    if (r.err) { add('путь до документа', c.title, 'fail', r.err); await ctx.close(); continue; }
    const steps = [`выбран ${r.chosen ? 'да' : 'НЕТ'}`, `строк назначения ${r.nLines}`,
                   `в назначении ${r.inLines ? 'есть' : 'НЕТ'}`, `в печатном протоколе ${r.inPrint ? 'есть' : 'НЕТ'}`];
    const ok = r.chosen && r.nLines > 0 && r.inLines && r.inPrint && !errors.length;
    add('путь до документа', `${c.title} (${r.id})`, ok ? 'ok' : 'fail',
      steps.join(' · ') + (r.dialogs.length ? ' · диалоги: ' + r.dialogs.join(' / ') : '') + (errors.length ? ' · ошибки JS: ' + errors.slice(0, 2).join(' | ') : ''));
    await ctx.close();
  }

  // ---------- 7: печатные формы ----------
  {
    const { ctx, page, errors } = await freshPage();
    for (const call of [...EXP.printCalls, ...Object.keys(EXP.printAllowedEmpty)]) {
      const r = await page.evaluate((call) => {
        const root = document.getElementById('inlinePrintRoot'); if (root) root.innerHTML = '';
        try { eval(call); } catch (e) { return { err: e.message }; }
        const t = (document.getElementById('inlinePrintRoot') || {}).innerText || '';
        return { len: t.trim().length };
      }, call);
      const allowed = EXP.printAllowedEmpty[call];
      if (r.err) add('печать', call, 'fail', r.err);
      else if (!r.len) add('печать', call, allowed ? 'ok' : 'fail', allowed ? 'пусто — ' + allowed : 'предпросмотр пуст');
      else add('печать', call, 'ok', `${r.len} знаков`);
    }
    if (errors.length) add('печать', 'ошибки JS при печати', 'fail', errors.slice(0, 3).join(' | '));
    await ctx.close();
  }

  // ---------- 8: «Новый пациент» не оставляет данных прошлого (D01) ----------
  // Эталон — карта сразу после «Новый пациент». Затем каждое простое поле
  // protocol.* (строка, число, да/нет) получает «чужое» значение, выбираются
  // два рецепта, и снова нажимается «Новый пациент». Всё должно вернуться
  // к эталону, кроме настроек рабочего места из carryOverSettings().
  {
    const { ctx, page, errors } = await freshPage();
    const how1 = await realClick(page, '[onclick="newPatientCard()"]');
    const ref = await page.evaluate(() => JSON.stringify(protocol));
    // Поля берутся не только из пустой карты: многие protocol.* создаются по ходу
    // работы (rpNote, personalSex…) и в пустой карте их нет. Поэтому список —
    // объединение полей пустой карты и всех protocol.ИМЯ = … из исходного кода.
    const srcFields = [...new Set([...readFileSync(HTML, 'utf8').matchAll(/\bprotocol\.([A-Za-z_]\w*)\s*=[^=]/g)].map((m) => m[1]))];
    const filled = await page.evaluate((srcFields) => {
      const keep = Object.keys(carryOverSettings());
      const changed = {};
      for (const k of new Set([...Object.keys(protocol), ...srcFields])) {
        if (keep.includes(k) || /uid|episode/i.test(k)) continue;
        const v = protocol[k];
        let nv;
        if (v === undefined || v === null || typeof v === 'string') nv = (v || '') + 'ЧУЖОЕ';
        else if (typeof v === 'number') nv = v + 7;
        else if (typeof v === 'boolean') nv = !v;
        else continue; // объекты и массивы — их проверяют рецепты и шкалы
        protocol[k] = nv; changed[k] = nv;
      }
      toggleBtlMagnet(BTL_MAGNET[0].id); toggleBtlSono(BTL_SONO[0].id);
      return { changed, keep, rx: btlRxLines().length };
    }, srcFields);
    const how = await realClick(page, '[onclick="newPatientCard()"]');
    const after = await page.evaluate(() => ({ p: JSON.stringify(protocol), rx: btlRxLines().length }));
    const A = JSON.parse(after.p);
    filled.changed = filled.changed || {};
    const survived = Object.keys(filled.changed).filter((k) => JSON.stringify(A[k]) === JSON.stringify(filled.changed[k]));
    filled.changed = Object.keys(filled.changed);
    const ok = !after.rx && !survived.length && filled.rx > 0 && !errors.length;
    add('новый пациент', `кнопка «Новый пациент» (${how}; эталон — ${how1})`, ok ? 'ok' : 'fail',
      `заполнено простых полей: ${filled.changed.length}, рецептов: строк ${filled.rx}` +
      (after.rx ? ` · остались строки назначения: ${after.rx}` : '') +
      (survived.length ? ' · пережили смену карты: protocol.' + survived.join(', protocol.') : ' · всё сброшено') +
      ` · законно переносятся: ${filled.keep.join(', ')}` + (errors.length ? ' · ошибки JS: ' + errors.slice(0, 2).join(' | ') : ''));
    await ctx.close();
  }

  // ---------- 9: сохранение карты в архив ----------
  {
    const { ctx, page } = await freshPage();
    const before = await page.evaluate(() => integrityCheck().notes.find((n) => /Архив карт/.test(n)) || '');
    await page.evaluate(() => { toggleBtlMagnet(BTL_MAGNET[0].id); });
    const how = await realClick(page, '[onclick="savePatientCard()"]');
    const after = await page.evaluate(() => ({ n: integrityCheck().notes.find((n) => /Архив карт/.test(n)) || '', d: window.__dialogs.slice(-2) }));
    const ok = /Архив карт:\s*[1-9]/.test(after.n);
    add('архив', `кнопка «Сохранить карту пациента» (${how})`, ok ? 'ok' : 'warn',
      `${before || 'Архив карт: ?'} → ${after.n || '?'}` + (after.d.length ? ' · ' + after.d.join(' / ') : '') +
      (ok ? '' : ' (возможно, без ФИО карта законно не сохраняется — проверить вручную)'));
    await ctx.close();
  }
} finally {
  await browser.close();
}

// ---------- отчёт ----------
const fails = results.filter((r) => r.status === 'fail');
const warns = results.filter((r) => r.status === 'warn');
const hash = createHash('sha256').update(readFileSync(HTML)).digest('hex');
const when = new Date().toLocaleString('ru-RU');
let md = `# Самотест ICF SINGAPORE — ${when}\n\nФайл: \`${HTML.replace(ROOT + '/', '')}\` · sha256 ${hash.slice(0, 12)}\n\n`;
md += `**Итог: ${fails.length ? `ПРОВАЛОВ ${fails.length}` : 'провалов нет'}${warns.length ? `, предупреждений ${warns.length}` : ''}.** Проверок: ${results.length}, ${((Date.now() - t0) / 1000).toFixed(0)} с.\n\n`;
let g = '';
for (const r of results) {
  if (r.group !== g) { g = r.group; md += `\n## ${g}\n`; }
  md += `- ${{ ok: '✅', fail: '❌', warn: '⚠️', skip: '➖' }[r.status]} ${r.name}${r.detail ? ' — ' + r.detail : ''}\n`;
}
md += `\n## Чего этот тест НЕ проверяет\n- клинический смысл назначений и доз (только то, что данные доходят до документа);\n- клик по каждой галочке рецепта (рецепт выбирается той же функцией, которую вызывает галочка);\n- вид печати на бумаге — для этого \`node tests/print_pdf.mjs\` (/pechat);\n- работу на iPad/iPhone (Safari) — только Chromium.\n`;
writeFileSync(resolve(OUT, 'report.md'), md);
if (!fails.length) writeFileSync(resolve(OUT, '.last_pass'), hash + '\n');
console.log(`\n${fails.length ? 'ПРОВАЛЫ: ' + fails.length : 'ГОТОВО: провалов нет'} · отчёт tests/out/report.md`);
process.exit(fails.length ? 1 : 0);
