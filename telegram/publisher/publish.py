#!/usr/bin/env python3
"""Публикация постов канала @MedFitnes по расписанию.

Берёт из telegram/schedule/posts.json самый ранний пост со статусом "pending",
у которого дата уже наступила (по Москве), публикует его в канал и отмечает
"published". За один запуск — не больше одного поста, поэтому пропущенные дни
догоняются постепенно, а не пачкой.

Переменные окружения:
  TELEGRAM_BOT_TOKEN — токен бота (секрет репозитория, в коде не хранится)
  TELEGRAM_CHANNEL   — канал, по умолчанию @MedFitnes
  DRY_RUN=1          — только показать, что было бы опубликовано
  POST_ID            — опубликовать конкретный пост (для ручного запуска)
"""
import datetime as dt
import html
import json
import os
import sys
import urllib.error
import urllib.request
import uuid
from pathlib import Path

POSTS = Path(__file__).resolve().parents[1] / "schedule" / "posts.json"
MSK = dt.timezone(dt.timedelta(hours=3))
CAPTION_LIMIT = 1024


def api(token, method, data=None, files=None):
    url = f"https://api.telegram.org/bot{token}/{method}"
    if files:
        boundary = uuid.uuid4().hex
        body = b""
        for k, v in (data or {}).items():
            body += (f"--{boundary}\r\nContent-Disposition: form-data; name=\"{k}\"\r\n\r\n{v}\r\n").encode()
        for k, (name, content) in files.items():
            body += (f"--{boundary}\r\nContent-Disposition: form-data; name=\"{k}\"; filename=\"{name}\"\r\n"
                     "Content-Type: image/jpeg\r\n\r\n").encode() + content + b"\r\n"
        body += f"--{boundary}--\r\n".encode()
        req = urllib.request.Request(url, body, {"Content-Type": f"multipart/form-data; boundary={boundary}"})
    else:
        req = urllib.request.Request(url, json.dumps(data or {}).encode(), {"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
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
    print(f"К публикации: №{post['id']} ({post['date']}) «{post['title']}»")
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
    POSTS.write_text(json.dumps(posts, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Опубликовано: https://t.me/{channel.lstrip('@')}/{post['message_id']}")


if __name__ == "__main__":
    main()
