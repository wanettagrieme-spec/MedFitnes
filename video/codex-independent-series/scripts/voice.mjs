import fs from 'node:fs';
import path from 'node:path';
const episode=JSON.parse(fs.readFileSync('episodes/01.json','utf8'));
const secret=fs.readFileSync('../video-studio/.env','utf8').match(/YANDEX_SPEECHKIT_API_KEY\s*=\s*["']?([A-Za-z0-9_.-]+)/)?.[1];
if(!secret)throw Error('Ключ SpeechKit не найден');
const sampleRate=48000;
function wav(samples){
 const b=Buffer.alloc(44+samples.length);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(sampleRate,24);b.writeUInt32LE(sampleRate*2,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(samples.length,40);samples.copy(b,44);return b;
}
let elapsed=.45;const blocks=[Buffer.alloc(Math.round(elapsed*sampleRate)*2)];
for(let i=0;i<episode.scenes.length;i++){
 const scene=episode.scenes[i];let response;
 const cached=`public/audio/01-scene-${i+1}.wav`;
 if(fs.existsSync(cached)){const pcm=fs.readFileSync(cached).subarray(44);scene.start=elapsed;scene.duration=pcm.length/(sampleRate*2);elapsed+=scene.duration;scene.end=elapsed;blocks.push(pcm,Buffer.alloc(Math.round(.45*sampleRate)*2));elapsed+=.45;continue;}
 for(let attempt=0;attempt<4;attempt++){
  try{
   const r=await fetch('https://tts.api.cloud.yandex.net/tts/v3/utteranceSynthesis',{method:'POST',headers:{Authorization:`Api-Key ${secret}`,'Content-Type':'application/json'},body:JSON.stringify({text:scene.text.replace('о-мэ-эс','о-мэ-+эс'),hints:[{voice:'ermil'},{role:'good'},{speed:.97}],outputAudioSpec:{rawAudio:{audioEncoding:'LINEAR16_PCM',sampleRateHertz:sampleRate}},loudnessNormalizationType:'LUFS',unsafeMode:true}),signal:AbortSignal.timeout(60000)});
   if(!r.ok)throw Error(`SpeechKit HTTP ${r.status}: ${(await r.text()).slice(0,500)}`);
   response=await r.text();break;
  }catch(e){if(attempt===3)throw Error(`Не удалось озвучить сцену ${i+1}: ${e.message}`);await new Promise(r=>setTimeout(r,1500));}
 }
 const pcm=Buffer.concat(response.trim().split('\n').map(line=>JSON.parse(line).result?.audioChunk?.data).filter(Boolean).map(data=>Buffer.from(data,'base64')));
 if(pcm.length===0)throw Error('SpeechKit не вернул аудио');
 scene.start=elapsed;scene.duration=pcm.length/(sampleRate*2);elapsed+=scene.duration;scene.end=elapsed;blocks.push(pcm,Buffer.alloc(Math.round(.45*sampleRate)*2));elapsed+=.45;
 fs.writeFileSync(`public/audio/01-scene-${i+1}.wav`,wav(pcm));console.log(`Новая сцена ${i+1}: ${scene.duration.toFixed(1)} с`);
}
blocks.push(Buffer.alloc(sampleRate*2));episode.duration=elapsed+1;
fs.writeFileSync('public/audio/01-voice.wav',wav(Buffer.concat(blocks)));
fs.writeFileSync('episodes/01-timing.json',JSON.stringify(episode,null,2));console.log(`Новая озвучка готова: ${episode.duration.toFixed(1)} с`);
