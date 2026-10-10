# MedFitnes

Рабочие материалы Telegram-канала @MedFitnes.

- `telegram/cards/` — карточки постов
- `telegram/schedule/posts.json` — расписание постов (дата, текст, картинка, статус `pending` / `published`)
- `telegram/publisher/publish.py` + `.github/workflows/telegram-publish.yml` — автопубликация

## Автопубликация в @MedFitnes
Каждый день в 09:45 по Москве GitHub запускает публикацию: берёт самый ранний пост со статусом
`pending`, дата которого наступила, отправляет его в канал (картинка + подпись) и ставит `published`.
За день — не больше одного поста, пропущенные догоняются по одному.

- Нужен секрет репозитория `TELEGRAM_BOT_TOKEN` (Settings → Secrets and variables → Actions); бот — администратор канала с правом публикации.
- Ручной запуск: Actions → «Публикация в Telegram» → Run workflow (по умолчанию пробный, без отправки).
- Новый пост — добавить запись в `posts.json` со статусом `pending`.

## Видео: серия о медицинской реабилитации
- `video/rehab-series/intro/` — заставка 10 с «Медицинская реабилитация»: без звука, с синтезированной музыкой, с треком Mixkit «Digital Clouds» (лицензия — `MUSIC_CREDITS.txt`); исходник анимации `rehab_intro.html`, `tools/render.mjs` (HTML → MP4) и `tools/music.mjs` (синтез саундтрека).
- `video/rehab-series/studio/` — рабочий проект серии на Remotion + Whisper (установка — в его README).
