'use strict';
// Stickman gunners: aiming, firing, drawing
function drawGun(g,id){const s=GSP[id],im=GUNIMG[id];if(im.complete&&im.naturalWidth)g.drawImage(im,s.x0,s.y0,s.w,s.h)}
function gunIcon(id){return 'assets/guns/'+id+'.webp'}
function solvePose(x,fy,s,dir,P){
  const T=28*s,TH=17*s,SH=17*s,UA=14*s,FA=14*s,HR=8*s;
  const e1=TH*Math.cos(P.l1[0])+SH*Math.cos(P.l1[1]),e2=TH*Math.cos(P.l2[0])+SH*Math.cos(P.l2[1]);
  const hip={x,y:fy-Math.max(e1,e2)};
  const sl=Math.sin(P.lean),cl=Math.cos(P.lean);
  const neck={x:x+sl*T*dir,y:hip.y-cl*T};
  const head={x:neck.x+sl*(HR+3)*dir,y:neck.y-cl*(HR+3)};
  const L=(o,a,l)=>({x:o.x+Math.sin(a)*l*dir,y:o.y+Math.cos(a)*l});
  const k1=L(hip,P.l1[0],TH),f1=L(k1,P.l1[1],SH),k2=L(hip,P.l2[0],TH),f2=L(k2,P.l2[1],SH);
  const sh={x:neck.x-sl*3*s*dir,y:neck.y+cl*3*s};
  const el1=L(sh,P.a1[0],UA),h1=L(el1,P.a1[1],FA),el2=L(sh,P.a2[0],UA),h2=L(el2,P.a2[1],FA);
  return{hip,neck,head,k1,f1,k2,f2,sh,e1:el1,h1,e2:el2,h2,hr:HR,s,dir};
}
function walkPose(p,amp,lean){
  const a=Math.sin(p)*amp,b=Math.sin(p+Math.PI)*amp;
  const bend=q=>.1+Math.max(0,Math.cos(q))*.95;
  return{lean,l1:[a,a-bend(p)],l2:[b,b-bend(p+Math.PI)],a1:[-Math.sin(p)*.6,-Math.sin(p)*.6+.5],a2:[Math.sin(p)*.6,Math.sin(p)*.6+.5]};
}
function ik(sx,sy,tx,ty,a,b,bend){
  const dx=tx-sx,dy=ty-sy;let d=Math.hypot(dx,dy);d=clamp(d,Math.abs(a-b)+.01,a+b-.01);
  const ang=Math.atan2(dy,dx),off=Math.acos(clamp((a*a+d*d-b*b)/(2*a*d),-1,1));
  const ea=ang+off*bend,ex=sx+Math.cos(ea)*a,ey=sy+Math.sin(ea)*a;
  const hx=tx-ex,hy=ty-ey,hl=Math.hypot(hx,hy)||1;
  return{e:{x:ex,y:ey},h:{x:ex+hx/hl*b,y:ey+hy/hl*b}};
}

// ---------- gunners ----------
function pickTarget(g,w,J){
  let best=null,bs=-1e9;
  for(const e of S.enemies){
    if(e.dead||e.cloak||e.x>W-12)continue;
    const d=Math.hypot(e.core.x-J.pivot.x,e.core.y-J.pivot.y);if(d>w.range)continue;
    let sc=-e.x;
    if(w.id==='railgun')sc=e.hp+(e.d.boss?4000:0)-e.x*.08;
    if(w.radius){let n=0;for(const o of S.enemies)if(!o.dead&&Math.abs(o.x-e.x)<90)n++;sc=n*200-e.x}
    if(e.d.beh==='suicide'||e.d.beh==='ram')sc+=350;
    if(e.d.beh==='heal'||e.d.beh==='mind')sc+=300;
    if(e.d.fly&&e.state==='hover')sc+=250;
    if(e.d.boss&&e.x<W-80)sc+=320;
    if(sc>bs){bs=sc;best=e}
  }
  return best;
}
function updateGunners(dt){
  for(const g of S.slots){
    if(!g.w||g.down)continue;
    if(g.ko){g.hp=Math.min(g.maxHp,g.hp+g.maxHp*.035*dt);if(Math.random()<dt*6)S.parts.push({type:'smoke',x:g.x+rand(-10,10),y:g.y-g.crate-rand(20,50),vx:rand(-10,10),vy:-30,life:.8,max:.8,size:rand(6,10),g:0});
      if(g.hp>=g.maxHp*.5){g.ko=false;floater(g.x,g.y-g.crate-90,'BACK IN ACTION','#5be27f',.8)}continue}
    if(g.boost>0)g.boost-=dt;
    if(g.stun>0){g.stun-=dt;continue}
    const w=WMAP[g.w];
    g.rec=Math.max(0,g.rec-dt*60);g.cd-=dt;g.rt-=dt;g.spin+=dt*(g.tgt&&g.w==='minigun'?40:3);
    const J=gunnerJ(g);
    if(!g.tgt||g.tgt.dead||g.rt<=0){const nt=pickTarget(g,w,J);if(nt!==g.tgt)g.head=Math.random()<w.headCh;g.tgt=nt;g.rt=.35}
    const t=g.tgt;
    if(t&&!t.dead&&(S.mode==='play'||S.demo)){
      const px=g.head?t.crit.x:t.core.x,py=g.head?t.crit.y:t.core.y;
      const dist=Math.hypot(px-J.pivot.x,py-J.pivot.y),moving=t.state==='walk'?t.spd:0;
      const lx=px-moving*dist/w.speed;
      const ft=dist/w.speed,drop=w.grav?.5*w.grav*ft*ft:0;
      const want=clamp(Math.atan2(py-drop-J.pivot.y,lx-J.pivot.x),-1.3,1.5);
      const step=w.turn*dt;g.aim+=clamp(want-g.aim,-step,step);
      if(Math.abs(want-g.aim)<(w.hit==='chain'?.14:w.id==='flame'?.12:.05)&&g.cd<=0){fireGun(g,gunnerJ(g),w);g.cd+=1/(wRate(w,g.lvl)*(g.boost>0?2:1));if(g.cd<0)g.cd=0}
    }else{g.aim+=(-.08-g.aim)*Math.min(1,dt*2);if(g.cd<0)g.cd=0}
  }
}
function fireGun(g,J,w){
  const dmg=wDmg(w,g.lvl),tx=J.tip.x,ty=J.tip.y,ca=Math.cos(g.aim),sa=Math.sin(g.aim);
  if(w.hit==='beam'){
    const ex=tx+ca*w.range,ey=ty+sa*w.range;
    for(const e of S.enemies){if(e.dead)continue;const h=hitTest(e,tx,ty,ex,ey);if(h)applyHit(e,h,dmg,ca,sa,e.core.x+rand(-6,6),e.core.y+rand(-6,6),w)}
    S.parts.push({type:'beam',x:tx,y:ty,x2:ex,y2:ey,life:.09,max:.09,g:0,col:'192,112,255'});
  }else if(w.hit==='chain'){
    let cur=g.tgt,f=1;const pts=[{x:tx,y:ty}],done=[];
    for(let k=0;k<w.chain&&cur;k++){
      done.push(cur.id);pts.push({x:cur.core.x,y:cur.core.y});
      applyHit(cur,cur.shield>0?'shield':'body',dmg*f,1,0,cur.core.x,cur.core.y,w);
      f*=.78;let nb=null,nd=240;
      for(const e of S.enemies){if(e.dead||e.cloak||done.includes(e.id))continue;const d=Math.hypot(e.core.x-pts[pts.length-1].x,e.core.y-pts[pts.length-1].y);if(d<nd){nd=d;nb=e}}
      cur=nb}
    S.parts.push({type:'bolt',pts,x:tx,y:ty,life:.16,max:.16,g:0,col:'110,235,255'});
  }else{
    for(let i=0;i<(w.pellets||1);i++){
      const a=g.aim+rand(-(w.spread||0),w.spread||0),sp=w.speed*(w.id==='flame'?rand(.85,1.15):1),life=w.life||1.4;
      S.bullets.push({x:tx,y:ty,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,dmg,pierce:w.pierce||1,hit:[],life,max:life,w:w.id,ex:!!w.radius,radius:w.radius||0,grav:w.grav||0,spin:0});
    }
  }
  g.rec=w.recoil;g.alt=!g.alt;S.shake=Math.max(S.shake,w.shake);
  if(w.id!=='flame'&&w.id!=='laser')S.parts.push({type:'flash',x:tx,y:ty,a:g.aim,life:.06,max:.06,size:w.radius||w.id==='railgun'?1.5:1,g:0,col:w.col});
  if(w.id==='blaster'||w.id==='minigun'||w.id==='railgun')S.parts.push({type:'shell',x:J.gun.x-4,y:J.gun.y-6,vx:rand(-120,-40),vy:rand(-260,-160),life:1.1,max:1.1,size:2.5,g:1100,floor:g.y-g.crate-2,rot:0,vr:rand(-20,20)});
  if(w.id==='rocket'||w.id==='plasma')for(let i=0;i<6;i++)S.parts.push({type:'smoke',x:J.gun.x-24,y:J.gun.y,vx:rand(-120,-40),vy:rand(-40,20),life:.7,max:.7,size:rand(8,14),g:0});
  SND.play(w.snd||w.id);
}
function applyStatus(e,w,dmg){
  const m=dmg/w.dmg;
  if(w.burn){e.burnT=2;e.burnD=w.burn*m}
  if(w.acid){e.acidT=3;e.acidD=Math.max(e.acidT>0&&e.acidD||0,w.acid*m)}
  if(w.slow){e.slowF=e.slowT>0?Math.max(e.slowF,w.slow):w.slow;e.slowT=w.id==='gravity'?1.6:1.4}
}
function applyHit(e,h,dmg,ix,iy,x,y,w){
  if(h==='shield'){
    e.shield-=dmg*(w.acid?2:1);sparks(x,y,6,'#e8f4ff');SND.play('hit');
    if(e.shield<=0){e.shield=0;const sb=e.B[0];S.parts.push({type:'plank',x:sb[0],y:(sb[1]+sb[3])/2,vx:rand(60,160),vy:rand(-300,-200),life:1.5,max:1.5,size:e.s,g:1000,rot:0,vr:rand(-8,8),col:e.d.acc,floor:GY-4});floater(e.core.x,e.topY-10,'SHIELD BROKEN','#cfe6ff',.9)}
    return true;
  }
  const head=h==='head';
  applyStatus(e,w,dmg);
  damageEnemy(e,dmg*(head?2.5:1),{head,ix:ix*(head?420:300),iy:iy*300-140,hx:x,hy:y});
  if(head)blood(x,y,ix,iy,6);else sparks(x,y,4,w.bc?'rgb('+w.bc+')':w.col);
  SND.play(head?'head':'hit');
  return false;
}

function gunnerJ(g){
  const fy=g.y-g.crate,id=g.w||'blaster',ca=Math.cos(g.aim),sa=Math.sin(g.aim),br=Math.sin(S.time*2.2+g.x)*.6;
  const pvx=g.x+8,pvy=fy-44,px=pvx-ca*g.rec*.7,py=pvy-sa*g.rec*.7;
  const P={lean:.18,l1:[.35,.15],l2:[-.25,-.3],a1:[0,0],a2:[0,0]};
  const J=solvePose(g.x-14,fy,1,1,P);J.hip.y+=br;J.neck.y+=br;J.head.y+=br;J.sh.y+=br;
  const R=(lx,ly)=>({x:px+ca*lx-sa*ly,y:py+sa*lx+ca*ly});
  const sp=GSP[id],h2=R(sp.grip[0],sp.grip[1]),h1=R(sp.grip[0]+9,sp.grip[1]-6);
  const b=ik(J.sh.x,J.sh.y,h1.x,h1.y,15,15,1),f=ik(J.sh.x,J.sh.y,h2.x,h2.y,15,15,1);
  J.e1=b.e;J.h1=b.h;J.e2=f.e;J.h2=f.h;J.gun={x:px,y:py};J.pivot={x:pvx,y:pvy};
  J.tip=R(sp.tip,0);J.sh2=J.sh;
  return J;
}
function drawGunner(g,s){
  if(s.down||!s.w)return;
  const fy=s.y-s.crate,t=S.time;
  if(S.popSlot===s.i){const r=62,cy=fy-44;g.save();g.globalCompositeOperation='lighter';g.strokeStyle='rgba(90,220,255,.55)';g.lineWidth=6;g.beginPath();g.arc(s.x,cy,r,0,7);g.stroke();
    g.strokeStyle='rgba(200,250,255,.9)';g.lineWidth=2;g.beginPath();g.arc(s.x,cy,r,t*2,t*2+4.2);g.stroke();g.restore()}
  if(s.boost>0){const gr=g.createRadialGradient(s.x,fy-45,4,s.x,fy-45,60);gr.addColorStop(0,'rgba(255,230,90,.45)');gr.addColorStop(1,'rgba(255,200,40,0)');g.fillStyle=gr;g.beginPath();g.arc(s.x,fy-45,60,0,7);g.fill()}
  g.save();if(s.ko)g.globalAlpha=.42;
  drawGunnerBody(g,s);g.restore();
  if(s.boost>0&&Math.random()<.3)S.parts.push({type:'spark',x:s.x+rand(-20,20),y:fy-rand(20,80),vx:rand(-30,30),vy:rand(-120,-40),life:.25,max:.25,g:0,col:'#ffe066'});
  if(s.ko){g.font='900 15px system-ui,Arial';g.textAlign='center';g.fillStyle='#ff6b5b';g.fillText('✖ KO',s.x,fy-96)}
  if(s.hp<s.maxHp){const w=40,x=s.x-w/2,y=fy+22,r=s.hp/s.maxHp;g.fillStyle='rgba(10,5,15,.8)';g.fillRect(x-1.5,y-1.5,w+3,6);g.fillStyle=s.ko?'#ff4a3a':r>.5?'#5be27f':r>.25?'#ffc83a':'#ff4a3a';g.fillRect(x,y,w*r,3);
    if(s.hurt>0){s.hurt-=1/60;g.fillStyle='rgba(255,255,255,.6)';g.fillRect(x,y,w*r,3)}}
}
function drawGunnerBody(g,s){
  const J=gunnerJ(s),w=WMAP[s.w],fy=s.y-s.crate,pv=J.pivot;
  const sw=Math.sin(S.time*7+s.x),sw2=Math.sin(S.time*7+1.3+s.x);
  g.strokeStyle=w.col;g.lineWidth=4;g.lineCap='round';g.beginPath();g.moveTo(J.neck.x,J.neck.y+2);g.quadraticCurveTo(J.neck.x-12,J.neck.y+2+sw*3,J.neck.x-22,J.neck.y+6+sw2*5);g.stroke();
  drawFigure(g,{...J,h2:J.h1,e2:J.e1},INK,5);
  g.fillStyle='#2c2a3a';g.fillRect(pv.x-5,pv.y,10,fy-pv.y);rr(g,pv.x-17,fy-7,34,7,3);g.fillStyle='#4a4460';g.fill();g.fillStyle=w.col;g.fillRect(pv.x-5,pv.y+12,10,3);
  g.save();g.translate(J.gun.x,J.gun.y);g.rotate(s.aim);if(s.w==='minigun'&&s.tgt)g.translate(rand(-.6,.6),rand(-.6,.6));drawGun(g,s.w);g.restore();
  g.fillStyle='#77709a';g.beginPath();g.arc(pv.x,pv.y,4.5,0,7);g.fill();
  g.strokeStyle=INK;g.lineWidth=5;g.beginPath();g.moveTo(J.sh.x,J.sh.y);g.lineTo(J.e2.x,J.e2.y);g.lineTo(J.h2.x,J.h2.y);g.stroke();
  g.fillStyle=shade(w.col);g.beginPath();g.arc(J.head.x,J.head.y-1,J.hr+1.6,Math.PI*1.05,Math.PI*-.05);g.fill();g.fillRect(J.head.x-J.hr-2,J.head.y-2.5,J.hr*2+5,2.6);
  g.fillStyle=w.col;g.fillRect(J.head.x-J.hr-2,J.head.y-2.5,J.hr*2+5,1.2);
  g.fillStyle='#fff';g.beginPath();g.arc(J.head.x+J.hr*.45,J.head.y+.5,1.7,0,7);g.fill();
  if(s.stun>0){const t=S.time;g.strokeStyle='rgba(200,110,255,.9)';g.lineWidth=2;for(let i=0;i<3;i++){const a=t*6+i*2.1;g.beginPath();g.arc(J.head.x+Math.cos(a)*9,J.head.y-14+Math.sin(a)*3,2.5,0,7);g.stroke()}}
  if(s.w==='railgun'&&s.tgt&&!s.tgt.dead&&S.mode==='play'){g.strokeStyle='rgba(120,200,255,.3)';g.lineWidth=1;g.setLineDash([6,6]);g.beginPath();g.moveTo(J.tip.x,J.tip.y);g.lineTo(J.tip.x+Math.cos(s.aim)*900,J.tip.y+Math.sin(s.aim)*900);g.stroke();g.setLineDash([])}
}

function drawFigure(g,J,col,lw){
  g.strokeStyle=col;g.lineWidth=lw;g.lineCap='round';g.lineJoin='round';g.beginPath();
  g.moveTo(J.f1.x,J.f1.y);g.lineTo(J.k1.x,J.k1.y);g.lineTo(J.hip.x,J.hip.y);g.lineTo(J.k2.x,J.k2.y);g.lineTo(J.f2.x,J.f2.y);
  g.moveTo(J.hip.x,J.hip.y);g.lineTo(J.neck.x,J.neck.y);
  g.moveTo(J.h1.x,J.h1.y);g.lineTo(J.e1.x,J.e1.y);g.lineTo(J.sh.x,J.sh.y);g.lineTo(J.e2.x,J.e2.y);g.lineTo(J.h2.x,J.h2.y);g.stroke();
  g.fillStyle=col;g.beginPath();g.arc(J.head.x,J.head.y,J.hr,0,7);g.fill();
}
