// ===== ASMR Explains engine v4 (canvas 2D): camera, transitions, glow, grain, vignette =====
const T=__TIMING__;
const W=720,H=1280,SC=window.SC||1,cv=document.getElementById('c');cv.width=W*SC;cv.height=H*SC;const ctx=cv.getContext('2d');ctx.setTransform(SC,0,0,SC,0,0);
const C={gold:'#f5c451',cream:'#f4e6bf',white:'#ffffff',red:'#ff5a4d',water:'#5db7ff'};
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
const eo=x=>{x=clamp(x);return 1-Math.pow(1-x,3)};
const lerp=(a,b,t)=>a+(b-a)*t;
const rnd=i=>{const s=Math.sin(i*12.9898+78.233)*43758.5453;return s-Math.floor(s)};
const back=x=>{x=clamp(x);const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2)};
const rgba=(c,a)=>`rgba(${c[0]|0},${c[1]|0},${c[2]|0},${a})`;
const mixc=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
const S=T.segs,N=S.length;
const sStart=i=>S[i].start-0.1, sEnd=i=>i<N-1?S[i+1].start-0.1:T.total;

function glow(x,y,r,c,a,add=true){ctx.save();if(add)ctx.globalCompositeOperation='lighter';
 const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,rgba(c,a));g.addColorStop(1,rgba(c,0));
 ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();ctx.restore();}
function sky(top,mid,bot,hy=.6){const g=ctx.createLinearGradient(0,-60,0,H+60);
 g.addColorStop(0,rgba(top,1));g.addColorStop(hy,rgba(mid,1));g.addColorStop(1,rgba(bot,1));
 ctx.fillStyle=g;ctx.fillRect(-80,-80,W+160,H+160);}
function puff(x,y,r,c,a){const g=ctx.createRadialGradient(x,y,0,x,y,r);
 g.addColorStop(0,rgba(c,a));g.addColorStop(.55,rgba(c,a*.55));g.addColorStop(1,rgba(c,0));
 ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.fill();}
function star(x,y,r,a,c=[255,240,220]){ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha*=clamp(a);
 ctx.strokeStyle=rgba(c,1);ctx.lineWidth=2;ctx.lineCap='round';ctx.beginPath();
 ctx.moveTo(x-r,y);ctx.lineTo(x+r,y);ctx.moveTo(x,y-r);ctx.lineTo(x,y+r);ctx.stroke();
 ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x-r*.5,y-r*.5);ctx.lineTo(x+r*.5,y+r*.5);ctx.moveTo(x-r*.5,y+r*.5);ctx.lineTo(x+r*.5,y-r*.5);ctx.stroke();
 ctx.restore();glow(x,y,r*1.6,c,.5*clamp(a));}

// vapor trail made of soft puffs, head at (hx,hy), going backwards along -(dx,dy)
function trail(hx,hy,dx,dy,L,o){
 const {r0=6,r1=40,a=.5,wob=10,t=0,n=70,col=[255,248,240],shade=null,seed=0,tf=.5,warm=0}=o;
 for(let i=n;i>=1;i--){const f=i/n,s=f*L;
  const w=Math.sin(f*8+seed+t*.6)*wob*f+Math.sin(f*21+seed*2-t*.9)*wob*.35*f;
  const px=hx-dx*s+(-dy)*w, py=hy-dy*s+dx*w;
  const r=lerp(r0,r1,Math.pow(f,.75))*(.8+rnd(i+seed*7)*.45);
  const al=a*Math.min(1,f*22)*(1-ease((f-tf)/(1-tf)));
  if(al<.01)continue;
  if(shade)puff(px,py+r*.28,r,shade,al*.6);
  puff(px,py,r*.92,col,al);
  if(warm>0&&f<.5){ctx.save();ctx.globalCompositeOperation='lighter';puff(px,py,r,[255,150,80],warm*(1-f*2)*al*.5);ctx.restore();}
 }}
function plane(x,y,s,ang,col='#080b16'){
 ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.scale(s,s);ctx.fillStyle=col;
 ctx.beginPath();ctx.moveTo(104,2);ctx.bezierCurveTo(104,-10,84,-17,56,-17);ctx.lineTo(-80,-15);ctx.lineTo(-100,-46);ctx.lineTo(-116,-46);
 ctx.lineTo(-102,-8);ctx.lineTo(-112,3);ctx.lineTo(-84,10);ctx.lineTo(60,12);ctx.bezierCurveTo(88,12,104,8,104,2);ctx.closePath();ctx.fill();
 ctx.strokeStyle='rgba(255,190,130,.55)';ctx.lineWidth=2/s;ctx.stroke();
 ctx.beginPath();ctx.moveTo(14,6);ctx.lineTo(-34,58);ctx.lineTo(-54,58);ctx.lineTo(-24,6);ctx.closePath();ctx.fill();
 ctx.beginPath();ctx.roundRect(-10,22,40,15,7);ctx.fill();
 ctx.restore();}
function crystal(x,y,r,rot,a,col=[190,235,255]){
 if(a<=.01||r<=.5)return;
 ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.globalAlpha*=clamp(a);
 ctx.strokeStyle=rgba(col,1);ctx.lineWidth=Math.max(1.6,r*.1);ctx.lineCap='round';
 ctx.shadowColor=rgba(col,.9);ctx.shadowBlur=r*.7;
 for(let k=0;k<6;k++){ctx.rotate(Math.PI/3);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(r,0);
  ctx.moveTo(r*.55,0);ctx.lineTo(r*.8,r*.3);ctx.moveTo(r*.55,0);ctx.lineTo(r*.8,-r*.3);ctx.stroke();}
 ctx.restore();}
// water molecule H2O (hot=1 warm orange, hot=0 cool blue)
function h2o(x,y,s,rot,a,hot=0){
 if(a<=.01)return;
 ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.globalAlpha*=clamp(a);
 const oc=mixc([110,195,255],[255,106,70],hot);
 glow(0,0,34*s,oc,.35);
 const hx=Math.sin(.91)*30*s,hy=Math.cos(.91)*30*s;
 ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=3*s;ctx.lineCap='round';
 ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(hx,hy);ctx.moveTo(0,0);ctx.lineTo(-hx,hy);ctx.stroke();
 for(const sg of[-1,1]){const g=ctx.createRadialGradient(sg*hx-3*s,hy-3*s,1,sg*hx,hy,11*s);g.addColorStop(0,'#fff');g.addColorStop(1,'#cfe0f5');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(sg*hx,hy,10*s,0,7);ctx.fill();}
 const g=ctx.createRadialGradient(-5*s,-6*s,2,0,0,19*s);g.addColorStop(0,rgba(mixc(oc,[255,255,255],.55),1));g.addColorStop(1,rgba(oc,1));
 ctx.fillStyle=g;ctx.beginPath();ctx.arc(0,0,18*s,0,7);ctx.fill();
 ctx.restore();}
function soot(x,y,s,a=1){
 ctx.save();ctx.translate(x,y);ctx.globalAlpha*=clamp(a);
 const P=[[0,0,1],[.7,.2,.7],[-.7,.1,.75],[.2,-.7,.65],[-.25,.7,.62],[.9,-.5,.45],[-.95,-.45,.5],[.55,.8,.42]];
 for(const[ox,oy,k]of P){const r=34*k*s,cx=ox*30*s,cy=oy*30*s;
  const g=ctx.createRadialGradient(cx-r*.3,cy-r*.3,1,cx,cy,r);g.addColorStop(0,'#4a4e5a');g.addColorStop(1,'#0b0c10');
  ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.fill();}
 ctx.restore();}
function clockFace(cx,cy,r){ctx.fillStyle='#14171e';ctx.beginPath();ctx.arc(cx,cy,r,0,7);ctx.fill();
 ctx.strokeStyle='rgba(255,255,255,.18)';ctx.lineWidth=3;ctx.stroke();
 for(let k=0;k<12;k++){const an=k/12*6.283;ctx.strokeStyle='rgba(255,255,255,.45)';ctx.lineWidth=k%3?2:4;ctx.beginPath();
  ctx.moveTo(cx+Math.cos(an)*(r-8),cy+Math.sin(an)*(r-8));ctx.lineTo(cx+Math.cos(an)*(r-(k%3?14:20)),cy+Math.sin(an)*(r-(k%3?14:20)));ctx.stroke();}}
function clockSweep(cx,cy,r,f,a=1){ctx.save();ctx.globalAlpha*=clamp(a);f=clamp(f);clockFace(cx,cy,r);
 ctx.strokeStyle=C.water;ctx.lineWidth=10;ctx.lineCap='round';ctx.beginPath();ctx.arc(cx,cy,r-26,-Math.PI/2,-Math.PI/2+6.283*f);ctx.stroke();
 const an=-Math.PI/2+6.283*f;ctx.strokeStyle='#fff';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(an)*(r-30),cy+Math.sin(an)*(r-30));ctx.stroke();
 ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(cx,cy,6,0,7);ctx.fill();ctx.restore();}
function clockSpin(cx,cy,r,h,a=1){ctx.save();ctx.globalAlpha*=clamp(a);clockFace(cx,cy,r);
 const am=-Math.PI/2+6.283*h,ah=-Math.PI/2+6.283*h/12;
 ctx.lineCap='round';ctx.strokeStyle='#fff';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(ah)*(r*.5),cy+Math.sin(ah)*(r*.5));ctx.stroke();
 ctx.strokeStyle=C.water;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(am)*(r-24),cy+Math.sin(am)*(r-24));ctx.stroke();
 ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(cx,cy,6,0,7);ctx.fill();ctx.restore();}
function noSign(cx,cy,r,f){f=clamp(f);if(f<=0)return;ctx.save();ctx.globalAlpha*=f;ctx.strokeStyle=C.red;ctx.lineWidth=16;ctx.lineCap='round';
 ctx.shadowColor='rgba(255,90,77,.7)';ctx.shadowBlur=22;
 ctx.beginPath();ctx.arc(cx,cy,r,-Math.PI/2,-Math.PI/2+6.283*f);ctx.stroke();const k=clamp((f-.5)*2);
 ctx.beginPath();ctx.moveTo(cx-r*.7,cy-r*.7);ctx.lineTo(cx-r*.7+r*1.4*k,cy-r*.7+r*1.4*k);ctx.stroke();ctx.restore();}

// ===== global layers =====
const grain=document.createElement('canvas');grain.width=grain.height=256;
{const g=grain.getContext('2d'),id=g.createImageData(256,256);for(let i=0;i<id.data.length;i+=4){const v=(Math.sin(i*.37)*43758.5453%1+1)%1*255;id.data[i]=id.data[i+1]=id.data[i+2]=v;id.data[i+3]=255}g.putImageData(id,0,0);}
let grainPat=null;
function dust(t){ctx.save();ctx.globalCompositeOperation='lighter';
 for(let i=0;i<34;i++){const x=(rnd(i)*W+Math.sin(t*.3+i)*18+W)%W,y=((rnd(i+99)*H-t*(7+rnd(i+5)*14))%H+H)%H;
  const tw=.5+.5*Math.sin(t*1.3+i*2.1);ctx.fillStyle=`rgba(255,240,220,${(.06+.16*rnd(i+7))*tw})`;
  ctx.beginPath();ctx.arc(x,y,1.2+rnd(i+3)*3.2,0,7);ctx.fill();}
 ctx.restore();}
function finish(t){
 const g=ctx.createRadialGradient(360,650,260,360,650,860);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.55)');
 ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 if(!grainPat)grainPat=ctx.createPattern(grain,'repeat');
 ctx.save();ctx.globalCompositeOperation='overlay';ctx.globalAlpha=.09;ctx.fillStyle=grainPat;
 const f=Math.floor(t*30);ctx.translate((rnd(f)*256)|0,(rnd(f+7)*256)|0);ctx.fillRect(-256,-256,W+512,H+512);ctx.restore();}

// ===== subtitles (word highlight) =====
const words=S.map(s=>{const ws=s.text.split(' ');const wts=ws.map(w=>w.length+2);const tot=wts.reduce((a,b)=>a+b,0);let c=s.start;
 return ws.map((w,i)=>{const dd=(s.end-s.start)*wts[i]/tot;const o={w,a:c,b:c+dd};c+=dd;return o;});});
const chunks=words.map(ws=>{const out=[];let cur=[],len=0;for(const w of ws){if(cur.length&&len+w.w.length+1>17){out.push(cur);cur=[];len=0}cur.push(w);len+=w.w.length+1}if(cur.length)out.push(cur);return out;});
function subs(t){
 for(let si=0;si<N;si++){if(t<S[si].start-.05||t>S[si].end+.25)continue;
  for(const ch of chunks[si]){const a=ch[0].a,b=ch[ch.length-1].b;const lastCh=ch===chunks[si][chunks[si].length-1];
   if(t<a-.02||(t>b+.02&&!(lastCh&&t<=S[si].end+.25)))continue;
   ctx.save();ctx.font='800 56px Inter';ctx.letterSpacing='0px';ctx.textBaseline='middle';ctx.textAlign='left';
   const sp=ctx.measureText(' ').width;let tw=0;const ms=ch.map(w=>{const m=ctx.measureText(w.w).width;tw+=m;return m});tw+=sp*(ch.length-1);
   let x=360-tw/2;const y=215;
   ch.forEach((w,i)=>{const act=t>=w.a&&t<w.b;const past=t>=w.b;
    ctx.shadowColor='rgba(0,0,0,.75)';ctx.shadowBlur=18;ctx.lineJoin='round';ctx.lineWidth=9;ctx.strokeStyle='rgba(0,0,0,.35)';ctx.strokeText(w.w,x,y);
    ctx.fillStyle=act?C.gold:(past?'#ffffff':'rgba(255,255,255,.4)');ctx.fillText(w.w,x,y);
    if(act){ctx.shadowBlur=0;ctx.fillStyle=C.gold;ctx.fillRect(x,y+40,ms[i],5);}
    x+=ms[i]+sp;});
   ctx.restore();return;}
 }}

// ===== render =====
const TR=.32;
function drawScene(i,u,d,alpha,extra){
 const cam=CAM[i];const z=lerp(cam.z0,cam.z1,clamp(u/d))*extra;
 ctx.save();ctx.globalAlpha=alpha;ctx.translate(cam.fx,cam.fy);ctx.scale(z,z);ctx.translate(-cam.fx,-cam.fy);
 scenes[i](u,d);ctx.restore();}
window.render=function(t){
 let i=0;for(let k=0;k<N;k++){if(t>=sStart(k))i=k;}
 const st=sStart(i),en=sEnd(i),u=Math.max(0,t-st),d=en-st;
 ctx.setTransform(1,0,0,1,0,0);ctx.globalAlpha=1;ctx.fillStyle='#05060a';ctx.fillRect(0,0,W,H);
 if(i>0&&u<TR){const ps=sStart(i-1),pd=sEnd(i-1)-ps;drawScene(i-1,t-ps,pd,1-ease(u/TR),1);}
 const aIn=i>0?ease(u/TR):1;
 drawScene(i,u,d,aIn,i>0?1+.035*(1-eo(u/.7)):1);
 dust(t);finish(t);subs(t);
 ctx.fillStyle=C.gold;ctx.fillRect(0,H-6,W*t/T.total,6);
 ctx.save();ctx.font='600 30px Inter';ctx.letterSpacing='0px';ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.fillStyle='rgba(255,255,255,.6)';ctx.shadowColor='rgba(0,0,0,.5)';ctx.shadowBlur=2;ctx.shadowOffsetX=1;ctx.shadowOffsetY=1;ctx.fillText('@asmr_explains',28,H-80+10);ctx.restore();};
