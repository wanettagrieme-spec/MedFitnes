import fs from 'node:fs';
const meta=JSON.parse(fs.readFileSync('episodes/01-timing.json'));
const transcript=JSON.parse(fs.readFileSync('out/new-transcript.json'));
const heard=[];
for(const segment of transcript.transcription){
 for(const token of segment.tokens){
  if(token.id>=50257||!token.text.trim())continue;
  if(/^\s/.test(token.text)||!heard.length)heard.push({text:token.text.trim(),start:token.offsets.from/1000,end:token.offsets.to/1000});
  else{heard.at(-1).text+=token.text;heard.at(-1).end=token.offsets.to/1000;}
 }
}
const normal=s=>s.toLowerCase().replace(/ё/g,'е').replace(/[^а-яa-z0-9]/g,'');
const pages=[];
for(const scene of meta.scenes){
 const original=scene.text.replace('о-мэ-эс','ОМС').split(/\s+/);
 const spoken=heard.filter(w=>w.start>=scene.start-.4&&w.start<scene.end+.1);
 const m=original.length,n=spoken.length;
 const dp=Array.from({length:m+1},()=>new Float32Array(n+1));
 for(let i=0;i<=m;i++)dp[i][0]=i;for(let j=0;j<=n;j++)dp[0][j]=j;
 for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)dp[i][j]=Math.min(dp[i-1][j]+1,dp[i][j-1]+1,dp[i-1][j-1]+(normal(original[i-1])===normal(spoken[j-1].text)?0:1.4));
 const starts=Array(m).fill(null);let i=m,j=n;
 while(i>0&&j>0){
  const cost=normal(original[i-1])===normal(spoken[j-1].text)?0:1.4;
  if(Math.abs(dp[i][j]-(dp[i-1][j-1]+cost))<.001){if(cost===0)starts[i-1]=Math.max(scene.start,spoken[j-1].start);i--;j--;}
  else if(dp[i][j]===dp[i-1][j]+1)i--;else j--;
 }
 for(let k=0;k<m;k++)if(starts[k]===null){
  let a=k-1,b=k+1;while(a>=0&&starts[a]===null)a--;while(b<m&&starts[b]===null)b++;
  const ta=a>=0?starts[a]:scene.start,tb=b<m?starts[b]:scene.end;
  starts[k]=ta+(tb-ta)*(k-a)/(b-a);
 }
 for(let k=1;k<m;k++)starts[k]=Math.max(starts[k],starts[k-1]);
 let begin=0;
 for(let k=0;k<m;k++){
  const text=original.slice(begin,k+1).join(' ');
  if(/[.!?]$/.test(original[k])||text.length>72||k===m-1){
   pages.push({start:starts[begin],end:k+1<m?starts[k+1]:scene.end,text});begin=k+1;
  }
 }
}
fs.writeFileSync('episodes/01-captions.json',JSON.stringify(pages,null,2));
console.log('Новые субтитры привязаны к новой записи:',pages.length,'фраз');
