"""Общие функции хуков ICF SINGAPORE.

Хуки не должны ломать работу: любая внутренняя ошибка — тихий выход 0.
Блокируют только намеренные проверки (код 2 или JSON с decision=block).
"""
import datetime
import hashlib
import json
import os
import subprocess
import sys

HOOKS = os.path.dirname(os.path.abspath(__file__))
ROOT = os.environ.get("CLAUDE_PROJECT_DIR") or os.path.dirname(os.path.dirname(HOOKS))
APP = os.path.join(ROOT, "app", "icf-singapore.html")
STATE_DIR = os.path.join(ROOT, ".claude", "state")
SESSION = os.path.join(STATE_DIR, "session.json")
LAST_PASS = os.path.join(ROOT, "tests", "out", ".last_pass")
VAULT_URL = "https://github.com/wanettagrieme-spec/medfit-vault"
TODAY = datetime.date.today().isoformat()


def read_input():
    try:
        return json.load(sys.stdin)
    except Exception:
        return {}


def run(cmd, cwd=None, timeout=30):
    try:
        return subprocess.run(cmd, cwd=cwd or ROOT, capture_output=True, text=True, timeout=timeout)
    except Exception as e:  # нет git, таймаут и т. п.
        class R:
            returncode, stdout, stderr = 1, "", str(e)
        return R()


def sha(path):
    try:
        h = hashlib.sha256()
        with open(path, "rb") as f:
            for chunk in iter(lambda: f.read(1 << 20), b""):
                h.update(chunk)
        return h.hexdigest()
    except OSError:
        return None


def load_json(path, default=None):
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default if default is not None else {}


def save_json(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)


def find_vault():
    """База medfit-vault: переменная MEDFIT_VAULT или обычные места рядом/в домашней папке."""
    home = os.path.expanduser("~")
    cands = [os.environ.get("MEDFIT_VAULT", "")]
    up = ROOT
    for _ in range(3):  # ../medfit-vault, ../../medfit-vault, ../../../medfit-vault
        up = os.path.dirname(up)
        cands.append(os.path.join(up, "medfit-vault"))
    cands += [os.path.join(home, p) for p in (
        "medfit-vault", "obsidian claude/medfit-vault", "Documents/medfit-vault",
        "Documents/GitHub/medfit-vault", "GitHub/medfit-vault")]
    for c in cands:
        if c and os.path.isfile(os.path.join(c, "_система", "finish.py")):
            return os.path.abspath(c)
    return None


def is_app(path):
    return bool(path) and os.path.abspath(path) == os.path.abspath(APP)
