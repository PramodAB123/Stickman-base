'use strict';
// Waves, spawning and the main update step
// which wave of this run we're on (1 = first): the first few start small and spaced out, then ramp up
const waveIdx=()=>S.career?careerWave():S.wave;
function buildWave(n){
  const pool=Object.keys(UNLOCK).filter(k=>UNLOCK[k]<=n);
  const wi=waveIdx(),ramp=wi===1?.5:wi===2?.7:wi===3?.85:1;
  let budget=(10+n*7.5+n*n*.45)*(n<5?1.4:n<10?1.3:1.1)*ramp;const q=[];
  const tw=pool.reduce((a,k)=>a+ET[k].w,0);
  while(budget>0){let r=Math.random()*tw,k=pool[0];for(const p of pool){r-=ET[p].w;if(r<=0){k=p;break}}q.push(k);budget-=ET[k].cost}
  for(let i=q.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[q[i],q[j]]=[q[j],q[i]]}
  const easy=x=>x==='rifle_grunt'||x==='blade_raider';
  const head=Math.min(4,q.length);for(let i=0;i<head;i++)if(!easy(q[i])){const j=q.findIndex((x,ii)=>ii>=head&&easy(x));if(j>0)[q[i],q[j]]=[q[j],q[i]]}
  if(S.career){if(careerBossWave())q.splice(Math.floor(q.length*.5),0,S.career.boss)}
  else if(n%5===0){q.splice(Math.floor(q.length*.55),0,bossFor(n));if(n>=30)q.push(bossFor(n+5))}
  return q;
}
function startWave(){
  S.wave++;S.queue=buildWave(S.wave);S.waveTotal=S.queue.length;S.waveActive=true;S.spawnT=1.2;S.breakT=0;
  S.mines=S.mines.filter(m=>!m.used);
  const C=S.career,boss=C?careerBossWave():S.wave%5===0,bn=C?C.boss:bossFor(S.wave);
  const last=C&&careerWave()===C.waves;
  S.banner={text:C?(last?'FINAL WAVE':'WAVE '+careerWave()+' / '+C.waves):'WAVE '+S.wave,sub:boss?'⚠ '+ET[bn].name.toUpperCase()+' APPROACHES ⚠':'',t:0,col:boss||last?'#ff6b5b':'#ffd35a'};
  SND.play('wave');
}
function callNow(){
  if(S.mode!=='play'||S.waveActive)return;
  const bonus=Math.round(S.breakT*3);if(bonus>0){S.coins+=bonus;floater(640,560,'+'+bonus+' early bonus','#ffd35a',1)}
  startWave();
}
function updateWave(dt){
  if(S.demo||S.mode!=='play')return;
  if(!S.waveActive){if(tutHold())return;S.breakT-=dt;if(S.breakT<=0)startWave();return}
  S.spawnT-=dt;
  if(S.spawnT<=0&&S.queue.length){
    const wi=waveIdx(),gch=wi<=2?0:wi===3?.12:Math.min(.45,.22+S.wave*.025);
    const grp=Math.random()<gch?2+(Math.random()<.3?1:0):1;
    for(let i=0;i<grp&&S.queue.length;i++){const e=spawnEnemy(S.queue.shift());e.x+=i*28;computeBody(e)}
    const gap=wi===1?2.3:wi===2?1.7:wi===3?1.2:0;
    S.spawnT=Math.max(.22,gap,.8-S.wave*.035)*(gap?rand(.85,1.2):rand(.6,1.4))*grp;
  }
  if(!S.queue.length&&!S.enemies.some(e=>!e.dead)){
    S.waveActive=false;
    if(S.career&&careerWave()>=S.career.waves){careerWin();return}
    const bonus=20+S.wave*15;S.coins+=bonus;S.breakT=12;
    S.banner={text:'WAVE CLEARED!',sub:'+'+bonus+' bonus coins · upgrade your gunners!',t:0,col:'#5be27f'};SND.play('clear');
    if(!S.career)store.set('best',Math.max(store.get('best',0),S.wave));
  }
}
function startDying(){
  if(S.mode!=='play')return;
  S.mode='dying';S.dyingT=2.2;SND.play('over');closePops();
  S.slots.forEach(g=>{if(!g.w)return;g.down=true;spawnRag({J:gunnerJ(g),s:1,d:{acc:WMAP[g.w].col},type:'guard'},{ix:-260,iy:-420})});
  const st=S;for(let i=0;i<5;i++)setTimeout(()=>{if(S===st)explodeFx(rand(WALL.x0+20,WALL.x1-10),rand(WALL.top,GY-40),60)},i*260);
  hudHide();
}

function update(dt){
  S.time+=dt;
  S.shake=Math.max(0,S.shake-dt*30);S.wallHit=Math.max(0,S.wallHit-dt);
  if(S.banner){S.banner.t+=dt;if(S.banner.t>2.4)S.banner=null}
  if(S.strikeCD>0&&S.mode==='play')S.strikeCD-=dt;
  // menus show a calm, still backdrop: the base and its gunners on watch, no enemies or gunfire
  for(const e of S.enemies)updateEnemy(e,dt);
  updateWave(dt);
  updateGunners(dt);
  updateBullets(dt);updateEproj(dt);updatePlane(dt);updateBombs(dt);updateRags(dt);
  S.enemies=S.enemies.filter(e=>!e.dead);
  for(const p of S.parts){p.life-=dt;p.vy+=(p.g||0)*dt;p.x+=(p.vx||0)*dt;p.y+=(p.vy||0)*dt;if(p.vr)p.rot+=p.vr*dt;
    const fl=p.floor!=null?p.floor:GY;if(p.g&&p.y>fl){p.y=fl;p.vy*=-.3;p.vx*=.6;if(p.vr)p.vr*=.5}
    if(p.type==='smoke'){p.vx*=1-dt*1.5;p.vy-=10*dt}}
  S.parts=S.parts.filter(p=>p.life>0);if(S.parts.length>700)S.parts.splice(0,S.parts.length-700);
  for(const f of S.floaters){f.t+=dt;f.y-=40*dt}S.floaters=S.floaters.filter(f=>f.t<1.1);
  for(const c of S.coinfx)c.t+=dt*1.6;S.coinfx=S.coinfx.filter(c=>{if(c.t>=1){popCoin();return false}return true});
  if(!S.demo&&S.wallHP/S.wallMax<.35&&Math.random()<dt*6)S.parts.push({type:'smoke',x:rand(WALL.x0+10,WALL.x1),y:WALL.top+rand(0,40),vx:rand(-10,10),vy:-30,life:1.4,max:1.4,size:rand(10,18),g:0,col:'#2a2030'});
  if(S.mode==='dying'){S.dyingT-=dt;if(S.dyingT<=0)showOver()}
}
