'use strict';
// Bullets, hits, explosions, effects, airstrike
function hurtGunner(s,dmg){
  if(!s||!s.w||s.down||s.ko||dmg<=0||S.mode!=='play')return;
  s.hp-=dmg;s.hurt=.25;
  if(s.hp<=0){s.hp=0;s.ko=true;s.tgt=null;s.boost=0;floater(s.x,s.y-s.crate-90,'KNOCKED OUT!','#ff6b5b',.9);SND.play('thud');explodeFx(s.x,s.y-s.crate-40,30)}
}
function nearGunner(x,y,r){let best=null,bd=r;for(const s of S.slots){if(!s.w||s.ko)continue;const d=Math.hypot(s.x-x,(s.y-s.crate-40)-y);if(d<bd){bd=d;best=s}}return best}
function hitWall(dmg,x,y){
  for(let i=0;i<6;i++)S.parts.push({type:'chip',x,y,vx:rand(20,180),vy:rand(-220,-40),life:rand(.4,.8),max:.8,size:rand(2,4),g:900,col:'#6e5a50'});
  S.parts.push({type:'smoke',x,y,vx:rand(10,40),vy:-20,life:.6,max:.6,size:rand(10,16),g:0});
  if(dmg<=0||S.mode!=='play')return;
  S.wallHP-=dmg;S.wallHit=.25;S.shake=Math.max(S.shake,3);SND.play('thud');
  if(S.wallHP<=0){S.wallHP=0;startDying()}
}

// ---------- combat ----------
function segPt2(ax,ay,bx,by,px,py){const dx=bx-ax,dy=by-ay,l=dx*dx+dy*dy;let t=l?((px-ax)*dx+(py-ay)*dy)/l:0;t=clamp(t,0,1);const x=ax+dx*t-px,y=ay+dy*t-py;return x*x+y*y}
function segSeg2(p1x,p1y,q1x,q1y,p2x,p2y,q2x,q2y){
  const d1x=q1x-p1x,d1y=q1y-p1y,d2x=q2x-p2x,d2y=q2y-p2y,rx=p1x-p2x,ry=p1y-p2y;
  const a=d1x*d1x+d1y*d1y,e=d2x*d2x+d2y*d2y,f=d2x*rx+d2y*ry;let s,t;
  if(a<1e-6&&e<1e-6)return rx*rx+ry*ry;
  if(a<1e-6){s=0;t=clamp(f/e,0,1)}else{const c=d1x*rx+d1y*ry;if(e<1e-6){t=0;s=clamp(-c/a,0,1)}else{const b=d1x*d2x+d1y*d2y,den=a*e-b*b;s=den?clamp((b*f-c*e)/den,0,1):0;t=(b*s+f)/e;if(t<0){t=0;s=clamp(-c/a,0,1)}else if(t>1){t=1;s=clamp((b-c)/a,0,1)}}}
  const x=p1x+d1x*s-(p2x+d2x*t),y=p1y+d1y*s-(p2y+d2y*t);return x*x+y*y;
}
function hitTest(e,ax,ay,bx,by){
  if(e.cloak)return null;
  for(const b of e.B)if(b[5]==='shield'&&segSeg2(ax,ay,bx,by,b[0],b[1],b[2],b[3])<=b[4]*b[4])return'shield';
  const c=e.crit;if(segPt2(ax,ay,bx,by,c.x,c.y)<=c.r*c.r)return'head';
  for(const b of e.B)if(b[5]!=='shield'&&segSeg2(ax,ay,bx,by,b[0],b[1],b[2],b[3])<=b[4]*b[4])return'body';
  return null;
}
function updateBullets(dt){
  for(const b of S.bullets){
    const ax=b.x,ay=b.y,w=WMAP[b.w];
    if(b.grav)b.vy+=b.grav*dt;
    if(b.w==='rocket'&&Math.random()<dt*60)S.parts.push({type:'smoke',x:b.x,y:b.y,vx:rand(-20,20),vy:rand(-20,10),life:.6,max:.6,size:rand(5,9),g:0});
    if(b.w==='flame'){b.vx*=Math.exp(-.5*dt);b.vy=b.vy*Math.exp(-.5*dt)-30*dt}
    b.spin+=dt*24;b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;
    for(const e of S.enemies){
      if(e.dead||b.hit.includes(e.id))continue;
      const h=hitTest(e,ax,ay,b.x,b.y);if(!h)continue;
      if(b.ex){b.dead=true;explode(b.x,b.y,b.radius,b.dmg,w);break}
      b.hit.push(e.id);
      const sp=Math.hypot(b.vx,b.vy)||1,ix=b.vx/sp,iy=b.vy/sp;
      if(applyHit(e,h,b.dmg,ix,iy,b.x,b.y,w))b.pierce=0;else b.pierce--;
      if(b.pierce<=0){b.dead=true;break}
    }
    if(b.dead)continue;
    if(b.y>=GY){b.dead=true;if(b.ex)explode(b.x,GY-4,b.radius,b.dmg,w);else if(b.w!=='flame')dust(b.x,GY)}
    else if(b.x>W+60||b.y<-80||b.x<-40||b.life<=0){b.dead=true;if(b.ex&&b.x<W+60&&b.x>0)explode(b.x,b.y,b.radius,b.dmg,w)}
  }
  S.bullets=S.bullets.filter(b=>!b.dead);
}
function damageEnemy(e,dmg,o){
  if(e.dead)return;e.hp-=dmg;if(!o.dot)e.flash=.08;
  if(o.ix)e.kx+=Math.max(0,o.ix)*(o.blast?.5:.12)/e.s;
  if(e.hp<=0)killEnemy(e,o);
}
function explode(x,y,r,dmg,w){
  explodeFx(x,y,r,w);
  for(const e of S.enemies){
    if(e.dead||e.cloak)continue;const ex=e.core.x,ey=e.core.y,d=Math.hypot(ex-x,ey-y);
    let dd=1e9;for(const b of e.B)if(b[5]!=='shield')dd=Math.min(dd,Math.sqrt(segPt2(b[0],b[1],b[2],b[3],x,y))-b[4]);dd=Math.max(0,dd);
    if(dd<r){const f=clamp(1-dd/(r*1.2),.3,1),nx=(ex-x)/(d||1),ny=(ey-y)/(d||1);
      if(e.shield>0)e.shield=Math.max(0,e.shield-dmg*f*(w&&w.acid?1.4:.6));
      if(w)applyStatus(e,w,dmg);
      const room=clamp((W-220-e.x)/300,0,1);
      damageEnemy(e,dmg*f,{blast:true,ix:((w&&w.push?700/Math.sqrt(e.s*e.s*e.s):0)*f+Math.abs(nx)*600*f+150)*room,iy:-520*f-120+ny*100,hx:x,hy:y});}
  }
}
function explodeFx(x,y,r,w){
  if(w&&w.fx){const c=w.fx;S.shake=Math.max(S.shake,3+r*.03);SND.play(w.id==='acid'?'goo':'explode');
    S.parts.push({type:'boom',x,y,life:.22,max:.22,size:r*.85,g:0,col:c});
    S.parts.push({type:'ring',x,y,life:.45,max:.45,size:r,g:0,col:c});
    if(w.push)S.parts.push({type:'ring',x,y,life:.6,max:.6,size:r*1.4,g:0,col:c,inv:1});
    for(let i=0;i<20;i++){const a=rand(0,6.28),v=rand(80,380);S.parts.push({type:w.id==='acid'?'drop':'spark',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-(w.id==='acid'?160:0),life:rand(.25,.6),max:.6,size:w.id==='acid'?rand(2,4):2,g:w.id==='acid'?900:100,col:'rgb('+c+')'})}
    for(let i=0;i<5;i++)S.parts.push({type:'smoke',x:x+rand(-20,20),y:y+rand(-20,10),vx:rand(-60,60),vy:rand(-90,-20),life:rand(.6,1.1),max:1.1,size:rand(12,20),g:0,col:w.id==='acid'?'#4f6a20':undefined});
    return}
  S.shake=Math.max(S.shake,6+r*.04);SND.play('explode');
  S.parts.push({type:'boom',x,y,life:.18,max:.18,size:r*.9,g:0});
  S.parts.push({type:'ring',x,y,life:.4,max:.4,size:r,g:0});
  for(let i=0;i<22;i++){const a=rand(0,6.28),v=rand(80,420);S.parts.push({type:'fire',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-120,life:rand(.25,.55),max:.55,size:rand(5,11),g:200})}
  for(let i=0;i<12;i++)S.parts.push({type:'smoke',x:x+rand(-20,20),y:y+rand(-20,10),vx:rand(-60,60),vy:rand(-90,-20),life:rand(.8,1.5),max:1.5,size:rand(14,26),g:0});
  for(let i=0;i<10;i++)S.parts.push({type:'chip',x,y,vx:rand(-300,300),vy:rand(-500,-150),life:rand(.6,1.1),max:1.1,size:rand(2,4),g:1000,col:'#3a2230'});
}
function sparks(x,y,n,col){for(let i=0;i<n;i++){const a=rand(0,6.28),v=rand(100,320);S.parts.push({type:'spark',x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rand(.12,.25),max:.25,size:2,g:300,col})}}
function blood(x,y,ix,iy,n){for(let i=0;i<n;i++)S.parts.push({type:'drop',x,y,vx:ix*rand(60,260)+rand(-60,60),vy:iy*rand(60,200)+rand(-200,-20),life:rand(.4,.8),max:.8,size:rand(1.5,3.2),g:1000,col:'#b8202e'})}
function dust(x,y){for(let i=0;i<4;i++)S.parts.push({type:'smoke',x,y:y-2,vx:rand(-40,40),vy:rand(-50,-10),life:.4,max:.4,size:rand(4,8),g:0,col:'#d8a070'})}
function floater(x,y,text,col,size){S.floaters.push({x,y,text,col,t:0,size:size||1})}

const RAG_LINKS=[[0,1],[1,2],[2,3],[3,4],[2,5],[5,6],[1,7],[7,8],[1,9],[9,10],[0,2]];
function spawnRag(e,o){
  const J=e.J,pts=[J.head,J.sh,J.hip,J.k1,J.f1,J.k2,J.f2,J.e1,J.h1,J.e2,J.h2].map(p=>({x:p.x,y:p.y,vx:0,vy:0,ox:p.x,oy:p.y}));
  const ix=o.ix||200,iy=o.iy||-150;
  pts.forEach((p,i)=>{let m=rand(.5,1);if(o.head&&i<=1)m=1.6;if(o.hx!=null){const d=Math.hypot(p.x-o.hx,p.y-o.hy);m*=clamp(1.4-d/(60*e.s),.5,1.4)}p.vx=ix*m/Math.sqrt(e.s)+rand(-30,30);p.vy=iy*m/Math.sqrt(e.s)+rand(-30,30)});
  const links=RAG_LINKS.map(([a,b])=>[a,b,Math.hypot(pts[a].x-pts[b].x,pts[a].y-pts[b].y)]);
  S.rags.push({pts,links,s:e.s,hr:J.hr,life:4,acc:e.d?e.d.acc:'#4fc3ff',type:e.type});
  if(S.rags.length>36)S.rags.shift();
}
function updateRags(dt){
  for(const r of S.rags){
    r.life-=dt;
    for(const p of r.pts){p.vy+=1100*dt;p.ox=p.x;p.oy=p.y;p.x+=p.vx*dt;p.y+=p.vy*dt}
    for(let it=0;it<4;it++){
      for(const [a,b,l] of r.links){const A=r.pts[a],B=r.pts[b],dx=B.x-A.x,dy=B.y-A.y,d=Math.hypot(dx,dy)||1,k=(d-l)/d*.5;A.x+=dx*k;A.y+=dy*k;B.x-=dx*k;B.y-=dy*k}
      r.pts.forEach((p,i)=>{const rad=i===0?r.hr:2.5*r.s;if(p.y>GY-rad)p.y=GY-rad});
    }
    for(const p of r.pts){const ground=p.y>=GY-r.hr-1;p.vx=(p.x-p.ox)/dt;p.vy=(p.y-p.oy)/dt;if(ground){p.vx*=.82;if(p.vy>0)p.vy=0}}
  }
  S.rags=S.rags.filter(r=>r.life>0);
}

function strikeCDMax(){return 34-4*S.strikeLvl}
// seconds a bomb dropped from height y takes to reach the ground (vy0 40, gravity 900)
function bombFall(y){const dy=GY-4-(y+12);return(-40+Math.sqrt(1600+1800*dy))/900}
function callStrike(){
  if(!(S.strikeLvl>0&&S.strikeCD<=0&&S.mode==='play'))return;
  const targets=S.enemies.filter(e=>!e.dead).sort((a,b)=>a.x-b.x);
  if(!targets.length){floater(640,300,'No targets yet!','#fff',1);return}
  S.strikeCD=strikeCDMax();
  const n=4+2*S.strikeLvl,xs=[];
  for(let i=0;i<n;i++){const t=targets[i%targets.length];xs.push(clamp(t.x-(t.state==='walk'?t.spd*((t.x+160)/720+bombFall(84)*.5):0)+rand(-30,30),WALL.x1+50,W-30))}
  xs.sort((a,b)=>a-b);
  S.plane={x:-160,y:84,xs,dropped:0,dmg:110*(1+.35*(S.strikeLvl-1))*(1+.06*(S.wave-1))};SND.play('plane');
  S.banner={text:'AIRSTRIKE!',sub:'',t:0,col:'#ff9a3c'};
}
function updatePlane(dt){
  const p=S.plane;if(!p)return;p.x+=720*dt;
  while(p.dropped<p.xs.length&&p.x>=p.xs[p.dropped]-360*bombFall(p.y)){S.bombs.push({x:p.x,y:p.y+12,vx:360,vy:40,dmg:p.dmg,rot:0});p.dropped++}
  if(p.x>W+200)S.plane=null;
}
function updateBombs(dt){
  for(const b of S.bombs){b.vy+=900*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.rot=Math.atan2(b.vy,b.vx);if(b.y>=GY-4){b.dead=true;explode(b.x,GY-6,115,b.dmg)}}
  S.bombs=S.bombs.filter(b=>!b.dead);
}
function updateEproj(dt){
  for(const p of S.eproj){
    p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot=Math.atan2(p.vy,p.vx);
    if(p.x<=WALL.x1&&p.y>=WALL.top-28){p.dead=true;
      explodeFx(p.x,p.y,p.kind==='bomb'||p.kind==='fireball'?55:p.kind==='bolt'?18:34);
      hitWall(S.demo?0:p.dmg,p.x,p.y);if(!S.demo)hurtGunner(nearGunner(p.x,p.y,90),p.dmg*.9);
    }else if(p.y>=GY){p.dead=true;explodeFx(p.x,GY-4,34)}
    else if(p.x<-50)p.dead=true;
  }
  for(const p of S.eproj){if(p.dead||(p.kind!=='bomb'&&p.kind!=='fireball'))continue;for(const b of S.bullets){if(!b.dead&&!b.ex&&Math.hypot(b.x-p.x,b.y-p.y)<14){p.dead=true;b.dead=true;explodeFx(p.x,p.y,45);floater(p.x,p.y-20,'NICE!','#9ff',.8);break}}}
  S.eproj=S.eproj.filter(p=>!p.dead);
}
