---
name: medfit-notebooklm
description: Работа с NotebookLM владелицы через установленную программу notebooklm — вопросы по источникам, подкасты, видеообзоры, отчёты, карточки и тесты на русском. Использовать, когда просят подкаст, видеообзор, разбор PDF или статьи, ответ «строго по источникам».
version: 1.0.0
author: Claude для владелицы
platforms: [macos]
metadata:
  hermes:
    tags: [NotebookLM, подкаст, видеообзор, источники]
    related_skills: [medfit-vault, medfit-telegram]
---

# NotebookLM

Программа установлена 02.11.2026: `notebooklm` (полный путь `/Users/sergeykozhevnikov/bin/notebooklm`, версия 0.8.6), вход в Google выполнен, подписка Pro, язык генерации — русский. Подробности — страница базы «Подключения — NotebookLM».

## Блокноты

- «Медфит — Вторая память» — зеркало итогов сессий; ID в `_система/notebooklm.md` в medfit-vault. Туда сам ничего не добавляй.
- «MedFitnes — подкасты» — подкасты и видео для канала.
- Для новых тем создавай отдельный блокнот: `notebooklm create "<название>" --json`.

## Основные команды

```bash
notebooklm list --json
notebooklm use <ID>
notebooklm source add "<URL или путь к файлу>"
notebooklm source add-drive-file <ID файла Google Диска>
notebooklm ask "<вопрос>"                       # ответ строго по источникам
notebooklm generate audio "<инструкция>" --language ru
notebooklm generate video "<инструкция>" --style classic --language ru
notebooklm generate report --format briefing-doc
notebooklm artifact list --json                   # статус генерации
notebooklm download audio ./podcast.mp3
notebooklm doctor                                 # диагностика
```

Подкаст генерируется 10–20 минут, видео 15–45 — не торопи и не урезай, жди `artifact wait`.

## Инструкции для генерации (по умолчанию)

«На русском. Пересказ своими словами, без цитат. Устаревшие цифры сверить с актуальными данными. Дружелюбно и практично, без медицинских назначений.»

## Разрешения

Сам: list, use, create, source add, ask, generate, download, artifact list/wait.
Только с «да» владелицы: удаление (delete, source delete), открытие блокнота для других (share), смена аккаунта.

## Если ошибка входа

Скажи владелице: нужно заново войти — `notebooklm login`, окно браузера откроется само. Пароль не вводи и не проси.
