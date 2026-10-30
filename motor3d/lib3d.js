// ===== ASMR Explains 3D library (three.js r160 global build): procedural models, camera, transitions =====
const gl=new THREE.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
gl.setPixelRatio(1);gl.setSize(720*SC,1280*SC,false);
gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.0;
gl.outputColorSpace=THREE.SRGBColorSpace;gl.localClippingEnabled=true;
const glc=gl.domElement;
const V3=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const sm=(a,b,x)=>ease((x-a)/(b-a));

function ctex(size,draw){const c=document.createElement('canvas');c.width=c.height=size;draw(c.getContext('2d'),size);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;}
const TEX={
 glow:ctex(128,(g,s)=>{const r=g.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.25,'rgba(255,255,255,.5)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,s,s);}),
 puff:ctex(128,(g,s)=>{const r=g.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);r.addColorStop(0,'rgba(255,255,255,.95)');r.addColorStop(.5,'rgba(255,255,255,.5)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,s,s);}),
 spark:ctex(128,(g,s)=>{g.translate(s/2,s/2);const r=g.createRadialGradient(0,0,0,0,0,s/2);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.12,'rgba(255,255,255,.6)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(-s/2,-s/2,s,s);
  g.fillStyle='rgba(255,255,255,.95)';g.fillRect(-s*.48,-1.5,s*.96,3);g.fillRect(-1.5,-s*.48,3,s*.96);}),
 dot:ctex(64,(g,s)=>{const r=g.createRadialGradient(s/2,s/2,0,s/2,s/2,s/2);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.7,'rgba(255,255,255,.9)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,s,s);})
};
function skyTex(top,mid,bot,hy=.55){return ctex(256,(g,s)=>{const r=g.createLinearGradient(0,0,0,s);
 r.addColorStop(0,`rgb(${top})`);r.addColorStop(hy,`rgb(${mid})`);r.addColorStop(1,`rgb(${bot})`);g.fillStyle=r;g.fillRect(0,0,s,s);});}
// environment for reflections
function makeEnv(){const pm=new THREE.PMREMGenerator(gl);const sc=new THREE.Scene();
 const g=new THREE.SphereGeometry(20,48,24);const pos=g.attributes.position,col=new Float32Array(pos.count*3);
 for(let i=0;i<pos.count;i++){const y=pos.getY(i)/20;let c;
  if(y>0)c=[lerp(.9,.3,y),lerp(.75,.45,y),lerp(.6,.85,y)];else c=[lerp(.9,.05,-y),lerp(.75,.05,-y),lerp(.6,.08,-y)];col.set(c,i*3);}
 g.setAttribute('color',new THREE.BufferAttribute(col,3));
 sc.add(new THREE.Mesh(g,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.BackSide})));
 const mk=(w,h,p,c)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:c,side:THREE.DoubleSide}));m.position.set(...p);m.lookAt(0,0,0);sc.add(m);};
 mk(10,5,[8,10,6],new THREE.Color(7,6.4,5.6));mk(6,8,[-12,3,2],new THREE.Color(2.2,2.6,3.6));mk(8,3,[0,-6,-10],new THREE.Color(1.6,1.2,.9));
 const rt=pm.fromScene(sc,.02);pm.dispose();return rt.texture;}
const ENV=makeEnv();
function M(color,o={}){return new THREE.MeshPhysicalMaterial(Object.assign({color,roughness:.35,metalness:0,envMap:ENV,envMapIntensity:1},o));}
function spr(tex,col,sz,op=1,add=false){const m=new THREE.SpriteMaterial({map:tex,color:col,transparent:true,opacity:op,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending,fog:false});
 const s=new THREE.Sprite(m);s.scale.set(sz,sz,1);return s;}
function newRig(sky){const scene=new THREE.Scene();const cam=new THREE.PerspectiveCamera(34,720/1280,.1,500);
 const bg=new THREE.Group(),fg=new THREE.Group();scene.add(bg,fg,cam);
 if(sky)scene.background=skyTex(...sky);
 return {scene,cam,bg,fg,update:()=>{}};}
function lights(R,o={}){const {key=0xffd9a8,keyI=2.2,keyPos=[5,8,6],hemiSky=0x8fa8ff,hemiGround=0x2a2018,hemiI=.7}=o;
 const k=new THREE.DirectionalLight(key,keyI);k.position.set(...keyPos);R.fg.add(k);
 R.fg.add(new THREE.HemisphereLight(hemiSky,hemiGround,hemiI));return k;}
function aim(R,pos,target,roll=0,t=0,shake=.02){const c=R.cam;
 c.position.set(pos[0]+Math.sin(t*1.7)*shake,pos[1]+Math.sin(t*2.3+1)*shake,pos[2]+Math.sin(t*1.1+2)*shake);
 c.lookAt(target[0],target[1],target[2]);if(roll)c.rotateZ(roll);}

// ---- vapor trail made of billboard puffs (3D positions => real parallax) ----
class Trail{
 constructor(n,parent){this.n=n;this.sp=[];for(let i=0;i<n;i++){const s=spr(TEX.puff,0xffffff,1,0,false);parent.add(s);this.sp.push(s);}}
 update(head,dir,L,o){const {r0=.3,r1=2,a=.5,wob=.4,t=0,seed=0,tf=.5,warm=0,scatter=.5,sizeMul=1}=o;
  const up=V3(0,1,0),side=dir.clone().cross(up).normalize();
  for(let i=0;i<this.n;i++){const f=(i+1)/this.n,s=f*L,sp=this.sp[i];
   const w1=Math.sin(f*8+seed+t*.6)*wob*f+Math.sin(f*21+seed*2-t*.9)*wob*.35*f,w2=Math.sin(f*6+seed*3+t*.5)*wob*.5*f;
   const r=lerp(r0,r1,Math.pow(f,.75))*(.8+rnd(i+seed*7)*.45)*sizeMul;
   sp.position.copy(head).addScaledVector(dir,-s).addScaledVector(side,w1+(rnd(i+3)-.5)*r*scatter).addScaledVector(up,w2+(rnd(i+9)-.5)*r*scatter);
   sp.scale.set(r*2,r*2,1);
   const al=a*Math.min(1,f*22)*(1-ease((f-tf)/(1-tf)));sp.material.opacity=clamp(al);
   const wm=warm*Math.max(0,1-f*2);sp.material.color.setRGB(1,1-.18*wm,1-.4*wm);}}
}
// ---- procedural airliner, nose toward +X, length ~10.8 ----
function airliner(){const g=new THREE.Group();
 const white=M(0xf4f6fa,{roughness:.22,clearcoat:1,clearcoatRoughness:.08,envMapIntensity:1.2,side:THREE.DoubleSide});
 const gold=M(0xf5c451,{roughness:.3,clearcoat:.6,side:THREE.DoubleSide});
 const grey=M(0x8793a6,{roughness:.3,metalness:.7});
 const dark=M(0x0d1018,{roughness:.2,metalness:.2});
 const pts=[];const N=44;
 for(let i=0;i<=N;i++){const x=-5.4+10.8*i/N;let r=.62;
  if(x>3.2){const k=(x-3.2)/2.2;r=.62*Math.sqrt(Math.max(0,1-k*k))+.02;}
  else if(x<-2.6){const k=(-2.6-x)/2.8;r=Math.max(.13,.62*(1-.85*k*k));}
  pts.push(new THREE.Vector2(r,x));}
 const fus=new THREE.Mesh(new THREE.LatheGeometry(pts,40),white);fus.rotation.z=-Math.PI/2;g.add(fus);
 const wing=(p,th)=>{const sh=new THREE.Shape();sh.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)sh.lineTo(p[i][0],p[i][1]);sh.closePath();
  const geo=new THREE.ExtrudeGeometry(sh,{depth:th,bevelEnabled:false});geo.translate(0,0,-th/2);return geo;};
 const wg=wing([[1.0,.4],[-1.4,.4],[-3.4,5.0],[-2.5,5.0]],.13);
 for(const sg of[1,-1]){const w=new THREE.Mesh(wg,white);w.rotation.x=Math.PI/2;w.position.y=-.28;w.scale.z=sg;g.add(w);
  const st=new THREE.Mesh(wg,white);st.rotation.x=Math.PI/2;st.position.set(-3.5,.05,0);st.scale.set(.42,.42,.42*sg);g.add(st);
  const e=new THREE.Group();const nac=new THREE.Mesh(new THREE.CylinderGeometry(.44,.4,1.6,32),grey);nac.rotation.z=Math.PI/2;e.add(nac);
  const inl=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,.1,24),dark);inl.rotation.z=Math.PI/2;inl.position.x=.8;e.add(inl);
  const cone=new THREE.Mesh(new THREE.ConeGeometry(.28,.55,24),grey);cone.rotation.z=Math.PI/2;cone.position.x=-1.05;e.add(cone);
  const py=new THREE.Mesh(new THREE.BoxGeometry(.7,.45,.12),white);py.position.set(.1,.38,0);e.add(py);
  e.position.set(.3,-.78,sg*1.95);g.add(e);}
 const fin=new THREE.Mesh(wing([[-3.5,.5],[-5.2,.5],[-5.55,2.3],[-4.7,2.3]],.1),gold);g.add(fin);
 const cock=new THREE.Mesh(new THREE.BoxGeometry(.55,.16,.62),dark);cock.position.set(3.7,.3,0);cock.rotation.z=-.3;g.add(cock);
 return g;}
// ---- water molecule (hot=1 orange, hot=0 cool blue) ----
const GSPH=new THREE.SphereGeometry(1,24,16),GCYL=new THREE.CylinderGeometry(1,1,1,10);
function bond(g,a,b,r,m){const d=b.clone().sub(a),len=d.length();const c=new THREE.Mesh(GCYL,m);c.scale.set(r,len,r);c.position.copy(a).addScaledVector(d,.5);
 c.quaternion.setFromUnitVectors(V3(0,1,0),d.normalize());g.add(c);}
function molecule(){const g=new THREE.Group();const mO=M(0x6fc3ff,{roughness:.18,clearcoat:1,emissive:0x000000});
 const mH=M(0xf4f8ff,{roughness:.2,clearcoat:1}),mB=M(0xdfe8f5,{roughness:.4});
 const O=new THREE.Mesh(GSPH,mO);O.scale.setScalar(.5);g.add(O);
 const hp=[V3(.67,-.52,0),V3(-.67,-.52,0)];
 for(const p of hp){const h=new THREE.Mesh(GSPH,mH);h.scale.setScalar(.29);h.position.copy(p);g.add(h);bond(g,V3(),p.clone(),.07,mB);}
 g.userData={O:mO,setHot(h){mO.color.setRGB(lerp(.43,1,h),lerp(.76,.38,h),lerp(1,.27,h));mO.emissive.setRGB(h*.6,h*.12,h*.03);}};return g;}
// ---- 3D ice crystal ----
function crystal(){const g=new THREE.Group();
 const m=M(0xbfeaff,{roughness:.12,clearcoat:1,transparent:true,opacity:.94,emissive:0x4fc3ff,emissiveIntensity:.55});
 const arm=new THREE.BoxGeometry(1,.13,.13),br=new THREE.BoxGeometry(.36,.1,.1);
 for(let k=0;k<6;k++){const grp=new THREE.Group();grp.rotation.z=k*Math.PI/3;
  const a=new THREE.Mesh(arm,m);a.position.x=.5;grp.add(a);
  for(const sg of[1,-1]){const b=new THREE.Mesh(br,m);b.position.set(.68,sg*.12,0);b.rotation.z=sg*.9;grp.add(b);}
  g.add(grp);}
 const hex=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.16,6),m);hex.rotation.x=Math.PI/2;g.add(hex);
 return g;}
function soot(){const g=new THREE.Group();const m=M(0x14161b,{roughness:.88});
 const P=[[0,0,0,1],[.8,.3,.2,.7],[-.8,.1,-.2,.75],[.2,-.8,.3,.65],[-.3,.8,.1,.62],[.9,-.5,-.3,.45],[-.95,-.5,.3,.5],[.5,.9,-.5,.42],[-.2,-.2,.9,.55]];
 for(const[x,y,z,k]of P){const s=new THREE.Mesh(GSPH,m);s.scale.setScalar(k*.9);s.position.set(x*.8,y*.8,z*.8);g.add(s);}
 return g;}
// points cloud helper
function cloud(n,col,size,add=true,op=1){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(n*3),3));
 const p=new THREE.Points(geo,new THREE.PointsMaterial({map:TEX.dot,size,color:col,transparent:true,opacity:op,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending,sizeAttenuation:true}));p.frustumCulled=false;return p;}
function setPts(p,i,x,y,z){const a=p.geometry.attributes.position;a.setXYZ(i,x,y,z);a.needsUpdate=true;}
// HUD objects (children of the camera)
function noSign3D(cam){const g=new THREE.Group();
 const red=new THREE.MeshBasicMaterial({color:new THREE.Color(2.2,.35,.28)});
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.7,.075,16,64),red);g.add(ring);
 const sl=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,1.0,12),red);sl.rotation.z=Math.PI/4;g.add(sl);
 const sp=[];for(let i=0;i<7;i++){const s=spr(TEX.puff,0xa8a8b4,.9+rnd(i)*.4,.8);s.position.set((rnd(i+1)-.5)*.7,(rnd(i+2)-.5)*.4,-.05);g.add(s);sp.push(s);}
 g.position.set(0,-1.94,-14);cam.add(g);g.visible=false;return g;}
function clock3D(cam,sweep){const g=new THREE.Group();
 const face=new THREE.Mesh(new THREE.CylinderGeometry(.65,.65,.12,48),M(0x14171e,{roughness:.4}));face.rotation.x=Math.PI/2;g.add(face);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.65,.03,12,48),M(0xdfe8f5,{roughness:.3}));g.add(ring);
 for(let k=0;k<12;k++){const t=new THREE.Mesh(new THREE.BoxGeometry(.035,k%3?.07:.13,.03),new THREE.MeshBasicMaterial({color:0xcfd6e2}));const a=k/12*Math.PI*2;
  t.position.set(Math.sin(a)*.55,Math.cos(a)*.55,.07);t.rotation.z=-a;g.add(t);}
 const hm=new THREE.Group(),hh=new THREE.Group();
 const m1=new THREE.Mesh(new THREE.BoxGeometry(.05,.5,.03),new THREE.MeshBasicMaterial({color:sweep?0x5db7ff:0x5db7ff}));m1.position.y=.25;hm.add(m1);
 const m2=new THREE.Mesh(new THREE.BoxGeometry(.07,.32,.03),new THREE.MeshBasicMaterial({color:0xffffff}));m2.position.y=.16;hh.add(m2);
 hm.position.z=hh.position.z=.09;g.add(hm,hh);
 const hub=new THREE.Mesh(new THREE.SphereGeometry(.06,16,12),new THREE.MeshBasicMaterial({color:0xffffff}));hub.position.z=.09;g.add(hub);
 g.position.set(0,-1.74,-14);g.userData={hm,hh};cam.add(g);g.visible=false;return g;}
function setClock(g,minTurn,hourTurn){g.userData.hm.rotation.z=-minTurn*Math.PI*2;g.userData.hh.rotation.z=-hourTurn*Math.PI*2;}

// ===== transitions =====
const cA=document.createElement('canvas'),cB=document.createElement('canvas');cA.width=cB.width=720*SC;cA.height=cB.height=1280*SC;
const xA=cA.getContext('2d'),xB=cB.getContext('2d');xA.setTransform(SC,0,0,SC,0,0);xB.setTransform(SC,0,0,SC,0,0);
function smear(img,x,y,dx,dy,a){const n=7;ctx.save();for(let j=0;j<n;j++){const k=j/(n-1)-.5;ctx.globalAlpha=a/(j+1);ctx.drawImage(img,x+k*dx,y+k*dy,720,1280);}ctx.restore();}
function transition(kind,p){const e=ease(p);
 ctx.fillStyle='#05060a';ctx.fillRect(0,0,720,1280);
 if(kind==='whip'||kind==='whipL'){const s=kind==='whip'?-1:1;const bl=Math.sin(Math.PI*p)*260;
  smear(cA,s*e*720,0,bl,0,1);smear(cB,-s*(1-e)*720,0,bl,0,1);}
 else if(kind==='whipUp'){const bl=Math.sin(Math.PI*p)*320;smear(cA,0,e*1280,0,bl,1);smear(cB,0,-(1-e)*1280,0,bl,1);}
 else if(kind==='push'){const sB=1.14-.14*e,sA=1+.55*e;
  ctx.save();ctx.translate(360,640);ctx.scale(sB,sB);ctx.translate(-360,-640);ctx.drawImage(cB,0,0,720,1280);ctx.restore();
  ctx.save();ctx.globalAlpha=1-e;ctx.translate(360,640);ctx.scale(sA,sA);ctx.translate(-360,-640);ctx.drawImage(cA,0,0,720,1280);ctx.restore();}
 else{ctx.drawImage(cA,0,0,720,1280);ctx.save();ctx.globalAlpha=e;ctx.drawImage(cB,0,0,720,1280);ctx.restore();}}

// ===================== EXTRA PIECES (v2) =====================
// ---- WATERMARK INTEGRADA: "@asmr_explains" como decal dentro de la escena (pintura, cristal, tiza) ----
function wmTex(style){return ctex(1024,(g,s)=>{g.clearRect(0,0,s,s);g.translate(s/2,s/2);g.font='800 150px Inter';g.textAlign='center';g.textBaseline='middle';{const w0=g.measureText('@asmr_explains').width;const px=Math.floor(150*Math.min(1,900/w0));g.font='800 '+px+'px Inter';}
 if(style==='glow'){g.shadowColor='rgba(255,255,255,.9)';g.shadowBlur=30;g.fillStyle='rgba(255,255,255,.95)';}
 else if(style==='chalk'){g.fillStyle='rgba(255,255,255,.92)';}
 else{g.fillStyle='#1b2a4a';}
 g.fillText('@asmr_explains',0,0);});}
// wmTag(parent,{pos:[x,y,z],rot:[rx,ry,rz],w:ancho,style:'paint'|'glow'|'chalk'}) -> Mesh plano, empieza invisible (opacity 0)
function wmTag(parent,o={}){const {pos=[0,0,0],rot=[0,0,0],w=3,style='paint'}=o;
 const m=new THREE.Mesh(new THREE.PlaneGeometry(w,w),new THREE.MeshBasicMaterial({map:wmTex(style),transparent:true,opacity:0,depthWrite:false,toneMapped:false,blending:style==='glow'?THREE.AdditiveBlending:THREE.NormalBlending,side:THREE.DoubleSide}));
 m.position.set(...pos);m.rotation.set(...rot);m.userData.wm=true;parent.add(m);return m;}
// wmShow(mesh|[meshes],u,t0,t1,max): visible entre t0 y t1 (segundos de la escena) con fundido de .5 s; max<=0.9 para que no moleste
function wmShow(list,u,t0,t1,max=.8){const a=clamp(ease((u-t0)/.5)*ease((t1-u)/.5));(Array.isArray(list)?list:[list]).forEach(m=>{m.material.opacity=a*max;m.visible=a>.01;});}
// wmFace(mesh,R): la marca mira siempre a cámara (útil dentro de objetos transparentes: gota, cristal, termómetro)
function wmFace(m,R){m.quaternion.copy(R.cam.quaternion);}
// el avión ya trae la marca pintada en el fuselaje: plane.userData.wm (2 decals, uno por lado)
{const _air0=airliner;airliner=function(){const g=_air0();
 g.userData.wm=[wmTag(g,{pos:[-.9,.1,.66],w:2.9}),wmTag(g,{pos:[-.9,.1,-.66],rot:[0,Math.PI,0],w:2.9})];return g;};}

// ---- Persona simbólica (silueta abstracta, sin rasgos): cabeza esfera + cuerpo cápsula ----
function person(color=0xcfd8ea,s=1){const g=new THREE.Group();const m=M(color,{roughness:.45,clearcoat:.4});
 const head=new THREE.Mesh(GSPH,m);head.scale.setScalar(.34);head.position.y=1.5;g.add(head);
 const body=new THREE.Mesh(new THREE.CapsuleGeometry(.4,.85,8,20),m);body.position.y=.72;g.add(body);
 g.scale.setScalar(s);g.userData.mat=m;return g;}
// ---- Balanza (dilemas): g.userData.setTilt(a) a en radianes (+ baja el plato derecho) ----
function balanceScale(){const g=new THREE.Group();const metal=M(0xd9b45a,{metalness:.9,roughness:.25,envMapIntensity:1.5});
 const post=new THREE.Mesh(new THREE.CylinderGeometry(.12,.18,3.2,20),metal);post.position.y=-.2;g.add(post);
 const base=new THREE.Mesh(new THREE.CylinderGeometry(1,1.2,.2,32),metal);base.position.y=-1.9;g.add(base);
 const beam=new THREE.Group();beam.position.y=1.4;g.add(beam);
 beam.add(new THREE.Mesh(new THREE.BoxGeometry(4.6,.14,.14),metal));
 const pans=[];for(const sx of[-2.2,2.2]){const p=new THREE.Group();p.position.set(sx,0,0);beam.add(p);
  const rope=new THREE.Mesh(new THREE.CylinderGeometry(.02,.02,1.6,6),metal);rope.position.y=-.8;p.add(rope);
  const pan=new THREE.Mesh(new THREE.CylinderGeometry(.9,.6,.18,32),metal);pan.position.y=-1.6;p.add(pan);pans.push(p);}
 g.userData.setTilt=a=>{beam.rotation.z=-a;pans.forEach(p=>p.rotation.z=a);};g.userData.pans=pans;return g;}
// ---- Botón grande (hipotético): g.userData.setPress(0..1) ----
function bigButton(color=0xff3b30){const g=new THREE.Group();
 const base=new THREE.Mesh(new THREE.CylinderGeometry(1.5,1.7,.5,48),M(0x2a2f3a,{metalness:.7,roughness:.35}));g.add(base);
 const cap=new THREE.Mesh(new THREE.CylinderGeometry(1.0,1.1,.5,48),M(color,{emissive:color,emissiveIntensity:.5,clearcoat:1,roughness:.2}));cap.position.y=.45;g.add(cap);
 g.userData.setPress=p=>{cap.position.y=.45-.28*p;};return g;}
// ---- Flecha 3D simple apuntando a +X ----
function arrow3D(color=0xffffff,len=3){const g=new THREE.Group();const m=M(color,{emissive:color,emissiveIntensity:.35});
 const sh=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,len,16),m);sh.rotation.z=Math.PI/2;sh.position.x=len/2;g.add(sh);
 const hd=new THREE.Mesh(new THREE.ConeGeometry(.35,.7,24),m);hd.rotation.z=-Math.PI/2;hd.position.x=len+.2;g.add(hd);return g;}
// ---- Barras 3D (comparativas): bars3D([valores 0..1],colores) -> g.userData.set(i,altura) ----
function bars3D(n,colors=[0x6ab4ff],w=.9,gap=.5,maxH=4){const g=new THREE.Group();const bs=[];
 for(let i=0;i<n;i++){const b=new THREE.Mesh(new THREE.BoxGeometry(w,1,w),M(colors[i%colors.length],{clearcoat:.5}));b.position.x=(i-(n-1)/2)*(w+gap);g.add(b);bs.push(b);}
 g.userData.set=(i,h)=>{const H=Math.max(.001,h*maxH);bs[i].scale.y=H;bs[i].position.y=H/2;};return g;}
// ---- Camino que se bifurca (dilema del tranvía abstracto): vías como tubos ----
function forkTrack(){const g=new THREE.Group();const m=M(0x8a93a6,{metalness:.8,roughness:.3});
 const mk=(pts)=>{const c=new THREE.CatmullRomCurve3(pts.map(p=>V3(...p)));g.add(new THREE.Mesh(new THREE.TubeGeometry(c,40,.09,8,false),m));};
 mk([[-10,0,0],[-3,0,0],[0,0,0]]);mk([[0,0,0],[3,0,.2],[10,0,3]]);mk([[0,0,0],[3,0,-.2],[10,0,-3]]);return g;}
// ---- Cámara: planos genéricos ----
// orbit(R,center,radius,angle,height,t,roll) y push(R,from,to,target,p)
function orbit(R,c,rad,ang,h,t,roll=0){aim(R,[c[0]+Math.sin(ang)*rad,c[1]+h,c[2]+Math.cos(ang)*rad],c,roll,t,.02);}
function dolly(R,a,b,tgt,p,t,roll=0){const e=ease(p);aim(R,[lerp(a[0],b[0],e),lerp(a[1],b[1],e),lerp(a[2],b[2],e)],tgt,roll,t,.02);}

// ===================== ORQUESTACIÓN (no tocar) =====================
// El fichero de escenas define: const BUILD=[()=>rigScene0, ...] (una por frase) y const TRANS=[null,'whip','push','whipUp','whipL','dissolve',...]
const rigs=[];function getRig(i){if(!rigs[i])rigs[i]=BUILD[i]();return rigs[i];}
function draw3d(i,u,d,x2d){const R=getRig(i);R.update(u,d);R.fg.visible=!window.__BGONLY;
 if(window.__BGONLY&&R.hud)R.hud.forEach(h=>h.visible=false);
 gl.render(R.scene,R.cam);x2d.drawImage(glc,0,0,720,1280);}
const TR3=.42;
window.render=function(t){
 let i=0;for(let k=0;k<N;k++){if(t>=sStart(k))i=k;}
 const st=sStart(i),en=sEnd(i),u=Math.max(0,t-st),d=en-st;
 ctx.setTransform(SC,0,0,SC,0,0);xA.setTransform(SC,0,0,SC,0,0);xB.setTransform(SC,0,0,SC,0,0);ctx.globalAlpha=1;ctx.shadowBlur=0;ctx.fillStyle='#05060a';ctx.fillRect(0,0,W,H);
 if(i>0&&u<TR3){const ps=sStart(i-1),pd=sEnd(i-1)-ps;draw3d(i-1,t-ps,pd,xA);draw3d(i,u,d,xB);transition(TRANS[i],u/TR3);}
 else draw3d(i,u,d,ctx);
 dust(t);finish(t);subs(t);
 ctx.fillStyle=C.gold;ctx.fillRect(0,H-6,W*t/T.total,6);
};
