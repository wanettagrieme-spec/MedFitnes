import numpy as np, sys, wave
from scipy.signal import butter, lfilter, fftconvolve
SR=48000; DUR=float(sys.argv[1]) if len(sys.argv)>1 else 70; OUT=sys.argv[2] if len(sys.argv)>2 else 'bed.wav'
rng=np.random.default_rng(7)
def note(m): return 440*2**((m-69)/12)
# warm progression in C: Cmaj9, Am9, Fmaj9, Gsus(add9)  — 4 bars x 4 s
prog=[[48,55,64,67,71,74],[45,52,60,64,67,71],[41,48,57,64,67,69],[43,50,57,62,67,69]]
BAR=4.0
n=int(DUR*SR); t=np.arange(n)/SR
pad=np.zeros(n); keys=np.zeros(n)
lp=butter(2,1800/(SR/2),'low')
for b in range(int(np.ceil(DUR/BAR))+1):
    ch=prog[b%4]; s=int(b*BAR*SR); L=int((BAR+2.0)*SR); e=min(n,s+L)
    if s>=n: break
    tt=np.arange(e-s)/SR
    env=np.minimum(1,tt/1.6)*np.minimum(1,np.maximum(0,(BAR+2.0-tt)/2.0))
    for m in ch:
        f=note(m)
        for d in (-0.06,0.0,0.06):
            pad[s:e]+=env*np.sin(2*np.pi*f*(1+d/100)*tt+rng.random()*6)*0.05
            pad[s:e]+=env*np.sin(2*np.pi*2*f*(1+d/100)*tt)*0.008
    # soft piano-like arpeggio, sparse
    for k,m in enumerate([ch[3]+12,ch[4]+12,ch[2]+12,ch[5]+12]):
        st=s+int(k*BAR/4*SR); L2=int(3*SR); e2=min(n,st+L2)
        if st>=n: continue
        t2=np.arange(e2-st)/SR; f=note(m)
        a=np.exp(-t2*1.6)*np.minimum(1,t2/0.01)
        keys[st:e2]+=a*(np.sin(2*np.pi*f*t2)+0.3*np.sin(2*np.pi*2*f*t2)+0.1*np.sin(2*np.pi*3*f*t2))*0.06
pad=lfilter(*lp,pad)
x=pad+keys
# reverb
ir_t=np.arange(int(2.5*SR))/SR; ir=rng.standard_normal(len(ir_t))*np.exp(-ir_t*2.2); ir=lfilter(*butter(1,4000/(SR/2),'low'),ir); ir/=np.abs(ir).sum()**0.5*8
wet=fftconvolve(x,ir)[:n]
y=0.75*x+0.6*wet
y=np.stack([y, np.roll(y,int(0.012*SR))],1)
fade=np.minimum(1,t/2.0)*np.minimum(1,(DUR-t)/3.0); y*=fade[:,None]
y/=np.abs(y).max()*1.12
w=wave.open(OUT,'wb'); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((y*32767).astype('<i2').tobytes()); w.close()
print('ok',OUT,DUR)
