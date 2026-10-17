import sys, json, re, base64, urllib.request, os
S=os.path.dirname(os.path.abspath(__file__))
key=open(os.path.join(S,'key')).read().strip()
def apply(text):
    text=re.sub(r'\s*\|\s*',' ',text)  # «|» — граница для субтитров без паузы в голосе (17.10.2026)
    for fn,stress in (('pronunciation.json',False),('stress.json',True)):
        p=os.path.join(S,fn)
        if not os.path.exists(p): continue
        d=json.load(open(p))
        for w,m in d.items():
            if w=='_': continue
            if stress:
                text=re.sub(r'(?<![\w+])'+w, lambda x: (m[0].upper()+m[1:]) if x.group(0)[0].isupper() else m, text, flags=re.I)
            else:
                text=re.sub(r'(?<!\w)'+re.escape(w)+r'(?!\w)', m, text)
    return text
def synth(text,out,voice='ermil',role='good',speed=0.95,gap=0.2):
    """«¦» в тексте: куски озвучиваются отдельно и склеиваются с ровной микропаузой gap (17.10.2026:
    в длинной фразе синтезатор сам ставил паузы после «потэнцыал»; владелица — паузы только между видами потенциала)."""
    if '¦' in text:
        parts=[x.strip() for x in text.split('¦') if x.strip()]; tmp=[]
        for i,pt in enumerate(parts):
            f=f'{out}.part{i}.wav'; _synth1(pt,f); tmp.append(f)
        # срезаем тишину по краям кусков, чтобы микропауза была ровно gap
        ins=[];flt=[]
        for i,f in enumerate(tmp):
            ins+=['-i',f]; flt.append(f'[{i}:a]silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse,apad=pad_dur={(0.5 if parts[i].endswith(('.','!','?')) else gap) if i<len(tmp)-1 else 0}[a{i}]')
        flt.append(''.join(f'[a{i}]' for i in range(len(tmp)))+f'concat=n={len(tmp)}:v=0:a=1[o]')
        os.system('ffmpeg -v error -y '+' '.join(f"'{x}'" if x!='-i' else x for x in ins)+f" -filter_complex '{';'.join(flt)}' -map '[o]' -ar 48000 -ac 1 '{out}'")
        for f in tmp: os.remove(f); os.path.exists(f+'.raw') and os.remove(f+'.raw')
        return
    _synth1(text,out,voice,role,speed)
def _synth1(text,out,voice='ermil',role='good',speed=0.95):
    body={'text':apply(text),'hints':[{'voice':voice},{'speed':speed},{'role':role}],
          'outputAudioSpec':{'rawAudio':{'audioEncoding':'LINEAR16_PCM','sampleRateHertz':48000}},
          'loudnessNormalizationType':'LUFS','unsafeMode':True}
    req=urllib.request.Request('https://tts.api.cloud.yandex.net/tts/v3/utteranceSynthesis',data=json.dumps(body).encode(),headers={'Authorization':'Api-Key '+key,'Content-Type':'application/json'})
    pcm=b''
    for line in urllib.request.urlopen(req,timeout=120).read().decode().splitlines():
        if line.strip():
            j=json.loads(line); pcm+=base64.b64decode(j['result']['audioChunk']['data'])
    open(out+'.raw','wb').write(pcm)
    os.system(f"ffmpeg -v error -y -f s16le -ar 48000 -ac 1 -i '{out}.raw' '{out}'")
if __name__=='__main__':
    synth(open(sys.argv[1]).read().strip(), sys.argv[2])
