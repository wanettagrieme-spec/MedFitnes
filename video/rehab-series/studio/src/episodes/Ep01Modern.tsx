import React from 'react';
import {AbsoluteFill, Audio, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import timings from '../../episodes/01-chto-takoe-mr/voice/timings.json';
import captionsJson from '../../episodes/01-chto-takoe-mr/voice/captions.json';
import {At, Captions, Clip} from '../series/components';
import {makeWordTime, type CaptionsJson} from '../series/captions';
import {C, fontFamily, sec} from '../series/theme';
const captions = captionsJson as CaptionsJson;
const wt = makeWordTime(captions);
const end = timings.duration + 1.5;
export const EP01_MODERN_DURATION = sec(end);
const prefix = 'stock/pexels/';
// All backgrounds are moving footage; no photographs or frozen video frames.
const cuts: [number, number, string][] = [
 [0,4.3,'B-surgeons-or-35150986.mp4'],[4.3,8.9,'A-heart-monitor-6130551.mp4'],[8.9,16.48,'C2-patient-icu-6130032.mp4'],
 [16.48,22,'F-rehab-woman-6023204.mp4'],[22,28,'N2-balance-training-6023255.mp4'],[28,34,'N3-hand-blue-ball-25950159.mp4'],[34,40.76,'G-elderly-couple-home-6023263.mp4'],
 [40.76,46,'N4-doctor-reflexes-14936269.mp4'],[46,52,'N6-seated-exercise-6023276.mp4'],[52,58,'K-doctor-patient-6998077.mp4'],[58,60,'N1-man-walker-855482.mp4'],[60,64.62,'D-crop-woman-stairs.mp4'],
 [64.62,71,'C2-patient-icu-6130032.mp4'],[71,74.7,'E-rehab-gym-6023248.mp4'],[74.7,78.52,'G-elderly-couple-home-6023263.mp4'],
 [78.52,85,'N10-senior-doctor-writing-8375665.mp4'],[85,90,'K-doctor-patient-6998077.mp4'],[90,96,'N2-balance-training-6023255.mp4'],[96,101,'N3-hand-blue-ball-25950159.mp4'],
 [101,108,'P1-hospital-aerial-39973334.mp4'],[108,113,'I-nurse-patient-6290536.mp4'],[113,118.31,'J-family-hug-8057635.mp4'],
 [118.31,125,'P2-doctor-gives-paper-6998080.mp4'],[125,131,'K-doctor-patient-6998077.mp4'],[131,136,'N9-senior-doctor-talk-8375621.mp4'],[136,end,'N1-man-walker-855482.mp4'],
];
const Beat: React.FC<{title:string; sub?:string; tag?:string; color?:string}> = ({title,sub,tag,color=C.mint}) => {
 const f=useCurrentFrame(); const a=spring({frame:f,fps:30,config:{damping:22,stiffness:110}});
 return <AbsoluteFill style={{padding:'135px 120px',justifyContent:'center',paddingBottom:240}}>
  <div style={{maxWidth:1450,transform:`translateX(${(1-a)*-90}px)`,opacity:a}}>
   {tag&&<div style={{color, fontSize:28,fontWeight:800,letterSpacing:4,marginBottom:30}}>{tag}</div>}
   <div style={{height:7,width:interpolate(f,[0,24],[0,150],{extrapolateRight:'clamp'}),background:color,marginBottom:35}}/>
   <div style={{fontSize:title.length>45?88:108,fontWeight:800,lineHeight:1.06,letterSpacing:-3,whiteSpace:'pre-line',textShadow:'0 6px 35px #0007'}}>{title}</div>
   {sub&&<div style={{fontSize:42,fontWeight:500,color:'#e5f5f4',marginTop:34,lineHeight:1.3,maxWidth:1300}}>{sub}</div>}
  </div>
 </AbsoluteFill>;
};
const Route = () => {
 const f=useCurrentFrame();
 return <AbsoluteFill style={{padding:'180px 120px',justifyContent:'center',paddingBottom:220}}>
  <div style={{fontSize:35,color:C.mint,marginBottom:55,fontWeight:800}}>ТРИ ЭТАПА • ОДИН ПУТЬ</div>
  <div style={{display:'flex',gap:35}}>{['Реанимация','Отделение\nреабилитации','Поликлиника\nили дом'].map((title,i)=>{
   const a=spring({frame:f-i*50,fps:30,config:{damping:22}});
   return <div key={title} style={{flex:1,opacity:a,transform:`translateY(${(1-a)*50}px)`,borderTop:`5px solid ${[C.coral,C.sky,C.mint][i]}`,paddingTop:25}}>
    <div style={{fontSize:110,fontWeight:800,color:[C.coral,C.sky,C.mint][i]}}>0{i+1}</div><div style={{fontSize:48,fontWeight:800,whiteSpace:'pre-line',lineHeight:1.2}}>{title}</div>
   </div>;
  })}</div>
 </AbsoluteFill>;
};
const labels: [number,number,string,string?,string?][] = [
 [0,8.9,'Сначала — спасти жизнь',undefined,'ПОСЛЕ БОЛЕЗНИ ИЛИ ТРАВМЫ'],
 [8.9,16.48,'Вернуться\nк своей жизни','Медицинская реабилитация','ВЫПУСК 01'],
 [16.48,24,'Часть лечения','Восстановление возможностей'],
 [24,34,'Восстановить\nили компенсировать','Функции, нарушенные болезнью или травмой','323-ФЗ • СТАТЬЯ 40'],
 [34,40.76,'Ходить. Работать. Жить.','Самостоятельность в повседневной жизни'],
 [40.76,46,'Лечение','Причина болезни и острые симптомы'],
 [46,52,'Реабилитация','Последствия болезни • возможности человека'],
 [52,58,'Ваши цели — вместе с вами','Что важно вернуть именно вам'],
 [58,64.62,'Подняться на свой этаж','Пример личной цели'],
 [78.52,wt('врач')-.3,'Вместе с вами — команда'],
 [wt('врач')-.3,wt('инструктор')-.3,'Врач ФРМ','Руководит программой'],
 [wt('инструктор')-.3,wt('эрготерапевт')-.3,'Инструктор ЛФК','Восстанавливает движение'],
 [wt('эрготерапевт')-.3,wt('психолог')-.6,'Эрготерапевт','Возвращает бытовые навыки'],
 [wt('психолог')-.6,wt('логопед')-.4,'Клинический психолог','Настроение • память • внимание'],
 [wt('логопед')-.4,wt('сестра')-.7,'Клинический логопед','Речь • глотание'],
 [wt('сестра')-.7,wt('участников')-.5,'Медсестра по реабилитации','Закрепляет навыки каждый день'],
 [wt('участников')-.5,118.31,'Вы и ваши близкие','Важные участники команды'],
 [118.31,wt('спросите')-.4,'Бесплатно по ОМС','При медицинских показаниях'],
 [wt('спросите')-.4,wt('начинать')-.4,'Нужна ли мне реабилитация?','Спросите лечащего врача'],
 [wt('начинать')-.4,wt('направят')-.4,'Когда её начинать?'],
 [wt('направят')-.4,wt('следующем')-.5,'Куда меня направят?'],
 [wt('следующем')-.5,end,'Кому нужна\nреабилитация?','В следующем выпуске'],
];
export const Ep01Modern = () => {
 const f=useCurrentFrame();
 const fade=interpolate(f,[0,20,sec(end)-20,sec(end)],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 return <AbsoluteFill style={{background:C.navy,fontFamily,color:'white'}}>
  <AbsoluteFill style={{opacity:fade}}>
   {cuts.map(([from,to,src])=><At key={from} from={from} to={to} fadeIn={from===0?0:.18}><Clip src={prefix+src} dim={.15}/></At>)}
   <AbsoluteFill style={{background:'linear-gradient(90deg,#061e32ef 0%,#061e32b0 48%,#061e3240 100%)'}}/>
   {labels.map(([from,to,title,sub,tag])=><At key={title+from} from={from} to={to} fadeIn={.16} fadeOut={.16}><Beat title={title} sub={sub} tag={tag}/></At>)}
   <At from={64.62} to={78.52}><Route/></At>
   <div style={{position:'absolute',left:120,right:120,top:64,display:'flex',justifyContent:'space-between',color:'#d8f9f0',fontSize:23,fontWeight:700,letterSpacing:3}}><span>МЕДИЦИНСКАЯ РЕАБИЛИТАЦИЯ</span><span>01 / 05</span></div>
   <div style={{position:'absolute',bottom:0,height:5,width:`${f/EP01_MODERN_DURATION*100}%`,background:C.mint}}/>
   <Captions pages={captions.pages} bottom={58} fontSize={46}/>
  </AbsoluteFill>
  <Audio src={staticFile('episodes/01/voice.wav')}/>
  <Audio src={staticFile('episodes/01/music.wav')} volume={frame=>.12*interpolate(frame,[0,45,sec(end)-60,sec(end)],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'})}/>
 </AbsoluteFill>;
};
