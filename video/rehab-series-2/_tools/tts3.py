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
def synth(text,out,voice='ermil',role='good',speed=0.95):
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
