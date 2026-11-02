---
name: medfit-save
description: Сохранение результатов работы по правилу владелицы «три места» — Google Диск, GitHub MedFitnes и база medfit-vault. Использовать после создания любого файла (видео, презентация, документ, картинка, текст поста) — без отдельной просьбы.
version: 1.0.0
author: Claude для владелицы
platforms: [macos, linux]
metadata:
  hermes:
    tags: [сохранение, Google Диск, GitHub, medfit-vault]
    related_skills: [medfit-vault, medfit-video, medfit-presentations, medfit-documents, medfit-images]
---

# Сохранение в три места

Правило владелицы (безусловно): всё созданное в работе сохраняется само, без просьбы.

1. **Google Диск** (на Mac — папка синхронизации):
   `/Users/sergeykozhevnikov/Library/CloudStorage/GoogleDrive-wanettagrieme@gmail.com/Мой диск/`
   Клади в папку проекта: Telegram — «Телеграм-каналы — материалы/Черновики»; ролики серии 2 — «Серия 2 МР/Ролик N — …»; прочее — папка проекта или «Hermes — результаты/ГГГГ-ММ-ДД». Сценарии и тексты — файлом .md или .docx.
2. **GitHub MedFitnes** — локально `~/GitHub/MedFitnes` (сначала `git pull --rebase`), в подходящую папку (telegram/, video/, docs/, hermes/results/). Коммит по-русски, автор «Hermes»: `git -c user.name="Hermes" -c user.email="hermes@local" commit -m "…"`, затем `git push`. Большие видео (больше 50 МБ) в GitHub не клади — только Диск и Mac, в коммите — ссылка/путь.
3. **База medfit-vault** — строка в log.md и Журнале с пометкой «(Hermes)»: что создано и где лежит (навык medfit-vault). Если появилось новое знание — заметка во «Входящие».
4. **Видео** — ещё в папку на Mac `~/Movies/Claude/` (серия 2 — `Серия 2 МР/Ролик N — …/`).

На сервере (без Диска и Mac): сохраняй в GitHub и пиши в базе, что копию на Диск нужно положить с Mac, — заданием в log.

Перед ответом «готово» проверь, что файл реально лежит во всех местах (ls / git log), и назови владелице пути.
