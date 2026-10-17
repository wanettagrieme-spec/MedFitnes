#!/usr/bin/env python3
"""Ролик 6 (зоны: плашка-заголовок сверху, субтитры 9:16 — y 1470–1620, 16:9 — y 880–1000; подписи кадров их не задевают): готовые кадры сцен 4, 5 и 8 с подписями (HTML → PNG через Chrome).

Сцена 4 — значки категорий МКФ из сгенерированного кадра + подписи.
Сцена 5 — фото команды + три кода МКФ с расшифровкой (владелица 17.10.2026: коды показывать;
           b730, d450, e310 сверены по классификации).
Сцена 8 — четыре равные карточки вариантов потенциала (без «лестницы» — чтобы не было
           ранжирования «выше/ниже», владелица отвергла градацию «высокий/низкий»).
Запуск: python3 compose.py <node_modules>  (lucide-static для иконок)
Пишет: img/v4c.png, img/h4c.png, img/v5c.png, img/h5c.png, img/v8c.png, img/h8c.png
"""
import base64, sys
from pathlib import Path
from PIL import Image
from playwright.sync_api import sync_playwright

HERE = Path(__file__).resolve().parent
IMG = HERE / "img"
NM = Path(sys.argv[1])
SIZE = {"v": (1080, 1920), "h": (1920, 1080)}
DARK, TEAL = "#003b31", "#27a89b"


def uri(p, mime="image/png"):
    return f"data:{mime};base64," + base64.b64encode(Path(p).read_bytes()).decode()


def icon(name, color="#ffffff", size=64):
    s = (NM / "lucide-static/icons" / f"{name}.svg").read_text()
    return (s.replace('stroke="currentColor"', f'stroke="{color}"')
             .replace('width="24"', f'width="{size}"').replace('height="24"', f'height="{size}"'))


BASE_CSS = """*{margin:0;padding:0;box-sizing:border-box}
body{width:%dpx;height:%dpx;overflow:hidden;font-family:Inter,sans-serif;position:relative;background:#f7faf9}"""

# ---- сцена 4: значки из кадра + подписи ----
BOX4 = {"v": [(236, 51 + k, 281, 283) for k in (0, 313, 633, 951)],
        "h": [(33, 206, 305, 304), (359, 207, 302, 302), (682, 206, 305, 304), (1009, 206, 305, 303)]}
LAB4 = ["Функции организма", "Структуры тела", "Активность и участие", "Факторы среды"]


def scene4(o):
    W, H = SIZE[o]
    src = Image.open(IMG / f"{o}4.png").convert("RGB")
    crops = []
    for i, (x, y, w, h) in enumerate(BOX4[o]):
        p = IMG / f"_ic{o}{i}.png"
        src.crop((x - 6, y - 6, x + w + 6, y + h + 6)).save(p)
        crops.append(uri(p))
    if o == "v":
        items = "".join(
            f'<div style="position:absolute;left:110px;top:{300 + i * 285}px;display:flex;align-items:center;gap:44px">'
            f'<img src="{c}" style="width:270px;height:270px"><div style="font-size:58px;font-weight:700;color:{DARK};width:520px;line-height:1.1">{l}</div></div>'
            for i, (c, l) in enumerate(zip(crops, LAB4)))
    else:
        items = "".join(
            f'<div style="position:absolute;left:{170 + i * 420}px;top:290px;width:340px;text-align:center">'
            f'<img src="{c}" style="width:280px;height:280px"><div style="margin-top:34px;font-size:46px;font-weight:700;color:{DARK};line-height:1.1">{l}</div></div>'
            for i, (c, l) in enumerate(zip(crops, LAB4)))
    note = ('<div style="position:absolute;left:0;right:0;bottom:%dpx;text-align:center;font-size:%dpx;color:#2b4a42">'
            '+ личные особенности пациента</div>') % ((110, 44) if o == "v" else (300, 38))
    return f"<style>{BASE_CSS % (W, H)}</style>{items}{note}"


# ---- сцена 5: коды МКФ ----
CODES = [("b730.3", "сила мышц", "выраженное нарушение", "#5cc8c6"),
         ("d450.2", "ходьба", "умеренная трудность", "#5cbf72"),
         ("e310", "семья", "помогает восстановлению", "#f2bf3b")]


def scene5(o):
    W, H = SIZE[o]
    bg = uri(IMG / f"{o}5.png")
    chip = lambda c, n, d, col, fs: (
        f'<div style="display:flex;align-items:center;gap:22px;background:rgba(255,255,255,.94);border-radius:26px;'
        f'padding:18px 30px;box-shadow:0 6px 24px rgba(0,0,0,.18);border-left:14px solid {col}">'
        f'<div style="font-family:\'DejaVu Sans Mono\',monospace;font-weight:700;font-size:{fs}px;color:{DARK}">{c}</div>'
        f'<div style="font-size:{int(fs*0.78)}px;color:#2b4a42;line-height:1.15"><b>{n}</b><br>{d}</div></div>')
    if o == "v":
        box = ('<div style="position:absolute;left:60px;right:60px;bottom:490px;display:flex;flex-direction:column;gap:22px">'
               + "".join(chip(*c, 54) for c in CODES) + "</div>")
    else:
        box = ('<div style="position:absolute;left:60px;right:60px;bottom:230px;display:flex;gap:26px;justify-content:center">'
               + "".join(chip(*c, 42) for c in CODES) + "</div>")
    return (f"<style>{BASE_CSS % (W, H)}</style>"
            f'<img src="{bg}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover">{box}')


# ---- сцена 8: четыре варианта потенциала ----
POT = [("Полного восстановления", "sun", "#5cc8c6"), ("Частичного восстановления", "sunrise", "#5cbf72"),
       ("Адаптации и компенсации", "repeat", "#f0705a"), ("Поддержки", "hand-heart", "#f2bf3b")]


def scene8(o):
    W, H = SIZE[o]
    bg = uri(IMG / f"{o}8.png")
    card = lambda t, ic, col, fs, isz: (
        f'<div style="background:rgba(255,255,255,.95);border-radius:30px;padding:26px 30px;display:flex;align-items:center;gap:28px;'
        f'box-shadow:0 8px 30px rgba(0,0,0,.16)"><div style="flex:none;width:{isz}px;height:{isz}px;border-radius:50%;background:{col};'
        f'display:flex;align-items:center;justify-content:center">{icon(ic, size=int(isz*0.56))}</div>'
        f'<div style="font-size:{fs}px;font-weight:700;color:{DARK};line-height:1.12">{t}</div></div>')
    if o == "v":
        grid = ('<div style="position:absolute;left:70px;right:70px;top:470px;display:flex;flex-direction:column;gap:34px">'
                + "".join(card(*p, 54, 120) for p in POT) + "</div>")
    else:
        grid = ('<div style="position:absolute;left:120px;right:120px;top:300px;display:grid;grid-template-columns:1fr 1fr;gap:40px">'
                + "".join(card(*p, 46, 110) for p in POT) + "</div>")
    return (f"<style>{BASE_CSS % (W, H)}</style>"
            f'<img src="{bg}" style="position:absolute;inset:-30px;width:calc(100% + 60px);height:calc(100% + 60px);object-fit:cover;filter:blur(10px) brightness(1.04)">'
            f"{grid}")


with sync_playwright() as pw:
    br = pw.chromium.launch(executable_path="/opt/google/chrome/chrome", args=["--no-sandbox"])
    for o in ("v", "h"):
        W, H = SIZE[o]
        pg = br.new_page(viewport={"width": W, "height": H})
        for k, fn in ((4, scene4), (5, scene5), (8, scene8)):
            pg.set_content(f"<html><head><meta charset='utf-8'></head><body>{fn(o)}</body></html>")
            pg.wait_for_timeout(300)
            pg.screenshot(path=str(IMG / f"{o}{k}c.png"))
            print(o, k, "готово")
        pg.close()
    br.close()
for p in IMG.glob("_ic*.png"):
    p.unlink()
