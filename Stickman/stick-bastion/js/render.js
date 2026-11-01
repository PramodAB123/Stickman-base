'use strict';
// Drawing: backgrounds, base, particles, projectiles, world
// ---------- drawing ----------
function buildBG(){
  const c=document.createElement('canvas');c.width=cv.width;c.height=cv.height;const g=c.getContext('2d');g.setTransform(K,0,0,K,0,0);
  const r=mulberry(42),T=MAP.th,OL='rgba(25,30,60,.55)';
  let gr=g.createLinearGradient(0,0,0,GY);gr.addColorStop(0,T.sky[0]);gr.addColorStop(.55,T.sky[1]);gr.addColorStop(1,T.sky[2]);g.fillStyle=gr;g.fillRect(0,0,W,GY);
  if(T.night){g.fillStyle='#fff';for(let i=0;i<140;i++){const y=r()*360;g.globalAlpha=(1-y/360)*r();g.fillRect(r()*W,y,r()<.1?2.4:1.4,r()<.1?2.4:1.4)}g.globalAlpha=1;
    const sx=880,sy=430,sr=120;gr=g.createLinearGradient(0,sy-sr,0,sy+sr);gr.addColorStop(0,'#ffe35a');gr.addColorStop(.5,'#ff6a8a');gr.addColorStop(1,'#c02fd0');
    g.save();g.beginPath();g.arc(sx,sy,sr,0,7);g.clip();g.fillStyle=gr;g.fillRect(sx-sr,sy-sr,sr*2,sr*2);g.fillStyle=T.sky[2];for(let i=0;i<7;i++){const y=sy+10+i*15;g.fillRect(sx-sr,y,sr*2,2+i*1.4)}g.restore();
    gr=g.createRadialGradient(sx,sy,sr*.8,sx,sy,sr*2.2);gr.addColorStop(0,'rgba(255,80,200,.35)');gr.addColorStop(1,'rgba(255,80,200,0)');g.fillStyle=gr;g.fillRect(0,0,W,GY);
  }else{
    const sx=T.sunX||1000,sy=T.sunY||140;gr=g.createRadialGradient(sx,sy,0,sx,sy,260);gr.addColorStop(0,'rgba(255,250,220,.9)');gr.addColorStop(.18,'rgba(255,240,190,.55)');gr.addColorStop(1,'rgba(255,240,190,0)');g.fillStyle=gr;g.fillRect(0,0,W,GY);
    g.fillStyle='#fffbe6';g.beginPath();g.arc(sx,sy,T.sunR||34,0,7);g.fill();
  }
  // far mountains
  const peaks=(base,hmin,hmax,wmin,wmax,fill,seed,snow)=>{const rr=mulberry(seed);const list=[];let x=-60;
    while(x<W+80){const w=wmin+rr()*(wmax-wmin),h=hmin+rr()*(hmax-hmin);list.push([x+w/2,w,h,rr()]);x+=w*(.45+rr()*.3)}
    list.sort((a,b)=>a[2]-b[2]);
    for(const [cx,w,h,q] of list){const top=base-h,l=cx-w/2,rt=cx+w/2,sk=(q-.5)*w*.18;
      g.beginPath();g.moveTo(l,base+40);g.lineTo(cx+sk-6,top+4);g.quadraticCurveTo(cx+sk,top-3,cx+sk+6,top+4);g.lineTo(rt,base+40);g.closePath();g.fillStyle=fill;g.fill();g.strokeStyle=OL;g.lineWidth=3;g.lineJoin='round';g.stroke();
      g.beginPath();g.moveTo(cx+sk,top+2);g.lineTo(l+6,base+40);g.lineTo(cx+sk-w*.08,base+40);g.lineTo(cx+sk-w*.02,top+h*.5);g.closePath();g.fillStyle='rgba(255,255,255,.16)';g.fill();
      g.beginPath();g.moveTo(cx+sk,top+2);g.lineTo(rt-6,base+40);g.lineTo(cx+sk+w*.18,base+40);g.closePath();g.fillStyle='rgba(20,20,60,.12)';g.fill();
      if(snow){const d=h*.22;g.beginPath();g.moveTo(cx+sk-6,top+4);g.quadraticCurveTo(cx+sk,top-3,cx+sk+6,top+4);g.lineTo(cx+sk+d*.55,top+d);g.lineTo(cx+sk+d*.15,top+d*.75);g.lineTo(cx+sk-d*.2,top+d*1.05);g.lineTo(cx+sk-d*.6,top+d*.95);g.closePath();g.fillStyle=snow;g.fill()}}};
  const hills=(base,amp,fill,seed,step)=>{const rr=mulberry(seed);g.beginPath();g.moveTo(-20,GY);let x=-20,y=base;g.lineTo(x,y);
    while(x<W+40){const nx=x+step*(.6+rr()*.8),ny=base-rr()*amp;g.quadraticCurveTo((x+nx)/2,Math.min(y,ny)-amp*.5,nx,ny);x=nx;y=ny}
    g.lineTo(W+40,GY);g.closePath();g.fillStyle=fill;g.fill();g.strokeStyle=OL;g.lineWidth=3;g.stroke()};
  peaks(T.farY||470,110,250,200,360,T.far,5,T.snow);
  if(T.night){// city skyline
    const rr=mulberry(11);for(let x=440;x<W;){const w=30+rr()*50,h=60+rr()*170,y=GY-60-h;g.fillStyle='#160f38';g.fillRect(x,y,w,h+60);g.strokeStyle='rgba(255,63,208,.5)';g.lineWidth=2;g.strokeRect(x+1,y+1,w-2,h+58);
      for(let wy=y+8;wy<GY-70;wy+=12)for(let wx=x+5;wx<x+w-6;wx+=9)if(rr()<.35){g.fillStyle=rr()<.5?'rgba(80,240,255,.8)':'rgba(255,90,220,.7)';g.fillRect(wx,wy,4,5)}x+=w+6+rr()*20}
  }
  hills(T.midY||520,60,T.mid,9,130);
  if(T.deco==='tree'){const rr=mulberry(21);for(let i=0;i<14;i++){const x=380+rr()*900,y=(T.midY||520)+10+rr()*40,s=.6+rr()*.7;tree(g,x,y,s,rr)}}
  hills(T.nearY||575,26,T.near,13,90);
  if(T.deco==='cactus'){[[620,590,1],[930,585,.8],[1160,594,1.15],[780,600,.7]].forEach(([x,y,s])=>cactus(g,x,y,s))}
  if(T.deco==='tree'){const rr=mulberry(33);for(let i=0;i<10;i++)bush(g,420+rr()*880,GY-2,0.7+rr()*.6,T)}
  if(T.deco==='rocks'){const rr=mulberry(23);for(let i=0;i<6;i++)rock(g,500+rr()*760,GY,10+rr()*16)}
  // ground
  gr=g.createLinearGradient(0,GY,0,H);gr.addColorStop(0,T.g2);gr.addColorStop(1,T.g3);g.fillStyle=gr;g.fillRect(0,GY,W,H-GY);
  if(T.night){g.strokeStyle='rgba(80,240,255,.35)';g.lineWidth=1.5;for(let i=0;i<7;i++){const y=GY+8+i*i*2.4;g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke()}
    for(let x=-600;x<W+600;x+=70){g.beginPath();g.moveTo(640+(x-640)*.35,GY);g.lineTo(x,H);g.stroke()}}
  else{for(let i=0;i<70;i++){const y=GY+16+r()*(H-GY-16),x=r()*W,s=2+r()*5*(y-GY)/60;g.fillStyle=r()<.5?'rgba(0,0,0,.18)':'rgba(255,255,255,.1)';g.beginPath();g.ellipse(x,y,s*1.4,s*.7,0,0,7);g.fill()}
    for(let i=0;i<10;i++){rock(g,r()*W,GY+20+r()*(H-GY-30),4+r()*6,T.g2)}}
  g.fillStyle=T.g1;g.fillRect(0,GY-2,W,9);g.fillStyle='rgba(255,255,255,.25)';g.fillRect(0,GY-2,W,2);g.fillStyle=OL;g.fillRect(0,GY+7,W,2.5);
  if(T.grass){g.fillStyle=T.g1;for(let x=0;x<W;x+=7){const h=4+((x*13)%9);g.beginPath();g.moveTo(x,GY);g.lineTo(x+3,GY-h);g.lineTo(x+6,GY);g.fill()}}
  // cloud sprite
  bgCloud=makeCloud(T);
  return c;
}
let bgCloud=null;
function makeCloud(T){const c=document.createElement('canvas');c.width=Math.round(220*K);c.height=Math.round(90*K);const g=c.getContext('2d');g.scale(K,K);
  const blobs=[[60,58,30],[95,44,38],[140,50,32],[170,62,22],[40,66,20],[118,66,30]];
  g.fillStyle=T.night?'rgba(120,60,180,.5)':'#ffffff';g.strokeStyle=T.night?'rgba(255,90,220,.25)':'rgba(70,110,170,.35)';g.lineWidth=3;
  g.beginPath();for(const [x,y,r] of blobs){g.moveTo(x+r,y);g.arc(x,y,r,0,7)}g.stroke();g.fill();
  if(!T.night){g.fillStyle='#d5e9f8';g.beginPath();g.ellipse(110,74,80,10,0,0,7);g.fill()}
  return c}
function cactus(g,x,y,s){g.save();g.translate(x,y);g.scale(s,s);g.lineJoin='round';const parts=[[-9,-70,18,72,9],[-30,-46,12,30,6],[-30,-24,24,10,5],[18,-56,12,28,6],[8,-36,22,10,5]];
  g.strokeStyle='#1f3a1a';g.lineWidth=4;for(const p of parts){rr(g,...p);g.stroke()}g.fillStyle='#59a83a';for(const p of parts){rr(g,...p);g.fill()}
  g.fillStyle='rgba(255,255,255,.28)';g.fillRect(-4,-62,3,56);g.fillRect(-26,-42,2.5,20);g.fillRect(21,-52,2.5,18);g.restore()}
function rock(g,x,y,s,col){g.fillStyle=col?'rgba(0,0,0,.18)':'#8a7a8c';g.strokeStyle='rgba(25,30,60,.5)';g.lineWidth=2;g.beginPath();g.ellipse(x,y,s*1.4,s*.8,0,Math.PI,0);g.closePath();g.fill();if(!col)g.stroke()}
function tree(g,x,y,s,rr){g.save();g.translate(x,y);g.scale(s,s);g.fillStyle='#6b4a2e';g.strokeStyle='rgba(25,40,30,.6)';g.lineWidth=3;g.beginPath();rr2(g,-6,-60,12,64);g.fill();g.stroke();
  const c=[[0,-80,34],[-26,-66,24],[26,-64,26],[-10,-100,24],[16,-96,22]];g.beginPath();for(const [cx,cy,r] of c){g.moveTo(cx+r,cy);g.arc(cx,cy,r,0,7)}g.stroke();g.fillStyle='#4f9a3e';g.fill();
  g.fillStyle='rgba(180,240,120,.35)';for(const [cx,cy,r] of c){g.beginPath();g.arc(cx-r*.3,cy-r*.3,r*.45,0,7);g.fill()}g.restore()}
function rr2(g,x,y,w,h){g.rect(x,y,w,h)}
function bush(g,x,y,s,T){g.save();g.translate(x,y);g.scale(s,s);const c=[[-16,-10,14],[0,-16,18],[18,-10,13]];g.beginPath();for(const [cx,cy,r] of c){g.moveTo(cx+r,cy);g.arc(cx,cy,r,0,7)}g.strokeStyle='rgba(20,40,20,.6)';g.lineWidth=3;g.stroke();g.fillStyle='#3f8f3a';g.fill();g.fillStyle='rgba(190,250,130,.3)';g.beginPath();g.arc(-4,-22,7,0,7);g.fill();g.restore()}
function stoneBlock(g,x,y,w,h,c1,c2,seed){
  const r=mulberry(seed);const gr=g.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,c1);gr.addColorStop(1,c2);g.fillStyle=gr;g.fillRect(x,y,w,h);
  g.save();g.beginPath();g.rect(x,y,w,h);g.clip();
  for(let yy=y,row=0;yy<y+h;yy+=22,row++){for(let xx=x-(row%2?18:0);xx<x+w;xx+=36){g.fillStyle=`rgba(${r()<.5?'255,255,255':'0,0,0'},${.03+r()*.07})`;g.fillRect(xx+1,yy+1,34,20);g.strokeStyle='rgba(30,15,20,.35)';g.lineWidth=1.5;g.strokeRect(xx+.5,yy+.5,36,22);g.fillStyle='rgba(255,230,200,.08)';g.fillRect(xx+2,yy+2,32,2)}}
  g.restore();
}
function baseCanvas(){
  const m=MAP;if(!m.img.complete||!m.img.naturalWidth)return null;
  const n=S.demo?0:Math.floor((1-S.wallHP/S.wallMax)*S.cracks.length);
  if(baseCache.n!==n||baseCache.id!==m.id){const c=baseCache.c||document.createElement('canvas');c.width=m.w;c.height=m.h;const g=c.getContext('2d');g.clearRect(0,0,m.w,m.h);g.drawImage(m.img,0,0);
    if(n>0){g.globalCompositeOperation='source-atop';g.lineCap='round';g.lineJoin='round';
      for(let i=0;i<n;i++){const cr=S.cracks[i];g.beginPath();g.moveTo(cr[0][0]*m.w,cr[0][1]*m.h);for(const p of cr)g.lineTo(p[0]*m.w,p[1]*m.h);g.strokeStyle='rgba(20,10,15,.9)';g.lineWidth=4;g.stroke();g.strokeStyle='rgba(255,140,60,.35)';g.lineWidth=1.2;g.stroke()}
      g.fillStyle=`rgba(40,15,20,${n/S.cracks.length*.3})`;g.fillRect(0,0,m.w,m.h);g.globalCompositeOperation='source-over'}
    baseCache.c=c;baseCache.n=n;baseCache.id=m.id}
  if(baseCache.redId!==m.id){const r=document.createElement('canvas');r.width=m.w;r.height=m.h;const g=r.getContext('2d');g.drawImage(m.img,0,0);g.globalCompositeOperation='source-in';g.fillStyle='#ff4030';g.fillRect(0,0,m.w,m.h);baseCache.red=r;baseCache.redId=m.id}
  return baseCache.c;
}
function drawBase(g){const c=baseCanvas();if(!c)return;const m=MAP,x=BX,y=GY+2-m.h*BS,w=m.w*BS,h=m.h*BS;
  g.fillStyle='rgba(20,10,30,.25)';g.beginPath();g.ellipse(x+w*.55,GY+4,w*.55,8,0,0,7);g.fill();
  g.drawImage(c,x,y,w,h);if(S.wallHit>0){g.globalAlpha=S.wallHit*.5;g.drawImage(baseCache.red,x,y,w,h);g.globalAlpha=1}}
function drawParapet(g,x0,x1,top,col){
  for(let x=x0;x<x1;x+=30){g.fillStyle=col;g.fillRect(x,top-26,20,26);g.fillStyle='rgba(255,230,200,.12)';g.fillRect(x,top-26,20,3);g.fillStyle='rgba(0,0,0,.2)';g.fillRect(x+16,top-26,4,26)}
}
function drawCrate(g,x,y,h){
  if(h<=30){g.fillStyle='#7a5232';g.fillRect(x-17,y-h,34,h);g.strokeStyle='#4a2e1a';g.lineWidth=2;g.strokeRect(x-16,y-h+1,32,h-2);return}
  g.strokeStyle='#5b3a24';g.lineWidth=5;g.beginPath();g.moveTo(x-16,y);g.lineTo(x-14,y-h);g.moveTo(x+16,y);g.lineTo(x+14,y-h);g.stroke();
  g.lineWidth=3;g.strokeStyle='#6e4a2e';g.beginPath();g.moveTo(x-15,y-4);g.lineTo(x+15,y-h+8);g.moveTo(x+15,y-4);g.lineTo(x-15,y-h+8);g.stroke();
  g.fillStyle='#8a5e3a';g.fillRect(x-22,y-h,44,7);g.fillStyle='rgba(255,220,170,.2)';g.fillRect(x-22,y-h,44,2);
}
function drawSlotUI(g,s){
  if(S.demo||S.mode!=='play'||s.down)return;
  const fy=s.y-s.crate,t=S.time,sel=S.popSlot===s.i;
  g.textAlign='center';g.textBaseline='middle';
  if(!s.w){
    if(typeof TUT!=='undefined'&&TUT.on&&s.i!==TUT.slot)return;
    const can=S.coins>=WEAPONS[0].price,pulse=can?.5+.5*Math.sin(t*5):0;
    g.strokeStyle=`rgba(255,215,90,${.45+pulse*.4})`;g.lineWidth=2;g.setLineDash([5,5]);g.beginPath();g.ellipse(s.x,fy-34,16,36,0,0,7);g.stroke();g.setLineDash([]);
    g.fillStyle=`rgba(255,215,90,${.12+pulse*.15})`;g.beginPath();g.ellipse(s.x,fy-34,16,36,0,0,7);g.fill();
    g.fillStyle='#ffd35a';g.font='900 22px system-ui,Arial';g.fillText('+',s.x,fy-34);
    const bw=94,bh=38,bx=s.x-bw/2,by=fy-132-(s.crate?24:0)+Math.sin(t*3+s.x)*2,ac=can?'#ffd23a':'#9a9ab4';
    g.fillStyle=sel?'#26366a':'rgba(16,24,52,.94)';rr(g,bx,by,bw,bh,8);g.fill();
    g.strokeStyle=ac;g.lineWidth=2;rr(g,bx,by,bw,bh,8);g.stroke();
    g.fillStyle='#fff';g.font='italic 800 11px "Barlow Condensed",system-ui,Arial';g.fillText('TAP HERE TO',s.x,by+11);
    g.fillStyle=ac;g.font='italic 900 19px "Barlow Condensed",system-ui,Arial';g.fillText('DEPLOY',s.x,by+26);
    const cy=by+bh+5+((t*1.8)%1)*4;g.strokeStyle=ac;g.lineWidth=2.6;g.lineJoin='round';
    for(let k=0;k!==2;k++){g.globalAlpha=1-k*.35;g.beginPath();g.moveTo(s.x-7,cy+k*7);g.lineTo(s.x,cy+k*7+5);g.lineTo(s.x+7,cy+k*7);g.stroke()}g.globalAlpha=1;
  }else{
    const tx=s.x,ty=fy+12;
    g.fillStyle='rgba(15,8,28,.85)';rr(g,tx-17,ty-8,34,16,5);g.fill();g.fillStyle=WMAP[s.w].col;g.font='900 10px system-ui,Arial';g.fillText('LV '+(s.lvl+1),tx,ty+.5);
    if(s.lvl<MAXLV&&S.coins>=upCost(WMAP[s.w],s.lvl)){const ay=fy-98+Math.sin(t*5+s.x)*4;g.fillStyle='#5be27f';g.strokeStyle='#0d3a1a';g.lineWidth=2;g.beginPath();g.moveTo(s.x,ay-10);g.lineTo(s.x+10,ay+1);g.lineTo(s.x+4,ay+1);g.lineTo(s.x+4,ay+10);g.lineTo(s.x-4,ay+10);g.lineTo(s.x-4,ay+1);g.lineTo(s.x-10,ay+1);g.closePath();g.fill();g.stroke()}
    if(sel){g.strokeStyle='rgba(255,215,90,.9)';g.lineWidth=2;g.beginPath();g.ellipse(s.x,fy+1,24,6,0,0,7);g.stroke()}
  }
}
function drawRag(g,r){
  const a=Math.min(1,r.life);g.globalAlpha=a;const p=r.pts;
  g.strokeStyle=INK;g.lineWidth=(r.type==='guard'?5:4.6*r.s);g.lineCap='round';g.lineJoin='round';g.beginPath();
  for(let i=0;i<10;i++){const [x,y]=RAG_LINKS[i];g.moveTo(p[x].x,p[x].y);g.lineTo(p[y].x,p[y].y)}g.stroke();
  g.fillStyle=INK;g.beginPath();g.arc(p[0].x,p[0].y,r.hr,0,7);g.fill();
  g.strokeStyle=r.acc;g.lineWidth=2.5*r.s;g.beginPath();g.arc(p[0].x,p[0].y,r.hr*.75,0,Math.PI*2);g.stroke();
  g.globalAlpha=1;
}
function drawParts(g,layer){
  for(const p of S.parts){
    const t=p.life/p.max;
    switch(p.type){
      case'smoke':if(layer!==0)break;g.globalAlpha=t*.45;g.fillStyle=p.col||'#3b2c3a';g.beginPath();g.arc(p.x,p.y,p.size*(1.6-t*.6),0,7);g.fill();break;
      case'chip':case'drop':if(layer!==0)break;g.globalAlpha=Math.min(1,t*2);g.fillStyle=p.col;g.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);break;
      case'shell':if(layer!==0)break;g.globalAlpha=Math.min(1,t*2);g.save();g.translate(p.x,p.y);g.rotate(p.rot);g.fillStyle='#e6b450';g.fillRect(-2.5,-1.2,5,2.4);g.restore();break;
      case'debris':if(layer!==0)break;g.globalAlpha=Math.min(1,t*2);g.save();g.translate(p.x,p.y);g.rotate(p.rot);g.fillStyle=p.col;g.fillRect(-p.size/2,-p.size/3,p.size,p.size*.66);g.restore();break;
      case'wheel':if(layer!==0)break;g.globalAlpha=Math.min(1,t*2);wheelG(g,p.x,p.y,p.size,p.rot);break;
      case'plank':if(layer!==0)break;g.globalAlpha=Math.min(1,t*2);g.save();g.translate(p.x,p.y);g.rotate(p.rot);g.fillStyle='#3d4a5c';g.fillRect(-6*p.size,-14*p.size,12*p.size,28*p.size);g.fillStyle=p.col;g.fillRect(-2*p.size,-11*p.size,4*p.size,22*p.size);g.restore();break;
      case'fire':if(layer!==1)break;g.globalAlpha=t;g.fillStyle=t>.6?'#fff2b0':t>.3?'#ffa53a':'#e2452a';g.beginPath();g.arc(p.x,p.y,p.size*(.5+t*.6),0,7);g.fill();break;
      case'spark':if(layer!==1)break;g.globalAlpha=t;g.strokeStyle=p.col||'#ffe9a0';g.lineWidth=2;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x-p.vx*.025,p.y-p.vy*.025);g.stroke();break;
      case'boom':if(layer!==1)break;{g.globalAlpha=t;const rad=p.size*(1.3-t*.3),gr=g.createRadialGradient(p.x,p.y,0,p.x,p.y,rad);gr.addColorStop(0,'rgba(255,250,220,1)');gr.addColorStop(.4,p.col?'rgba('+p.col+',.9)':'rgba(255,190,80,.9)');gr.addColorStop(1,p.col?'rgba('+p.col+',0)':'rgba(255,90,40,0)');g.fillStyle=gr;g.beginPath();g.arc(p.x,p.y,rad,0,7);g.fill();break}
      case'ring':if(layer!==1)break;g.globalAlpha=t*.8;g.strokeStyle=p.col?'rgb('+p.col+')':'#ffd9a0';g.lineWidth=4*t;g.beginPath();g.arc(p.x,p.y,Math.max(1,p.size*(p.inv?t:1.2-t)),0,7);g.stroke();break;
      case'beam':if(layer!==1)break;g.globalAlpha=t;g.globalCompositeOperation='lighter';g.lineCap='round';g.strokeStyle='rgba('+p.col+',.45)';g.lineWidth=14*t;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x2,p.y2);g.stroke();g.strokeStyle='rgba(255,235,255,.95)';g.lineWidth=3.5;g.stroke();g.globalCompositeOperation='source-over';break;
      case'bolt':if(layer!==1)break;{g.globalAlpha=t;g.globalCompositeOperation='lighter';g.lineJoin='round';for(const [lw,c] of [[7,'rgba('+p.col+',.4)'],[2.5,'rgba(235,255,255,.95)']]){g.strokeStyle=c;g.lineWidth=lw;g.beginPath();g.moveTo(p.pts[0].x,p.pts[0].y);for(let k=1;k<p.pts.length;k++){const a=p.pts[k-1],b=p.pts[k];for(let s=1;s<=4;s++){const f=s/4;g.lineTo(a.x+(b.x-a.x)*f+(s<4?rand(-9,9):0),a.y+(b.y-a.y)*f+(s<4?rand(-9,9):0))}}g.stroke()}g.globalCompositeOperation='source-over';break}
      case'corpse':if(layer!==0)break;{const im=p.d.img;g.globalAlpha=Math.min(1,t*1.6);g.save();g.translate(p.x,p.y);g.rotate(p.rot*(1-t)*.6);g.filter='brightness(.45)';g.drawImage(im,-p.w/2,-p.h,p.w,p.h);g.filter='none';g.restore();break}
      case'chunk':if(layer!==0||!p.d.img.naturalWidth)break;{const im=p.d.img,iw=im.naturalWidth,ih=im.naturalHeight,a=Math.min(1,t*2.2);g.save();g.translate(p.x,p.y);g.rotate(p.rot);
        g.globalAlpha=a;g.drawImage(im,p.fx*iw,p.fy*ih,p.fw*iw,p.fh*ih,-p.w/2,-p.h/2,p.w,p.h);
        const hot=Math.max(0,(t-.55)/.45);g.globalAlpha=a*(.55-.25*hot);g.drawImage(tinted(p.d,'#160c14'),p.fx*iw,p.fy*ih,p.fw*iw,p.fh*ih,-p.w/2,-p.h/2,p.w,p.h);
        if(hot>0){g.globalAlpha=a*hot*.7;g.drawImage(tinted(p.d,'#ff7a2a'),p.fx*iw,p.fy*ih,p.fw*iw,p.fh*ih,-p.w/2,-p.h/2,p.w,p.h)}g.restore();break}
      case'plus':if(layer!==1)break;g.globalAlpha=t;g.fillStyle='#6dff7a';g.fillRect(p.x-6,p.y-2,12,4);g.fillRect(p.x-2,p.y-6,4,12);break;
      case'flash':if(layer!==1)break;{g.globalAlpha=1;g.save();g.translate(p.x,p.y);g.rotate(p.a);const z=p.size*(.7+Math.random()*.5);g.fillStyle=p.col||'rgba(255,220,120,.95)';g.beginPath();g.moveTo(0,-5*z);g.lineTo(22*z,0);g.lineTo(0,5*z);g.lineTo(5*z,0);g.closePath();g.fill();g.fillStyle='rgba(255,255,230,.9)';g.beginPath();g.arc(2,0,5*z,0,7);g.fill();g.restore();break}
    }
  }
  g.globalAlpha=1;
}
function drawBullets(g){
  g.globalCompositeOperation='lighter';
  for(const b of S.bullets){
    const w=WMAP[b.w];
    switch(b.w){
      case'rocket':case'saw':break;
      case'railgun':g.strokeStyle='rgba(120,200,255,.5)';g.lineWidth=8;g.beginPath();g.moveTo(b.x-b.vx*.035,b.y-b.vy*.035);g.lineTo(b.x,b.y);g.stroke();g.strokeStyle='rgba(230,248,255,.95)';g.lineWidth=3;g.stroke();break;
      case'flame':{const t=1-b.life/b.max,r=5+t*20;g.globalAlpha=Math.max(0,1-t*1.1);const gr=g.createRadialGradient(b.x,b.y,0,b.x,b.y,r);gr.addColorStop(0,t<.35?'rgba(255,250,200,.95)':'rgba(255,170,60,.85)');gr.addColorStop(.5,'rgba(255,100,30,.5)');gr.addColorStop(1,'rgba(200,40,20,0)');g.fillStyle=gr;g.beginPath();g.arc(b.x,b.y,r,0,7);g.fill();g.globalAlpha=1;break}
      case'frost':{const a=Math.atan2(b.vy,b.vx);g.save();g.translate(b.x,b.y);g.rotate(a);g.fillStyle='rgba(120,220,255,.45)';g.fillRect(-26,-3,26,6);g.fillStyle='rgba(225,250,255,.95)';g.beginPath();g.moveTo(9,0);g.lineTo(0,-4.5);g.lineTo(-10,0);g.lineTo(0,4.5);g.closePath();g.fill();g.restore();break}
      case'acid':case'plasma':case'gravity':{const r=b.w==='acid'?6:b.w==='plasma'?9:10,c=w.fx;
        g.strokeStyle='rgba('+c+',.4)';g.lineWidth=r*1.6;g.lineCap='round';g.beginPath();g.moveTo(b.x-b.vx*.03,b.y-b.vy*.03);g.lineTo(b.x,b.y);g.stroke();
        const gr=g.createRadialGradient(b.x,b.y,0,b.x,b.y,r*2.2);gr.addColorStop(0,'rgba(255,255,255,.95)');gr.addColorStop(.35,'rgba('+c+',.9)');gr.addColorStop(1,'rgba('+c+',0)');g.fillStyle=gr;g.beginPath();g.arc(b.x,b.y,r*2.2,0,7);g.fill();
        if(b.w==='gravity'){g.strokeStyle='rgba(220,180,255,.8)';g.lineWidth=2;g.beginPath();g.ellipse(b.x,b.y,r*1.7,r*.7,b.spin*.3,0,7);g.stroke()}break}
      default:{const r=b.w==='blaster'?4:3.2,c=w.bc||'255,160,60';
        g.strokeStyle='rgba('+c+',.55)';g.lineWidth=r*1.4;g.beginPath();g.moveTo(b.x-b.vx*.012,b.y-b.vy*.012);g.lineTo(b.x,b.y);g.stroke();
        g.fillStyle='rgba('+c+',.95)';g.beginPath();g.arc(b.x,b.y,r,0,7);g.fill();g.fillStyle='#fff3c8';g.beginPath();g.arc(b.x,b.y,r*.45,0,7);g.fill()}
    }
  }
  g.globalCompositeOperation='source-over';
  for(const b of S.bullets){
    if(b.w==='saw'){g.save();g.translate(b.x,b.y);g.rotate(b.spin);g.fillStyle='#c9ccd6';g.beginPath();for(let k=0;k<24;k++){const a=k/24*Math.PI*2,r=k%2?11:15;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath();g.fill();
      g.fillStyle='#ff9a20';g.beginPath();g.arc(0,0,9,0,7);g.fill();g.fillStyle='#ffd27a';g.beginPath();g.arc(0,0,4,0,7);g.fill();g.fillStyle='#4a4460';g.beginPath();g.arc(0,0,2,0,7);g.fill();g.restore();continue}
    if(b.w!=='rocket')continue;
    const a=Math.atan2(b.vy,b.vx);g.save();g.translate(b.x,b.y);g.rotate(a);g.fillStyle='#5c7a2a';g.fillRect(-14,-4,18,8);g.fillStyle='#ff5a2f';g.beginPath();g.moveTo(4,-4);g.lineTo(12,0);g.lineTo(4,4);g.fill();
    g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,180,60,.9)';g.beginPath();g.moveTo(-14,-3);g.lineTo(-26-Math.random()*10,0);g.lineTo(-14,3);g.fill();g.globalCompositeOperation='source-over';g.restore()}
  for(const p of S.eproj){g.save();g.translate(p.x,p.y);g.rotate(p.rot||0);
    if(p.kind==='shell'){g.fillStyle='#1b1b22';g.beginPath();g.ellipse(0,0,7,5,0,0,7);g.fill();g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,140,50,.8)';g.beginPath();g.arc(-6,0,4+Math.random()*2,0,7);g.fill();g.globalCompositeOperation='source-over'}
    else if(p.kind==='bolt'){g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,80,60,.9)';g.fillRect(-12,-2,16,4);g.fillStyle='#fff';g.fillRect(-2,-1,5,2);g.globalCompositeOperation='source-over'}
    else if(p.kind==='fireball'){g.globalCompositeOperation='lighter';const gr=g.createRadialGradient(0,0,0,0,0,16);gr.addColorStop(0,'#fff');gr.addColorStop(.35,'rgba(230,90,255,.95)');gr.addColorStop(1,'rgba(150,40,220,0)');g.fillStyle=gr;g.beginPath();g.arc(0,0,16,0,7);g.fill();g.globalCompositeOperation='source-over'}
    else{g.fillStyle='#1b1b22';g.beginPath();g.ellipse(0,0,8,6,0,0,7);g.fill();g.fillStyle='#5ad1ff';g.fillRect(-10,-3,3,6)}
    g.restore()}
  for(const b of S.bombs){g.save();g.translate(b.x,b.y);g.rotate(b.rot);g.fillStyle='#2b2f38';g.beginPath();g.ellipse(0,0,11,5,0,0,7);g.fill();g.fillRect(-14,-5,4,10);g.restore()}
}
function drawPlane(g){
  const p=S.plane;if(!p)return;g.save();g.translate(p.x,p.y);
  g.fillStyle='#2a2238';g.beginPath();g.ellipse(0,0,46,9,0,0,7);g.fill();
  g.beginPath();g.moveTo(-6,0);g.lineTo(-24,-30);g.lineTo(-12,-30);g.lineTo(14,0);g.closePath();g.fill();
  g.beginPath();g.moveTo(-34,0);g.lineTo(-48,-18);g.lineTo(-40,-18);g.lineTo(-26,0);g.fill();
  g.fillStyle='#ff9a3c';g.beginPath();g.ellipse(18,-3,8,3.5,0,0,7);g.fill();
  g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,160,60,.8)';g.beginPath();g.moveTo(-46,-3);g.lineTo(-66-Math.random()*10,0);g.lineTo(-46,3);g.fill();g.globalCompositeOperation='source-over';
  g.restore();
}
function drawWorld(){
  const g=ctx;
  if(!bg||!bg.width||!bg.height)bg=buildBG();
  if(!bg.width||!bg.height){bg=null;return}
  let sx=0,sy=0;if(S.shake>0){sx=rand(-1,1)*S.shake;sy=rand(-1,1)*S.shake}
  g.setTransform(1,0,0,1,0,0);g.drawImage(bg,sx*K,sy*K);g.setTransform(K,0,0,K,sx*K,sy*K);
  if(bgCloud){for(let i=0;i<5;i++){const x=((i*300+S.time*(6+i*2.5))%(W+360))-220,y=40+i*44+(i%2)*18,s=.6+(i%3)*.22;g.globalAlpha=MAP.th.night?.5:.95;g.drawImage(bgCloud,x,y,220*s,90*s)}g.globalAlpha=1}
  drawBase(g);
  if(S.spikes>0){for(let i=0;i<12;i++){const x=WALL.x1+22+i*14+(i%2)*5,h=14+S.spikes*5+(i%3)*4;g.fillStyle='#5b3a24';g.beginPath();g.moveTo(x-4,GY+2);g.lineTo(x+3,GY-h);g.lineTo(x+6,GY+2);g.fill();g.fillStyle='#d9d2c6';g.beginPath();g.moveTo(x+1,GY-h+5);g.lineTo(x+3,GY-h);g.lineTo(x+4.4,GY-h+5);g.fill()}
    g.strokeStyle='rgba(200,190,180,.7)';g.lineWidth=1;g.beginPath();for(let x=WALL.x1+16;x<WALL.x1+150;x+=8)g.lineTo(x,GY-8-Math.sin(x)*3);g.stroke()}
  for(const m of S.mines){if(m.used)continue;g.fillStyle='#2b2f38';g.beginPath();g.ellipse(m.x,GY,10,4,0,Math.PI,0);g.fill();g.fillStyle=Math.sin(S.time*6+m.x)>0?'#ff3b30':'#5a1410';g.beginPath();g.arc(m.x,GY-4,2,0,7);g.fill()}
  drawParts(g,0);
  for(const e of S.enemies)if(!e.d.fly)drawEnemy(g,e);
  for(const r of S.rags)drawRag(g,r);
  for(const s of S.slots)drawGunner(g,s);
  for(const e of S.enemies)if(e.d.fly)drawEnemy(g,e);
  drawBullets(g);
  g.globalCompositeOperation='lighter';drawParts(g,1);g.globalCompositeOperation='source-over';
  drawPlane(g);
  for(const s of S.slots)drawSlotUI(g,s);
  g.textAlign='center';g.textBaseline='middle';
  for(const f of S.floaters){const a=f.t<.8?1:1-(f.t-.8)/.3;g.globalAlpha=clamp(a,0,1);const sc=f.t<.12?1+(.12-f.t)*4:1;g.font=`900 ${Math.round(20*f.size*sc)}px system-ui,Arial,sans-serif`;g.lineWidth=4;g.strokeStyle='rgba(20,8,20,.85)';g.strokeText(f.text,f.x,f.y);g.fillStyle=f.col;g.fillText(f.text,f.x,f.y)}
  g.globalAlpha=1;
  for(const c of S.coinfx){const t=c.t,tx=1040,ty=36,mx=(c.x+tx)/2,my=Math.min(c.y,ty)-120,x=(1-t)*(1-t)*c.x+2*(1-t)*t*mx+t*t*tx,y=(1-t)*(1-t)*c.y+2*(1-t)*t*my+t*t*ty;g.fillStyle='#ffc53d';g.beginPath();g.arc(x,y,6,0,7);g.fill();g.fillStyle='#fff3b0';g.beginPath();g.arc(x-2,y-2,2,0,7);g.fill()}
  g.setTransform(K,0,0,K,0,0);
  const boss=S.enemies.find(e=>e.d.boss&&!e.dead);
  if(boss&&!S.demo){const w=440,x=W/2-w/2,y=92;g.fillStyle='rgba(15,8,28,.7)';g.fillRect(x-6,y-22,w+12,40);g.font='900 14px system-ui,Arial';g.fillStyle='#e7c8ff';g.textAlign='center';g.fillText('☠ '+boss.d.name.toUpperCase(),W/2,y-10);g.fillStyle='#2a1838';g.fillRect(x,y,w,10);g.fillStyle='#b46cff';g.fillRect(x,y,w*clamp(boss.hp/boss.maxHp,0,1),10)}
  if(S.banner&&S.banner.t>=0){const b=S.banner,t=b.t,a=t<.2?t/.2:t>1.9?Math.max(0,1-(t-1.9)/.5):1,sc=t<.2?1.4-t*2:1;g.save();g.globalAlpha=a;g.translate(W/2,220);g.scale(sc,sc);g.textAlign='center';g.textBaseline='middle';g.font='900 60px Impact,"Arial Black",system-ui';g.lineWidth=10;g.strokeStyle='rgba(30,10,30,.85)';g.strokeText(b.text,0,0);g.fillStyle=b.col;g.fillText(b.text,0,0);if(b.sub){g.font='800 24px system-ui,Arial';g.lineWidth=6;g.strokeText(b.sub,0,50);g.fillStyle='#fff';g.fillText(b.sub,0,50)}g.restore()}
  const vg=g.createRadialGradient(W/2,H/2,H*.5,W/2,H/2,H*1.05);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(10,0,30,.3)');g.fillStyle=vg;g.fillRect(0,0,W,H);
  if(!S.demo&&S.mode==='play'&&S.wallHP/S.wallMax<.25){g.fillStyle=`rgba(255,30,30,${.08+.06*Math.sin(S.time*6)})`;g.fillRect(0,0,W,H)}
}
