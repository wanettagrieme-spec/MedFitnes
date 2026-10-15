import json, re, subprocess, os
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
os.makedirs('ov', exist_ok=True)
tl = json.load(open('timeline.json'))
bounds, total = tl['bounds'], tl['total']

FB = '/usr/share/fonts/truetype/inter/Inter-Bold.ttf'
FX = '/usr/share/fonts/truetype/inter/Inter-ExtraBold.ttf'
for p in [FB, FX]:
    if not os.path.exists(p):
        r = subprocess.check_output(['fc-match', '-f', '%{file}', 'Inter:' + ('extrabold' if 'Extra' in p else 'bold')]).decode()
        if p == FB: FB = r
        else: FX = r

def font(path, size): return ImageFont.truetype(path, size)

def wrap(draw, text, f, maxw):
    words, lines, cur = text.split(), [], ''
    for w in words:
        t = (cur + ' ' + w).strip()
        if draw.textlength(t, font=f) <= maxw: cur = t
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines

def plate(name, text, y, bg, fg=(255, 255, 255), size=60, maxw=900, fpath=None, pad=(34, 22), radius=28, center=True):
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    f = font(fpath or FX, size)
    lines = []
    for part in text.split('\n'):
        lines += wrap(d, part, f, maxw)
    lh = int(size * 1.22)
    tw = max(d.textlength(l, font=f) for l in lines)
    bw, bh = tw + 2 * pad[0], lh * len(lines) + 2 * pad[1]
    x0 = (W - bw) / 2 if center else 60
    d.rounded_rectangle([x0, y, x0 + bw, y + bh], radius=radius, fill=bg)
    for i, l in enumerate(lines):
        lw = d.textlength(l, font=f)
        d.text((x0 + (bw - lw) / 2 if center else x0 + pad[0], y + pad[1] + i * lh - size * 0.05), l, font=f, fill=fg)
    im.save(f'ov/{name}.png')
    return f'ov/{name}.png'

# --- subtitles from Descript SRT, punctuation fixed to match script
srt = open('voice.srt').read().strip().split('\n\n')
fix = {'Самая частая ошибка близких: пусть полежит, окрепнет.': 'Самая частая ошибка близких — «пусть полежит, окрепнет».'}
subs = []
def ts(s):
    h, m, r = s.split(':'); sec, ms = r.split(','); return int(h) * 3600 + int(m) * 60 + int(sec) + int(ms) / 1000
for i, blk in enumerate(srt):
    ln = blk.split('\n'); a, b = ln[1].split(' --> ')
    txt = ' '.join(ln[2:]).strip(); txt = fix.get(txt, txt)
    subs.append((ts(a), ts(b), txt))
overlays = []
for i, (a, b, t) in enumerate(subs):
    nb = subs[i + 1][0] if i + 1 < len(subs) else b + 0.6
    end = min(nb, b + 0.6)
    p = plate(f'sub{i:02d}', t, 1470, (15, 23, 30, 200), size=54, maxw=920, fpath=FB, radius=22)
    overlays.append((p, a - 0.05, end))

# --- title plates (varied palette)
B = bounds
amber, cyan, coral, green, blue, navy = (245, 166, 35, 240), (0, 172, 193, 240), (232, 90, 79, 240), (46, 160, 90, 240), (41, 121, 255, 240), (20, 40, 70, 235)
overlays += [
    (plate('t1', 'Первые 3 месяца\nрешают очень многое', 70, amber, fg=(25, 25, 25), size=72), 0.3, B[1]),
    (plate('t2', 'Нейропластичность', 70, cyan, size=70), B[1] + 0.2, B[2]),
    (plate('t3', '«Пусть полежит» —\nопасная ошибка', 70, coral, size=72), B[2] + 0.2, B[3]),
    (plate('t4', 'Правильная укладка\nс первых дней', 70, green, size=66), B[3] + 0.1, B[4]),
    (plate('t5', 'Постепенно поднимать —\nпо решению врача', 70, green, size=62), B[4] + 0.2, B[5]),
    (plate('t6', 'Команда специалистов', 70, blue, size=62), B[5] + 0.2, B[6]),
]
# role labels synced with the voice (subs 15..18 -> indices 14..17)
roles = [('Врач ФРМ — план', 13), ('Инструктор ЛФК — движение', 14), ('Эрготерапевт — бытовые навыки', 15), ('Клинический логопед — речь и глотание', 16)]
for k, (txt, si) in enumerate(roles):
    overlays.append((plate(f'r{k}', txt, 190 + k * 95, navy, size=44, maxw=960, fpath=FB, radius=18), subs[si][0], B[6]))
overlays.append((plate('t7', 'Спросите врача\nо реабилитации сегодня', 70, amber, fg=(25, 25, 25), size=66), B[6] + 0.2, total))
endt = subs[-1][1] + 0.3
overlays.append((plate('disc', 'Информация не заменяет\nконсультацию врача', 1440, (255, 255, 255, 235), fg=(20, 30, 40), size=52, fpath=FB), endt, total))

# --- video: 7 clips trimmed/padded to scene durations, scaled to 1080x1920
inputs, filt = [], []
for i in range(7):
    dur = B[i + 1] - B[i]
    inputs += ['-i', f'v{i + 1}.mp4']
    filt.append(f'[{i}:v]scale=1080:-2,crop=1080:1920:0:0,fps=30,setsar=1,tpad=stop_mode=clone:stop_duration=3,trim=duration={dur:.3f},setpts=PTS-STARTPTS[c{i}]')
filt.append(''.join(f'[c{i}]' for i in range(7)) + 'concat=n=7:v=1:a=0[base]')
last = 'base'
n = 7
for j, (p, a, b) in enumerate(overlays):
    inputs += ['-i', p]
    filt.append(f'[{last}][{n + j}:v]overlay=0:0:enable=\'between(t,{a:.2f},{b:.2f})\'[o{j}]')
    last = f'o{j}'
filt.append(f'[{last}]fade=t=in:st=0:d=0.4,fade=t=out:st={total - 0.6:.2f}:d=0.6,format=yuv420p[v]')
na = n + len(overlays)
inputs += ['-i', 'voice_full.wav']
filt.append(f'[{na}:a]loudnorm=I=-14:TP=-1.5:LRA=11,afade=t=out:st={total - 0.6:.2f}:d=0.6[a]')
cmd = ['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', ';'.join(filt), '-map', '[v]', '-map', '[a]',
       '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-t', f'{total:.3f}', '-movflags', '+faststart', 'final.mp4']
subprocess.run(cmd, check=True)
print('ok', len(overlays))
