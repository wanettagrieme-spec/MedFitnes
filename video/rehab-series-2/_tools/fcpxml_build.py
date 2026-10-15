"""Проект Final Cut Pro (FCPXML 1.10) для ролика серии 2 — все слои отдельно.

Запуск из папки ролика:  python3 ../_tools/fcpxml_build.py v|h <mac_dir>
  v|h       — 9:16 или 16:9
  mac_dir   — папка на Mac, где будут лежать медиа и проект
              (например /Users/<имя>/Movies/Серия 2 МР — Final Cut/ep01-zolotoe-okno)
Нужно в папке ролика: src/timeline.json, src/voice.srt, src/fcp.json (сцены, плашки, роли),
voice-*.mp3 (по fcp.json). Делает: папку fcp_<v|h>/ с PNG-плашками, music.wav и project.fcpxml.
Видео сцен (Kling) скачиваются на Mac по ссылкам из fcp.json (fetch.sh).

Слои на ленте: V1 — сцены (Kling, растяжение ≤1,25× как в build3.py), V2+ — плашки-заголовки,
подписи ролей, субтитры, финальные надписи (PNG); A1 — голос, A2 — музыка (−12 дБ).
"""
import json, os, subprocess, sys, urllib.parse
from PIL import Image, ImageDraw, ImageFont

ORI, MAC = sys.argv[1], sys.argv[2].rstrip('/')
V = ORI == 'v'
W, H = (1080, 1920) if V else (1920, 1080)
OUT = f'fcp_{ORI}'; os.makedirs(f'{OUT}/ov', exist_ok=True)
cfg = json.load(open('src/fcp.json'))
tl = json.load(open('src/timeline.json')); B, total = tl['bounds'], tl['total']
FB = subprocess.check_output(['fc-match', '-f', '%{file}', 'Inter:bold']).decode()
FX = subprocess.check_output(['fc-match', '-f', '%{file}', 'Inter:extrabold']).decode()
FPS = 30

def fr(s):  # секунды -> время FCPXML, кратное кадру 30p
    return f'{int(round(s * FPS)) * 100}/3000s'

def wrap(d, text, f, maxw):
    words, lines, cur = text.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=f) <= maxw: cur = t
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines

def plate(name, text, y, bg, fg=(255, 255, 255), size=60, maxw=900, fpath=None, pad=(34, 22), radius=28, x=None):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    f = ImageFont.truetype(fpath or FX, size)
    lines = []
    for part in text.split('\n'): lines += wrap(d, part, f, maxw)
    lh = int(size * 1.22); tw = max(d.textlength(l, font=f) for l in lines)
    bw, bh = tw + 2 * pad[0], lh * len(lines) + 2 * pad[1]
    x0 = x if x is not None else (W - bw) / 2
    d.rounded_rectangle([x0, y, x0 + bw, y + bh], radius=radius, fill=bg)
    for i, l in enumerate(lines):
        lw = d.textlength(l, font=f)
        d.text((x0 + (bw - lw) / 2, y + pad[1] + i * lh - size * 0.05), l, font=f, fill=fg)
    im.save(f'{OUT}/ov/{name}.png'); return f'ov/{name}.png'

def ts(s):
    h, m, r = s.split(':'); sec, ms = r.split(','); return int(h) * 3600 + int(m) * 60 + int(sec) + int(ms) / 1000
subs = []
for blk in open('src/voice.srt').read().strip().split('\n\n'):
    ln = blk.split('\n'); a, b = ln[1].split(' --> '); subs.append((ts(a), ts(b), ' '.join(ln[2:]).strip()))

# ---- плашки: (файл, начало, конец, дорожка)
ov = []
SY, SS, SW = (1470, 54, 920) if V else (880, 50, 1500)
TY, TX = (70, None) if V else (40, 50)
pal = {'red': (214, 48, 49, 240), 'amber': (245, 166, 35, 240), 'cyan': (0, 172, 193, 240), 'green': (46, 160, 90, 240),
       'blue': (41, 121, 255, 240), 'teal': (0, 128, 128, 240), 'coral': (232, 90, 79, 240)}
for k, (txt, col, dark) in enumerate(cfg['titles']):
    ov.append((plate(f't{k}', txt, TY, pal[col], fg=(25, 25, 25) if dark else (255, 255, 255), size=60 if V else 56,
                     maxw=900 if V else 1100, x=TX), B[k] + 0.15, B[k + 1], 2))
navy = (20, 40, 70, 235)
for k, (txt, si) in enumerate(cfg.get('roles', [])):
    ry = (TY + 130 + k * 95) if V else (TY + 120 + k * 85)
    ov.append((plate(f'r{k}', txt, ry, navy, size=44 if V else 40, maxw=960, fpath=FB, radius=18, x=TX),
               subs[si][0], B[cfg['roles_until_scene']], 3))
for i, (a, b, t) in enumerate(subs):
    nb = subs[i + 1][0] if i + 1 < len(subs) else b + 0.6
    ov.append((plate(f'sub{i:02d}', t, SY, (15, 23, 30, 200), size=SS, maxw=SW, fpath=FB, radius=22), a - 0.05, min(nb, b + 0.6), 4))
endt = subs[-1][1] + 0.3
if V:
    ov.append((plate('disc', 'Информация не заменяет\nконсультацию врача', 1440, (255, 255, 255, 235), fg=(20, 30, 40), size=52, fpath=FB), endt, total, 5))
    ov.append((plate('ai', 'Видеоряд создан с помощью ИИ', 1680, (0, 0, 0, 150), size=34, fpath=FB, radius=14), endt, total, 6))
else:
    ov.append((plate('disc', 'Информация не заменяет консультацию врача', 850, (255, 255, 255, 235), fg=(20, 30, 40), size=52, fpath=FB, maxw=1600), endt, total, 5))
    ov.append((plate('ai', 'Видеоряд создан с помощью ИИ', 990, (0, 0, 0, 150), size=34, fpath=FB, radius=14), endt, total, 6))

# ---- музыка (тот же синтез, что в роликах)
here = os.path.dirname(os.path.abspath(__file__))
subprocess.run([sys.executable, f'{here}/music.py', f'{total + 1:.3f}', f'{OUT}/music.wav'], check=True, stdout=subprocess.DEVNULL)

# ---- ресурсы
def url(rel): return 'file://' + urllib.parse.quote(f'{MAC}/{rel}')
res, ids = [], {}
res.append(f'<format id="r1" frameDuration="100/3000s" width="{W}" height="{H}" colorSpace="1-1-1 (Rec. 709)"/>')
res.append(f'<format id="r2" name="FFVideoFormatRateUndefined" width="{W}" height="{H}" colorSpace="1-1-1 (sRGB IEC61966-2.1)"/>')
n = 3
scenes = cfg['scenes'][ORI]  # [{"file": "v1.mp4", "url": ..., "w":716, "h":1280, "fps":24, "frames":169}]
for i, s in enumerate(scenes):
    fid, aid = f'r{n}', f'r{n + 1}'; n += 2
    res.append(f'<format id="{fid}" frameDuration="1/{s["fps"]}s" width="{s["w"]}" height="{s["h"]}" colorSpace="1-1-1 (Rec. 709)"/>')
    res.append(f'<asset id="{aid}" name="Сцена {i + 1}" start="0s" duration="{s["frames"]}/{s["fps"]}s" hasVideo="1" format="{fid}">'
               f'<media-rep kind="original-media" src="{url("media/" + s["file"])}"/></asset>')
    ids[f'scene{i}'] = aid
for (p, a, b, lane) in ov:
    aid = f'r{n}'; n += 1
    res.append(f'<asset id="{aid}" name="{os.path.basename(p)[:-4]}" start="0s" duration="0s" hasVideo="1" format="r2">'
               f'<media-rep kind="original-media" src="{url(p)}"/></asset>')
    ids[p] = aid
for key, rel, dur in [('voice', 'media/' + cfg['voice'], cfg['voice_dur']), ('music', 'music.wav', total + 1)]:
    aid = f'r{n}'; n += 1
    res.append(f'<asset id="{aid}" name="{"Голос" if key == "voice" else "Музыка"}" start="0s" duration="{fr(dur)}" hasAudio="1" audioSources="1" audioChannels="{1 if key == "voice" else 2}" audioRate="48000">'
               f'<media-rep kind="original-media" src="{url(rel)}"/></asset>')
    ids[key] = aid

# ---- лента
kids = []
for i, s in enumerate(scenes):
    a, b = B[i], B[i + 1]
    sdur = int(round(b * FPS)) - int(round(a * FPS))  # кадров 30p
    src = s['frames'] / s['fps']
    k = min(max((sdur / FPS) / src, 1.0), 1.25)
    used = min(src, (sdur / FPS) / k)  # секунд исходника
    retime = ''
    if k > 1.0001:
        val = int(used * s['fps']) * (3000 // s['fps'])
        retime = (f'<timeMap><timept time="0s" value="0s" interp="linear"/>'
                  f'<timept time="{sdur * 100}/3000s" value="{val}/3000s" interp="linear"/></timeMap>')
    kids.append(f'<asset-clip ref="{ids[f"scene{i}"]}" lane="1" offset="{fr(a)}" name="Сцена {i + 1}" start="0s" duration="{sdur * 100}/3000s">'
                f'{retime}<adjust-conform type="fill"/></asset-clip>')
for (p, a, b, lane) in ov:
    kids.append(f'<video ref="{ids[p]}" lane="{lane}" offset="{fr(a)}" name="{os.path.basename(p)[:-4]}" start="0s" duration="{fr(b - a)}"/>')
kids.append(f'<asset-clip ref="{ids["voice"]}" lane="-1" offset="0s" name="Голос" start="0s" duration="{fr(total)}"/>')
kids.append(f'<asset-clip ref="{ids["music"]}" lane="-2" offset="0s" name="Музыка" start="0s" duration="{fr(total)}"><adjust-volume amount="-12dB"/></asset-clip>')

name = cfg['name'] + (' — 9x16' if V else ' — 16x9')
xml = ('<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE fcpxml>\n<fcpxml version="1.10">\n<resources>\n' + '\n'.join(res) +
       f'\n</resources>\n<library location="{"file://" + urllib.parse.quote(os.path.dirname(MAC) + "/Серия 2 МР.fcpbundle")}/">\n<event name="Серия 2 МР">\n<project name="{name}">\n'
       f'<sequence format="r1" duration="{fr(total)}" tcStart="0s" tcFormat="NDF" audioLayout="stereo" audioRate="48k">\n<spine>\n'
       f'<gap name="Основа" offset="0s" start="0s" duration="{fr(total)}">\n' + '\n'.join(kids) +
       '\n</gap>\n</spine>\n</sequence>\n</project>\n</event>\n</library>\n</fcpxml>\n')
open(f'{OUT}/project.fcpxml', 'w').write(xml)
open(f'{OUT}/fetch.sh', 'w').write('#!/bin/sh\nset -e\nmkdir -p media\n' + ''.join(
    f'curl -sfL -o "media/{s["file"]}" "{s["url"]}"\n' for s in scenes) + 'echo ok\n')
print('ok', OUT, len(ov), 'плашек')
