'use strict';
// Base upgrades as a bar of direct buttons along the bottom of the screen (replaces the BASE button and its popup)
function baseItems(){
  const out=[],rc=Math.round((30+S.wave*6)/5)*5,missing=S.wallMax-S.wallHP,live=S.mines.filter(m=>!m.used).length;
  out.push({ic:'🔧',sn:'REPAIR',d:'Repair wall: +35% base HP',col:'#5be27f',cost:missing>.5?rc:null,done:'FULL',act:()=>{S.wallHP=Math.min(S.wallMax,S.wallHP+S.wallMax*.35)}});
  out.push({ic:'🧱',sn:'WALL',d:'Reinforce wall: +150 max HP',lv:S.wallLvl,max:6,col:'#ff9b52',cost:S.wallLvl<6?180*(S.wallLvl+1):null,act:()=>{S.wallLvl++;S.wallMax+=150;S.wallHP+=150}});
  out.push({ic:'🪵',sn:'SPIKES',d:'Spike trap: slows and hurts attackers near the wall',lv:S.spikes,max:3,col:'#c98a4a',cost:S.spikes<3?[220,420,700][S.spikes]:null,act:()=>{S.spikes++}});
  out.push({ic:'💣',sn:'MINES',d:'Land mines x3 ('+live+' / 9 placed)',col:'#b77cff',cost:live<=6?150:null,done:'FULL',act:()=>{for(let i=0;i<3;i++)S.mines.push({x:rand(WALL.x1+330,W-140),used:false})}});
  out.push({ic:'✈️',sn:'AIR',d:S.strikeLvl?'Airstrike: more bombs, faster recharge':'Airstrike: unlocks the STRIKE button',lv:S.strikeLvl,max:3,col:'#4fb4ff',cost:S.strikeLvl<3?(S.strikeLvl?350*S.strikeLvl+150:450):null,act:()=>{S.strikeLvl++;S.strikeCD=0}});
  return out;
}
// the bar lives inside the HUD, so it shows and hides with it
const baseBar=(()=>{const b=document.createElement('div');b.id='baseBar';b.className='pe';$('hud').append(b);return b})();
$('baseBtn').classList.add('gone');
function renderBase(){
  const items=baseItems();baseActs=items.map(i=>i.act);
  const mk=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e};
  baseBar.textContent='';
  items.forEach((it,i)=>{
    const c=mk('button','bq'+(it.cost==null?' done':''));c.style.setProperty('--bc',it.col);c.title=it.d;c.dataset.i=i;
    if(it.cost!=null)c.dataset.cost=it.cost;
    const pips=mk('span','bp');for(let j=0;(it.max||0)>j;j++)pips.append(mk('i',it.lv>j?'on':''));
    const pr=mk('span','bpr');if(it.cost==null)pr.textContent=it.done||'MAX';else pr.append(mk('span','coin'),document.createTextNode(it.cost));
    c.append(mk('span','bi',it.ic),mk('span','bn',it.sn),pips,pr);baseBar.append(c);
  });
  barState();
}
// grey out what you can't afford without rebuilding the bar
function barState(){if(!S)return;baseBar.querySelectorAll('.bq').forEach(b=>{const c=b.dataset.cost;b.classList.toggle('poor',c!=null&&S.coins<+c)})}
baseBar.addEventListener('click',ev=>{
  const b=ev.target.closest('.bq');if(!b||S.mode!=='play')return;SND.unlock();
  if(b.dataset.cost==null){SND.play('nope');return}
  const i=+b.dataset.i,c=+b.dataset.cost;
  if(c>S.coins){SND.play('nope');b.classList.remove('shake');void b.offsetWidth;b.classList.add('shake');return}
  S.coins-=c;baseActs[i]();SND.play('buy');renderBase();
  const n=baseBar.children[i];if(n){n.classList.add('pop');}
  hudUpdate();
});
// keep the bar in sync with the game (wall damage, mines used, levels, coins)
let barSig='';
setInterval(()=>{if(!S||S.demo){barSig='';return}
  const sig=baseItems().map(i=>i.cost+'|'+i.d+'|'+i.lv).join(',');if(sig!==barSig){renderBase();barSig=sig}else barState()},200);
