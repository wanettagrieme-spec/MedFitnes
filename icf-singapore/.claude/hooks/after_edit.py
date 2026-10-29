#!/usr/bin/env python3
"""PostToolUse после Edit/Write рабочего HTML.

Блокирующие проверки (Claude видит ошибку и обязан исправить):
- синтаксис каждого встроенного <script> через `node --check`
  (номер строки пересчитывается в строку HTML);
- файл не «похудел» больше чем на 10 % от начала сессии (признак обрезки).
Напоминания (не блокируют): три места печати, путь данных до документа,
фабрика пустой карты, ключ хранилища.
"""
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import APP, SESSION, is_app, load_json, read_input

SCRIPT_RE = re.compile(r"<script\b([^>]*)>(.*?)</script\s*>", re.S | re.I)
SKIP_TYPES = ("json", "template", "x-tmpl", "text/plain", "importmap")


def check_scripts(html):
    node = shutil.which("node")
    if not node:
        return None, "node не установлен — синтаксис JS не проверен (установи Node.js: tests/setup.sh)."
    errors = []
    with tempfile.TemporaryDirectory() as tmp:
        for i, m in enumerate(SCRIPT_RE.finditer(html)):
            attrs, body = m.group(1), m.group(2)
            if "src=" in attrs.lower() or any(t in attrs.lower() for t in SKIP_TYPES) or not body.strip():
                continue
            ext = ".mjs" if "module" in attrs.lower() else ".js"
            f = os.path.join(tmp, f"s{i}{ext}")
            with open(f, "w", encoding="utf-8") as fh:
                fh.write(body)
            r = subprocess.run([node, "--check", f], capture_output=True, text=True, timeout=120)
            if r.returncode != 0:
                start_line = html.count("\n", 0, m.start(2))  # строк до начала тела скрипта
                msg = r.stderr.replace(f, f"<script №{i + 1}>")
                lm = re.search(r":(\d+)\n", r.stderr)
                where = f" (≈ строка {start_line + int(lm.group(1))} в HTML)" if lm else ""
                errors.append(f"Синтаксическая ошибка в <script №{i + 1}>{where}:\n" + msg.strip()[:1500])
    return errors, None


def touched_text(ti):
    parts = [ti.get("old_string", ""), ti.get("new_string", ""), ti.get("content", "")[:20000]]
    for e in ti.get("edits") or []:
        parts += [e.get("old_string", ""), e.get("new_string", "")]
    return "\n".join(p for p in parts if p)


def reminders(t):
    out = []
    if re.search(r"@media\s+print|inlinePrintRoot|standalonePrintCss|\.g-(table|cell|print)|print-root|@page", t):
        out.append("Правка затронула печать: она должна быть во всех трёх местах — #inlinePrintRoot, @media print, standalonePrintCss() (с префиксом .print-root). Докажи PDF-прогоном (/pechat).")
    if re.search(r"\bBTL_[A-Z_]+|btlRxLines|ftHas|Html\s*=|toggleBtl|allElectro", t):
        out.append("Правка затронула каталоги/назначения: проверь путь данных до интерфейса, строки назначения и печати настоящим кликом (/proverka) — класс дефектов v2_256/257.")
    if re.search(r"protocol\.\w+\s*=", t) and not re.search(r"freshProtocol|freshFunctional|freshRows|resetCaseState", t):
        out.append("Появилось/изменилось поле protocol.*: убедись, что оно есть в фабрике пустой карты (freshProtocol/resetCaseState), иначе переживёт «Новый пациент» (D01).")
    if "icfModule_v2_34" in t:
        out.append("Задет ключ хранилища icfModule_v2_34 — его менять НЕЛЬЗЯ (пропадут сохранённые карты).")
    if re.search(r"#[0-9a-fA-F]{6}|rgb\(", t):
        out.append("Изменены цвета: проверь обе темы (светлая/тёмная) и ч/б печать.")
    return out


def main():
    inp = read_input()
    ti = inp.get("tool_input") or {}
    if not is_app(ti.get("file_path")) or not os.path.isfile(APP):
        return 0

    html = open(APP, encoding="utf-8", errors="replace").read()
    problems = []

    start = load_json(SESSION).get("app_size") or 0
    now = os.path.getsize(APP)
    if start and now < start * 0.9:
        problems.append(f"Файл уменьшился с {start / 1e6:.2f} до {now / 1e6:.2f} МБ (−{100 - now * 100 // start}%). "
                        "Похоже на обрезку. Проверь git diff --stat и при необходимости git checkout -- app/icf-singapore.html.")

    errs, warn = check_scripts(html)
    if errs:
        problems += errs

    if problems:
        print("\n\n".join(problems), file=sys.stderr)
        return 2

    notes = reminders(touched_text(ti))
    if warn:
        notes.insert(0, warn)
    notes.insert(0, "Синтаксис встроенного JS в порядке (node --check)." if errs is not None else "")
    notes = [n for n in notes if n]
    if notes:
        print(json.dumps({"hookSpecificOutput": {"hookEventName": "PostToolUse",
                                                 "additionalContext": "\n".join(notes)}}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except SystemExit:
        raise
    except Exception as e:
        print(f"(хук после правки: внутренняя ошибка {e} — проверь синтаксис вручную: /proverka)", file=sys.stderr)
        sys.exit(1)  # не блокирует, но видно
