#!/usr/bin/env python3
"""SessionStart: старт по методу Карпаты без ручных шагов.

1. Находит базу medfit-vault и подтягивает её (git pull --rebase).
2. Кладёт в контекст: где база, последние 10 записей log.md, раздел «ДАЛЬШЕ»
   страницы проекта, текущую версию программы и состояние git.
3. Запоминает отпечаток рабочего файла — по нему хук остановки видит,
   была ли правка в этой сессии.
Всё, что печатается в stdout, Claude видит в начале разговора.
"""
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import (APP, ROOT, SESSION, TODAY, VAULT_URL, find_vault, load_json,
                     read_input, run, save_json, sha)

PAGE = os.path.join("Вики", "Проекты", "ICF SINGAPORE — протокол.md")


def section(text, title):
    m = re.search(r"^## " + re.escape(title) + r".*?$(.*?)(?=^## |\Z)", text, re.M | re.S)
    return m.group(1).strip() if m else ""


def main():
    inp = read_input()
    out = ["# Старт сессии ICF SINGAPORE (хук)"]

    # --- база знаний ---
    vault = find_vault()
    if vault:
        r = run(["git", "pull", "--rebase", "-q"], cwd=vault, timeout=25)
        pulled = "подтянута из GitHub" if r.returncode == 0 else "НЕ подтянута (" + (r.stderr.strip()[:120] or "ошибка git") + ") — работать с локальной копией и сказать владелице"
        out.append(f"База medfit-vault: `{vault}` — {pulled}.")
        out.append("По правилам базы прочитай её CLAUDE.md и index.md (по нужным разделам), прежде чем отвечать по существу.")
        try:
            log = open(os.path.join(vault, "log.md"), encoding="utf-8").read()
            heads = re.findall(r"^## \[.*$", log, re.M)[-10:]
            out.append("\nПоследние 10 записей log.md:\n" + "\n".join(heads))
        except OSError:
            pass
        try:
            page = open(os.path.join(vault, PAGE), encoding="utf-8").read()
            nxt = section(page, "ДАЛЬШЕ")
            if nxt:
                out.append("\nСтраница проекта, раздел «ДАЛЬШЕ»:\n" + nxt[:2500])
        except OSError:
            out.append(f"\nСтраница проекта `{PAGE}` в базе не найдена — сообщить владелице.")
    else:
        out.append("База medfit-vault на этом компьютере НЕ найдена. Первым делом склонируй её рядом с проектом: "
                   f"`git clone {VAULT_URL} \"$(dirname \"$CLAUDE_PROJECT_DIR\")/medfit-vault\"` "
                   "(или укажи путь в переменной MEDFIT_VAULT), затем прочитай её CLAUDE.md, index.md и последние записи log.md.")

    # --- рабочий файл ---
    if os.path.isfile(APP):
        size = os.path.getsize(APP) / 1e6
        text = open(APP, encoding="utf-8", errors="ignore").read()
        ver = {k: re.search(k + r"\s*=\s*['\"]([^'\"]+)", text) for k in ("APP_VERSION", "DATA_SCHEMA", "RULES_VERSION")}
        vs = " · ".join(f"{k} {m.group(1)}" for k, m in ver.items() if m) or "версии в файле не найдены"
        out.append(f"\nРабочий файл: app/icf-singapore.html, {size:.1f} МБ — {vs}.")
    else:
        out.append("\nРабочего файла app/icf-singapore.html нет. Попроси владелицу прислать актуальную версию (zip в чат — проверенный путь для больших файлов).")

    st = run(["git", "status", "--short", "--", "."]).stdout.strip()
    if st:
        out.append("Незакоммиченные изменения в проекте:\n" + st[:800])
    tags = run(["git", "tag", "--list", "icf-*", "--sort=-creatordate"]).stdout.split()
    if tags:
        out.append(f"Последняя выпущенная версия (git-метка): {tags[0]}")

    # --- отпечаток для хука остановки ---
    prev = load_json(SESSION)
    if inp.get("source") in ("resume", "compact") and prev.get("date") == TODAY:
        pass  # продолжение той же сессии — точку отсчёта не сдвигаем
    else:
        save_json(SESSION, {"date": TODAY, "app_sha": sha(APP),
                            "app_size": os.path.getsize(APP) if os.path.isfile(APP) else 0,
                            "head": run(["git", "rev-parse", "HEAD"]).stdout.strip(),
                            "dirty": run(["git", "status", "--porcelain", "--", "."]).stdout.strip()})

    out.append("\nПорядок работы: изучить → подтвердить понимание → ждать явного сигнала → править (только Edit) → /proverka → честный отчёт → /zapis.")
    print("\n".join(out))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as e:  # хук старта никогда не мешает начать работу
        print(f"(хук старта: внутренняя ошибка {e}; продолжай, но прочитай базу вручную)")
        sys.exit(0)
