#!/usr/bin/env python3
"""Публикация постов канала @MedFitnes по расписанию.

Берёт из telegram/schedule/posts.json самый ранний пост со статусом "pending",
у которого дата уже наступила (по Москве), публикует его в канал и отмечает
"published". За один запуск — не больше одного поста, поэтому пропущенные дни
догоняются постепенно, а не пачкой.

Если у поста есть audio_file или video_file (путь от папки telegram/), после
карточки отдельным сообщением уходит аудио (название = заголовок поста) или
видео. Лимит бота — 50 МБ на файл: видео больше пережимается ffmpeg.
Пережать заранее, вручную: python publish.py shrink <видео.mp4>

Переменные окружения:
  TELEGRAM_BOT_TOKEN — токен бота (секрет репозитория, в коде не хранится)
  TELEGRAM_CHANNEL   — канал, по умолчанию @MedFitnes
  DRY_RUN=1          — только показать, что было бы опубликовано
  POST_ID            — опубликовать конкретный пост (для ручного запуска)
"""
import datetime as dt
import html
import json
import mimetypes
import os
import re
import shutil
import subprocess
import sys
import tempfile
import urllib.error
import urllib.request
import uuid
from pathlib import Path

TELEGRAM = Path(__file__).resolve().parents[1]
POSTS = TELEGRAM / "schedule" / "posts.json"
MSK = dt.timezone(dt.timedelta(hours=3))
CAPTION_LIMIT = 1024
FILE_LIMIT = 50 * 1024 * 1024  # лимит Bot API на загрузку файла
SHRINK_TARGET = 48 * 1024 * 1024  # с запасом на контейнер mp4


def api(token, method, data=None, files=None):
    url = f"https://api.telegram.org/bot{token}/{method}"
    if files:
        boundary = uuid.uuid4().hex
        body = b""
        for k, v in (data or {}).items():
            body += (f"--{boundary}\r\nContent-Disposition: form-data; name=\"{k}\"\r\n\r\n{v}\r\n").encode()
        for k, (name, content) in files.items():
            ctype = mimetypes.guess_type(name)[0] or "application/octet-stream"
            body += (f"--{boundary}\r\nContent-Disposition: form-data; name=\"{k}\"; filename=\"{name}\"\r\n"
                     f"Content-Type: {ctype}\r\n\r\n").encode() + content + b"\r\n"
        body += f"--{boundary}--\r\n".encode()
        req = urllib.request.Request(url, body, {"Content-Type": f"multipart/form-data; boundary={boundary}"})
    else:
        req = urllib.request.Request(url, json.dumps(data or {}).encode(), {"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=300 if files else 60) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        return json.loads(e.read() or b"{}") or {"ok": False, "description": str(e)}


def caption(post):
    text = f"<b>{html.escape(post['title'])}</b>\n\n{html.escape(post['body'].strip())}"
    if len(text) > CAPTION_LIMIT:
        sys.exit(f"Пост {post['id']}: подпись {len(text)} знаков, Telegram принимает до {CAPTION_LIMIT}. Сократите текст.")
    return text


def send(token, channel, post):
    data = {"chat_id": channel, "caption": caption(post), "parse_mode": "HTML"}
    local = post.get("photo_file") and (POSTS.parents[1] / post["photo_file"])
    if local and local.exists():
        return api(token, "sendPhoto", data, files={"photo": (local.name, local.read_bytes())})
    if post.get("photo_url"):
        res = api(token, "sendPhoto", {**data, "photo": post["photo_url"]})
        if res.get("ok"):
            return res
        print(f"Telegram не смог забрать картинку по ссылке ({res.get('description')}), загружаю файлом…")
        with urllib.request.urlopen(post["photo_url"], timeout=60) as r:
            img = r.read()
        return api(token, "sendPhoto", data, files={"photo": (f"post-{post['id']}.jpg", img)})
    return api(token, "sendMessage", {"chat_id": channel, "text": data["caption"], "parse_mode": "HTML"})


def media(post):
    """('audio' | 'video', путь) или None, если у поста нет вложения."""
    for kind in ("audio", "video"):
        if post.get(f"{kind}_file"):
            path = TELEGRAM / post[f"{kind}_file"]
            if not path.exists():
                sys.exit(f"Пост {post['id']}: нет файла {post[f'{kind}_file']}.")
            return kind, path
    return None


def mb(n):
    return f"{n / 1024 / 1024:.1f} МБ"


def duration(path):
    """Длительность в секундах из вывода ffmpeg (ffprobe не обязателен)."""
    err = subprocess.run(["ffmpeg", "-i", str(path)], capture_output=True, text=True).stderr
    m = re.search(r"Duration: (\d+):(\d+):([\d.]+)", err)
    if not m:
        sys.exit(f"{path.name}: ffmpeg не определил длительность.")
    h, mnt, s = m.groups()
    return int(h) * 3600 + int(mnt) * 60 + float(s)


def shrink_video(path, dest):
    """Пережать видео под лимит бота: H.264 в два прохода с битрейтом, рассчитанным
    под 48 МБ. Разрешение не меняется; звук — AAC 128 кбит/с."""
    if not shutil.which("ffmpeg"):
        sys.exit("Видео больше 50 МБ, а ffmpeg не найден — пережать нечем.")
    audio_kbps = 128
    video_kbps = int(SHRINK_TARGET * 8 / duration(path) / 1000) - audio_kbps
    if video_kbps < 300:
        sys.exit(f"{path.name}: слишком длинное для 50 МБ без заметной потери качества ({video_kbps} кбит/с).")
    common = ["ffmpeg", "-y", "-v", "error", "-i", str(path), "-c:v", "libx264", "-preset", "slow",
              "-b:v", f"{video_kbps}k", "-maxrate", f"{int(video_kbps * 1.5)}k", "-bufsize", f"{video_kbps * 2}k",
              "-pix_fmt", "yuv420p"]
    with tempfile.TemporaryDirectory() as tmp:
        log = str(Path(tmp) / "pass")
        subprocess.run(common + ["-pass", "1", "-passlogfile", log, "-an", "-f", "mp4", os.devnull], check=True)
        subprocess.run(common + ["-pass", "2", "-passlogfile", log, "-c:a", "aac", "-b:a", f"{audio_kbps}k",
                                 "-movflags", "+faststart", str(dest)], check=True)
    if dest.stat().st_size > FILE_LIMIT:
        sys.exit(f"{path.name}: после сжатия {mb(dest.stat().st_size)} — всё ещё больше 50 МБ.")
    print(f"Видео пережато: {mb(path.stat().st_size)} → {mb(dest.stat().st_size)} ({video_kbps} кбит/с).")
    return dest


def send_media(token, channel, post, kind, path):
    if kind == "audio":
        if path.stat().st_size > FILE_LIMIT:
            sys.exit(f"Пост {post['id']}: аудио {mb(path.stat().st_size)} — больше 50 МБ.")
        return api(token, "sendAudio", {"chat_id": channel, "title": post["title"]},
                   files={"audio": (path.name, path.read_bytes())})
    with tempfile.TemporaryDirectory() as tmp:
        if path.stat().st_size > FILE_LIMIT:
            path = shrink_video(path, Path(tmp) / path.name)
        return api(token, "sendVideo", {"chat_id": channel, "supports_streaming": "true"},
                   files={"video": (path.name, path.read_bytes())})


def check():
    """Проверка без публикации: ключ рабочий, бот — админ канала с правом постить."""
    token = os.environ.get("TELEGRAM_BOT_TOKEN")
    if not token:
        sys.exit("Нет секрета TELEGRAM_BOT_TOKEN.")
    channel = os.environ.get("TELEGRAM_CHANNEL") or "@MedFitnes"
    me = api(token, "getMe")
    if not me.get("ok"):
        sys.exit(f"Ключ бота не принят Telegram: {me.get('description')}")
    bot = me["result"]
    print(f"Бот: @{bot.get('username')}")
    m = api(token, "getChatMember", {"chat_id": channel, "user_id": bot["id"]})
    if not m.get("ok"):
        sys.exit(f"Бот не видит канал {channel}: {m.get('description')}")
    st = m["result"]
    if st.get("status") == "creator" or (st.get("status") == "administrator" and st.get("can_post_messages")):
        print(f"Бот — администратор {channel} с правом публикации. Всё готово.")
    else:
        sys.exit(f"Бот в {channel} со статусом «{st.get('status')}» без права публикации — сделайте его администратором.")


def main():
    if sys.argv[1:2] == ["shrink"]:
        src = Path(sys.argv[2])
        if src.stat().st_size <= FILE_LIMIT:
            return print(f"{src.name}: {mb(src.stat().st_size)} — в лимите, сжимать не нужно.")
        dest = src.with_name(src.stem + "-tg" + src.suffix)
        return shrink_video(src, dest)
    if os.environ.get("CHECK_ONLY") == "1":
        return check()
    posts = json.loads(POSTS.read_text(encoding="utf-8"))
    now = dt.datetime.now(MSK)
    today = now.date().isoformat()
    want = os.environ.get("POST_ID", "").strip()
    if want:
        queue = [p for p in posts if str(p["id"]) == want and p["status"] == "pending"]
    else:
        queue = sorted((p for p in posts if p["status"] == "pending" and p["date"] <= today),
                       key=lambda p: (p["date"], p["id"]))
    left = sum(p["status"] == "pending" for p in posts)
    if not queue:
        print(f"{today}: публиковать нечего. В очереди {left} пост(ов).")
        return
    post = queue[0]
    attached = media(post)
    print(f"К публикации: №{post['id']} ({post['date']}) «{post['title']}»")
    if attached:
        kind, path = attached
        size = path.stat().st_size
        note = "больше 50 МБ — будет пережато ffmpeg" if kind == "video" and size > FILE_LIMIT else \
            "больше 50 МБ — Telegram не примет" if size > FILE_LIMIT else "в лимите"
        print(f"После карточки: {'аудио' if kind == 'audio' else 'видео'} {path.relative_to(TELEGRAM)}, {mb(size)} ({note})")
    if os.environ.get("DRY_RUN") == "1":
        print("Пробный запуск — в канал ничего не отправлено.\n---\n" + caption(post))
        return
    token = os.environ.get("TELEGRAM_BOT_TOKEN")
    if not token:
        sys.exit("Нет секрета TELEGRAM_BOT_TOKEN — добавьте его в Settings → Secrets and variables → Actions.")
    channel = os.environ.get("TELEGRAM_CHANNEL") or "@MedFitnes"
    res = send(token, channel, post)
    if not res.get("ok"):
        sys.exit(f"Telegram отказал: {res.get('description')}")
    post["status"] = "published"
    post["published_at"] = now.isoformat(timespec="minutes")
    post["message_id"] = res["result"]["message_id"]
    # Карточка уже в канале — отмечаем сразу, чтобы при сбое вложения она не ушла повторно.
    POSTS.write_text(json.dumps(posts, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Опубликовано: https://t.me/{channel.lstrip('@')}/{post['message_id']}")
    if attached:
        res = send_media(token, channel, post, *attached)
        if not res.get("ok"):
            post["media_error"] = res.get("description")
            POSTS.write_text(json.dumps(posts, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            sys.exit(f"Карточка вышла, но Telegram не принял вложение: {res.get('description')}. "
                     f"Отправьте его вручную ответом на https://t.me/{channel.lstrip('@')}/{post['message_id']}")
        post["media_message_id"] = res["result"]["message_id"]
        POSTS.write_text(json.dumps(posts, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"Вложение: https://t.me/{channel.lstrip('@')}/{post['media_message_id']}")


if __name__ == "__main__":
    main()
