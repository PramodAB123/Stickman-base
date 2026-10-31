'use strict';
// Career map painter: floating-island chapters drawn once onto #mapCv (redrawn on resize)
let mapImgsReady=false;
function drawMap(){
  const c=$('mapCv'),box=c.parentElement.getBoundingClientRect();if(!box.width)return;
  const dpr=Math.min(window.devicePixelRatio||1,2),Wm=box.width,Hm=box.height;
  c.width=Math.round(Wm*dpr);c.height=Math.round(Hm*dpr);const g=c.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);
  const u=Math.min(Wm/900,Hm/560),R=mulberry(11);
  // sky
  let gr=g.createLinearGradient(0,0,0,Hm);gr.addColorStop(0,'#2a3f86');gr.addColorStop(.5,'#1d2a66');gr.addColorStop(1,'#131b45');g.fillStyle=gr;g.fillRect(0,0,Wm,Hm);
  for(let i=0;i<90;i++){g.fillStyle=`rgba(255,255,255,${.15+R()*.55})`;const s=R()<.15?2.2:1.2;g.fillRect(R()*Wm,R()*Hm*.7,s,s)}
  ISLES.forEach((s,i)=>{const t=THEME[CHAPTERS[i].id],x=s.c[0]*Wm,y=s.c[1]*Hm,rg=g.createRadialGradient(x,y,0,x,y,Wm*.32);rg.addColorStop(0,`rgba(${t.glow},.35)`);rg.addColorStop(1,`rgba(${t.glow},0)`);g.fillStyle=rg;g.fillRect(0,0,Wm,Hm)});
  cloudBank(g,Wm,Hm*.2,Wm,u*.8,mulberry(3),'rgba(170,190,255,.10)');
  // back row, mid clouds, front row, bottom clouds
  [0,1].forEach(i=>paintIsle(g,i,Wm,Hm,u));
  cloudBank(g,Wm,Hm*.62,Wm,u,mulberry(5),'rgba(190,205,255,.05)');
  [3,2].forEach(i=>paintIsle(g,i,Wm,Hm,u));
  cloudBank(g,Wm,Hm*1.02,Wm,u*1.3,mulberry(7),'rgba(200,215,255,.14)');
  // trail
  const P=NODEPOS.map(([a,b])=>[a*Wm,b*Hm]),done=CAR.stars.filter(x=>x>0).length;g.lineCap='round';
  for(let i=0;i<P.length-1;i++){const [x1,y1]=P[i],[x2,y2]=P[i+1],mx=(x1+x2)/2,my=(y1+y2)/2+(i%4===3?0:12*u);
    g.setLineDash([10*u,8*u]);g.lineWidth=6.5*u;g.strokeStyle='rgba(10,10,30,.45)';g.beginPath();g.moveTo(x1,y1+3);g.quadraticCurveTo(mx,my+3,x2,y2+3);g.stroke();
    g.lineWidth=3.6*u;g.strokeStyle=i<done?'#ffd35a':'rgba(255,255,255,.92)';g.beginPath();g.moveTo(x1,y1);g.quadraticCurveTo(mx,my,x2,y2);g.stroke()}
  g.setLineDash([]);
  if(!mapImgsReady&&MAPIDS.some(id=>!MAPS[id].img.complete)){Promise.all(MAPIDS.map(id=>MAPS[id].img.decode().catch(()=>0))).then(()=>{mapImgsReady=true;if(hubTab==='career')drawMap()})}
}
function cloudBank(g,cx,y,Wm,u,R,col){g.fillStyle=col;for(let i=0;i<10;i++){const x=R()*Wm,r=(30+R()*60)*u;g.beginPath();g.ellipse(x,y+(R()-.5)*40*u,r*1.8,r*.7,0,0,7);g.fill()}}
function shadeHex(hex,f){const n=parseInt(hex.slice(1),16);let r=n>>16,gg=(n>>8)&255,b=n&255;const m=v=>Math.max(0,Math.min(255,Math.round(f>1?v+(255-v)*(f-1):v*f)));return`rgb(${m(r)},${m(gg)},${m(b)})`}
function topPath(g,x,y,rw,rh,R){const n=18,pts=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2,k=.9+R()*.14;pts.push([x+Math.cos(a)*rw*k,y+Math.sin(a)*rh*k])}
  g.beginPath();pts.forEach((p,i)=>{const q=pts[(i+1)%n],mx=(p[0]+q[0])/2,my=(p[1]+q[1])/2;i?g.quadraticCurveTo(p[0],p[1],mx,my):g.moveTo(mx,my)});const p=pts[0],q=pts[1];g.quadraticCurveTo(p[0],p[1],(p[0]+q[0])/2,(p[1]+q[1])/2);g.closePath()}
const PAL={
  desert:{top:'#f6b26b',top2:'#d9783c',rock:'#c8642f',rock2:'#7a2f1a',dark:'#3e160f'},
  industrial:{top:'#f4faff',top2:'#bcd6ef',rock:'#7e9cc4',rock2:'#3c5680',dark:'#18233f'},
  nature:{top:'#8fdc5a',top2:'#3f9d3a',rock:'#8a7650',rock2:'#4a3d26',dark:'#211a10'},
  cyber:{top:'#4a3434',top2:'#2a1c1d',rock:'#4a302c',rock2:'#24130f',dark:'#0b0505'},
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
  // ---- top surface with a thick front lip
  topPath(g,x,y,rw,rh,mulberry(90+i));gr=g.createLinearGradient(0,y-rh,0,y+rh);gr.addColorStop(0,P.top);gr.addColorStop(1,P.top2);g.fillStyle=gr;g.fill();
  g.save();g.clip();
  for(let k=0;k<40;k++){g.fillStyle=R()<.5?'rgba(255,255,255,.07)':'rgba(0,0,0,.06)';g.beginPath();g.ellipse(x+(R()-.5)*rw*2,y+(R()-.5)*rh*2,(8+R()*30)*u,(3+R()*8)*u,0,0,7);g.fill()}
  if(id==='cyber')lavaRivers(g,x,y,rw,rh,u,R);
  if(id==='nature'){g.strokeStyle='#5cc8f0';g.lineWidth=7*u;g.lineCap='round';g.beginPath();g.moveTo(x-rw*.7,y-rh*.6);g.bezierCurveTo(x-rw*.4,y,x-rw*.1,y-rh*.2,x-rw*.44,y+rh*.95);g.stroke();g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=2*u;g.stroke()}
  g.restore();
  g.strokeStyle='rgba(255,255,255,.3)';g.lineWidth=2*u;topPath(g,x,y,rw,rh,mulberry(90+i));g.stroke();
  g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=3*u;g.beginPath();g.ellipse(x,y+rh*.08,rw*.97,rh*.97,0,.15,Math.PI-.15);g.stroke();
  // ---- scenery (back to front) + landmark base
  const items=[];
  const add=(fx,fy,fn)=>items.push({px:x+fx*rw,py:y+fy*rh,fn});
  const im=MAPS[id].img;
  items.push({base:1,px:s.lm[0]*Wm,py:s.lm[1]*Hm+Hm*.06,fn:(px,py)=>{if(im.complete&&im.naturalWidth){const h=Hm*.21,w=h*im.naturalWidth/im.naturalHeight;g.drawImage(im,px-w/2,py-h,w,h)}}});
  for(let k=0;k<8;k++)add((R()-.5)*1.8,(R()-.3)*1.3,(px,py)=>rock(g,px,py,u*(.6+R()*.6),P));
  if(id==='desert'){[[-.75,-.45,1.2],[.72,-.5,1],[-.35,-.7,.8],[.5,.2,.6],[.82,.15,.7]].forEach(([a,b,k])=>add(a,b,(px,py)=>mesa(g,px,py,k*u,R)));for(let k=0;k<7;k++)add((R()-.5)*1.7,(R()-.3)*1.2,(px,py)=>cactus(g,px,py,u*(.8+R()*.5)))}
  if(id==='industrial'){[[-.7,-.55,1.3],[-.4,-.75,1],[.75,-.5,1.1],[.45,-.8,.8]].forEach(([a,b,k])=>add(a,b,(px,py)=>peak(g,px,py,k*u)));for(let k=0;k<5;k++)add((R()-.5)*1.7,(R()-.2)*1.1,(px,py)=>crystal(g,px,py,u*(.8+R()*.6),R));for(let k=0;k<6;k++)add((R()-.5)*1.8,(R()-.4)*1.2,(px,py)=>pine(g,px,py,u*(.8+R()*.4)))}
  if(id==='nature'){for(let k=0;k<12;k++)add((R()-.5)*1.85,(R()-.55)*1.4,(px,py)=>tree(g,px,py,u*(.9+R()*.7),R));for(let k=0;k<3;k++)add((R()-.5)*1.4,(R()-.2)*.9,(px,py)=>ruin(g,px,py,u))}
  if(id==='cyber'){add(-.62,-.35,(px,py)=>volcano(g,px,py,u*1.3));add(.72,-.4,(px,py)=>volcano(g,px,py,u*.9));for(let k=0;k<6;k++)add((R()-.5)*1.7,(R()-.3)*1.2,(px,py)=>basalt(g,px,py,u*(.8+R()*.5),R))}
  const bx=s.lm[0]*Wm,by=s.lm[1]*Hm+Hm*.06;items.sort((a,b)=>a.py-b.py).forEach(it=>{if(!it.base&&Math.abs(it.px-bx)<rw*.42&&Math.abs(it.py-by)<rh*.55)return;it.fn(it.px,it.py)});
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
