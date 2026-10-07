#!/usr/bin/env python3
"""Один раз скачивает картинки неопубликованных постов в telegram/images/
и прописывает в posts.json поле photo_file — чтобы публикация не зависела от Gamma."""
import json, urllib.request
from pathlib import Path
root = Path(__file__).resolve().parents[1]
posts_path = root / "schedule" / "posts.json"
posts = json.loads(posts_path.read_text(encoding="utf-8"))
imgdir = root / "images"; imgdir.mkdir(exist_ok=True)
ok = 0
for p in posts:
    if p["status"] != "pending" or not p.get("photo_url"):
        continue
    dst = imgdir / f"post-{p['id']:02d}.jpg"
    if not dst.exists():
        req = urllib.request.Request(p["photo_url"], headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=60) as r:
            data = r.read()
        if len(data) < 5000 or data[:3] != b"\xff\xd8\xff" and data[:8] != b"\x89PNG\r\n\x1a\n":
            raise SystemExit(f"Пост {p['id']}: получен не файл картинки ({len(data)} байт)")
        dst.write_bytes(data)
    p["photo_file"] = f"images/{dst.name}"
    ok += 1
    print(f"Пост {p['id']}: {dst.name} ({dst.stat().st_size // 1024} КБ)")
posts_path.write_text(json.dumps(posts, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Готово: {ok} картинок")
