import React, {useLayoutEffect,useMemo,useRef,useState} from 'react';
import * as T from 'three';
import {continueRender,delayRender,useCurrentFrame} from 'remotion';

const colors={ivory:'#f4f1e8',green:'#21745c',blue:'#2356d8',orange:'#ff8050',skin:'#edb894',pants:'#25365c'};
function mesh(g:T.BufferGeometry,color:string,parent:T.Object3D,x=0,y=0,z=0){const m=new T.Mesh(g,new T.MeshStandardMaterial({color,roughness:.68,metalness:.03}));m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
const box=(p:T.Object3D,x:number,y:number,z:number,w:number,h:number,d:number,c:string)=>mesh(new T.BoxGeometry(w,h,d),c,p,x,y,z);
const ball=(p:T.Object3D,x:number,y:number,z:number,r:number,c:string)=>mesh(new T.SphereGeometry(r,28,20),c,p,x,y,z);
function rod(parent:T.Object3D,a:number[],b:number[],r:number,c:string){const av=new T.Vector3(...a),bv=new T.Vector3(...b),delta=bv.clone().sub(av);const m=mesh(new T.CylinderGeometry(r,r,delta.length(),18),c,parent);m.position.copy(av.clone().add(bv).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return m;}
function person(parent:T.Object3D,color=colors.orange){
 const root=new T.Group();parent.add(root);
 const torso=mesh(new T.CapsuleGeometry(.28,.65,8,24),color,root,0,1.5,0);torso.scale.set(1,.85,.6);
 ball(root,0,2.19,0,.18,colors.skin);const hair=ball(root,0,2.29,-.02,.185,'#6c5042');hair.scale.set(1,.5,1);
 ball(root,-.06,2.2,.165,.013,'#2f3539');ball(root,.06,2.2,.165,.013,'#2f3539');
 const nose=ball(root,0,2.16,.184,.024,colors.skin);nose.scale.set(.7,1,1);
 const limbs=new T.Group();root.add(limbs);
 const limbsUpdate=(t:number,walking=false,reach=false)=>{
  for(const child of [...limbs.children]){limbs.remove(child);if(child instanceof T.Mesh){child.geometry.dispose();(child.material as T.Material).dispose();}}
  for(const side of [-1,1]){
   const stride=walking?Math.sin(t*3+side*Math.PI/2)*.27:Math.sin(t*1.4+side)*.025;
   const lift=walking?Math.max(0,Math.sin(t*3+side*Math.PI/2))*.13:0;
   const hip=[side*.14,1.12,0],knee=[side*.14,.62+lift*.5,stride*.5],foot=[side*.14,.13+lift,stride];
   rod(limbs,hip,knee,.11,colors.pants);rod(limbs,knee,foot,.095,colors.pants);
   const shoe=box(limbs,foot[0],foot[1]-.04,foot[2]+.08,.23,.14,.38,'#f7f7f2');
   const shoulder=[side*.31,1.75,0],elbow=[side*.42,1.32,walking?-stride*.7:.04];
   const hand=reach&&side===1?[.45,1.25+Math.max(0,Math.sin(t*.7))*.55,.43]:[side*.41,1.0,walking?-stride:.08];
   rod(limbs,shoulder,elbow,.09,color);rod(limbs,elbow,hand,.075,colors.skin);ball(limbs,...hand as [number,number,number],.086,colors.skin);
  }
  root.position.y=walking?Math.abs(Math.sin(t*3))*.025:Math.sin(t*1.4)*.015;
 };
 return {root,update:limbsUpdate};
}
function cup(parent:T.Object3D){const group=new T.Group();parent.add(group);mesh(new T.CylinderGeometry(.24,.20,.44,40),colors.green,group,0,.23,0);mesh(new T.CylinderGeometry(.19,.19,.012,32),'#7c4d32',group,0,.453,0);const handle=mesh(new T.TorusGeometry(.14,.035,12,28),colors.green,group,.25,.25,0);return group;}
function createWorld(kind:string){
 const scene=new T.Scene();const stage=new T.Group();scene.add(stage);stage.position.x=.85;
 const floor=mesh(new T.CylinderGeometry(2.8,2.8,.18,72),'#e2e7df',stage,0,-.11,0);
 scene.add(new T.HemisphereLight('#fff9e9','#9dbaa9',2.5));
 const light=new T.DirectionalLight('#fff4e5',4);light.position.set(-4,8,5);light.castShadow=true;light.shadow.mapSize.set(1024,1024);light.shadow.camera.left=-6;light.shadow.camera.right=6;light.shadow.camera.top=6;light.shadow.camera.bottom=-6;scene.add(light);
 const rim=new T.DirectionalLight('#abcaff',2);rim.position.set(4,4,-3);scene.add(rim);
 const camera=new T.PerspectiveCamera(32,1920/1080,.1,100);
 const people:{root:T.Group;update:(t:number,w?:boolean,r?:boolean)=>void}[]=[];
 let update=(t:number)=>{};
 if(kind==='daily'||kind==='talk'){
  const p=person(stage);p.root.position.x=-.45;p.root.rotation.y=.2;people.push(p);
  box(stage,.8,.85,.4,1.35,.1,.95,'#cba37e');for(const x of [.25,1.35])for(const z of [.03,.77])box(stage,x,.4,z,.06,.8,.06,'#86694f');
  const c=cup(stage);c.scale.setScalar(.65);c.position.set(-.16,1.1,.43);
  const paper=box(stage,1,.92,.4,.5,.018,.6,'#fffbf1');paper.rotation.y=.2;
  update=t=>{p.update(t,false,true);c.position.y=1.10+Math.max(0,Math.sin(t*.7))*.55;c.rotation.z=Math.sin(t*.7)*.06;};
  if(kind==='talk'){const d=person(stage,colors.blue);d.root.position.set(1.6,0,-.25);d.root.rotation.y=-.45;people.push(d);}
 }
 if(kind==='stairs'||kind==='progress'){
  for(let i=0;i<5;i++)box(stage,-1.05+i*.49,(i+1)*.15,.1,.49,(i+1)*.3,1.25,i%2?colors.blue:'#5780e4');
  const p=person(stage);people.push(p);p.root.rotation.y=Math.PI*.5;
  rod(stage,[-1.6,.85,-.72],[1.65,2.6,-.72],.045,colors.green);for(let i=0;i<4;i++)rod(stage,[-1.5+i,0,-.72],[-1.5+i,.9+i*.54,-.72],.04,colors.green);
  update=t=>{const step=(t*.32)%4;const i=Math.floor(step);const u=step-i;p.update(t,true);p.root.position.x=-1.05+(i+u)*.49;p.root.position.y=(i+1)*.3+u*.3;};
 }
 if(kind==='team'){
  const shades=[colors.orange,colors.blue,colors.green,'#dec458'];
  for(let i=0;i<4;i++){const p=person(stage,shades[i]);const angle=i*Math.PI*.5;p.root.position.set(Math.sin(angle)*1.3,0,Math.cos(angle)*1.3);p.root.rotation.y=angle+Math.PI;people.push(p);}
  box(stage,0,1.0,0,1.3,.1,1.3,'#d2b494');box(stage,0,.5,0,.12,1,.12,colors.green);
  box(stage,0,1.075,0,.75,.02,.55,'#fffdf7');
  for(let i=0;i<3;i++)box(stage,-.08+i*.1,1.095,-.08,.05,.008,.18,colors.green);
  update=t=>{people.forEach((p,i)=>p.update(t+i));stage.rotation.y=Math.sin(t*.22)*.15;};
 }
 if(kind==='early'){
  box(stage,0,.7,0,2.5,.16,1.0,'#c7d4ce');box(stage,0,.83,0,2.4,.12,.94,'#fffdf7');box(stage,-.85,.95,0,.5,.16,.75,'#fff');
  for(const x of [-.95,.95])for(const z of [-.3,.3]){rod(stage,[x,.63,z],[x,.15,z],.05,'#829d91');ball(stage,x,.11,z,.10,colors.pants);}
  const p=person(stage);people.push(p);p.update(0);p.root.rotation.z=Math.PI*.5;p.root.position.set(1.2,1.07,0);
  box(stage,.1,1.0,0,1.55,.24,.70,colors.green);
  rod(stage,[-1.55,.0,-.55],[-1.55,1.9,-.55],.055,'#829d91');box(stage,-1.55,1.9,-.55,.08,.95,.55,colors.pants);box(stage,-1.5,1.92,-.55,.10,.60,.44,colors.blue);
  const d=person(stage,colors.blue);d.root.position.set(.65,0,-1);d.root.rotation.y=.2;people.push(d);
  update=t=>{d.update(t);};
 }
 if(kind==='rebuild'){
  const p=person(stage);p.root.position.x=.25;people.push(p);
  const ring=mesh(new T.TorusGeometry(1.5,.11,18,64),colors.green,stage,0,1.4,-.65);ring.rotation.x=.2;
  const points:T.Mesh[]=[];for(let i=0;i<6;i++){const a=i*Math.PI/3;points.push(ball(stage,Math.cos(a)*1.5,1.4+Math.sin(a)*1.5,-.65,.15,i%2?colors.blue:colors.orange));}
  update=t=>{p.update(t);ring.rotation.z=t*.12;points.forEach((m,i)=>{const a=i*Math.PI/3+t*.18;m.position.set(Math.cos(a)*1.5,1.4+Math.sin(a)*1.5,-.65);});};
 }
 // A stylized plant provides room depth without stock imagery.
 rod(stage,[2,0,-1.1],[2,1.1,-1.1],.035,colors.green);
 for(let i=0;i<4;i++){const leaf=ball(stage,2+Math.sin(i*2)*.15,.65+i*.15,-1.1+Math.cos(i*2)*.12,.16,colors.green);leaf.scale.set(.55,1.7,.4);leaf.rotation.z=i*.7;}
 mesh(new T.CylinderGeometry(.25,.17,.35,24),'#ce9d76',stage,2,.17,-1.1);
 return {scene,camera,stage,update,people};
}
export const World:React.FC<{kind:string}> = ({kind})=>{
 const frame=useCurrentFrame();const canvas=useRef<HTMLCanvasElement>(null);const renderer=useRef<T.WebGLRenderer>();
 const [handle]=useState(()=>delayRender('Оригинальная 3D-сцена'));
 const world=useMemo(()=>createWorld(kind),[kind]);
 useLayoutEffect(()=>{
  const r=new T.WebGLRenderer({canvas:canvas.current!,antialias:true,alpha:true});r.setSize(1920,1080);r.setClearColor(0x000000,0);r.shadowMap.enabled=true;r.shadowMap.type=T.PCFSoftShadowMap;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.1;renderer.current=r;
  return ()=>{r.dispose();world.scene.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();if(Array.isArray(o.material))o.material.forEach(m=>m.dispose());else o.material.dispose();}});};
 },[world]);
 useLayoutEffect(()=>{
  const t=frame/30;world.update(t);if(world.people.length&&kind==='talk')world.people[1].update(t+.4);
  const yaw=.12*Math.sin(t*.25);world.camera.position.set(6.4*Math.sin(.72+yaw),4.8,6.4*Math.cos(.72+yaw));world.camera.lookAt(-1.1,1.15,0);renderer.current!.render(world.scene,world.camera);continueRender(handle);
 },[frame,world,handle,kind]);
 return <canvas ref={canvas} style={{position:'absolute',inset:0,width:1920,height:1080}}/>;
};
