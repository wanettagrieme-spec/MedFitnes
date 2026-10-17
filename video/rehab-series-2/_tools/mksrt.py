"""Субтитры по тексту абзацев p1..pN и паузам аудио (без Descript). Запуск из папки src: python3 mksrt.py
Нужны timeline.json, v3/p*.wav, p*.txt. Пишет voice.srt. Длинные предложения режутся по знакам, ≤62 символов, короткие хвосты (<16) склеиваются."""
import json, re, subprocess, glob
tl = json.load(open('timeline.json')); N = len(tl['durs'])
def fmt(t):
    ms = int(round(t * 1000)); return f'{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}'
def chunks(txt):
    res = []
    for s in [s for s in re.split(r'(?<=[.!?])\s+', txt) if s]:
        parts = [s]
        if len(s) > 62:
            toks = re.split(r'(?<=[,:—])\s+', s); cur = ''; parts = []
            for t in toks:
                if cur and len(cur + ' ' + t) > 62: parts.append(cur); cur = t
                else: cur = (cur + ' ' + t).strip()
            parts.append(cur)
        res += parts
    return res
blocks = []
for i in range(N):
    sents = chunks(re.sub(r'\s*(sil<\[\d+\]>|\|)\s*', ', ', open(f'p{i + 1}.txt').read().strip())); d = tl['durs'][i]; st = tl['starts'][i]  # разметка пауз SpeechKit в субтитры не идёт
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', f'v3/p{i + 1}.wav', '-af', 'silencedetect=noise=-38dB:d=0.12', '-f', 'null', '-'], capture_output=True, text=True).stderr
    se = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', r)]; ee = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', r)]
    pauses = [(a + b) / 2 for a, b in zip(se, ee) if 0.25 < a < d - 0.25]
    L = [len(s) for s in sents]; tot = sum(L); bnds = []; acc = 0
    for k in range(len(sents) - 1):
        acc += L[k]; g = d * acc / tot
        c = min(pauses, key=lambda p: abs(p - g)) if pauses else g
        bnds.append(c if abs(c - g) < d * 0.12 else g)
    edges = [0.0] + bnds + [d]
    for k, s in enumerate(sents):
        blocks.append([st + edges[k] + (0.02 if k else 0.0), st + edges[k + 1] - (0.02 if k < len(sents) - 1 else 0.0), s])
out = []; i = 0
while i < len(blocks):
    a, b, t = blocks[i]
    if len(t) < 16 and i + 1 < len(blocks): out.append([a, blocks[i + 1][1], t + ' ' + blocks[i + 1][2]]); i += 2
    else: out.append(blocks[i]); i += 1
open('voice.srt', 'w').write('\n\n'.join(f'{k + 1}\n{fmt(a)} --> {fmt(b)}\n{t}' for k, (a, b, t) in enumerate(out)) + '\n')
print(len(out), 'субтитров')
