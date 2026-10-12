import React from 'react';
import {AbsoluteFill,Audio,Composition,Sequence,interpolate,spring,staticFile,useCurrentFrame} from 'remotion';
import meta from '../episodes/01-timing.json';
import pages from '../episodes/01-captions.json';
import {World} from './World';
const fps=30;
export const duration=Math.ceil(meta.duration*fps);
const clamp={extrapolateLeft:'clamp',extrapolateRight:'clamp'} as const;
function Caption({start}:{start:number}){
 const t=useCurrentFrame()/fps+start;
 const current=pages.find(page=>t>=page.start&&t<page.end);
 if(!current)return null;
 return <div style={{position:'absolute',bottom:67,left:160,right:160,display:'flex',justifyContent:'center'}}><div style={{maxWidth:1500,padding:'15px 30px',background:'#fffdf7e8',borderRadius:14,color:'#192e28',fontSize:34,lineHeight:1.3,textAlign:'center',boxShadow:'0 6px 25px #122b2310'}}>{current.text}</div></div>;
}
function Shot({scene,index}:{scene:typeof meta.scenes[number];index:number}){
 const f=useCurrentFrame();const localDuration=Math.round((scene.duration+.45)*fps);
 const appearance=spring({frame:f-8,fps,config:{damping:25,stiffness:100}});
 const transition=interpolate(f,[localDuration-12,localDuration],[0,1],clamp);
 const cycle=Math.sin(f/fps*.65)*6;
 const light=index%2===0;
 return <AbsoluteFill style={{background:light?'#f4f1e8':'#e5ede5',overflow:'hidden'}}>
  <div style={{position:'absolute',right:-240,top:-310,width:1150,height:1150,borderRadius:'50%',background:light?'#dce6d8':'#d0ddd4',transform:`translateY(${cycle}px)`}}/>
  <World kind={scene.kind}/>
  <div style={{position:'absolute',left:100,top:65,fontSize:22,letterSpacing:4,fontWeight:700,color:'#32634d'}}>МЕДИЦИНСКАЯ РЕАБИЛИТАЦИЯ</div>
  <div style={{position:'absolute',right:100,top:65,color:'#32634d',fontSize:23}}>01 <span style={{opacity:.35}}>—</span> 10</div>
  <div style={{position:'absolute',left:104,top:260,width:690,transform:`translateY(${(1-appearance)*60}px)`,opacity:appearance}}>
   <div style={{display:'inline-block',background:'#d8ee95',padding:'10px 20px',borderRadius:30,fontSize:26,color:'#304831',fontWeight:700,marginBottom:30}}>{scene.accent}</div>
   <h1 style={{margin:0,fontSize:scene.title.length>35?76:92,fontWeight:800,lineHeight:1.05,letterSpacing:-3,color:'#193e31'}}>{scene.title}</h1>
   <div style={{width:100+55*Math.sin(f/fps*.45),height:8,borderRadius:8,background:'#ff8050',marginTop:38}}/>
  </div>
  <div style={{position:'absolute',left:105,top:800,fontSize:23,color:'#617066',letterSpacing:2}}>ВОЗМОЖНОСТИ → ДЕЙСТВИЯ → ЖИЗНЬ</div>
  <Caption start={scene.start}/>
  <div style={{position:'absolute',top:0,bottom:0,left:1920*(1-transition),width:1920,background:'#d8ee95'}}/>
 </AbsoluteFill>;
}
export const Film=()=>{
 const f=useCurrentFrame();const fade=interpolate(f,[0,10,duration-22,duration],[0,1,1,0],clamp);
 return <AbsoluteFill style={{background:'#f4f1e8',fontFamily:'Arial, Helvetica, sans-serif'}}>
  <AbsoluteFill style={{opacity:fade}}>
   {meta.scenes.map((s,i)=><Sequence key={i} from={Math.round(s.start*fps)} durationInFrames={Math.round((s.duration+.45+(i===meta.scenes.length-1?1:0))*fps)}><Shot scene={s} index={i}/></Sequence>)}
  </AbsoluteFill>
  <Audio src={staticFile('audio/01-voice.wav')}/>
  <Audio src={staticFile('audio/01-music.wav')} volume={1.5}/>
 </AbsoluteFill>;
};
export const Root=()=> <Composition id="Codex01" component={Film} fps={fps} width={1920} height={1080} durationInFrames={duration}/>;
