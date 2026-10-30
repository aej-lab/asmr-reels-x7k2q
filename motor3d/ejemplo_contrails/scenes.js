// ===== 3D scenes: contrails =====
const HD3=V3(Math.cos(.44),Math.sin(.44),0);
function cumulus3D(R,cx,cy,cz,s,t,tint=0xffffff){
 const P=[[0,0,1],[.9,.15,.78],[-.9,.2,.8],[.45,.55,.7],[-.4,.5,.72],[1.55,-.1,.55],[-1.5,-.05,.58]];
 for(const[ox,oy,k]of P){const sh=spr(TEX.puff,0x7f95c0,10*k*s,.6);sh.position.set(cx+ox*5*s,cy+oy*4*s-1.2*s+Math.sin(t*.5+ox)*.2,cz);R.bg.add(sh);
  const w=spr(TEX.puff,tint,9.4*k*s,.9);w.position.set(cx+ox*5*s,cy+oy*4*s+Math.sin(t*.5+ox)*.2,cz+.1);R.bg.add(w);}}

function buildHook(out){
 const R=newRig([[8,10,34],[66,34,94],[250,138,84]]);
 lights(R,{key:0xffb27a,keyI:2.8,keyPos:[40,-10,30],hemiSky:0x6a5aa8,hemiGround:0x7a3a28,hemiI:1.0});
 const sun=spr(TEX.glow,0xff9a55,150,.95,true);sun.position.set(32,-22,-90);R.bg.add(sun);
 const sun2=spr(TEX.glow,0xfff0d0,40,1,true);sun2.position.set(32,-22,-89);R.bg.add(sun2);
 for(let i=0;i<24;i++){const s=spr(TEX.puff,0x2a1848,28+rnd(i)*22,.8);s.position.set(-100+i*9.2,-36+rnd(i+3)*6,-42-rnd(i+7)*30);R.bg.add(s);}
 const plane=airliner();plane.rotation.z=.44;R.fg.add(plane);
 const trail=new Trail(96,R.fg);
 const sp=[];for(let i=0;i<14;i++){const s=spr(TEX.spark,0xffe8d0,1.3,0,true);R.fg.add(s);sp.push(s);}
 const ns=noSign3D(R.cam);R.hud=[ns];
 R.update=(u,d)=>{const off=out?(u-d):u;if(!out)wmShow(plane.userData.wm,u,1.2,2.9,.85);else wmShow(plane.userData.wm,u,-9,-8);
  const tail=HD3.clone().multiplyScalar(.7*off);
  plane.position.copy(tail).addScaledVector(HD3,5.2);
  const gl2=out?Math.sin(Math.PI*clamp(u/d)):0;
  trail.update(tail,HD3,62,{r0:.45,r1:3.4,a:.68,wob:.5,t:off,seed:1,tf:.55,warm:.9,scatter:.6});
  for(let i=0;i<14;i++){const f=.04+.5*rnd(i+30),s=f*62;const q=tail.clone().addScaledVector(HD3,-s);q.y+=(rnd(i+5)-.5)*lerp(.4,3.4,f)*.8;q.z+=(rnd(i+9)-.5)*1.2;
   sp[i].position.copy(q);sp[i].material.opacity=Math.pow(.5+.5*Math.sin(off*2.6+i*1.9),3)*.9*(1+gl2);}
  aim(R,[-3+.5*off,-5+.2*off,55-1.0*off],[1+.2*off,-2,0],.012*Math.sin(off*.4),off,.03);
  const noF=out?1-sm(1.0,1.55,u):sm(1.3,2.0,u);
  ns.visible=noF>.01;ns.scale.setScalar(Math.max(.01,back(noF)));ns.children.forEach(c=>{if(c.material&&c.material.opacity!==undefined&&c.isSprite)c.material.opacity=.8*noF;});};
 return R;}

function buildCloud(){
 const R=newRig([[14,26,66],[44,100,150],[252,196,150]]);
 lights(R,{key:0xffd7a0,keyI:2.6,keyPos:[-20,12,30],hemiSky:0x8fb2ff,hemiGround:0x9a7a60,hemiI:1.0});
 const sun=spr(TEX.glow,0xffc080,120,.7,true);sun.position.set(-40,-18,-90);R.bg.add(sun);
 cumulus3D(R,-22,-24,-12,1.3,0);cumulus3D(R,26,-28,-20,1.1,2);cumulus3D(R,0,-34,-30,1.5,4);
 const plane=airliner();R.fg.add(plane);const trail=new Trail(100,R.fg);
 const wisp=spr(TEX.puff,0xffffff,46,.22);R.fg.add(wisp);
 const sp=[];for(let i=0;i<10;i++){const s=spr(TEX.spark,0xffffff,1.1,0,true);R.fg.add(s);sp.push(s);}
 R.update=(u,d)=>{const p=ease(u/(d*.95)),tx=lerp(-15,9,p),ty=lerp(-1.5,1.5,p);
  const tail=V3(tx,ty,0),dir=V3(.993,.12,0).normalize();
  plane.rotation.z=Math.atan2(dir.y,dir.x);plane.position.copy(tail).addScaledVector(dir,5.2);
  trail.update(tail,dir,tx+45,{r0:.6,r1:4.2,a:.4+.32*p,wob:.7,t:u,seed:3,tf:.92,scatter:.9});
  for(let i=0;i<10;i++){const f=.08+.7*rnd(i+4);sp[i].position.set(tail.x-(tx+45)*f*.9,tail.y+(rnd(i)-.5)*3,(rnd(i+2)-.5)*2);sp[i].material.opacity=Math.pow(.5+.5*Math.sin(u*2.4+i*1.7),3)*.8;}
  wisp.position.set(lerp(22,-30,u/d),-8,26);
  aim(R,[tx*.45+1,1.2,62-3*u/d],[tx*.5+3,0,0],.01*Math.sin(u*.5),u,.03);};
 return R;}

function buildEngine(){
 const R=newRig([[4,6,14],[10,16,30],[22,22,34]]);
 lights(R,{key:0xffe2c0,keyI:3.2,keyPos:[-6,10,12],hemiSky:0x4a6a9a,hemiGround:0x14100c,hemiI:.9});
 const rim=new THREE.DirectionalLight(0x6ab4ff,2.6);rim.position.set(8,3,-10);R.fg.add(rim);
 const eng=new THREE.Group();eng.rotation.z=-.42;R.fg.add(eng);
 const steel=M(0x8c97a8,{roughness:.28,metalness:.85,side:THREE.DoubleSide,envMapIntensity:1.4});
 const dark=M(0x1a1e26,{roughness:.5,metalness:.6});
 const prof=[];for(let i=0;i<=32;i++){const x=-6+10*i/32,k=sm(-6,4,x);let r=lerp(2.55,1.55,k);if(x<-5.6)r+= (5.6+x)*-.0;prof.push(new THREE.Vector2(r,x));}
 const shell=new THREE.Mesh(new THREE.LatheGeometry(prof,64,Math.PI*.42,Math.PI*1.16),steel);shell.rotation.z=-Math.PI/2;eng.add(shell);
 const lip=new THREE.Mesh(new THREE.TorusGeometry(2.55,.14,16,64,Math.PI*1.16),steel);lip.rotation.y=Math.PI/2;lip.rotation.z=Math.PI*.42;lip.position.x=-6;
 // fan
 const fan=new THREE.Group();fan.position.x=-5;eng.add(fan);
 for(let k=0;k<16;k++){const a=k/16*Math.PI*2;const pv=new THREE.Group();pv.rotation.x=a;const b=new THREE.Mesh(new THREE.BoxGeometry(.5,1.9,.1),steel);b.position.y=1.35;b.rotation.y=.7;pv.add(b);fan.add(pv);}
 const hub=new THREE.Mesh(new THREE.ConeGeometry(.55,1.1,24),steel);hub.rotation.z=Math.PI/2;hub.position.x=-5.4;eng.add(hub);
 // compressor stages
 const stages=[];for(let s=0;s<5;s++){const g=new THREE.Group();g.position.x=-3.6+s*.65;const r=lerp(1.95,1.35,s/4);
  const disc=new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,.1,24),dark);disc.rotation.z=Math.PI/2;g.add(disc);
  for(let k=0;k<22;k++){const pv=new THREE.Group();pv.rotation.x=k/22*Math.PI*2;const b=new THREE.Mesh(new THREE.BoxGeometry(.07,r-.4,.3),steel);b.position.y=.4+(r-.4)/2;b.rotation.y=.5;pv.add(b);g.add(pv);}
  eng.add(g);stages.push(g);}
 // combustor
 const comb=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,1.9,40,1,true),M(0xff7a2a,{emissive:0xff5a10,emissiveIntensity:1.6,transparent:true,opacity:.45,side:THREE.DoubleSide,roughness:.4}));
 comb.rotation.z=Math.PI/2;comb.position.x=.4;eng.add(comb);
 const fl=[];for(let i=0;i<7;i++){const s=spr(TEX.glow,i<4?0xff8a30:0xffe0a0,(i<4?3.6:2.2),.9,true);s.position.set(-.2+i*.35,(rnd(i)-.5)*.6,(rnd(i+3)-.5)*.6);eng.add(s);fl.push(s);}
 const fire=new THREE.PointLight(0xff7a30,40,16,1.6);fire.position.set(.4,0,0);eng.add(fire);
 for(let k=0;k<3;k++){const t=new THREE.Mesh(new THREE.CylinderGeometry(1.1-k*.08,1.1-k*.08,.12,40),M(0x7a1d10,{emissive:0xff3a10,emissiveIntensity:.9-k*.2,roughness:.5}));t.rotation.z=Math.PI/2;t.position.x=1.7+k*.5;eng.add(t);}
 const noz=new THREE.Mesh(new THREE.ConeGeometry(1.3,2.4,40,1,true),steel);noz.rotation.z=-Math.PI/2;noz.position.x=3.6;eng.add(noz);
 const plug=new THREE.Mesh(new THREE.ConeGeometry(.5,1.6,24),dark);plug.rotation.z=-Math.PI/2;plug.position.x=3.8;eng.add(plug);
 // fuel droplets
 const fuel=[];for(let i=0;i<10;i++){const s=spr(TEX.dot,0xffd36a,.28,1,true);eng.add(s);fuel.push(s);}
 // exhaust puffs + molecules
 const ex=[];for(let i=0;i<46;i++){const s=spr(TEX.puff,0xffffff,1,0,false);eng.add(s);ex.push(s);}
 const mols=[];for(let i=0;i<6;i++){const m=molecule();m.scale.setScalar(.9);eng.add(m);mols.push(m);}
 R.update=(u,d)=>{
  fan.rotation.x=u*16;stages.forEach((s,i)=>s.rotation.x=-u*(10+i));
  const f=.8+.25*Math.sin(u*19)+.1*Math.sin(u*37);fire.intensity=40*f;fl.forEach((s,i)=>{s.material.opacity=.7+.3*Math.sin(u*14+i*2);});
  for(let i=0;i<10;i++){const ph=(u*1.3+i/10)%1;fuel[i].position.set(-.5+rnd(i)*1.6,lerp(1.9,.5,ph),(rnd(i+4)-.5)*1.2);fuel[i].material.opacity=Math.sin(ph*Math.PI);}
  for(let i=0;i<46;i++){const ph=(u*.5+i/46)%1,x=4.6+ph*13,sp=.7+ph*2.6;
   ex[i].position.set(x,(rnd(i)-.5)*2*sp*(.4+.6*rnd(i+3)),(rnd(i+7)-.5)*2*sp*.6);const r=lerp(.8,3,ph)*(.6+.6*rnd(i+5));ex[i].scale.set(r*2,r*2,1);
   ex[i].material.opacity=.7*Math.sin(ph*Math.PI);const w=1-ph;ex[i].material.color.setRGB(1,lerp(.9,.55,w),lerp(.95,.3,w));}
  for(let i=0;i<6;i++){const ph=(u*.28+i/6)%1;mols[i].position.set(5+ph*11,(rnd(i+20)-.5)*3.2*ph+Math.sin(u*2+i)*.3,(rnd(i+30)-.5)*2.4*ph);
   mols[i].rotation.set(u*.9+i,u*.7+i*2,0);const sc=(1+ph*.6)*Math.min(1,ph*6)*(1-Math.pow(ph,6));mols[i].scale.setScalar(Math.max(.001,sc));mols[i].userData.setHot(1-ph*.5);}
  const a=lerp(.62,1.35,ease(u/d)),rad=lerp(26,19,ease(u/d));
  aim(R,[1.5+Math.sin(a)*rad,lerp(5,1,u/d),Math.cos(a)*rad],[2.5,0,0],.02*Math.sin(u*.6),u,.02);};
 return R;}

function buildThermo(){
 const R=newRig([[4,8,26],[22,56,118],[130,200,235]]);
 lights(R,{key:0xdfeeff,keyI:2.6,keyPos:[-8,12,14],hemiSky:0x7aa8ff,hemiGround:0x20304a,hemiI:1.0});
 const rim=new THREE.DirectionalLight(0x9fd8ff,2.2);rim.position.set(10,2,-8);R.fg.add(rim);
 const tx=-1.2;const glass=new THREE.Mesh(new THREE.CylinderGeometry(.58,.58,14.4,40,1,true),M(0xcfe8ff,{transparent:true,opacity:.2,roughness:.05,clearcoat:1,side:THREE.DoubleSide,envMapIntensity:1.8}));glass.position.set(tx,0,0);R.fg.add(glass);
 const bulb=new THREE.Mesh(GSPH,M(0xcfe8ff,{transparent:true,opacity:.22,roughness:.05,clearcoat:1,side:THREE.DoubleSide,envMapIntensity:1.8}));bulb.scale.setScalar(1.15);bulb.position.set(tx,-7.6,0);R.fg.add(bulb);
 const hg=new THREE.CylinderGeometry(.34,.34,1,28);const merc=new THREE.Mesh(hg,M(0xff6450,{emissive:0xff2a1a,emissiveIntensity:.8,roughness:.2,clearcoat:1}));R.fg.add(merc);
 const mb=new THREE.Mesh(GSPH,merc.material);mb.scale.setScalar(.9);mb.position.set(tx,-7.6,0);R.fg.add(mb);
 const mg=spr(TEX.glow,0xff6450,5,.6,true);R.fg.add(mg);
 for(let k=0;k<21;k++){const t=new THREE.Mesh(new THREE.BoxGeometry(k%3?.45:.8,.07,.07),new THREE.MeshBasicMaterial({color:0xdfe8f5}));t.position.set(tx+1.2+(k%3?.0:.18),-6.5+k*.65,0);R.fg.add(t);}
 const ring=new THREE.Mesh(new THREE.TorusGeometry(1.5,.05,10,64),new THREE.MeshBasicMaterial({color:new THREE.Color(.5,1.4,2)}));ring.rotation.x=Math.PI/2;ring.position.set(tx,1,0);R.fg.add(ring);
 const dashes=[];for(let i=0;i<14;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(.4,.06,.06),new THREE.MeshBasicMaterial({color:new THREE.Color(.5,1.3,1.9),transparent:true}));b.position.set(tx+2.4+i*.6,1,0);R.fg.add(b);dashes.push(b);}
 const cr=crystal();cr.scale.setScalar(1.3);cr.position.set(tx-3.6,1,0);R.fg.add(cr);
 const pl=airliner();pl.scale.setScalar(.7);pl.position.set(7,9.5,-26);pl.rotation.z=.08;R.bg.add(pl);
 const fr=cloud(70,0xd8f0ff,.26);R.fg.add(fr);
 const glowF=spr(TEX.glow,0x8fd8ff,9,0,true);glowF.position.set(tx,1,0);R.fg.add(glowF);
 R.update=(u,d)=>{
  const lv=lerp(2.6,-4.8,ease((u-.3)/(d-1.0))),h=lv+7.0;merc.scale.set(1,Math.max(.01,h),1);merc.position.set(tx,-7+h/2,0);
  const cold=clamp((2.6-lv)/4);merc.material.color.setRGB(lerp(1,.35,cold),lerp(.39,.78,cold),lerp(.31,1,cold));merc.material.emissive.setRGB(lerp(1,.1,cold),lerp(.16,.5,cold),lerp(.1,1,cold));
  mg.position.set(tx,lv,.6);mg.material.color.copy(merc.material.color);
  const fz=sm(1,-1.5,lv);glowF.material.opacity=.6*Math.sin(Math.min(1,fz*1.2)*Math.PI)*(lv<1?1:0);dashes.forEach((b,i)=>b.material.opacity=.35+.6*(lv<1?1:0));
  cr.rotation.set(u*.4,u*.6,u*.3);
  for(let i=0;i<70;i++){setPts(fr,i,(rnd(i)*16-8-u*(.6+rnd(i+1)))%8,((rnd(i+9)*20+u*(.8+rnd(i+2)))%20)-9,(rnd(i+4)-.5)*10);}
  fr.material.opacity=.5+.4*fz;
  const a=lerp(-.45,.4,ease(u/d)),rad=26;aim(R,[Math.sin(a)*rad,lerp(-8,1,ease(u/d)),Math.cos(a)*rad],[0,lerp(-5,0,ease(u/d)),0],.018*Math.sin(u*.5),u,.02);};
 return R;}

function buildVapor(){
 const R=newRig([[6,10,24],[10,18,40],[14,20,38]]);
 lights(R,{key:0xffffff,keyI:1.2,keyPos:[2,10,14],hemiSky:0x5a7ab0,hemiGround:0x201410,hemiI:.7});
 const warm=new THREE.PointLight(0xff6a30,160,26,1.4);warm.position.set(-7,0,6);R.fg.add(warm);
 const cool=new THREE.PointLight(0x4aa8ff,160,26,1.4);cool.position.set(7,0,6);R.fg.add(cool);
 const wg=spr(TEX.glow,0xff6a30,26,.5,true);wg.position.set(-9,0,-6);R.bg.add(wg);const cg=spr(TEX.glow,0x4aa8ff,26,.5,true);cg.position.set(9,0,-6);R.bg.add(cg);
 const items=[];for(let i=0;i<12;i++){const m=molecule();const c=crystal();R.fg.add(m);R.fg.add(c);const f=spr(TEX.spark,0xffffff,2.2,0,true);R.fg.add(f);
  items.push({m,c,f,x0:-9+rnd(i)*9,v:1.3+rnd(i+3)*.8,y:-6.2+i*.95+(rnd(i+8)-.5)*.3,z:(rnd(i+5)-.5)*5});}
 R.update=(u,d)=>{
  for(const it of items){const x=it.x0+it.v*u,k=ease(x/1.6);const y=it.y+Math.sin(u*4+it.x0)*(.25*(1-k)+.06);
   it.m.visible=k<.99;it.c.visible=k>.02;
   it.m.position.set(x+(rnd(it.x0*7)-.5)*.1*Math.sin(u*14)*(1-k),y,it.z);it.m.rotation.set(u*1.2+it.y,u*(1.2-k),0);it.m.scale.setScalar(Math.max(.01,1.05*(1-k*.3)));it.m.userData.setHot(1-k);
   it.c.position.set(x,y,it.z);it.c.rotation.set(u*.5,u*.4+it.y,u*.3);it.c.scale.setScalar(Math.max(.001,1.1*back(k)));
   it.f.position.set(x,y,it.z+.5);it.f.material.opacity=k>.02&&k<.55?.9*Math.sin(k/.55*Math.PI):0;}
  const cx=lerp(-1.5,1.5,u/d),a=Math.sin(u*.35)*.18;aim(R,[cx+Math.sin(a)*25,.8,Math.cos(a)*25],[cx,0,0],.012*Math.sin(u*.4),u,.02);};
 return R;}

function buildSoot(){
 const R=newRig([[6,8,18],[16,20,36],[26,26,44]]);
 lights(R,{key:0xfff0e0,keyI:2.4,keyPos:[8,10,10],hemiSky:0x6a88c8,hemiGround:0x181420,hemiI:.9});
 const rim=new THREE.DirectionalLight(0x6ab8ff,2.6);rim.position.set(-8,-2,-10);R.fg.add(rim);
 const bgG=spr(TEX.glow,0x78a8ff,40,.35,true);bgG.position.set(0,0,-12);R.bg.add(bgG);
 const so=soot();so.scale.setScalar(1.5);R.fg.add(so);
 const mols=[];for(let i=0;i<20;i++){const m=molecule();m.scale.setScalar(.7);R.fg.add(m);
  const th=rnd(i)*Math.PI*2,ph=Math.acos(1-2*rnd(i+1));mols.push({m,dir:V3(Math.sin(ph)*Math.cos(th),Math.cos(ph),Math.sin(ph)*Math.sin(th)),R0:9+rnd(i+2)*4,rt:2.2+rnd(i+3)*.8,ts:.15+i*.1,fl:(()=>{const s=spr(TEX.glow,0xffffff,3,0,true);R.fg.add(s);return s;})()});}
 const shell=new THREE.Mesh(new THREE.IcosahedronGeometry(3.5,1),M(0xa8e4ff,{roughness:.1,transparent:true,opacity:.28,emissive:0x4fc3ff,emissiveIntensity:.5,flatShading:true,side:THREE.DoubleSide}));
 const edges=new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(3.5,1)),new THREE.LineBasicMaterial({color:0xcff0ff,transparent:true}));
 const sg=new THREE.Group();sg.add(shell,edges);R.fg.add(sg);
 R.update=(u,d)=>{const fr=ease((u-(d-1.1))/.6);
  so.rotation.set(u*.2,u*.3,0);
  for(const o of mols){const k=ease((u-o.ts)/1.1),rr=lerp(o.R0,o.rt,k),a=k*.7+(u>o.ts+1.1?(u-o.ts-1.1)*.25:0);
   const p=o.dir.clone().applyAxisAngle(V3(0,1,0),a).multiplyScalar(rr);o.m.position.copy(p);o.m.rotation.set(u+o.R0,u*.8,0);o.m.userData.setHot(0);
   o.fl.position.copy(p);const arr=u-(o.ts+1.1);o.fl.material.opacity=arr>0&&arr<.35?.9*(1-arr/.35):0;}
  sg.visible=fr>.01;sg.scale.setScalar(Math.max(.01,.6+.4*back(fr)));shell.material.opacity=.28*fr;edges.material.opacity=fr;
  const a=lerp(-.5,.9,ease(u/d)),rad=lerp(21,15.5,ease(u/d));aim(R,[Math.sin(a)*rad,lerp(3,1,u/d),Math.cos(a)*rad],[0,0,0],.02*Math.sin(u*.6),u,.02);};
 return R;}

function buildAir(humid){
 const R=newRig(humid?[[8,26,52],[24,86,120],[110,190,200]]:[[20,24,40],[120,100,110],[240,200,150]]);
 lights(R,humid?{key:0xcfeaff,keyI:2.2,keyPos:[10,14,20],hemiSky:0x7ab8e0,hemiGround:0x103040,hemiI:1.0}:{key:0xffd7a8,keyI:2.6,keyPos:[-18,10,20],hemiSky:0xc8a890,hemiGround:0x5a4030,hemiI:1.0});
 const g0=spr(TEX.glow,humid?0x78c8e8:0xffc890,90,.45,true);g0.position.set(humid?18:-30,-12,-70);R.bg.add(g0);
 const dir=V3(.95,.31,0).normalize();const plane=airliner();plane.scale.setScalar(.6);plane.rotation.z=Math.atan2(dir.y,dir.x);R.fg.add(plane);
 const trail=new Trail(humid?110:60,R.fg);
 const crs=[];for(let i=0;i<(humid?10:9);i++){const c=crystal();R.fg.add(c);crs.push(c);}
 const pts=cloud(humid?80:12,humid?0xa8d8ff:0xffeec0,humid?.34:.28,true,humid?.8:.6);R.fg.add(pts);
 const ck=clock3D(R.cam,!humid);R.hud=[ck];
 R.update=(u,d)=>{const tail=dir.clone().multiplyScalar(.6*u);
  plane.position.copy(tail).addScaledVector(dir,3.2);
  if(humid)trail.update(tail,dir,70,{r0:.4,r1:lerp(2.8,5.2,u/d),a:.55,wob:.9,t:u,seed:7,tf:.93,scatter:.5});
  else trail.update(tail,dir,15,{r0:.3,r1:1.3,a:.6,wob:.3,t:u,seed:5,tf:.1,scatter:.4});
  for(let i=0;i<crs.length;i++){let s,sc;if(humid){s=4+i*5;sc=lerp(.5,1.25,u/d)*(.8+.4*rnd(i));}else{s=1.4+i*1.3;sc=lerp(.75,.12,s/15)*(1-sm(3,13,s))*(1-.2*Math.sin(u*3+i));}
   crs[i].position.copy(tail).addScaledVector(dir,-s);crs[i].position.y+=Math.sin(u*2+i)*.2;crs[i].scale.setScalar(Math.max(.001,sc));crs[i].rotation.set(u*.4+i,u*.5,u*.3);}
  const n=humid?80:12;for(let i=0;i<n;i++){setPts(pts,i,(rnd(i)*34-17+Math.sin(u*.5+i)*.8)+tail.x*.8,((rnd(i+9)*20-8-u*(humid?.8:.2)*(.5+rnd(i+2)))%20+20)%20-9+tail.y,(rnd(i+4)-.5)*14);}
  ck.visible=true;
  if(humid)setClock(ck,u*1.1,u*1.1/12);else setClock(ck,clamp((u-.4)/1.7),clamp((u-.4)/1.7)/12);
  ck.scale.setScalar(.64*ease(u/.4)+.001);
  const pc=plane.position;aim(R,[pc.x-3.4+Math.sin(u*.3)*2.2,pc.y-3.25+Math.sin(u*.25)*1.2,34],[pc.x-3.4,pc.y-3.25,0],.012*Math.sin(u*.4),u,.03);};
 return R;}

function dropR(y){const t=clamp((y+1.35)/2.65);return .95*Math.pow(Math.sin(Math.PI*Math.pow(t,.65)),.85);}
function buildDrop(){
 const R=newRig([[6,10,30],[16,44,92],[40,100,150]]);
 lights(R,{key:0xe8f4ff,keyI:2.8,keyPos:[-6,10,12],hemiSky:0x6aa0e8,hemiGround:0x102038,hemiI:1.0});
 const rim=new THREE.DirectionalLight(0x8fd0ff,2.4);rim.position.set(8,3,-8);R.fg.add(rim);
 const S=3.6;const pts=[];for(let i=0;i<=64;i++){const y=-1.35+2.65*i/64;pts.push(new THREE.Vector2(Math.max(.001,dropR(y)),y));}
 const lg=new THREE.LatheGeometry(pts,64);
 const glass=new THREE.Mesh(lg,M(0xcfeaff,{transparent:true,opacity:.3,roughness:.04,clearcoat:1,side:THREE.DoubleSide,envMapIntensity:2.0}));
 const plane=new THREE.Plane(V3(0,-1,0),0);
 const wm=M(0x3da4ff,{transparent:true,opacity:.92,roughness:.08,clearcoat:1,emissive:0x1166dd,emissiveIntensity:.5,side:THREE.DoubleSide,clippingPlanes:[plane],envMapIntensity:1.6});
 const water=new THREE.Mesh(lg,wm);
 const surf=new THREE.Mesh(new THREE.CircleGeometry(1,48),M(0x9fd8ff,{emissive:0x4fa8ff,emissiveIntensity:.6,roughness:.1,side:THREE.DoubleSide}));surf.rotation.x=-Math.PI/2;
 const dg=new THREE.Group();dg.scale.setScalar(S);dg.add(glass,water,surf);R.fg.add(dg);
 const bub=cloud(14,0xffffff,.35,true,.8);R.fg.add(bub);
 const wmD=wmTag(R.fg,{pos:[0,-.2,3.0],w:4.4,style:'paint'});
 const trail=new Trail(80,R.bg);const pl=airliner();pl.scale.setScalar(.8);R.bg.add(pl);
 const sp=[];for(let i=0;i<8;i++){const s=spr(TEX.spark,0xcfeaff,1.2,0,true);R.fg.add(s);sp.push(s);}
 R.update=(u,d)=>{const fill=ease((u-.3)/(d-1.2));wmShow(wmD,u,2.2,4.4,.7);const lv=lerp(-1.35,1.25,fill);
  plane.constant=lv*S;surf.position.y=lv;surf.scale.setScalar(Math.max(.01,dropR(lv)));surf.visible=fill>.01;
  for(let i=0;i<14;i++){const ph=(u*.4+i/14)%1;setPts(bub,i,(rnd(i)-.5)*1.3*S*.7,lerp(-1.3*S,lv*S,ph),(rnd(i+4)-.5)*1.0*S*.5);}
  bub.visible=fill>.02;
  const th=V3(1,-.08,0).normalize();const tail=V3(11+.3*u,9.5-.1*u,-8);pl.position.copy(tail).addScaledVector(th,4);pl.rotation.z=-.08;
  trail.update(tail,th,60,{r0:.6,r1:lerp(1.4,4,fill),a:.55,wob:.7,t:u,seed:9,tf:.9,scatter:.5});
  for(let i=0;i<8;i++){const a=i*.8+u*.3;sp[i].position.set(Math.cos(a)*(1.35*S+rnd(i)*1.2),Math.sin(a)*1.35*S*.9,(rnd(i+3)-.5)*3);sp[i].material.opacity=Math.pow(.5+.5*Math.sin(u*2.2+i*1.3),3)*fill;}
  const a=lerp(-.5,.75,ease(u/d)),rad=lerp(24,19,ease(u/d));aim(R,[Math.sin(a)*rad,lerp(.5,2.2,u/d),Math.cos(a)*rad],[0,1.2,0],.012*Math.sin(u*.5),u,.02);
  wmFace(wmD,R);wmD.position.set(R.cam.position.x,0,R.cam.position.z).setLength(3.5).setY(-.2);};
 return R;}

const BUILD=[()=>buildHook(false),buildCloud,buildEngine,buildThermo,buildVapor,buildSoot,()=>buildAir(false),()=>buildAir(true),buildDrop,()=>buildHook(true)];
const TRANS=[null,'whip','push','whipUp','dissolve','push','dissolve','whipL','push','dissolve'];
