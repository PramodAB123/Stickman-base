'use strict';
// Base upgrades as a row of game-style cards along the bottom (replaces the old drop-down list from ui.js)
function baseItems(){
  const out=[],rc=Math.round((30+S.wave*6)/5)*5,missing=S.wallMax-S.wallHP,live=S.mines.filter(m=>!m.used).length;
  out.push({ic:'🔧',sn:'REPAIR',d:'+35% base HP',col:'#5be27f',cost:missing>.5?rc:null,done:'FULL',act:()=>{S.wallHP=Math.min(S.wallMax,S.wallHP+S.wallMax*.35)}});
  out.push({ic:'🧱',sn:'REINFORCE',d:'+150 max HP',lv:S.wallLvl,max:6,col:'#ff9b52',cost:S.wallLvl<6?180*(S.wallLvl+1):null,act:()=>{S.wallLvl++;S.wallMax+=150;S.wallHP+=150}});
  out.push({ic:'🪵',sn:'SPIKES',d:'Slow & hurt at wall',lv:S.spikes,max:3,col:'#c98a4a',cost:S.spikes<3?[220,420,700][S.spikes]:null,act:()=>{S.spikes++}});
  out.push({ic:'💣',sn:'MINES ×3',d:live+' / 9 placed',col:'#b77cff',cost:live<=6?150:null,done:'FULL',act:()=>{for(let i=0;i<3;i++)S.mines.push({x:rand(WALL.x1+330,W-140),used:false})}});
  out.push({ic:'✈️',sn:'AIRSTRIKE',d:S.strikeLvl?'More bombs':'Unlock STRIKE',lv:S.strikeLvl,max:3,col:'#4fb4ff',cost:S.strikeLvl<3?(S.strikeLvl?350*S.strikeLvl+150:450):null,act:()=>{S.strikeLvl++;S.strikeCD=0}});
  return out;
}
function renderBase(){
  const items=baseItems();baseActs=items.map(i=>i.act);
  const mk=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e};
  const p=$('basePop');p.removeAttribute('style');p.classList.add('btray');p.textContent='';
  const x=mk('button','gx','✕');x.dataset.act='close';x.setAttribute('aria-label','Close');
  const row=mk('div','bcards');p.append(x,mk('div','bth','🏰 BASE UPGRADES'),row);
  items.forEach((it,i)=>{
    const c=mk('div','bcard'+(it.cost==null?' done':''));c.style.setProperty('--bc',it.col);
    const pips=mk('div','bpips');for(let j=0;(it.max||0)>j;j++)pips.append(mk('i',it.lv>j?'on':''));
    const b=mk('button','bbuy');
    if(it.cost==null){b.disabled=true;b.textContent=it.done||'MAX'}
    else{b.dataset.i=i;b.dataset.cost=it.cost;b.append(mk('span','coin'),document.createTextNode(it.cost))}
    c.append(mk('div','bic',it.ic),mk('b','',it.sn),mk('span','bd',it.d),pips,b);row.append(c);
  });
  hudUpdate();
}
// keep the open tray in sync with the game (wall damage, mines used, coins, airstrike level)
let traySig='';
function traySync(){const p=$('basePop');if(!S||p.classList.contains('hidden')){traySig='';return}
  const sig=baseItems().map(i=>i.cost+'|'+i.d+'|'+i.lv).join(',');if(sig!==traySig){traySig=sig;renderBase()}}
setInterval(traySync,250);
