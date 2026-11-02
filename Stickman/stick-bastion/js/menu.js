'use strict';
// Start screen hub: Career map, Upgrades, Guns, Premium and Survival tabs
const TABS=['career','upgrades','guns','premium','survival'];
let hubTab=store.get('tab','career');if(!TABS.includes(hubTab))hubTab='career';
// island layout on the chapter map: one long strip, chapters left to right (fractions of the strip's width / height)
const MAPW=2.2; // strip width as a multiple of the visible map area
const ISLES=[0,1,2,3].map(i=>{const cx=.125+.25*i,cy=i%2?.46:.4,rw=.1;
  return{c:[cx,cy],r:[rw,.145],nodes:[-.7,-.24,.24,.7].map((f,k)=>[cx+f*rw,cy+[.08,.11,.11,.06][k]]),lm:[cx+.004,cy-.1],lab:[cx-rw*.98,.04]}});
// a chapter is hidden in smoke until the player reaches it (a star on the previous chapter's boss level, or on any of its own levels)
const chapterOpen=c=>c===0||CAR.stars[c*4-1]>0||CAR.stars.slice(c*4,c*4+4).some(x=>x>0);
// you can always see the chapters you've reached plus the next one; everything past that is hidden in smoke
const chapterSeen=c=>c===0||chapterOpen(c)||chapterOpen(c-1);
const seenCount=()=>[0,1,2,3].filter(chapterSeen).length;
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
  $('hubTitle').textContent={upgrades:'UPGRADES',guns:'ARMORY',premium:'PREMIUM',career:'CAREER MODE',survival:'SURVIVAL'}[t];
  $('backBtn').classList.toggle('hidden',t==='career');
  $('playBtn').innerHTML=t==='survival'?'SURVIVE <b>▶</b>':'PLAY <b>▶</b>';
  if(t==='career'){drawMap();renderNodes();renderPanel();centerMap(CAR.sel)}
  if(t==='upgrades')renderUpg();
  if(t==='guns')renderGuns();
  if(t==='premium')renderPrem();
  if(t==='survival'){const m=store.get('map','industrial');if(MAP.id!==m){applyMap(m);S=freshState(true)}renderMapPick()}
  hubChips();
}
function hubChips(){$('crTxt').textContent=CAR.cr;$('stTxt').textContent=starTotal()+'/48'}
document.querySelector('.bnav').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(!b)return;SND.unlock();SND.play('click');showTab(b.dataset.tab)});
$('backBtn').onclick=()=>{SND.play('click');showTab('career')};

function renderNodes(){
  const cur=nextLevel();
  $('nodes').innerHTML=ISLES.map((s,i)=>chapterSeen(i)?`<div class="chlab" style="left:${s.lab[0]*100}%;top:${s.lab[1]*100}%;--c:${CHAPTERS[i].col}"><span>${CHAPTERS[i].icon}</span><div><small>CHAPTER ${i+1}</small>${CHAPTERS[i].name}</div></div>`:'').join('')+
  LEVELS.map((L,i)=>{if(!chapterSeen(L.ch))return'';const [x,y]=NODEPOS[i],st=CAR.stars[i],lk=!unlocked(i);
    return `<button class="node${st?' done':''}${i===cur&&!st?' cur':''}${lk?' lock':''}${L.boss?' boss':''}${i===CAR.sel?' sel':''}" data-i="${i}" style="left:${x*100}%;top:${y*100}%" aria-label="Level ${L.k}">
      <span class="hex"><span class="num">${lk?'🔒':L.boss?'☠':L.k}</span></span><span class="ns">${[0,1,2].map(j=>`<i class="${j<st?'on':''}">★</i>`).join('')}</span></button>`}).join('');
}
// scroll the strip so a level sits in the middle of the view
function mapMaxScroll(){const w=$('mapWrap'),n=seenCount();return n>=4?1e9:Math.max(0,(.25*n+.04)*$('mapIn').clientWidth-w.clientWidth)}
$('mapWrap').addEventListener('scroll',()=>{const w=$('mapWrap'),m=mapMaxScroll();if(w.scrollLeft>m)w.scrollLeft=m});
function centerMap(i,smooth){const w=$('mapWrap'),x=NODEPOS[i][0]*$('mapIn').clientWidth-w.clientWidth/2;w.scrollTo({left:Math.min(mapMaxScroll(),Math.max(0,x)),behavior:smooth?'smooth':'auto'})}
// drag / wheel scrolling (touch scrolls natively); a drag never counts as a tap on a level
{const w=$('mapWrap');let down=null,moved=false;
  w.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;down={x:e.clientX,y:e.clientY,s:w.scrollLeft};moved=false});
  window.addEventListener('pointermove',e=>{if(!down)return;const f=stageFrac(e.clientX,e.clientY),f0=stageFrac(down.x,down.y),dx=(f.x-f0.x)*stage.offsetWidth;if(Math.abs(dx)>6){moved=true;w.classList.add('drag')}if(moved)w.scrollLeft=down.s-dx});
  window.addEventListener('pointerup',()=>{down=null;w.classList.remove('drag')});
  w.addEventListener('click',e=>{if(moved){e.stopPropagation();e.preventDefault();moved=false}},true);
  w.addEventListener('wheel',e=>{if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){w.scrollLeft+=e.deltaY;e.preventDefault()}},{passive:false});
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
  const card=w=>{const dps=w.dmg*w.rate*(w.pellets||1),own=owned(w.id);
    return `<div class="gcard${w.prem?' prem':''}${own?'':' lockd'}" style="--gc:${w.col}"><img alt="" src="${gunIcon(w.id)}"><b>${w.name}</b><span>${w.desc}</span>
      <div class="gbar"><small>DMG</small><i style="width:${Math.min(100,w.dmg/125*100)}%"></i></div><div class="gbar"><small>DPS</small><i style="width:${Math.min(100,dps/md*100)}%"></i></div>
      <em><span class="coin"></span> ${w.price}</em>
      ${w.prem?(own?'<div class="gown">OWNED</div>':`<button class="act" data-buy="${w.id}" ${CAR.cr<w.prem?'disabled':''}><span class="crc">C</span> ${w.prem}</button>`):''}</div>`};
  $('gunList').innerHTML=WEAPONS.filter(w=>!w.prem).map(card).join('');
}
// ---------- premium armory ----------
const PERK={fbite:'Freeze',vdrake:'Pierce 3',glance:'Black hole',solar:'Burn'};
function renderPrem(){
  const mx=k=>Math.max(...WEAPONS.map(k));
  const mDmg=mx(w=>w.dmg*(w.pellets||1)),mRate=mx(w=>w.rate),mRng=mx(w=>w.range);
  const bar=(l,v)=>`<div class="pst"><small>${l}</small><div class="seg">${Array.from({length:5},(_,i)=>`<i class="${i<Math.max(1,Math.round(v*5))?'on':''}"></i>`).join('')}</div></div>`;
  $('premList').innerHTML=WEAPONS.filter(w=>w.prem).map(w=>{const own=owned(w.id),can=CAR.cr>=w.prem;
    return `<div class="pcard${own?' own':''}" style="--gc:${w.col}">
      <div class="part">${own?'<span class="pok" title="Owned"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>':''}<img alt="" src="${gunIcon(w.id)}"></div>
      <div class="pnm"><b>${w.name}</b><span class="ptag">${PERK[w.id]||'Premium'}</span></div><span class="pd">${w.desc}</span>
      ${bar('DAMAGE',w.dmg*(w.pellets||1)/mDmg)}${bar('RATE',Math.sqrt(w.rate/mRate))}${bar('RANGE',w.range/mRng)}
      <div class="pft"><span class="pdc"><span class="coin"></span> ${w.price} <small>to deploy</small></span>
      ${own?'<div class="gown">OWNED</div>':`<button class="act pbuy" data-buy="${w.id}" ${can?'':'disabled'}><span class="crc">C</span> ${w.prem}</button>`}</div></div>`}).join('');
}
$('premList').addEventListener('click',e=>{const b=e.target.closest('[data-buy]');if(!b||b.disabled)return;SND.unlock();const w=WMAP[b.dataset.buy];
  if(owned(w.id))return;if(CAR.cr<w.prem){SND.play('nope');return}
  CAR.cr-=w.prem;CAR.own.push(w.id);saveCar();SND.play('buy');renderPrem();hubChips()});
// ---------- play ----------
$('playBtn').onclick=()=>{SND.unlock();
  if(hubTab==='survival'){newGame(null);return}
  if(hubTab!=='career'){CAR.sel=nextLevel()}
  if(!unlocked(CAR.sel)){showTab('career');return}
  newGame(LEVELS[CAR.sel]);
};
window.addEventListener('resize',()=>{if(hubTab==='career'&&!$('hub').classList.contains('hidden'))setTimeout(drawMap,50)});
