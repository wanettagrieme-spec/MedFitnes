import fs from 'node:fs';
const meta=JSON.parse(fs.readFileSync('episodes/01-timing.json','utf8'));
const sr=48000,seconds=meta.duration,n=Math.ceil(seconds*sr),out=Buffer.alloc(n*4+44);
out.write('RIFF');out.writeUInt32LE(out.length-8,4);out.write('WAVEfmt ',8);out.writeUInt32LE(16,16);out.writeUInt16LE(1,20);out.writeUInt16LE(2,22);out.writeUInt32LE(sr,24);out.writeUInt32LE(sr*4,28);out.writeUInt16LE(4,32);out.writeUInt16LE(16,34);out.write('data',36);out.writeUInt32LE(n*4,40);
// Original instrumental score: 76 BPM, D6/Bm7/Gmaj7/Aadd9, soft mallets and a muted pulse.
const chords=[[50,57,62,66,71],[47,54,59,62,66],[43,55,59,62,66],[45,57,61,64,71]],beat=60/76;
const hz=m=>440*2**((m-69)/12);
for(let i=0;i<n;i++){
 const t=i/sr,bar=Math.floor(t/(beat*8)),ch=chords[bar%4];let left=0,right=0;
 for(let j=0;j<ch.length;j++){
  const m=ch[j]+12,phase=t%(beat*2),f=hz(m),env=Math.exp(-phase*1.8)*Math.min(1,phase/.03);
  const wave=(Math.sin(2*Math.PI*f*t)+.15*Math.sin(2*Math.PI*f*2*t))*env*.016;
  left+=wave*(.65+j*.07);right+=wave*(.95-j*.06);
 }
 const pulse=t%beat,low=Math.sin(2*Math.PI*hz(ch[0])*t)*Math.exp(-pulse*10)*.03;
 const fade=Math.min(1,t/3,(seconds-t)/4);left=(left+low)*fade;right=(right+low)*fade;
 out.writeInt16LE(Math.round(left*32767),44+i*4);out.writeInt16LE(Math.round(right*32767),46+i*4);
}
fs.writeFileSync('public/audio/01-music.wav',out);console.log('Новая оригинальная музыкальная дорожка:',seconds.toFixed(1),'с');
