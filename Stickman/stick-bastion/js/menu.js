'use strict';
// Start screen hub: Home, Upgrades, Guns, Career map and Survival tabs
const TABS=['career','upgrades','guns','survival'];
let hubTab=store.get('tab','career');if(!TABS.includes(hubTab))hubTab='career';
// island layout on the chapter map (fractions of the map area): centre, size, node path, landmark spot, label spot
const ISLES=[
  {c:[.25,.36],r:[.23,.13],nodes:[[.08,.40],[.18,.44],[.29,.42],[.40,.37]],lm:[.27,.27],lab:[.03,.04]},
  {c:[.74,.33],r:[.23,.13],nodes:[[.58,.35],[.68,.40],[.79,.42],[.91,.38]],lm:[.77,.23],lab:[.56,.04]},
  {c:[.74,.80],r:[.23,.12],nodes:[[.92,.83],[.81,.87],[.70,.86],[.59,.82]],lm:[.79,.71],lab:[.56,.53]},
  {c:[.26,.81],r:[.23,.12],nodes:[[.41,.84],[.30,.88],[.19,.87],[.08,.83]],lm:[.22,.72],lab:[.03,.53]},
];
const NODEPOS=ISLES.flatMap(s=>s.nodes);
const THEME={
  desert:{top:['#ffc27a','#e0803e'],cliff:['#c0602f','#4e1e15'],glow:'255,160,70'},
  industrial:{top:['#f2f8ff','#a9c8e8'],cliff:['#5d7fa8','#1c2a48'],glow:'120,200,255'},
  nature:{top:['#9be56a','#3f9c3c'],cliff:['#7a6440','#2a2618'],glow:'110,230,120'},
  cyber:{top:['#4a3a3a','#241a1c'],cliff:['#3a2422','#0e0708'],glow:'255,90,40'},
};

function showTab(t){
  hubTab=t;store.set('tab',t);
  TABS.forEach(x=>{$('tab_'+x).classList.toggle('hidden',x!==t);document.querySelector(`.bnav [data-tab="${x}"]`).classList.toggle('on',x===t)});
  $('hub').classList.toggle('see',t==='survival');
  $('hubTitle').textContent={upgrades:'UPGRADES',guns:'ARMORY',career:'CAREER MODE',survival:'SURVIVAL'}[t];
  $('backBtn').classList.toggle('hidden',t==='career');
  $('playBtn').innerHTML=t==='survival'?'SURVIVE <b>▶</b>':'PLAY <b>▶</b>';
  if(t==='career'){drawMap();renderNodes();renderPanel()}
  if(t==='upgrades')renderUpg();
  if(t==='guns')renderGuns();
  if(t==='survival'){const m=store.get('map','industrial');if(MAP.id!==m){applyMap(m);S=freshState(true)}renderMapPick()}
  hubChips();
}
function hubChips(){$('crTxt').textContent=CAR.cr;$('stTxt').textContent=starTotal()+'/48'}
document.querySelector('.bnav').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(!b)return;SND.unlock();SND.play('click');showTab(b.dataset.tab)});
$('backBtn').onclick=()=>{SND.play('click');showTab('career')};

function renderNodes(){
  const cur=nextLevel();
  $('nodes').innerHTML=ISLES.map((s,i)=>`<div class="chlab" style="left:${s.lab[0]*100}%;top:${s.lab[1]*100}%;--c:${CHAPTERS[i].col}"><span>${CHAPTERS[i].icon}</span><div><small>CHAPTER ${i+1}</small>${CHAPTERS[i].name}</div></div>`).join('')+
  LEVELS.map((L,i)=>{const [x,y]=NODEPOS[i],st=CAR.stars[i],lk=!unlocked(i);
    return `<button class="node${st?' done':''}${i===cur&&!st?' cur':''}${lk?' lock':''}${L.boss?' boss':''}${i===CAR.sel?' sel':''}" data-i="${i}" style="left:${x*100}%;top:${y*100}%" aria-label="Level ${L.k}">
      <span class="hex"><span class="num">${lk?'🔒':L.boss?'☠':L.k}</span></span><span class="ns">${[0,1,2].map(j=>`<i class="${j<st?'on':''}">★</i>`).join('')}</span></button>`}).join('');
}
$('nodes').addEventListener('click',e=>{const b=e.target.closest('.node');if(!b)return;SND.unlock();const i=+b.dataset.i;
  if(!unlocked(i)){SND.play('nope');return}CAR.sel=i;saveCar();SND.play('click');renderNodes();renderPanel()});
function renderPanel(){
  const i=CAR.sel,L=LEVELS[i],C=CHAPTERS[L.ch],st=CAR.stars[i],t=THEME[C.id],lk=!unlocked(i);
  const ens=levelEnemies(L);
  $('lvlPanel').innerHTML=`<div class="lh"><small style="color:${C.col}">CHAPTER ${L.ch+1} · ${C.name.toUpperCase()}</small><h3>LEVEL ${L.k}${L.boss?' <em>BOSS</em>':''}</h3></div>
    <div class="prev" style="background:linear-gradient(${t.top[0]}55,${t.cliff[1]})"><img class="pb" alt="" src="${MAPS[C.id].src}"><div class="pen">${ens.slice(0,3).map(id=>`<img alt="" src="assets/enemies/${id}.webp" style="height:${ET[id].boss?2.9:Math.max(1.3,ET[id].h/30)}em">`).join('')}</div></div>
    <div class="prow"><span>🌊 WAVES</span><b>${L.waves} waves</b></div>
    <div class="prow"><span>💰 STARTING COINS</span><b>${L.coins+perk('chest')*40}</b></div>
    <div class="psec">ENEMY TYPES</div>
    <div class="pens">${ens.map(id=>`<div class="${ET[id].boss?'bs':''}" title="${ET[id].name}"><img alt="${ET[id].name}" src="assets/enemies/${id}.webp"></div>`).join('')}</div>
    <div class="psec">REWARDS</div>
    <div class="prw"><div><span class="crc">C</span>×${st?Math.round(L.reward*.35):L.reward}</div><div><span class="sti">★</span>+25 each</div></div>
    <div class="pobj">${['Complete the level','Keep base HP above 50%','Use 3 or fewer gunners'].map((o,j)=>`<div class="${j<st?'on':''}"><i>★</i>${o}</div>`).join('')}</div>
    ${lk?'<div class="plock">🔒 Clear level '+i+' to unlock</div>':''}`;
  $('playBtn').disabled=lk&&hubTab==='career';
}
// ---------- upgrades ----------
function renderUpg(){
  $('upgList').innerHTML=UPG.map(u=>{const l=perk(u.id),max=l>=u.max,c=max?0:u.cost[l];
    return `<div class="ucard"><div class="uic">${u.ic}</div><b>${u.name}</b><span>${u.desc}</span><div class="pips">${Array.from({length:u.max},(_,j)=>`<i class="${j<l?'on':''}"></i>`).join('')}</div>
      <button class="act" data-u="${u.id}" ${max||CAR.cr<c?'disabled':''}>${max?'MAXED':'<span class="crc">C</span> '+c}</button></div>`}).join('')+
    `<div class="unote">Earn credits by clearing career levels. Upgrades last forever and help in every mode.</div>`;
}
$('upgList').addEventListener('click',e=>{const b=e.target.closest('[data-u]');if(!b||b.disabled)return;const u=UPG.find(x=>x.id===b.dataset.u),l=perk(u.id),c=u.cost[l];
  if(CAR.cr<c){SND.play('nope');return}CAR.cr-=c;CAR.up[u.id]=l+1;saveCar();SND.play('buy');renderUpg();hubChips()});
// ---------- guns ----------
function renderGuns(){
  const md=Math.max(...WEAPONS.map(w=>w.dmg*w.rate*(w.pellets||1)));
  $('gunList').innerHTML=WEAPONS.map(w=>{const dps=w.dmg*w.rate;
    return `<div class="gcard" style="--gc:${w.col}"><img alt="" src="${gunIcon(w.id)}"><b>${w.name}</b><span>${w.desc}</span>
      <div class="gbar"><small>DMG</small><i style="width:${Math.min(100,w.dmg/125*100)}%"></i></div><div class="gbar"><small>DPS</small><i style="width:${Math.min(100,dps/md*100)}%"></i></div>
      <em><span class="coin"></span> ${w.price}</em></div>`}).join('');
}
// ---------- play ----------
$('playBtn').onclick=()=>{SND.unlock();
  if(hubTab==='survival'){newGame(null);return}
  if(hubTab!=='career'){CAR.sel=nextLevel()}
  if(!unlocked(CAR.sel)){showTab('career');return}
  newGame(LEVELS[CAR.sel]);
};
window.addEventListener('resize',()=>{if(hubTab==='career'&&!$('hub').classList.contains('hidden'))setTimeout(drawMap,50)});
