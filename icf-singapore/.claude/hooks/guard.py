#!/usr/bin/env python3
"""PreToolUse: запреты, которые нельзя оставлять на усмотрение.

- Write поверх рабочего HTML: полная перезапись ~18,6 МБ из контекста обрезает файл.
  Создать файл впервые можно, переписать существующий — нет; только Edit.
- Удаление или затирание рабочего файла из командной строки.
- Принудительная отправка в GitHub (git push --force) — затирает чужие коммиты.
"""
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _common import APP, is_app, read_input


def deny(reason):
    print(json.dumps({"hookSpecificOutput": {
        "hookEventName": "PreToolUse",
        "permissionDecision": "deny",
        "permissionDecisionReason": reason}}, ensure_ascii=False))
    sys.exit(0)


def main():
    inp = read_input()
    tool, ti = inp.get("tool_name", ""), inp.get("tool_input") or {}

    if tool == "Write" and is_app(ti.get("file_path")) and os.path.exists(APP):
        deny("Рабочий файл app/icf-singapore.html нельзя переписывать целиком (Write): это ~18,6 МБ, "
             "перезапись из контекста обрезает файл. Делай точечные правки инструментом Edit; "
             "новую версию от владелицы клади командой cp/unzip в Bash.")

    if tool == "Bash":
        cmd = ti.get("command", "")
        if re.search(r"git\s+push\b[^|;&]*(--force\b|-f\b|--force-with-lease)", cmd):
            deny("Принудительная отправка в GitHub запрещена: она затирает чужие коммиты (с базой работает и Perplexity). "
                 "Сделай git pull --rebase и обычный git push.")
        if "icf-singapore.html" in cmd and re.search(r"(^|[;&|]\s*)(rm|truncate|shred)\b|>\s*\S*icf-singapore\.html", cmd):
            deny("Команда удаляет или затирает рабочий файл app/icf-singapore.html. Если нужно заменить его новой версией "
                 "от владелицы — сначала git commit текущего, затем cp новой версии поверх (это видно в git diff).")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except SystemExit:
        raise
    except Exception:
        sys.exit(0)
