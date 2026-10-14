import subprocess,json,sys,os,glob
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from tts3 import synth
d0=sys.argv[1]; os.chdir(d0); os.makedirs('v3',exist_ok=True)
n=len(glob.glob('p[0-9]*.txt'))
for i in range(1,n+1): synth(open(f'p{i}.txt').read().strip(), f'v3/p{i}.wav')
d=[float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',f'v3/p{i}.wav']).decode()) for i in range(1,n+1)]
LEAD,GAP,TAIL=0.4,0.55,2.8
starts=[];t=LEAD
for x in d: starts.append(t); t+=x+GAP
total=t-GAP+TAIL
bounds=[0.0]+[starts[i]-GAP/2 for i in range(1,n)]+[total]
json.dump({'durs':d,'starts':starts,'bounds':bounds,'total':total},open('timeline.json','w'),indent=1)
inputs=[];filt=[]
for i in range(n):
    inputs+=['-i',f'v3/p{i+1}.wav']; filt.append(f'[{i}:a]adelay={int(starts[i]*1000)}|{int(starts[i]*1000)}[a{i}]')
filt.append(''.join(f'[a{i}]' for i in range(n))+f'amix=inputs={n}:normalize=0,apad=whole_dur={total}[out]')
subprocess.run(['ffmpeg','-v','error','-y',*inputs,'-filter_complex',';'.join(filt),'-map','[out]','-t',str(total),'-ar','48000','voice_full.wav'],check=True)
subprocess.run(['ffmpeg','-v','error','-y','-i','voice_full.wav','-b:a','192k','voice_full.mp3'],check=True)
print(d0,n,round(total,2),os.path.getsize('voice_full.mp3'))
