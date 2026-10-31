'use strict';
// HUD, menus, shop popups and input
// ---------- HUD / UI ----------
const hudCache={};
function setTxt(id,v){if(hudCache[id]!==v){hudCache[id]=v;$(id).textContent=v}}
function hudUpdate(){
  if(S.demo)return;
  const r=S.wallHP/S.wallMax;
  setTxt('hpTxt',Math.ceil(S.wallHP)+' / '+S.wallMax);
  const f=$('hpFill');f.style.width=(r*100).toFixed(1)+'%';f.className=r>.5?'':r>.25?'warn':'bad';
  const wn=S.career?careerWave()+'/'+S.career.waves:S.wave;setTxt('waveTxt',S.waveActive?'WAVE '+wn:(S.career?careerWave():S.wave)?'WAVE '+wn+' CLEARED':'GET READY');
  const rem=S.queue.length+S.enemies.filter(e=>!e.dead).length;$('waveFill').style.width=(S.waveActive?(1-rem/Math.max(1,S.waveTotal))*100:100).toFixed(1)+'%';
  setTxt('coinTxt',String(S.coins));
  const brk=S.mode==='play'&&!S.waveActive;
  $('breakBar').classList.toggle('hidden',!brk);
  if(brk){setTxt('breakT',String(Math.max(0,Math.ceil(S.breakT))));const b=Math.round(S.breakT*3);setTxt('callBonus',b>0?'+'+b:'')}
  const sb=$('strikeBtn');
  if(S.strikeLvl>0){sb.classList.remove('hidden');const p=S.strikeCD>0?1-S.strikeCD/strikeCDMax():1;sb.style.setProperty('--p',p.toFixed(3));sb.classList.toggle('ready',p>=1)}else sb.classList.add('hidden');
  $('speedBtn').classList.toggle('on',S.speed>1);
  document.querySelectorAll('.pop [data-cost]').forEach(b=>{b.disabled=b.dataset.lock==='1'||S.coins<+b.dataset.cost});
  refreshGunPop();tutTick();
}
function popCoin(){const b=$('coinBox');b.classList.remove('bump');void b.offsetWidth;b.classList.add('bump')}
function hudHide(){$('hud').classList.add('hidden');closePops()}
const screens=['hub','pause','over','win'];
function showScreen(id){screens.forEach(s=>$(s).classList.toggle('hidden',s!==id))}

let gpLast='';
function refreshGunPop(force){
  if(S.popSlot==null||!$('gpHp'))return;const s=S.slots[S.popSlot];if(!s.w)return;
  const rc=repairCost(s),bc=boostCost(),full=s.hp>=s.maxHp,key=[Math.ceil(s.hp),rc,bc,Math.ceil(s.boost),s.ko,S.coins].join();
  if(!force&&key===gpLast)return;gpLast=key;
  $('gpHp').style.width=(s.hp/s.maxHp*100).toFixed(1)+'%';$('gpHp').className=s.ko?'ko':s.hp/s.maxHp<.5?'low':'';
  $('gpHpT').textContent=s.ko?'KNOCKED OUT':full?'FULL':Math.ceil(s.hp)+' / '+s.maxHp;
  const f=$('gpFix');f.dataset.cost=full?0:rc;f.dataset.lock=full?'1':'';$('gpFixC').innerHTML=full?'OK':'<span class="coin"></span>'+rc;
  const b=$('gpBoost');b.dataset.cost=bc;b.dataset.lock=s.boost>0||s.ko?'1':'';$('gpBoostC').innerHTML=s.boost>0?Math.ceil(s.boost)+'s':'<span class="coin"></span>'+bc;b.classList.toggle('on',s.boost>0);
  f.disabled=f.dataset.lock==='1'||S.coins<rc;b.disabled=b.dataset.lock==='1'||S.coins<bc;
}
function closePops(){if(S)S.popSlot=null;$('slotPop').classList.add('hidden');$('basePop').classList.add('hidden')}
function placeSlotPop(){
  const s=S.slots[S.popSlot],p=$('slotPop');
  p.style.left=((s.x+(p.classList.contains('gpop')?70:44))/W*100)+'%';
  const ph=p.offsetHeight/stage.offsetHeight*100||40;
  p.style.top=clamp((s.y-s.crate-(p.classList.contains('gpop')?150:190))/H*100,1,Math.max(1,99-ph))+'%';
}
function openSlot(i){
  $('basePop').classList.add('hidden');
  S.popSlot=i;renderSlotPop();$('slotPop').classList.remove('hidden');placeSlotPop();$('slotPop').classList.remove('hidden');SND.play('click');
}
function weaponGrid(cur,discount){
  return '<div class="wgrid">'+WEAPONS.map(w=>{const cost=Math.max(0,w.price-discount);
    return `<button class="wopt${w.id===cur?' cur':''}" data-w="${w.id}" ${w.id===cur?'data-lock="1" data-cost="0"':'data-cost="'+cost+'"'}><img alt="" src="${gunIcon(w.id)}"><span>${w.name}</span><span class="s">${w.desc}</span><span class="c">${w.id===cur?'EQUIPPED':'<span class="coin"></span> '+cost}</span></button>`}).join('')+'</div>';
}
function renderSlotPop(mode){
  const s=S.slots[S.popSlot],p=$('slotPop');
  const head=(title,sub)=>`<div class="ph"><h4>${title}<span class="sub2">${sub}</span></h4><button class="x" data-act="close" aria-label="Close">✕</button></div>`;
  p.classList.remove('gpop');
  if(!s.w){
    p.innerHTML=head('Deploy a gunner',s.name+' · aims and fires on its own')+weaponGrid(null,0);
  }else if(mode==='swap'){
    const refund=Math.round(s.invested*.6);
    p.innerHTML=head('Change gun','Old gun trades in for '+refund+' coins')+weaponGrid(s.w,refund)+'<button class="act alt" data-act="back">← Back</button>';
  }else{
    const w=WMAP[s.w],lv=s.lvl,max=lv>=MAXLV,c=max?0:upCost(w,lv);
    const canSell=!(S.slots.filter(x=>x.w).length===1);
    const bar=(lbl,cur,nxt,top,fmt)=>{const a=cur/top*100,b=max?0:(nxt-cur)/top*100;
      return `<div class="gs"><div class="gl"><b>${lbl}</b> ${fmt(cur)}${max?'':` <em>+${fmt(nxt-cur)}</em>`}</div><div class="gb"><i style="width:${a.toFixed(1)}%"></i><u style="left:${a.toFixed(1)}%;width:${b.toFixed(1)}%"></u></div></div>`};
    const r0=x=>String(Math.round(x)),r1=x=>x<3?x.toFixed(2):x.toFixed(1);
    p.innerHTML=`<button class="x gx" data-act="close" aria-label="Close">✕</button>
      <div class="ghead"><img alt="" src="${gunIcon(w.id)}"><div><b>${w.name}</b><span>${s.name}</span></div><span class="lvb">LV ${lv+1}</span></div>
      ${max?'<button class="upbig" disabled data-lock="1">★ MAX LEVEL</button>':`<button class="upbig" data-act="up" data-cost="${c}"><span class="ua">⬆ UPGRADE</span><span class="uc"><span class="coin"></span> ${c}</span></button>`}
      <div class="gstats">${bar('DAMAGE',wDmg(w,lv),wDmg(w,lv+1),wDmg(w,MAXLV),r0)}${bar('FIRE RATE',wRate(w,lv),wRate(w,lv+1),wRate(w,MAXLV),r1)}${bar('HEALTH',s.maxHp,gHP(lv+1),gHP(MAXLV),r0)}</div>
      <div class="gfix">
        <div class="rp"><div class="rpl"><small>REPAIR</small><b id="gpHpT"></b></div><div class="rpb"><i id="gpHp"></i></div></div>
        <button class="tool" id="gpFix" data-act="fix" aria-label="Repair"><span class="ti">🔧</span><span id="gpFixC"></span></button>
        <button class="tool boost" id="gpBoost" data-act="boost" aria-label="Boost"><span class="ti">⚡<small>BOOST</small></span><span id="gpBoostC"></span></button>
      </div>
      <div class="gmore"><button data-act="swap">🔁 Change gun</button>${canSell?`<button data-act="sell">💰 Sell +${Math.round(s.invested*.6)}</button>`:''}</div>`;
    p.classList.add('gpop');refreshGunPop(true);
  }
  if(!p.classList.contains('hidden'))placeSlotPop();
  hudUpdate();
}
$('slotPop').addEventListener('click',ev=>{
  const b=ev.target.closest('button');if(!b||b.disabled||S.popSlot==null)return;
  const s=S.slots[S.popSlot],act=b.dataset.act;
  if(act==='close'){closePops();SND.play('click');return}
  if(act==='back'){renderSlotPop();return}
  if(act==='swap'){renderSlotPop('swap');SND.play('click');return}
  if(act==='fix'){const c=repairCost(s);if(s.hp>=s.maxHp||S.coins<c){SND.play('nope');return}S.coins-=c;s.hp=s.maxHp;s.ko=false;SND.play('buy');floater(s.x,s.y-s.crate-100,'REPAIRED!','#5be27f',.9);sparks(s.x,s.y-s.crate-40,10,'#bfffd0');refreshGunPop(true);return}
  if(act==='boost'){const c=boostCost();if(s.boost>0||s.ko||S.coins<c){SND.play('nope');return}S.coins-=c;s.boost=10;SND.play('zap');floater(s.x,s.y-s.crate-100,'BOOST! x2 FIRE RATE','#ffe066',.9);refreshGunPop(true);return}
  if(act==='up'){const c=upCost(WMAP[s.w],s.lvl);if(S.coins<c){SND.play('nope');return}S.coins-=c;s.invested+=c;s.lvl++;{const m=gHP(s.lvl);s.hp+=m-s.maxHp;s.maxHp=m}SND.play('buy');floater(s.x,s.y-s.crate-100,'LEVEL UP!','#5be27f',.9);sparks(s.x,s.y-s.crate-40,12,'#9effb5');renderSlotPop();return}
  if(act==='sell'){const r=Math.round(s.invested*.6);S.coins+=r;s.w=null;s.lvl=0;s.invested=0;s.tgt=null;SND.play('sell');floater(s.x,s.y-s.crate-90,'+'+r,'#ffd35a',.9);renderSlotPop();return}
  const wid=b.dataset.w;if(!wid)return;
  const w=WMAP[wid],refund=s.w?Math.round(s.invested*.6):0,cost=Math.max(0,w.price-refund);
  if(S.coins<cost){SND.play('nope');return}
  S.coins-=cost;s.w=wid;s.lvl=0;s.invested=w.price;s.cd=.3;s.tgt=null;s.aim=-.1;s.maxHp=s.hp=gHP(0);s.ko=false;s.boost=0;
  S.maxGunners=Math.max(S.maxGunners||1,S.slots.filter(x=>x.w).length);
  SND.play('deploy');floater(s.x,s.y-s.crate-100,w.name.toUpperCase()+'!','#ffd35a',.9);
  for(let i=0;i<10;i++)S.parts.push({type:'smoke',x:s.x+rand(-14,14),y:s.y-s.crate-rand(0,60),vx:rand(-30,30),vy:rand(-40,-10),life:.6,max:.6,size:rand(6,12),g:0,col:'#e8d8ff'});
  closePops();
});

function baseItems(){
  const out=[],rc=Math.round((30+S.wave*6)/5)*5,missing=S.wallMax-S.wallHP;
  out.push({ic:'🔧',n:'Repair wall',d:'Restore 35% of max HP',cost:missing>.5?rc:null,done:'FULL',act:()=>{S.wallHP=Math.min(S.wallMax,S.wallHP+S.wallMax*.35)}});
  out.push({ic:'🧱',n:'Reinforce wall'+(S.wallLvl?' · Lv '+S.wallLvl:''),d:'+150 max HP (heals 150)',cost:S.wallLvl<6?180*(S.wallLvl+1):null,act:()=>{S.wallLvl++;S.wallMax+=150;S.wallHP+=150}});
  out.push({ic:'🪵',n:'Spike trap'+(S.spikes?' · Lv '+S.spikes:''),d:'Slows and hurts attackers at the wall',cost:S.spikes<3?[220,420,700][S.spikes]:null,act:()=>{S.spikes++}});
  const live=S.mines.filter(m=>!m.used).length;
  out.push({ic:'💣',n:'Land mines ×3',d:live+' / 9 placed · blow up walkers',cost:live<=6?150:null,done:'FULL',act:()=>{for(let i=0;i<3;i++)S.mines.push({x:rand(440,1080),used:false})}});
  out.push({ic:'✈',n:'Airstrike'+(S.strikeLvl?' · Lv '+S.strikeLvl:''),d:S.strikeLvl?'More bombs, faster recharge':'Unlocks the STRIKE button',cost:S.strikeLvl<3?(S.strikeLvl?350*S.strikeLvl+150:450):null,act:()=>{S.strikeLvl++;S.strikeCD=0}});
  return out;
}
let baseActs=[];
function renderBase(){
  const items=baseItems();baseActs=items.map(i=>i.act);
  $('basePop').innerHTML=`<div class="ph"><h4>🏰 Base upgrades<span class="sub2">Strengthen your fortress</span></h4><button class="x" data-act="close" aria-label="Close">✕</button></div>`+
    items.map((it,i)=>`<div class="brow"><div class="ic">${it.ic}</div><div class="t"><b>${it.n}</b><span>${it.d}</span></div>${it.cost==null?`<button class="act" disabled>${it.done||'MAX'}</button>`:`<button class="act" data-i="${i}" data-cost="${it.cost}"><span class="coin"></span> ${it.cost}</button>`}</div>`).join('');
  hudUpdate();
}
$('basePop').addEventListener('click',ev=>{
  const b=ev.target.closest('button');if(!b||b.disabled)return;
  if(b.dataset.act==='close'){closePops();return}
  const i=+b.dataset.i,c=+b.dataset.cost;if(isNaN(i))return;
  if(S.coins<c){SND.play('nope');return}
  S.coins-=c;baseActs[i]();SND.play('buy');renderBase();
});
$('baseBtn').addEventListener('click',()=>{SND.unlock();const p=$('basePop');if(!p.classList.contains('hidden')){closePops();return}closePops();renderBase();p.classList.remove('hidden');SND.play('click')});

function showOver(){
  S.mode='over';hudHide();const L=S.career;
  const survived=Math.max(0,(L?careerWave():S.wave)-1);
  if(!L){const best=Math.max(store.get('best',0),survived);store.set('best',best);$('oBest').textContent='Best: '+best+' wave'+(best===1?'':'s')}
  else $('oBest').textContent='Level '+L.k+' · '+survived+' of '+L.waves+' waves cleared';
  $('oWaves').textContent=survived;$('oKills').textContent=S.kills;$('oHeads').textContent=S.heads;
  $('againBtn').textContent=L?'⟲ RETRY':'⟲ PLAY AGAIN';$('menuBtn').textContent=L?'MAP':'MENU';
  showScreen('over');
}
let lastLevel=null;
function newGame(L){
  lastLevel=L||null;applyMap(L?L.map:store.get('map','industrial'));
  S=freshState(false,L);hudCacheReset();showScreen(null);closePops();$('hud').classList.remove('hidden');
  S.banner=L?{text:'LEVEL '+L.k,sub:'Survive '+L.waves+' waves'+(L.boss?' · boss on the last wave!':''),t:-.3,col:'#ffd35a'}
    :{text:'DEPLOY YOUR GUNNERS!',sub:'Tap a glowing post · wave 1 starts soon',t:-.3,col:'#ffd35a'};
  if(L&&L.k===1)tutStart();else tutEnd();
}
function toMenu(){tutEnd();if(lastLevel)applyMap(lastLevel.map);S=freshState(true);hudCacheReset();showScreen('hub');hudHide();showTab(lastLevel?'career':hubTab);updateBest()}
function hudCacheReset(){for(const k in hudCache)delete hudCache[k]}
function updateBest(){const b=store.get('best',0);$('bestTxt').textContent=b?'🏆 Best: '+b+' wave'+(b===1?'':'s')+' survived':'No record yet'}
function pause(){if(S.mode!=='play')return;S.mode='paused';showScreen('pause')}
function resume(){if(S.mode!=='paused')return;S.mode='play';showScreen(null);last=performance.now()}
function sndLabel(){$('sndBtn1').textContent=SND.on?'🔊':'🔇';$('sndBtn2').textContent='🔊 Sound: '+(SND.on?'On':'Off')}
function toggleSnd(){SND.on=!SND.on;store.set('snd',SND.on);SND.unlock();sndLabel()}
function renderMapPick(){$('mapPick').innerHTML=MAPIDS.map(id=>`<button class="mapc${MAP.id===id?' on':''}" data-map="${id}"><img alt="" src="${MAPS[id].src}"><span>${MAPS[id].icon} ${MAPS[id].name}</span></button>`).join('')}
$('mapPick').addEventListener('click',ev=>{const b=ev.target.closest('[data-map]');if(!b)return;SND.unlock();SND.play('click');store.set('map',b.dataset.map);applyMap(b.dataset.map);S=freshState(true);renderMapPick()});
renderMapPick();
$('againBtn').onclick=()=>{SND.unlock();newGame(lastLevel)};
$('retryBtn').onclick=()=>{SND.unlock();newGame(lastLevel)};
$('nextBtn').onclick=()=>{SND.unlock();CAR.sel=Math.min(15,lastLevel.k);saveCar();newGame(LEVELS[CAR.sel])};
$('mapBtn').onclick=toMenu;
$('menuBtn').onclick=toMenu;$('quitBtn').onclick=toMenu;
$('resumeBtn').onclick=resume;$('pauseBtn').onclick=()=>{S.mode==='paused'?resume():pause()};
$('speedBtn').onclick=()=>{S.speed=S.speed>1?1:2;SND.play('click')};
$('callBtn').onclick=()=>{SND.unlock();callNow()};
$('sndBtn1').onclick=toggleSnd;$('sndBtn2').onclick=toggleSnd;
$('strikeBtn').addEventListener('click',()=>{SND.unlock();callStrike()});

function toLogical(e){const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*W,y:(e.clientY-r.top)/r.height*H}}
function slotAt(x,y){
  let best=-1,bd=1e9;
  S.slots.forEach((s,i)=>{const fy=s.y-s.crate;if(x>s.x-34&&x<s.x+34&&y>fy-(s.w?90:130)&&y<fy+18){const d=Math.abs(x-s.x)+Math.abs(y-(fy-40))*.5;if(d<bd){bd=d;best=i}}});
  return best;
}
cv.addEventListener('pointerdown',e=>{
  SND.unlock();if(S.mode!=='play')return;e.preventDefault();
  const p=toLogical(e),i=slotAt(p.x,p.y);
  if(i>=0&&!S.slots[i].down){if(S.popSlot===i){closePops();return}openSlot(i)}else closePops();
});
cv.addEventListener('contextmenu',e=>e.preventDefault());
window.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&(S.popSlot!=null||!$('basePop').classList.contains('hidden'))){closePops();return}
  if(e.key==='Escape'||e.key==='p'||e.key==='P'){S.mode==='paused'?resume():pause();return}
  if(S.mode!=='play')return;
  if(e.code==='Space'){e.preventDefault();callNow()}
  else if(e.key==='f'||e.key==='F')callStrike();
  else if(e.key>='1'&&e.key<='4')openSlot(+e.key-1);
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pause()});
