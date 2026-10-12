import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
const meta=JSON.parse(fs.readFileSync('episodes/01-timing.json','utf8'));
// Licensed recording, not self-authored music. Author and license: sources/music-credits.json.
execFileSync(process.env.FFMPEG || 'ffmpeg',[
 '-nostdin','-y','-loglevel','error','-i','sources/mixkit-classical-7-jonny-s.mp3',
 '-af',`atrim=0:${meta.duration},asetpts=PTS-STARTPTS,highpass=f=70,lowpass=f=6500,loudnorm=I=-36:TP=-9:LRA=7,afade=t=in:st=0:d=3,afade=t=out:st=${meta.duration-4}:d=4`,
 '-ar','48000','-ac','2','-c:a','pcm_s16le','public/audio/01-mixkit-music.wav'
]);
console.log('Новая лицензированная музыкальная подложка подготовлена:',meta.duration.toFixed(1),'с');
