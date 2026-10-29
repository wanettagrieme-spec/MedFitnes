#!/usr/bin/env python3
"""Stop: не закончить работу, пока она не доведена до правил владелицы.

Срабатывает, только если в этой сессии что-то менялось (рабочий файл,
коммиты, незакоммиченные правки). Тогда требует:
1. самотест прошёл ПОСЛЕ последней правки рабочего файла (/proverka);
2. всё закоммичено и отправлено в GitHub;
3. в базе medfit-vault есть сегодняшняя запись по проекту, и
   `python3 _система/finish.py` отвечает «ГОТОВО» (метод Карпаты).
Если Claude трижды подряд не смог закрыть пункты, хук отпускает его,
но показывает владелице, что именно осталось незакрытым.
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import (APP, LAST_PASS, ROOT, SESSION, STATE_DIR, TODAY, find_vault,
                     load_json, read_input, run, save_json, sha)

STRIKES = os.path.join(STATE_DIR, "stop_strikes.json")
MAX_STRIKES = 3


def main():
    read_input()  # stop_hook_active не используем: петлю ограничивает счётчик
    sess = load_json(SESSION)
    app_now = sha(APP)
    app_changed = bool(sess) and app_now != sess.get("app_sha")
    head_moved = bool(sess.get("head")) and run(["git", "rev-parse", "HEAD"]).stdout.strip() != sess.get("head")
    # Незакоммиченное считается работой этой сессии, только если оно изменилось
    # с её начала: чужие хвосты, бывшие до старта, не повод держать Claude.
    dirty_now = run(["git", "status", "--porcelain", "--", "."]).stdout.strip()
    dirty = bool(dirty_now) and (dirty_now != sess.get("dirty", "") or app_changed)
    if not (app_changed or head_moved or dirty):
        save_json(STRIKES, {"n": 0})
        return 0

    todo = []
    if app_changed:
        try:
            passed = open(LAST_PASS, encoding="utf-8").read().strip()
        except OSError:
            passed = ""
        if passed != app_now:
            todo.append("Рабочий файл изменён, а самотест после ПОСЛЕДНЕЙ правки не проходил: запусти /proverka "
                        "(node tests/selftest.mjs). Если пройти нельзя — честно скажи владелице, что не проверено и почему.")
    if dirty:
        todo.append("Есть незакоммиченные изменения этой сессии: git status, затем git add, git commit (по-русски), git pull --rebase, git push.")
    else:
        ahead = run(["git", "rev-list", "--count", "@{u}..HEAD"]).stdout.strip()
        if ahead not in ("", "0"):
            todo.append(f"Не отправлено в GitHub коммитов: {ahead} — git pull --rebase и git push.")

    vault = find_vault()
    if not vault:
        todo.append("База medfit-vault не найдена — склонируй её рядом с проектом и зафиксируй работу (/zapis).")
    else:
        log = open(os.path.join(vault, "log.md"), encoding="utf-8").read()
        today = "\n".join(re.findall(rf"^## \[{TODAY}\].*?(?=^## \[|\Z)", log, re.M | re.S))
        if not re.search(r"ICF SINGAPORE|МКФ", today):
            todo.append("В log.md базы нет сегодняшней записи по ICF SINGAPORE: /zapis — страница проекта («было → стало»), Журнал, log.md.")
        else:
            r = run(["python3", "_система/finish.py"], cwd=vault, timeout=120)
            if "ГОТОВО" not in r.stdout:
                todo.append("finish.py базы не ответил «ГОТОВО»:\n" + (r.stdout + r.stderr).strip()[:1500])

    if not todo:
        save_json(STRIKES, {"n": 0})
        return 0

    strikes = load_json(STRIKES).get("n", 0) + 1
    save_json(STRIKES, {"n": strikes})
    text = "Сессия не закрыта по правилам владелицы:\n- " + "\n- ".join(todo)
    if strikes > MAX_STRIKES:
        save_json(STRIKES, {"n": 0})
        print(json.dumps({"systemMessage": "⚠️ " + text + "\n(Claude не смог закрыть эти пункты сам.)"}, ensure_ascii=False))
        return 0
    print(json.dumps({"decision": "block", "reason": text}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as e:
        print(json.dumps({"systemMessage": f"Хук закрытия сессии упал ({e}) — проверь вручную: /zapis."}, ensure_ascii=False))
        sys.exit(0)
