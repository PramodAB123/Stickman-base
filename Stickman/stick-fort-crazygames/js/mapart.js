'use strict';
// Career map painter: floating-island chapters drawn once onto #mapCv (redrawn on resize)
let mapImgsReady=false;
function drawMap(){
  const c=$('mapCv'),pe=c.parentElement,box={width:pe.clientWidth,height:pe.clientHeight};if(!box.width||!box.height)return;
  const dpr=Math.min(window.devicePixelRatio||1,2),Wm=box.width,Hm=box.height;
  c.width=Math.round(Wm*dpr);c.height=Math.round(Hm*dpr);const g=c.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);
  const u=Math.min(Wm/(900*MAPW),Hm/560),R=mulberry(11);
  // dusk sky: deep navy overhead warming to violet and a low rose band, then far mountain ranges
  let gr=g.createLinearGradient(0,0,0,Hm);gr.addColorStop(0,'#16205a');gr.addColorStop(.45,'#2a3486');gr.addColorStop(.78,'#4a3f8e');gr.addColorStop(1,'#7a4f8c');g.fillStyle=gr;g.fillRect(0,0,Wm,Hm);
  for(let i=0;i<110*MAPW;i++){const sx=R()*Wm,sy=R()*Hm*.6,a=.25+R()*.6;g.fillStyle=`rgba(255,250,235,${a})`;if(R()<.08){const r=2.4*u;g.beginPath();g.moveTo(sx,sy-r*2);g.lineTo(sx+r*.5,sy-r*.5);g.lineTo(sx+r*2,sy);g.lineTo(sx+r*.5,sy+r*.5);g.lineTo(sx,sy+r*2);g.lineTo(sx-r*.5,sy+r*.5);g.lineTo(sx-r*2,sy);g.lineTo(sx-r*.5,sy-r*.5);g.fill()}else g.fillRect(sx,sy,1.4,1.4)}
  moon(g,.035*Wm,.2*Hm,30*u);moon(g,.5*Wm,.12*Hm,20*u);
  ranges(g,Wm,Hm,u);
  puffBand(g,Wm,Hm*.3,u*.9,mulberry(3),'#3a4592','#48539f',.55);
  // islands left to right, then low clouds along the bottom
  ISLES.forEach((_,i)=>{if(chapterSeen(i)){shards(g,i,Wm,Hm,u);paintIsle(g,i,Wm,Hm,u)}});
  birds(g,Wm,Hm,u,mulberry(5));
  puffBand(g,Wm,Hm*1.0,u*1.1,mulberry(7),'#3f3d84','#514e98',1);puffBand(g,Wm,Hm*1.09,u*1.4,mulberry(8),'#4a4790','#5e5aa6',1);
  // trail: a dirt road across each island, rope bridges between islands, a stone pad under every level marker
  const P=NODEPOS.map(([a,b])=>[a*Wm,b*Hm]);g.lineCap='round';g.lineJoin='round';
  for(let i=0;i<P.length-1;i++){const ch=Math.floor(i/4);if(!chapterSeen(ch))break;const [x1,y1]=P[i],[x2,y2]=P[i+1];
    if(i%4===3){bridge(g,x1,y1,x2,y2,u,CAR.stars[i]>0&&chapterSeen(ch+1));continue}
    const my=(y1+y2)/2+12*u,mx=(x1+x2)/2,q=t=>{const a=1-t;return[a*a*x1+2*a*t*mx+t*t*x2,a*a*y1+2*a*t*my+t*t*y2]},n=Math.max(4,Math.round(Math.hypot(x2-x1,y2-y1)/(15*u))),done=CAR.stars[i]>0;
    for(let k=1;k<n;k++){const [sx,sy]=q(k/n),w=(6.5+(k%2)*1.2)*u;
      g.fillStyle='rgba(20,10,20,.35)';g.beginPath();g.ellipse(sx,sy+2.4*u,w,w*.5,0,0,7);g.fill();
      g.fillStyle=done?'#c98a12':'#7d8399';g.beginPath();g.ellipse(sx,sy+1.2*u,w,w*.5,0,0,7);g.fill();
      g.fillStyle=done?'#ffd23a':'#c9cede';g.beginPath();g.ellipse(sx,sy,w*.92,w*.42,0,0,7);g.fill();
      g.fillStyle=done?'#ffe68a':'#e4e7f0';g.beginPath();g.ellipse(sx-w*.25,sy-w*.1,w*.4,w*.16,0,0,7);g.fill()}}
  P.forEach(([x,y],i)=>{if(chapterSeen(Math.floor(i/4)))pad(g,x,y,u,LEVELS[i].boss,CHAPTERS[LEVELS[i].ch].id)});
  // chapters further ahead than the next one are not drawn at all: just a wall of smoke
  ISLES.forEach((s,i)=>{if(!chapterSeen(i))smoke(g,s.c[0]*Wm,s.c[1]*Hm,s.r[0]*Wm,Hm,u,mulberry(200+i))});
  {const i=seenCount();if(i<ISLES.length){const s=ISLES[i];hiddenIsle(g,s.c[0]*Wm,s.c[1]*Hm,s.r[0]*Wm,s.r[1]*Hm);fogEdge(g,(s.c[0]-s.r[0]*1.25)*Wm,Hm,u,mulberry(300+i))}}
  if(!mapImgsReady&&MAPIDS.some(id=>!MAPS[id].img.complete)){Promise.all(MAPIDS.map(id=>MAPS[id].img.decode().catch(()=>0))).then(()=>{mapImgsReady=true;if(hubTab==='career')drawMap()})}
}
function smoke(g,x,y,rw,Hm,u,R){
  const puff=(px,py,r,a)=>{const gr=g.createRadialGradient(px,py,0,px,py,r);gr.addColorStop(0,`rgba(70,75,135,${a})`);gr.addColorStop(.6,`rgba(62,66,124,${a*.75})`);gr.addColorStop(1,'rgba(55,58,115,0)');g.fillStyle=gr;g.beginPath();g.arc(px,py,r,0,7);g.fill()};
  // wide base layer, then lumpy puffs, then a few lighter tops so it reads as rolling smoke rather than a flat grey box
  puff(x,y,rw*1.6,.95);puff(x,y-Hm*.2,rw*1.2,.9);puff(x,y+Hm*.3,rw*1.3,.9);
  for(let k=0;k<40;k++){const a=R()*Math.PI*2,d=Math.sqrt(R());puff(x+Math.cos(a)*rw*1.2*d,y-Hm*.02+Math.sin(a)*Hm*.42*d,(45+R()*75)*u,.6+R()*.3)}
  for(let k=0;k<10;k++){const px=x+(R()-.5)*rw*1.9,py=y-Hm*.12+(R()-.5)*Hm*.25,r=(26+R()*40)*u,gr=g.createRadialGradient(px,py-r*.3,0,px,py,r);gr.addColorStop(0,'rgba(110,115,180,.4)');gr.addColorStop(1,'rgba(100,105,170,0)');g.fillStyle=gr;g.beginPath();g.arc(px,py,r,0,7);g.fill()}
}
function cloudBank(g,cx,y,Wm,u,R,col){g.fillStyle=col;for(let i=0;i<10*MAPW;i++){const x=R()*Wm,r=(30+R()*60)*u;g.beginPath();g.ellipse(x,y+(R()-.5)*40*u,r*1.8,r*.7,0,0,7);g.fill()}}
function shadeHex(hex,f){const n=parseInt(hex.slice(1),16);let r=n>>16,gg=(n>>8)&255,b=n&255;const m=v=>Math.max(0,Math.min(255,Math.round(f>1?v+(255-v)*(f-1):v*f)));return`rgb(${m(r)},${m(gg)},${m(b)})`}
function topPath(g,x,y,rw,rh,R){const n=18,pts=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2,k=.9+R()*.14;pts.push([x+Math.cos(a)*rw*k,y+Math.sin(a)*rh*k])}
  g.beginPath();pts.forEach((p,i)=>{const q=pts[(i+1)%n],mx=(p[0]+q[0])/2,my=(p[1]+q[1])/2;i?g.quadraticCurveTo(p[0],p[1],mx,my):g.moveTo(mx,my)});const p=pts[0],q=pts[1];g.quadraticCurveTo(p[0],p[1],(p[0]+q[0])/2,(p[1]+q[1])/2);g.closePath()}
const PAL={
  desert:{top:'#f6b26b',top2:'#d9783c',rock:'#c8642f',rock2:'#7a2f1a',dark:'#3e160f'},
  industrial:{top:'#f4faff',top2:'#bcd6ef',rock:'#7e9cc4',rock2:'#3c5680',dark:'#18233f'},
  nature:{top:'#8fdc5a',top2:'#3f9d3a',rock:'#8a7650',rock2:'#4a3d26',dark:'#211a10'},
  cyber:{top:'#4a3434',top2:'#2a1c1d',rock:'#4a302c',rock2:'#24130f',dark:'#0b0505'},
  volcanic:{top:'#5a3a44',top2:'#3a2230',rock:'#4a2a34',rock2:'#2a141c',dark:'#100608'},
  crystal:{top:'#4a4a8a',top2:'#2c2a64',rock:'#2e2a62',rock2:'#191640',dark:'#08071a'},
};
function paintIsle(g,i,Wm,Hm,u){
  const s=ISLES[i],id=CHAPTERS[i].id,P=PAL[id],R=mulberry(40+i*7),x=s.c[0]*Wm,y=s.c[1]*Hm,rw=s.r[0]*Wm,rh=s.r[1]*Hm;
  // ---- underside: stacked rock columns tapering to spikes
  const N=26,pts=[];for(let k=0;k<=N;k++){const f=k/N,d=Math.pow(Math.sin(f*Math.PI),.7);pts.push([x-rw*.97+f*rw*1.94,y+rh*.55+d*rh*(1.9+R()*1.1)+(k%2===1?R()*rh*.7:0)])}
  g.save();g.beginPath();g.moveTo(x-rw*.99,y+rh*.1);pts.forEach(p=>g.lineTo(p[0],p[1]));g.lineTo(x+rw*.99,y+rh*.1);g.closePath();
  let gr=g.createLinearGradient(0,y,0,y+rh*2.6);gr.addColorStop(0,P.rock);gr.addColorStop(.35,P.rock2);gr.addColorStop(1,P.dark);g.fillStyle=gr;g.fill();g.clip();
  {const sg=g.createLinearGradient(x-rw,0,x+rw,0);sg.addColorStop(0,'rgba(0,0,0,.35)');sg.addColorStop(.35,'rgba(255,255,255,.06)');sg.addColorStop(1,'rgba(0,0,0,.45)');g.fillStyle=sg;g.fillRect(x-rw,y,rw*2,rh*4)}
  for(let xx=x-rw;xx<x+rw;){const w=(7+R()*12)*u,l=.75+R()*.5;g.fillStyle=`rgba(${l>1?'255,255,255':'0,0,0'},${Math.abs(l-1)*.7})`;g.fillRect(xx,y,w,rh*3);g.fillStyle='rgba(255,255,255,.08)';g.fillRect(xx,y,1.5*u,rh*3);xx+=w}
  for(let k=1;k<5;k++){g.fillStyle=`rgba(0,0,0,${.07+k*.03})`;g.fillRect(x-rw,y+rh*(.25+k*.38),rw*2,2.5*u)}
  if(id==='cyber'){g.strokeStyle='#ff7a2a';g.shadowColor='#ff4a10';g.shadowBlur=10*u;g.lineWidth=2*u;for(let k=0;k<6;k++){let xx=x+(R()-.5)*rw*1.5,yy=y+rh*.4;g.beginPath();g.moveTo(xx,yy);for(let j=0;j<5;j++){xx+=(R()-.5)*18*u;yy+=rh*.22;g.lineTo(xx,yy)}g.stroke()}g.shadowBlur=0}
  if(id==='nature'){g.strokeStyle='#2f7d2c';g.lineWidth=2*u;for(let k=0;k<12;k++){const vx=x+(R()-.5)*rw*1.8;g.beginPath();g.moveTo(vx,y+rh*.2);g.quadraticCurveTo(vx+(R()-.5)*14*u,y+rh*(.6+R()*.5),vx+(R()-.5)*6*u,y+rh*(.8+R()*.9));g.stroke()}}
  if(id==='industrial'){g.fillStyle='rgba(220,240,255,.55)';for(let k=0;k<14;k++){const ix=x+(R()-.5)*rw*1.8,iy=y+rh*(.3+R()*.3);g.beginPath();g.moveTo(ix-3*u,iy);g.lineTo(ix,iy+(10+R()*22)*u);g.lineTo(ix+3*u,iy);g.fill()}}
  g.restore();
  // waterfalls / lava falls down the front
  if(id==='nature')for(const f of [.28,.62])fall(g,x-rw+f*rw*2,y+rh*.55,7*u,rh*3.2,'150,225,255',u);
  if(id==='cyber')fall(g,x+rw*.42,y+rh*.6,6*u,rh*2.2,'255,120,30',u);
  if(id==='volcanic')for(const f of [.3,.7])fall(g,x-rw+f*rw*2,y+rh*.6,6*u,rh*2.4,'255,110,30',u);
  if(id==='crystal')for(const f of [.35,.72])fall(g,x-rw+f*rw*2,y+rh*.55,7*u,rh*3,'90,200,255',u);
  // ---- top surface with a thick front lip
  topPath(g,x,y,rw,rh,mulberry(90+i));gr=g.createLinearGradient(0,y-rh,0,y+rh);gr.addColorStop(0,P.top);gr.addColorStop(1,P.top2);g.fillStyle=gr;g.fill();
  g.save();g.clip();
  for(let k=0;k<40;k++){g.fillStyle=R()<.5?'rgba(255,255,255,.07)':'rgba(0,0,0,.06)';g.beginPath();g.ellipse(x+(R()-.5)*rw*2,y+(R()-.5)*rh*2,(8+R()*30)*u,(3+R()*8)*u,0,0,7);g.fill()}
  if(id==='cyber'||id==='volcanic')lavaRivers(g,x,y,rw,rh,u,R);
  if(id==='nature'){g.strokeStyle='#5cc8f0';g.lineWidth=7*u;g.lineCap='round';g.beginPath();g.moveTo(x-rw*.7,y-rh*.6);g.bezierCurveTo(x-rw*.4,y,x-rw*.1,y-rh*.2,x-rw*.44,y+rh*.95);g.stroke();g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=2*u;g.stroke()}
  g.restore();
  g.strokeStyle='rgba(255,255,255,.3)';g.lineWidth=2*u;topPath(g,x,y,rw,rh,mulberry(90+i));g.stroke();
  g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=3*u;g.beginPath();g.ellipse(x,y+rh*.08,rw*.97,rh*.97,0,.15,Math.PI-.15);g.stroke();
  // ---- scenery (back to front) + landmark base
  const items=[];
  const add=(fx,fy,fn)=>items.push({px:x+fx*rw,py:y+fy*rh,fn});
  const im=MAPS[id].img;
  items.push({base:1,px:s.lm[0]*Wm,py:s.lm[1]*Hm+Hm*.06,fn:(px,py)=>{if(im.complete&&im.naturalWidth){const h=Hm*.27,w=h*im.naturalWidth/im.naturalHeight;g.drawImage(im,px-w/2,py-h,w,h)}}});
  for(let k=0;k<8;k++)add((R()-.5)*1.8,(R()-.3)*1.3,(px,py)=>rock(g,px,py,u*(.6+R()*.6),P));
  if(id==='desert'){[[-.75,-.45,1.2],[.72,-.5,1],[-.35,-.7,.8],[.5,.2,.6],[.82,.15,.7]].forEach(([a,b,k])=>add(a,b,(px,py)=>mesa(g,px,py,k*u,R)));for(let k=0;k<7;k++)add((R()-.5)*1.7,(R()-.3)*1.2,(px,py)=>cactus(g,px,py,u*(.8+R()*.5)))}
  if(id==='industrial'){[[-.7,-.55,1.3],[-.4,-.75,1],[.75,-.5,1.1],[.45,-.8,.8]].forEach(([a,b,k])=>add(a,b,(px,py)=>peak(g,px,py,k*u)));for(let k=0;k<5;k++)add((R()-.5)*1.7,(R()-.2)*1.1,(px,py)=>crystal(g,px,py,u*(.8+R()*.6),R));for(let k=0;k<6;k++)add((R()-.5)*1.8,(R()-.4)*1.2,(px,py)=>pine(g,px,py,u*(.8+R()*.4)))}
  if(id==='nature'){for(let k=0;k<12;k++)add((R()-.5)*1.85,(R()-.55)*1.4,(px,py)=>tree(g,px,py,u*(.9+R()*.7),R));for(let k=0;k<3;k++)add((R()-.5)*1.4,(R()-.2)*.9,(px,py)=>ruin(g,px,py,u))}
  if(id==='cyber'){add(-.62,-.35,(px,py)=>volcano(g,px,py,u*1.3));add(.72,-.4,(px,py)=>volcano(g,px,py,u*.9));for(let k=0;k<6;k++)add((R()-.5)*1.7,(R()-.3)*1.2,(px,py)=>basalt(g,px,py,u*(.8+R()*.5),R))}
  if(id==='volcanic'){add(.66,-.45,(px,py)=>volcano(g,px,py,u*1.4));add(-.7,-.4,(px,py)=>volcano(g,px,py,u*.8));for(let k=0;k<6;k++)add((R()-.5)*1.7,(R()-.3)*1.2,(px,py)=>basalt(g,px,py,u*(.8+R()*.5),R))}
  if(id==='crystal'){for(let k=0;k<9;k++)add((R()-.5)*1.8,(R()-.4)*1.3,(px,py)=>gem(g,px,py,u*(.8+R()*.7),R,k%2))}
  const bx=s.lm[0]*Wm,by=s.lm[1]*Hm+Hm*.06;items.sort((a,b)=>a.py-b.py).forEach(it=>{if(!it.base&&Math.abs(it.px-bx)<rw*.52&&Math.abs(it.py-by)<rh*.62)return;it.fn(it.px,it.py)});
}
function fall(g,x,y,w,h,c,u){const gr=g.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,`rgba(${c},.95)`);gr.addColorStop(.7,`rgba(${c},.5)`);gr.addColorStop(1,`rgba(${c},0)`);g.fillStyle=gr;g.fillRect(x-w/2,y,w,h);
  g.fillStyle='rgba(255,255,255,.55)';g.fillRect(x-w*.15,y,w*.25,h*.7);g.fillStyle=`rgba(${c},.25)`;for(let k=0;k<5;k++){g.beginPath();g.arc(x+(k-2)*w*.6,y+h*.75,w*1.2,0,7);g.fill()}}
function lavaRivers(g,x,y,rw,rh,u,R){g.lineCap='round';for(let k=0;k<2;k++){const sx=x+(R()-.5)*rw*1.2,sy=y-rh*.5;g.beginPath();g.moveTo(sx,sy);let xx=sx,yy=sy;for(let j=0;j<4;j++){xx+=(R()-.5)*rw*.3;yy+=rh*.4;g.lineTo(xx,yy)}
  g.strokeStyle='rgba(255,90,20,.45)';g.lineWidth=6*u;g.stroke();g.strokeStyle='#ffb02a';g.lineWidth=2.2*u;g.stroke()}}
function mesa(g,x,y,u,R){const w=46*u,h=40*u;const cols=['#e07b3c','#c45a2c','#e8935a','#b04a24'];for(let k=0;k<4;k++){const f=k/4;g.fillStyle=cols[k];g.beginPath();g.moveTo(x-w/2-f*0,y-h*f);g.lineTo(x-w/2+6*u+f*4*u,y-h*(f+.25));g.lineTo(x+w/2-6*u-f*4*u,y-h*(f+.25));g.lineTo(x+w/2,y-h*f);g.closePath();g.fill()}
  g.fillStyle='#ffb87a';g.fillRect(x-w/2+10*u,y-h-2*u,w-20*u,3*u);g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x+w*.15,y-h,w*.3,h)}
function cactus(g,x,y,u){g.fillStyle='#2f8a3e';const r=(a,b,c,d)=>{rr(g,x+a*u,y+b*u,c*u,d*u,Math.min(c,d)*u/2);g.fill()};r(-2.5,-20,5,20);r(-9,-14,4,9);r(-9,-9,7,3);r(5,-17,4,9);r(2,-11,7,3);g.fillStyle='rgba(255,255,255,.18)';g.fillRect(x-1.5*u,y-19*u,1.2*u,17*u)}
function peak(g,x,y,u){const w=60*u,h=62*u;g.fillStyle='#8fb3dc';g.beginPath();g.moveTo(x-w/2,y);g.lineTo(x,y-h);g.lineTo(x+w/2,y);g.fill();g.fillStyle='#5e86b8';g.beginPath();g.moveTo(x,y-h);g.lineTo(x+w/2,y);g.lineTo(x+w*.08,y);g.fill();
  g.fillStyle='#f4fbff';g.beginPath();g.moveTo(x-w*.18,y-h*.62);g.lineTo(x,y-h);g.lineTo(x+w*.19,y-h*.6);g.lineTo(x+w*.07,y-h*.66);g.lineTo(x-.02*w,y-h*.56);g.lineTo(x-w*.09,y-h*.66);g.fill()}
function crystal(g,x,y,u,R){g.save();g.shadowColor='#7fe8ff';g.shadowBlur=10*u;for(let k=0;k<3;k++){const h=(14+R()*18)*u,dx=(k-1)*6*u,a=(k-1)*.3;g.save();g.translate(x+dx,y);g.rotate(a);g.fillStyle=k===1?'#9ef0ff':'#5fd0f5';g.beginPath();g.moveTo(-4*u,0);g.lineTo(-4*u,-h*.75);g.lineTo(0,-h);g.lineTo(4*u,-h*.75);g.lineTo(4*u,0);g.fill();g.fillStyle='rgba(255,255,255,.6)';g.fillRect(-2.5*u,-h*.8,1.5*u,h*.6);g.restore()}g.restore()}
function pine(g,x,y,u){g.fillStyle='#4a3424';g.fillRect(x-2*u,y-6*u,4*u,6*u);for(let k=0;k<3;k++){const w=(16-k*4)*u,yy=y-6*u-k*8*u;g.fillStyle='#2e6b5a';g.beginPath();g.moveTo(x-w/2,yy);g.lineTo(x,yy-12*u);g.lineTo(x+w/2,yy);g.fill();g.fillStyle='#f2f9ff';g.beginPath();g.moveTo(x-w*.3,yy-5*u);g.lineTo(x,yy-12*u);g.lineTo(x+w*.3,yy-5*u);g.fill()}}
function tree(g,x,y,u,R){g.fillStyle='#5a3a22';g.fillRect(x-2.5*u,y-14*u,5*u,14*u);const cs=['#2d8a3a','#3aa346','#57c04f'];for(let k=0;k<3;k++){g.fillStyle=cs[k];[[0,-24],[-9,-17],[9,-17],[-4,-30],[5,-28]].forEach(([a,b],j)=>{if((j+k)%2)return;g.beginPath();g.arc(x+a*u-k*u,y+b*u-k*2*u,(9-k*2)*u,0,7);g.fill()})}g.fillStyle='rgba(255,255,255,.15)';g.beginPath();g.arc(x-3*u,y-30*u,3.5*u,0,7);g.fill()}
function ruin(g,x,y,u){g.fillStyle='#8f9a86';g.fillRect(x-10*u,y-22*u,6*u,22*u);g.fillRect(x+4*u,y-16*u,6*u,16*u);g.fillRect(x-12*u,y-25*u,24*u,4*u);g.fillStyle='#4f8a3a';g.fillRect(x-10*u,y-22*u,6*u,4*u);g.fillStyle='rgba(0,0,0,.2)';g.fillRect(x-6*u,y-22*u,2*u,22*u)}
function volcano(g,x,y,u){const w=70*u,h=50*u;let gr=g.createLinearGradient(x-w/2,0,x+w/2,0);gr.addColorStop(0,'#3a2422');gr.addColorStop(1,'#160b0a');g.fillStyle=gr;g.beginPath();g.moveTo(x-w/2,y);g.lineTo(x-w*.12,y-h);g.lineTo(x+w*.12,y-h);g.lineTo(x+w/2,y);g.fill();
  g.save();g.shadowColor='#ff5a10';g.shadowBlur=14*u;g.fillStyle='#ffb02a';g.beginPath();g.ellipse(x,y-h,w*.12,4*u,0,0,7);g.fill();g.strokeStyle='#ff7a1a';g.lineWidth=3*u;g.beginPath();g.moveTo(x-3*u,y-h);g.quadraticCurveTo(x-w*.18,y-h*.5,x-w*.25,y);g.moveTo(x+4*u,y-h);g.quadraticCurveTo(x+w*.1,y-h*.4,x+w*.2,y);g.stroke();g.restore();
  g.fillStyle='rgba(90,80,90,.45)';for(let k=0;k<4;k++){g.beginPath();g.arc(x+k*5*u,y-h-10*u-k*10*u,(7+k*3)*u,0,7);g.fill()}}
function basalt(g,x,y,u,R){g.fillStyle='#2a1a1a';const n=3;for(let k=0;k<n;k++){const h=(10+R()*14)*u;g.fillRect(x+(k-1)*6*u-3*u,y-h,6*u,h)}g.fillStyle='rgba(255,120,40,.6)';g.fillRect(x-1*u,y-3*u,2*u,3*u)}
function rock(g,x,y,u,P){g.fillStyle=P.rock2;g.beginPath();g.moveTo(x-7*u,y);g.lineTo(x-4*u,y-6*u);g.lineTo(x+3*u,y-7*u);g.lineTo(x+7*u,y);g.fill();g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.moveTo(x-4*u,y-6*u);g.lineTo(x+3*u,y-7*u);g.lineTo(x,y-3*u);g.fill()}

const ROAD={desert:'#f3c48c',industrial:'#d8e6f4',nature:'#c9b07a',cyber:'#6a4a42',volcanic:'#6a4a42',crystal:'#5a5a9a'};
// flat crystal cluster (violet or cyan), no glow
function gem(g,x,y,u,R,c){const cols=c?['#c48cff','#8a5ae0','#f0dcff']:['#7fd8ff','#3f9ad8','#e0f6ff'];for(let k=0;k<3;k++){const h=(12+R()*16)*u*(k===1?1.3:1),dx=(k-1)*6*u,a=(k-1)*.35;g.save();g.translate(x+dx,y);g.rotate(a);g.fillStyle=cols[k===1?0:1];g.beginPath();g.moveTo(-4*u,0);g.lineTo(-4*u,-h*.72);g.lineTo(0,-h);g.lineTo(4*u,-h*.72);g.lineTo(4*u,0);g.fill();g.fillStyle=cols[2];g.globalAlpha=.6;g.fillRect(-2.4*u,-h*.78,1.4*u,h*.6);g.globalAlpha=1;g.restore()}}
// flat stone disc a level marker stands on; boss levels get a ring of wooden stakes
function pad(g,x,y,u,boss,id){const rx=(boss?21:15)*u,ry=rx*.36;
  g.fillStyle='rgba(20,10,10,.3)';g.beginPath();g.ellipse(x,y+2.5*u,rx+2*u,ry+2*u,0,0,7);g.fill();
  g.fillStyle=id==='cyber'||id==='volcanic'?'#3a2a2a':id==='crystal'?'#3a3a6a':'#8a8f9e';g.beginPath();g.ellipse(x,y+1.5*u,rx,ry,0,0,7);g.fill();
  g.fillStyle=id==='cyber'||id==='volcanic'?'#5a4444':id==='crystal'?'#5a5a94':'#b9bfcc';g.beginPath();g.ellipse(x,y,rx*.9,ry*.8,0,0,7);g.fill();
  if(boss){for(let k=0;k<9;k++){const a=Math.PI*(.05+k*.9/8),sx=x-Math.cos(a)*rx*1.25,sy=y+Math.sin(a)*ry*1.3,h=(9+(k%2)*3)*u;
    g.fillStyle='#4a2f1b';g.beginPath();g.moveTo(sx-2*u,sy);g.lineTo(sx-2*u,sy-h);g.lineTo(sx,sy-h-3.5*u);g.lineTo(sx+2*u,sy-h);g.lineTo(sx+2*u,sy);g.fill();g.fillStyle='#7a5232';g.fillRect(sx-2*u,sy-h,1.2*u,h)}}}
// plank bridge on two sagging ropes; little gold pennants once it leads somewhere you've opened
function bridge(g,x1,y1,x2,y2,u,open){const sag=26*u,q=t=>{const a=1-t;return[a*a*x1+2*a*t*(x1+x2)/2+t*t*x2,a*a*y1+2*a*t*((y1+y2)/2+sag)+t*t*y2]};
  const rope=(dy)=>{g.beginPath();for(let k=0;k<=24;k++){const [x,y]=q(k/24);k?g.lineTo(x,y+dy):g.moveTo(x,y+dy)}g.stroke()};
  g.strokeStyle='rgba(10,8,20,.35)';g.lineWidth=3*u;rope(4*u);
  const n=Math.max(8,Math.round(Math.hypot(x2-x1,y2-y1)/(9*u)));
  for(let k=1;k<n;k++){const [x,y]=q(k/n);g.fillStyle=k%3?'#9a6a3c':'#86592f';g.fillRect(x-3.2*u,y-2.5*u,6.4*u,6*u);g.fillStyle='#5a3a1e';g.fillRect(x-3.2*u,y+2.5*u,6.4*u,1.4*u)}
  g.strokeStyle='#d9b98a';g.lineWidth=1.6*u;rope(-1.5*u);
  // handrail with hangers
  g.strokeStyle='#c9a676';g.lineWidth=1.3*u;rope(-14*u);
  for(let k=2;k<n-1;k+=2){const [x,y]=q(k/n);g.beginPath();g.moveTo(x,y-14*u);g.lineTo(x,y-2*u);g.stroke()}
  for(const [x,y] of [q(.06),q(.94)]){g.fillStyle='#4a2f1b';g.fillRect(x-2*u,y-18*u,4*u,20*u);g.fillStyle='#7a5232';g.fillRect(x-2*u,y-18*u,1.3*u,20*u);
    if(open){g.fillStyle='#ffd23a';g.beginPath();g.moveTo(x+2*u,y-18*u);g.lineTo(x+11*u,y-15*u);g.lineTo(x+2*u,y-12*u);g.fill()}}}
// small rock chunks floating beside an island
function shards(g,i,Wm,Hm,u){const s=ISLES[i],P=PAL[CHAPTERS[i].id],R=mulberry(500+i),x=s.c[0]*Wm,y=s.c[1]*Hm,rw=s.r[0]*Wm,rh=s.r[1]*Hm;
  [[-1.18,.9,1],[1.2,1.5,.8],[-1.08,2.3,.6],[1.12,.35,.5]].forEach(([fx,fy,k])=>{const px=x+fx*rw,py=y+fy*rh,w=(18+R()*10)*u*k,h=w*(1.1+R()*.5);
    g.fillStyle=P.rock2;g.beginPath();g.moveTo(px-w/2,py);g.lineTo(px-w*.2,py+h*.7);g.lineTo(px+w*.05,py+h);g.lineTo(px+w*.3,py+h*.55);g.lineTo(px+w/2,py);g.closePath();g.fill();
    g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.moveTo(px+w*.05,py);g.lineTo(px+w/2,py);g.lineTo(px+w*.3,py+h*.55);g.lineTo(px+w*.05,py+h);g.fill();
    g.fillStyle=P.top2;g.beginPath();g.ellipse(px,py,w/2,w*.16,0,0,7);g.fill();g.fillStyle=P.top;g.beginPath();g.ellipse(px-w*.05,py-w*.03,w*.38,w*.1,0,0,7);g.fill()})}
// a few distant birds, plain ink strokes
function birds(g,Wm,Hm,u,R){g.strokeStyle='rgba(10,14,40,.6)';g.lineWidth=1.6*u;g.lineCap='round';
  for(let f=0;f<4;f++){const fx=(.08+f*.25+R()*.08)*Wm,fy=(.12+R()*.12)*Hm;for(let k=0;k<3+f%2;k++){const bx=fx+k*14*u+R()*6*u,by=fy+(k%2)*7*u+R()*4*u,w=(5+R()*2)*u;
    g.beginPath();g.moveTo(bx-w,by-w*.5);g.quadraticCurveTo(bx-w*.4,by-w*.6,bx,by);g.quadraticCurveTo(bx+w*.4,by-w*.6,bx+w,by-w*.5);g.stroke()}}}
// the next chapter shows only as a dark outline inside the fog
function hiddenIsle(g,x,y,rw,rh){g.fillStyle='rgba(30,32,78,.35)';g.beginPath();g.ellipse(x,y,rw,rh,0,Math.PI,0);
  g.lineTo(x+rw*.95,y+rh*.3);g.lineTo(x+rw*.5,y+rh*1.6);g.lineTo(x+rw*.15,y+rh*2.4);g.lineTo(x-rw*.1,y+rh*1.9);g.lineTo(x-rw*.45,y+rh*2.2);g.lineTo(x-rw*.95,y+rh*.3);g.closePath();g.fill();
  g.fillStyle='rgba(30,32,78,.4)';[[-.3,.55,.13],[-.12,.95,.16],[.1,1.25,.2],[.32,.8,.14]].forEach(([fx,fh,fw])=>{const tx=x+fx*rw,w=fw*rw,h=fh*rh;g.beginPath();g.moveTo(tx-w/2,y);g.lineTo(tx-w/2,y-h);g.lineTo(tx,y-h-w*.7);g.lineTo(tx+w/2,y-h);g.lineTo(tx+w/2,y);g.fill()});g.fillRect(x-rw*.4,y-rh*.45,rw*.85,rh*.45)}
// a clean, flat-shaded billow line where the fog starts, so it reads as a cloud wall instead of a blur
function fogEdge(g,x,Hm,u,R){const pts=[];let y=-30*u;
  while(y<Hm+60*u){const r=(26+R()*40)*u;pts.push([x+Math.sin(y/(Hm*.17))*30*u+(R()-.5)*22*u,y,r]);y+=r*(.75+R()*.35)}
  const body=()=>{g.beginPath();g.moveTo(x+90*u,-10);pts.forEach(([px,py])=>g.lineTo(px,py));g.lineTo(x+90*u,Hm+10);g.closePath()};
  g.fillStyle='#454a86';body();g.fill();
  const sg=g.createLinearGradient(x+60*u,0,x+220*u,0);sg.addColorStop(0,'rgba(69,74,134,1)');sg.addColorStop(1,'rgba(69,74,134,0)');g.fillStyle=sg;g.fillRect(x+60*u,0,160*u,Hm);
  pts.forEach(([px,py,r])=>{g.fillStyle='#2e3168';g.beginPath();g.arc(px+2*u,py+5*u,r,0,7);g.fill()});
  pts.forEach(([px,py,r])=>{g.fillStyle='#454a86';g.beginPath();g.arc(px,py,r,0,7);g.fill()});
  pts.forEach(([px,py,r])=>{g.fillStyle='#5e63a2';g.beginPath();g.arc(px-r*.18,py-r*.22,r*.66,0,7);g.fill()});
  // a few loose puffs drifting off the wall
  for(let k=0;k<5;k++){const py=(.1+k*.2+R()*.06)*Hm,px=x-(40+R()*70)*u,r=(10+R()*12)*u;g.fillStyle='#454a86';g.beginPath();g.ellipse(px,py,r*1.8,r,0,0,7);g.fill();g.fillStyle='#5e63a2';g.beginPath();g.ellipse(px-r*.3,py-r*.25,r*1.1,r*.55,0,0,7);g.fill()}}

// flat moon with soft crater shapes
function moon(g,x,y,r){g.fillStyle='rgba(255,240,210,.08)';g.beginPath();g.arc(x,y,r*1.6,0,7);g.fill();g.fillStyle='#f6e9c8';g.beginPath();g.arc(x,y,r,0,7);g.fill();
  g.fillStyle='#e2d0a6';g.beginPath();g.arc(x+r*.2,y+r*.12,r*.86,-.4,2.2);g.arc(x,y,r,2.2,-.4,true);g.fill();
  g.fillStyle='#d8c493';[[-.35,-.25,.2],[.25,.3,.15],[.3,-.35,.1],[-.1,.45,.08]].forEach(([a,b,c])=>{g.beginPath();g.arc(x+a*r,y+b*r,c*r,0,7);g.fill()})}
// two far mountain ranges along the horizon
function ranges(g,Wm,Hm,u){[[.62,'#3a3a82',mulberry(21),70],[.72,'#4a4590',mulberry(22),55]].forEach(([fy,col,R,h])=>{g.fillStyle=col;g.beginPath();g.moveTo(0,Hm);let x=0;g.lineTo(0,Hm*fy);
  while(x<Wm){const w=(60+R()*90)*u,pk=(h*.5+R()*h)*u;g.lineTo(x+w*.5,Hm*fy-pk);g.lineTo(x+w*.62,Hm*fy-pk*.82);g.lineTo(x+w,Hm*fy+R()*10*u);x+=w}g.lineTo(Wm,Hm);g.closePath();g.fill()})}
// a band of flat cartoon cloud puffs: shadow color body, lighter tops
function puffBand(g,Wm,y,u,R,c1,c2,a){g.globalAlpha=a;const pts=[];for(let x=-40*u;x<Wm+40*u;){const r=(26+R()*34)*u;pts.push([x,y+(R()-.5)*22*u,r]);x+=r*(1+R()*.5)}
  g.fillStyle=c1;pts.forEach(([x,yy,r])=>{g.beginPath();g.arc(x,yy,r,0,7);g.fill()});g.fillRect(0,y,Wm,g.canvas.height);
  g.fillStyle=c2;pts.forEach(([x,yy,r])=>{g.beginPath();g.arc(x-r*.15,yy-r*.25,r*.7,0,7);g.fill()});g.globalAlpha=1}
