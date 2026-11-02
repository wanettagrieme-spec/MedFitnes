---
name: notebooklm-setup
description: Установка и проверка интеграции Claude ↔ NotebookLM на компьютере пользователя (Claude Code и Claude Desktop). Запускать, когда пользователь просит «установи NotebookLM», «подключи NotebookLM», «почини NotebookLM» или когда команда notebooklm не найдена / не авторизована.
---

# Установка интеграции NotebookLM

Основа — неофициальный пакет `notebooklm-py` (проверено на v0.8.6, ноябрь 2026).
Устанавливается ТОЛЬКО локально, на компьютере пользователя. Сессия Google
хранится только там: `~/.notebooklm/profiles/default/storage_state.json`.

## Жёсткие правила безопасности

- НИКОГДА не вставлять куки / storage_state.json / токены в тексты скилов,
  в чат, в GitHub, на Google Диск или в medfit-vault. Это ключ от всего
  Google-аккаунта. Раздел «Add to Co-work» из исходного скила из видео — не использовать.
- `~/.notebooklm/` не синхронизировать и не коммитить.
- Пароль Google Claude не вводит: вход пользователь делает сам в окне браузера.

## Шаг 1. Python 3.10+ и пакет

```bash
PY=$(command -v python3.12 || command -v python3.11 || command -v python3.10 || command -v python3)
$PY -c "import sys; assert sys.version_info >= (3,10), sys.version"
# macOS со старым Python: brew install python@3.12
$PY -m venv ~/.notebooklm-venv
~/.notebooklm-venv/bin/pip install -U "notebooklm-py[browser]"
~/.notebooklm-venv/bin/playwright install chromium
mkdir -p ~/bin && ln -sf ~/.notebooklm-venv/bin/notebooklm ~/bin/notebooklm
grep -q 'HOME/bin' ~/.zshrc 2>/dev/null || echo 'export PATH="$HOME/bin:$PATH"' >> ~/.zshrc
export PATH="$HOME/bin:$PATH"
notebooklm --version
```

## Шаг 2. Вход в Google (делает пользователь)

Сказать пользователю: «Сейчас откроется окно браузера — войдите в свой Google-аккаунт
и откройте notebooklm.google.com. Сессия сохранится сама».

```bash
notebooklm login                 # окно закроется само после входа (до 5 минут)
# если встроенный Chromium падает (macOS 15+):
notebooklm login --browser chrome
notebooklm auth check && notebooklm list
```

## Шаг 3. Скил и MCP-сервер

```bash
notebooklm skill install --target claude      # официальный скил пакета → ~/.claude/skills
notebooklm mcp install claude-code            # MCP-сервер в Claude Code
notebooklm mcp install claude-desktop         # MCP-сервер в Claude Desktop (нужен uv: brew install uv)
```
После этого перезапустить Claude Desktop.

## Шаг 4. Русский язык

```bash
notebooklm language set ru    # глобально: подкасты, видео, слайды, тесты — на русском
notebooklm language get
```

## Шаг 5. Блокнот «вторая память» (зеркало medfit-vault)

```bash
notebooklm list --json        # искать «Медфит — Вторая память»
# если нет:
notebooklm create "Медфит — Вторая память" --json
```
ID блокнота записать в medfit-vault: `_система/notebooklm.md` (только ID и название,
НИКАКИХ кук). Скил `wrapup-medfit` читает ID оттуда.

## Шаг 6. Проверка

```bash
notebooklm use <ID>
notebooklm source add "Проверка интеграции NotebookLM" --type text --title "test"
notebooklm ask "Что в источнике test?"
```
Потом удалить тестовый источник (с подтверждения пользователя).

## Подписка

У пользователя NotebookLM Pro: повышенные лимиты на блокноты, источники и генерации.
При ошибке лимита — подождать и повторить (`--retry N`), не урезать задачу.
Проверить остаток: `notebooklm usage`.

## Обслуживание

- Сессия истекла (ошибка auth/cookie) → `notebooklm login`, пользователь входит заново.
- Обновить пакет → `~/.notebooklm-venv/bin/pip install -U "notebooklm-py[browser]"`, затем снова
  `notebooklm skill install --target claude`.
- `notebooklm doctor` — диагностика.

## Разрешения (что Claude делает сам, что спрашивает)

Сам, без вопросов: list, status, use, create, source add / list / wait, ask, history,
summary, language, generate *, download * (в папку проекта), artifact list / wait,
research.
Спрашивает: любое удаление (delete, source delete, artifact delete, note delete),
share / public (публикация блокнота), смена Google-аккаунта.
