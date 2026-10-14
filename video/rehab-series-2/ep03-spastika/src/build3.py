import json, subprocess, os, sys
from PIL import Image, ImageDraw, ImageFont

ORI = sys.argv[1]  # 'v' or 'h'
V = ORI == 'v'
W, H = (1080, 1920) if V else (1920, 1080)
OUT = f'final_{ORI}.mp4'
od = f'ov_{ORI}'; os.makedirs(od, exist_ok=True)
tl = json.load(open('timeline.json')); B, total = tl['bounds'], tl['total']
FB = subprocess.check_output(['fc-match', '-f', '%{file}', 'Inter:bold']).decode()
FX = subprocess.check_output(['fc-match', '-f', '%{file}', 'Inter:extrabold']).decode()

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
    p = f'{od}/{name}.png'; im.save(p); return p

def ts(s):
    h, m, r = s.split(':'); sec, ms = r.split(','); return int(h) * 3600 + int(m) * 60 + int(sec) + int(ms) / 1000
subs = []
for blk in open('voice.srt').read().strip().split('\n\n'):
    ln = blk.split('\n'); a, b = ln[1].split(' --> '); subs.append((ts(a), ts(b), ' '.join(ln[2:]).strip()))

ov = []
SY, SS, SW = (1470, 54, 920) if V else (880, 50, 1500)
for i, (a, b, t) in enumerate(subs):
    nb = subs[i + 1][0] if i + 1 < len(subs) else b + 0.6
    ov.append((plate(f'sub{i:02d}', t, SY, (15, 23, 30, 200), size=SS, maxw=SW, fpath=FB, radius=22), a - 0.05, min(nb, b + 0.6)))

TY, TX = (70, None) if V else (40, 50)
red, amber, cyan, green, blue, teal = (214, 48, 49, 240), (245, 166, 35, 240), (0, 172, 193, 240), (46, 160, 90, 240), (41, 121, 255, 240), (0, 128, 128, 240)
titles = json.load(open('titles.json'))
pal = {'red': red, 'amber': amber, 'cyan': cyan, 'green': green, 'blue': blue, 'teal': teal}
for k, (txt, col, dark) in enumerate(titles):
    ov.append((plate(f't{k}', txt, TY, pal[col], fg=(25, 25, 25) if dark else (255, 255, 255), size=60 if V else 56, maxw=900 if V else 1100, x=TX), B[k] + 0.15, B[k + 1]))
endt = subs[-1][1] + 0.3
if V:
    ov.append((plate('disc', 'Информация не заменяет\nконсультацию врача', 1440, (255, 255, 255, 235), fg=(20, 30, 40), size=52, fpath=FB), endt, total))
    ov.append((plate('ai', 'Видеоряд создан с помощью ИИ', 1680, (0, 0, 0, 150), size=34, fpath=FB, radius=14), endt, total))
else:
    ov.append((plate('disc', 'Информация не заменяет консультацию врача', 850, (255, 255, 255, 235), fg=(20, 30, 40), size=52, fpath=FB, maxw=1600), endt, total))
    ov.append((plate('ai', 'Видеоряд создан с помощью ИИ', 990, (0, 0, 0, 150), size=34, fpath=FB, radius=14), endt, total))

scenes = json.load(open('scenes.json'))[ORI]  # list of [type, file]
inputs, filt = [], []
for i, (typ, f) in enumerate(scenes):
    dur = B[i + 1] - B[i]
    if typ == 'video':
        inputs += ['-i', f]
        sc = f'scale={W}:-2,crop={W}:{H}:0:0' if V else f'scale={W}:{H}'
        filt.append(f'[{i}:v]{sc},fps=30,setsar=1,tpad=stop_mode=clone:stop_duration=4,trim=duration={dur:.3f},setpts=PTS-STARTPTS[c{i}]')
    else:
        inputs += ['-loop', '1', '-t', f'{dur + 0.5:.3f}', '-i', f]
        n = int(round(dur * 30)) + 2
        zin = 'in' if i % 2 == 0 else 'out'
        z = f"'min(1.0+0.05*on/{n},1.05)'" if zin == 'in' else f"'max(1.05-0.05*on/{n},1.0)'"
        filt.append(f'[{i}:v]scale={W * 2}:{H * 2}:force_original_aspect_ratio=increase,crop={W * 2}:{H * 2},zoompan=z={z}:x=iw/2-(iw/zoom/2):y=(ih-ih/zoom)*0.1:d={n}:s={W}x{H}:fps=30,setsar=1,trim=duration={dur:.3f},setpts=PTS-STARTPTS[c{i}]')
ns = len(scenes)
filt.append(''.join(f'[c{i}]' for i in range(ns)) + f'concat=n={ns}:v=1:a=0[base]')
last = 'base'
for j, (p, a, b) in enumerate(ov):
    inputs += ['-i', p]
    filt.append(f"[{last}][{ns + j}:v]overlay=0:0:enable='between(t,{a:.2f},{b:.2f})'[o{j}]"); last = f'o{j}'
filt.append(f'[{last}]fade=t=in:st=0:d=0.4,fade=t=out:st={total - 0.6:.2f}:d=0.6,format=yuv420p[v]')
inputs += ['-i', 'voice_full.wav']
filt.append(f'[{ns + len(ov)}:a]loudnorm=I=-14:TP=-1.5:LRA=11,afade=t=out:st={total - 0.6:.2f}:d=0.6[a]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', ';'.join(filt), '-map', '[v]', '-map', '[a]',
                '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
                '-t', f'{total:.3f}', '-movflags', '+faststart', OUT], check=True)
print('ok', OUT)
