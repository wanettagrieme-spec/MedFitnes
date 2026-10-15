"""Монтаж ролика серии 2, версия 4 (15.10.2026): плашки-заголовки меньше, всегда сверху,
сторона (слева/справа) выбирается по кадру — там, где нет голов (детектор лиц YuNet).

Запуск из папки с исходниками ролика:  python3 build4.py v|h
Нужно: timeline.json, voice.srt, titles.json, [roles.json], assets.json, voice_full.wav, bed.wav,
файлы сцен из assets.json, модель yunet.onnx (env YUNET или рядом со скриптом).
Пишет: final4_<v|h>.mp4, sides_<v|h>.json (выбранная сторона и проверка запаса над головами).

Решение владелицы 15.10.2026: «второй пункт плюс уменьшение, плашка всегда сверху, сторона по кадру»;
субтитры и время показа не менялись. Остальное — как в build3.py (голос серии 1, музыка с
приглушением, наезд ≤5 % от верха, растяжение видео ≤1,25×, без ускорения речи).
"""
import json, os, subprocess, sys
import cv2
from PIL import Image, ImageDraw, ImageFont

ORI = sys.argv[1]; V = ORI == 'v'
W, H = (1080, 1920) if V else (1920, 1080)
od = f'ov4_{ORI}'; os.makedirs(od, exist_ok=True)
tl = json.load(open('timeline.json')); B, total = tl['bounds'], tl['total']
FB = subprocess.check_output(['fc-match', '-f', '%{file}', 'Inter:bold']).decode()
FX = subprocess.check_output(['fc-match', '-f', '%{file}', 'Inter:extrabold']).decode()
YUNET = os.environ.get('YUNET', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'yunet.onnx'))

def run(args): subprocess.run(args, check=True)

def wrap(d, text, f, maxw):
    words, lines, cur = text.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=f) <= maxw: cur = t
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines

def measure(text, size, maxw, fpath, pad):
    d = ImageDraw.Draw(Image.new('RGBA', (8, 8))); f = ImageFont.truetype(fpath, size); lines = []
    for part in text.split('\n'): lines += wrap(d, part, f, maxw)
    lh = int(size * 1.22); tw = max(d.textlength(l, font=f) for l in lines)
    return f, lines, lh, int(tw + 2 * pad[0]), int(lh * len(lines) + 2 * pad[1])

def plate(name, text, x, y, bg, fg=(255, 255, 255), size=60, maxw=900, fpath=None, pad=(34, 22), radius=28):
    f, lines, lh, bw, bh = measure(text, size, maxw, fpath or FX, pad)
    if x is None: x = (W - bw) / 2
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle([x, y, x + bw, y + bh], radius=radius, fill=bg)
    for i, l in enumerate(lines):
        lw = d.textlength(l, font=f)
        d.text((x + (bw - lw) / 2, y + pad[1] + i * lh - size * 0.05), l, font=f, fill=fg)
    p = f'{od}/{name}.png'; im.save(p); return p

# ---------- 1. основа: сцены без плашек ----------
scenes = json.load(open('assets.json'))[ORI]  # [[type, file], ...]
inputs, filt = [], []
for i, (typ, f) in enumerate(scenes):
    dur = B[i + 1] - B[i]
    if typ == 'video':
        inputs += ['-i', f]
        sc = f'scale={W}:-2,crop={W}:{H}:0:0' if V else f'scale={W}:{H}'
        clen = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).decode())
        k = min(max(dur / clen, 1.0), 1.25)
        filt.append(f'[{i}:v]setpts={k:.4f}*PTS,{sc},fps=30,setsar=1,tpad=stop_mode=clone:stop_duration=4,trim=duration={dur:.3f},setpts=PTS-STARTPTS[c{i}]')
    else:
        inputs += ['-loop', '1', '-t', f'{dur + 0.5:.3f}', '-i', f]
        n = int(round(dur * 30)) + 2
        z = f"'min(1.0+0.05*on/{n},1.05)'" if i % 2 == 0 else f"'max(1.05-0.05*on/{n},1.0)'"
        filt.append(f'[{i}:v]scale={W * 2}:{H * 2}:force_original_aspect_ratio=increase,crop={W * 2}:{H * 2},zoompan=z={z}:x=iw/2-(iw/zoom/2):y=(ih-ih/zoom)*0.1:d={n}:s={W}x{H}:fps=30,setsar=1,trim=duration={dur:.3f},setpts=PTS-STARTPTS[c{i}]')
ns = len(scenes)
filt.append(''.join(f'[c{i}]' for i in range(ns)) + f'concat=n={ns}:v=1:a=0,format=yuv420p[v]')
BASE = f'base4_{ORI}.mp4'
if not (os.environ.get('REUSE_BASE') and os.path.exists(BASE)):
  run(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', ';'.join(filt), '-map', '[v]',
     '-c:v', 'libx264', '-preset', 'medium', '-crf', '12', '-t', f'{total:.3f}', BASE])

# ---------- 2. где головы: по 6 кадрам каждой сцены ----------
cap = cv2.VideoCapture(BASE)
det = cv2.FaceDetectorYN.create(YUNET, '', (W, H), 0.6, 0.3, 5000)
heads = []
for i in range(ns):
    hb = []
    for j in range(6):
        t = B[i] + (B[i + 1] - B[i]) * (0.05 + 0.9 * j / 5)
        cap.set(cv2.CAP_PROP_POS_MSEC, t * 1000); ok, fr = cap.read()
        if not ok: continue
        _, faces = det.detect(fr)
        for r in ([] if faces is None else faces):
            x, y, w, h = [float(v) for v in r[:4]]
            hb.append((x - 0.25 * w, y - 0.45 * h, x + 1.25 * w, y + 1.1 * h, y - 0.6 * h, x, y, w))  # голова с волосами; лицо
    heads.append(hb)

def overlap(r, boxes):
    a = 0.0
    for b in boxes:
        ix = max(0, min(r[2], b[2]) - max(r[0], b[0])); iy = max(0, min(r[3], b[3]) - max(r[1], b[1])); a += ix * iy
    return a

# ---------- 3. плашки ----------
def ts(s):
    h, m, r = s.split(':'); sec, ms = r.split(','); return int(h) * 3600 + int(m) * 60 + int(sec) + int(ms) / 1000
subs = []
for blk in open('voice.srt').read().strip().split('\n\n'):
    ln = blk.split('\n'); a, b = ln[1].split(' --> '); subs.append((ts(a), ts(b), ' '.join(ln[2:]).strip()))

ov = []
SY, SS, SW = (1470, 54, 920) if V else (880, 50, 1500)          # субтитры — без изменений
for i, (a, b, t) in enumerate(subs):
    nb = subs[i + 1][0] if i + 1 < len(subs) else b + 0.6
    ov.append((plate(f'sub{i:02d}', t, None, SY, (15, 23, 30, 200), size=SS, maxw=SW, fpath=FB, radius=22), a - 0.05, min(nb - 0.09, b + 0.6)))  # без наложения соседних субтитров

TS, TP, TR, TY, M = (44, (26, 16), 20, 50, 40) if V else (40, (24, 14), 18, 36, 40)   # было 60/56, pad 34×22
RS = 34 if V else 30
pal = {'red': (214, 48, 49, 240), 'amber': (245, 166, 35, 240), 'cyan': (0, 172, 193, 240), 'green': (46, 160, 90, 240),
       'blue': (41, 121, 255, 240), 'teal': (0, 128, 128, 240), 'coral': (232, 90, 79, 240)}
navy = (20, 40, 70, 235)
titles = json.load(open('titles.json'))
roles = json.load(open('roles.json')) if os.path.exists('roles.json') else []
roles_scene = json.load(open('roles_scene.json')) if os.path.exists('roles_scene.json') else None
report = []
for k, item in enumerate(titles):
    txt, col, dark = item[:3]
    _, _, _, bw, bh = measure(txt, TS, 900 if V else 1000, FX, TP)
    stack = [(bw, bh)]
    rsz = []
    if roles_scene is not None and k == roles_scene:
        for rt, _ in roles:
            _, _, _, rw, rh = measure(rt, RS, 960, FB, (20, 12)); rsz.append((rw, rh))
    # подписи ролей показываются по одной (сменяют друг друга под заголовком), а не стопкой
    colw = max([bw] + [w for w, _ in rsz]); colh = bh + (14 + max(h for _, h in rsz) if rsz else 0)
    cand = {'left': (M, TY, M + colw, TY + colh), 'right': (W - M - colw, TY, W - M, TY + colh)}
    sc = {s: overlap(r, heads[k]) for s, r in cand.items()}
    def clearance(r):  # расстояние от низа плашки до верха ближайшего лица под ней (чем больше, тем лучше)
        c = [b[6] - r[3] for b in heads[k] if b[5] - 0.25 * b[7] < r[2] and b[5] + 1.25 * b[7] > r[0]]
        return min(c) if c else 10 ** 6
    cl = {s: clearance(r) for s, r in cand.items()}
    side = max(cl, key=lambda s: (min(cl[s], 300), -sc[s], s == 'left'))
    x = M if side == 'left' else W - M - bw
    ov.append((plate(f't{k}', txt, x, TY, pal[col], fg=(25, 25, 25) if dark else (255, 255, 255), size=TS,
                     maxw=900 if V else 1000, pad=TP, radius=TR), B[k] + 0.15, B[k + 1]))
    ry = TY + bh + 14
    if roles_scene is not None and k == roles_scene:
        for r_i, (rt, si) in enumerate(roles):
            rw, rh = rsz[r_i]
            rx = M if side == 'left' else W - M - rw
            end = subs[roles[r_i + 1][1]][0] if r_i + 1 < len(roles) else B[k + 1]
            ov.append((plate(f'r{r_i}', rt, rx, ry, navy, size=RS, maxw=960, fpath=FB, pad=(20, 12), radius=14), subs[si][0], end))
    top = min([b[4] for b in heads[k]], default=None)
    report.append({'scene': k + 1, 'side': side, 'clearance_px': round(min(cl[side], 99999)), 'overlap_px': round(sc[side]), 'other_px': round(sc['right' if side == 'left' else 'left']),
                   'faces': len(heads[k]), 'min_head_top_px': None if top is None else round(top)})
endt = subs[-1][1] + 0.3
if V:
    ov.append((plate('disc', 'Информация не заменяет\nконсультацию врача', None, 1440, (255, 255, 255, 235), fg=(20, 30, 40), size=52, fpath=FB), endt, total))
    ov.append((plate('ai', 'Видеоряд создан с помощью ИИ', None, 1680, (0, 0, 0, 150), size=34, fpath=FB, radius=14), endt, total))
else:
    ov.append((plate('disc', 'Информация не заменяет консультацию врача', None, 850, (255, 255, 255, 235), fg=(20, 30, 40), size=52, fpath=FB, maxw=1600), endt, total))
    ov.append((plate('ai', 'Видеоряд создан с помощью ИИ', None, 990, (0, 0, 0, 150), size=34, fpath=FB, radius=14), endt, total))
json.dump(report, open(f'sides_{ORI}.json', 'w'), ensure_ascii=False, indent=1)

# ---------- 4. сборка: основа + плашки + голос + музыка ----------
inputs, filt = ['-i', BASE], []
last = '0:v'
for j, (p, a, b) in enumerate(ov):
    inputs += ['-i', p]
    filt.append(f"[{last}][{j + 1}:v]overlay=0:0:enable='between(t,{a:.2f},{b:.2f})'[o{j}]"); last = f'o{j}'
filt.append(f'[{last}]fade=t=in:st=0:d=0.4,fade=t=out:st={total - 0.6:.2f}:d=0.6,format=yuv420p[v]')
na = len(ov) + 1
inputs += ['-i', 'voice_full.wav', '-i', 'bed.wav']
filt.append(f'[{na + 1}:a]volume=0.30[m];[{na}:a]asplit=2[vo][sc];[m][sc]sidechaincompress=threshold=0.03:ratio=5:attack=40:release=700[md];'
            f'[vo][md]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,afade=t=out:st={total - 1.5:.2f}:d=1.5[a]')
OUT = f'final4_{ORI}.mp4'
run(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', ';'.join(filt), '-map', '[v]', '-map', '[a]',
     '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
     '-t', f'{total:.3f}', '-movflags', '+faststart', OUT])
print('ok', OUT, json.dumps(report, ensure_ascii=False))
