"""Пересборка тайминга ролика серии 2 после смены озвучки: python3 retime.py [номера абзацев для пересинтеза]
Читает p1..pN.txt, синтезирует указанные абзацы (v3/pN.wav), пересчитывает timeline.json, voice_full.wav/mp3 и voice.srt
(субтитры — по предложениям и запятым с привязкой к паузам аудио). Запуск из папки src ролика."""
import subprocess, json, re, os, sys, time, glob, importlib.util
sp = importlib.util.spec_from_file_location('t', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tts3.py'))
t = importlib.util.module_from_spec(sp); sp.loader.exec_module(t)
N = len(glob.glob('p[0-9]*.txt')); os.makedirs('v3', exist_ok=True)
for a in sys.argv[1:]:
    i = int(a)
    for k in range(6):
        try: t.synth(open(f'p{i}.txt').read().strip(), f'v3/p{i}.wav'); break
        except Exception as e: print('retry', i, k, e); time.sleep(3)
for f in glob.glob('v3/*.raw'): os.remove(f)
d = [float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f'v3/p{i}.wav']).decode()) for i in range(1, N + 1)]
LEAD, GAP, TAIL = 0.4, 0.55, 2.8
starts = []; x = LEAD
for q in d: starts.append(x); x += q + GAP
total = x - GAP + TAIL
bounds = [0.0] + [starts[i] - GAP / 2 for i in range(1, N)] + [total]
json.dump({'durs': d, 'starts': starts, 'bounds': bounds, 'total': total}, open('timeline.json', 'w'), indent=1)
inp = []; filt = []
for i in range(N):
    inp += ['-i', f'v3/p{i+1}.wav']; filt.append(f'[{i}:a]adelay={int(starts[i]*1000)}|{int(starts[i]*1000)}[a{i}]')
filt.append(''.join(f'[a{i}]' for i in range(N)) + f'amix=inputs={N}:normalize=0,apad=whole_dur={total}[out]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', *inp, '-filter_complex', ';'.join(filt), '-map', '[out]', '-t', str(total), '-ar', '48000', 'voice_full.wav'], check=True)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', 'voice_full.wav', '-b:a', '192k', 'voice_full.mp3'], check=True)
def fmt(s):
    ms = int(round(s * 1000)); return f'{ms//3600000:02d}:{ms//60000%60:02d}:{ms//1000%60:02d},{ms%1000:03d}'
def chunks(txt):
    res = []
    for s in [s for s in re.split(r'(?<=[.!?])\s+', txt) if s]:
        parts = [s]
        if len(s) > 62:
            toks = re.split(r'(?<=[,:—])\s+', s); cur = ''; parts = []
            for w in toks:
                if cur and len(cur + ' ' + w) > 62: parts.append(cur); cur = w
                else: cur = (cur + ' ' + w).strip()
            parts.append(cur)
        res += parts
    return res
blocks = []
for i in range(N):
    sents = chunks(open(f'p{i+1}.txt').read().strip()); dd = d[i]; st = starts[i]
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', f'v3/p{i+1}.wav', '-af', 'silencedetect=noise=-38dB:d=0.12', '-f', 'null', '-'], capture_output=True, text=True).stderr
    se = [float(v) for v in re.findall(r'silence_start: ([\d.]+)', r)]; ee = [float(v) for v in re.findall(r'silence_end: ([\d.]+)', r)]
    pauses = [(a + b) / 2 for a, b in zip(se, ee) if 0.25 < a < dd - 0.25]
    L = [len(s) for s in sents]; tot = sum(L); bnds = []; acc = 0
    for k in range(len(sents) - 1):
        acc += L[k]; g = dd * acc / tot
        c = min(pauses, key=lambda p: abs(p - g)) if pauses else g
        bnds.append(c if abs(c - g) < dd * 0.12 else g)
    edges = [0.0] + bnds + [dd]
    for k, s in enumerate(sents):
        blocks.append([st + edges[k] + (0.02 if k else 0.0), st + edges[k+1] - (0.02 if k < len(sents) - 1 else 0.0), s])
out = []; i = 0
while i < len(blocks):
    a, b, s = blocks[i]
    if len(s) < 16 and i + 1 < len(blocks): out.append([a, blocks[i+1][1], s + ' ' + blocks[i+1][2]]); i += 2
    else: out.append(blocks[i]); i += 1
open('voice.srt', 'w').write('\n\n'.join(f'{k+1}\n{fmt(a)} --> {fmt(b)}\n{s}' for k, (a, b, s) in enumerate(out)) + '\n')
print(N, round(total, 1), [round(bounds[i+1] - bounds[i], 1) for i in range(N)])
