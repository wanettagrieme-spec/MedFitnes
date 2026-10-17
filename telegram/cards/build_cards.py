#!/usr/bin/env python3
"""Сборка инфографических карточек месяца 2 в стиле утверждённой карточки A (Canva, 30.09.2026).

Вход: month2_texts.json (тексты), фото постов (photos/<KEY>.png), значок «МедФитнес» (logo_badge.png).
Выход: out/<KEY>.jpg 1080×1440.
Запуск: python3 build_cards.py <папка_с_фото> <node_modules> <выходная_папка> [KEY ...]
"""
import base64, json, sys
from pathlib import Path

import cv2
from PIL import Image
from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
PHOTOS, NM, OUT = map(Path, sys.argv[1:4])
ONLY = set(sys.argv[4:])
OUT.mkdir(parents=True, exist_ok=True)

ICONS = {
    "B": ["stethoscope", "person-standing", "dumbbell", "users"],
    "C": ["repeat", "clock-alert", "angry", "message-circle-off"],
    "D": ["spline", "arrow-up-from-line", "person-standing", "move-vertical"],
    "E": ["layout-grid", "refresh-cw", "timer", "rotate-ccw"],
    "F": ["briefcase", "calendar-check", "clock-alert", "chart-column"],
    "G": ["hand-metal", "activity", "move-vertical", "gauge"],
    "H": ["wind", "target", "hand-heart", "scale"],
    "I": ["heart-pulse", "dumbbell", "hand-heart", "apple"],
    "J": ["weight", "shield-plus", "users-round", "waves"],
    "K": ["tag", "bike", "heart-pulse", "settings-2"],
    "L": ["megaphone", "users", "target", "dumbbell"],
}
# цвета кружков — как в карточке A: бирюзовый, зелёный, коралловый, жёлтый
DOTS = ["#5cc8c6", "#5cbf72", "#f0705a", "#f2bf3b"]
BOX_W, BOX_H = 998, 504
CROP_TOP = {"C": 0, "H": 0, "J": 0}  # ручная проверка: у инструктора поднятые руки/голова у края кадра
LAYOUT_JS = """() => {
  const h = document.querySelector('h1'), list = document.querySelector('.list');
  let fs = 72;
  while (h.offsetHeight > 230 && fs > 50) { fs -= 2; h.style.fontSize = fs + 'px'; }
  const top = h.offsetTop + h.offsetHeight + 28;
  list.style.top = top + 'px';
  const rh = Math.floor((880 - top - 36) / 4);
  document.querySelectorAll('.row').forEach(r => r.style.height = rh + 'px');
  return [fs, top, rh];
}"""  # окно фото, как в карточке A


def b64(path, mime):
    return f"data:{mime};base64," + base64.b64encode(Path(path).read_bytes()).decode()


def crop_photo(src, dst, key=None):
    """Обрезка под окно 998×504 с запасом над самой высокой головой."""
    im = Image.open(src).convert("RGB")
    W, H = im.size
    ch = round(W * BOX_H / BOX_W)
    gray = cv2.cvtColor(cv2.imread(str(src)), cv2.COLOR_BGR2GRAY)
    faces = []
    for name in ("haarcascade_frontalface_default.xml", "haarcascade_profileface.xml"):
        det = cv2.CascadeClassifier(cv2.data.haarcascades + name)
        faces += list(det.detectMultiScale(gray, 1.1, 6, minSize=(W // 40, W // 40)))
    if faces:
        head_top = min(y - 0.6 * h for x, y, w, h in faces)  # макушка ≈ 0,6 высоты лица над рамкой лица
        top = max(0, min(H - ch, int(head_top - 0.06 * ch)))
    else:
        top = (H - ch) // 4
    if key in CROP_TOP:
        top = CROP_TOP[key]
    im.crop((0, top, W, top + ch)).resize((BOX_W * 2, BOX_H * 2), Image.LANCZOS).save(dst, quality=92)
    return len(faces), top


def icon_svg(name):
    s = (NM / "lucide-static/icons" / f"{name}.svg").read_text()
    return s.replace('stroke="currentColor"', 'stroke="#ffffff"').replace('width="24"', 'width="54"').replace('height="24"', 'height="54"')


CSS = """
%(ff)s
*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:1440px;font-family:OS;background:#fbfdfe;position:relative;overflow:hidden}
.c1{position:absolute;border-radius:50%%;background:#eef7f9}
.ring{position:absolute;border-radius:50%%;border:2px solid #bfe6e2}
.logo{position:absolute;left:50px;top:38px;width:428px}
.rub{position:absolute;right:58px;top:58px;height:72px;border-radius:36px;padding:0 30px 0 24px;
 display:flex;align-items:center;gap:14px;background:linear-gradient(90deg,#f7836a,#f9c64f);
 font-weight:600;font-size:20px;color:#2b4a42;box-shadow:0 4px 14px rgba(240,130,90,.18)}
.rub svg{width:32px;height:32px}
h1{position:absolute;left:122px;top:184px;width:860px;font-weight:700;font-size:%(fs)spx;line-height:.98;
 letter-spacing:-.02em;color:#003b31}
.list{position:absolute;left:124px;top:%(lt)spx;width:850px}
.line{position:absolute;left:19px;top:20px;bottom:20px;width:2px;background:#cfe7e3}
.row{position:relative;height:%(rh)spx;margin-bottom:12px;display:flex;align-items:center}
.dot{position:absolute;left:10px;width:22px;height:22px;border-radius:50%%}
.pill{position:absolute;left:52px;right:0;top:0;bottom:0;border-radius:18px;background:#eef6f8}
.ic{position:relative;margin-left:72px;width:88px;height:88px;border-radius:50%%;display:flex;align-items:center;justify-content:center}
.num{position:relative;margin-left:36px;width:44px;font-weight:600;font-size:40px;color:#27a89b}
.txt{position:relative;margin-left:8px;width:560px;font-size:%(ts)spx;line-height:1.15;color:#2b4a42}
.ph{position:absolute;left:41px;top:898px;width:998px;height:504px;object-fit:cover}
"""


def nbsp(t):
    import re
    return re.sub(r"(?<![\w-])(\d+|[а-яА-ЯёЁ]{1,2}) ", "\\1\u00a0", t)


def page(p, photo, fonts):
    title_len = len(p["title"])
    fs = 72 if title_len <= 52 else (64 if title_len <= 64 else 58)
    lines = 3 if title_len > 40 else 2
    title_h = fs * 0.98 * lines
    list_top = int(184 + title_h + 34)
    row_h = int((880 - list_top - 3 * 12) / 4)
    css = CSS % dict(ff=fonts, fs=fs, lt=list_top, rh=row_h, ts=29)
    folder = icon_svg("folder").replace("#ffffff", "#2b4a42")
    rows = "".join(
        f'<div class="row"><div class="dot" style="background:{DOTS[i]}"></div><div class="pill"></div>'
        f'<div class="ic" style="background:{DOTS[i]}">{icon_svg(ICONS[p["key"]][i])}</div>'
        f'<div class="num">{i+1}.</div><div class="txt">{pt}</div></div>'
        for i, pt in enumerate(p["points"]))
    return f"""<html><head><meta charset="utf-8"><style>{css}</style></head><body>
<div class="c1" style="width:300px;height:300px;left:-210px;top:260px"></div>
<div class="c1" style="width:260px;height:260px;right:-170px;top:420px"></div>
<div class="ring" style="width:330px;height:330px;right:-250px;top:340px"></div>
<div class="c1" style="width:380px;height:380px;left:-300px;top:820px"></div>
<img class="logo" src="{b64(HERE/'logo_badge.png','image/png')}">
<div class="rub">{folder}<span>Рубрика: {p['rubric']}</span></div>
<h1>{nbsp(p['title'])}</h1>
<div class="list"><div class="line"></div>{rows}</div>
<img class="ph" src="{b64(photo,'image/jpeg')}">
</body></html>"""


def main():
    posts = json.loads((HERE / "month2_texts.json").read_text(encoding="utf-8"))
    fdir = NM / "@fontsource/open-sans/files"
    fonts = "".join("@font-face{font-family:OS;font-weight:%d;src:url(%s)}" % (w, b64(fdir / f"open-sans-{sub}-{w}-normal.woff2", "font/woff2"))
                    for sub in ("latin", "cyrillic") for w in (400, 600, 700))
    with sync_playwright() as pw:
        br = pw.chromium.launch(executable_path="/opt/google/chrome/chrome", args=["--no-sandbox"])
        pg = br.new_page(viewport={"width": 1080, "height": 1440})
        for p in posts:
            if p["key"] == "A" or (ONLY and p["key"] not in ONLY):
                continue
            cropped = OUT / f"{p['key']}_photo.jpg"
            n, top = crop_photo(PHOTOS / f"{p['key']}.png", cropped, p["key"])
            pg.set_content(page(p, cropped, fonts))
            pg.wait_for_timeout(300)
            lay = pg.evaluate(LAYOUT_JS)
            png = OUT / f"{p['key']}.png"
            pg.screenshot(path=str(png))
            Image.open(png).convert("RGB").save(OUT / f"{p['key']}.jpg", quality=92)
            print(p["key"], "лиц:", n, "срез сверху:", top, "заголовок/список/строка:", lay)
        br.close()


main()
