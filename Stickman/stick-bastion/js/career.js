'use strict';
// Career mode: chapters, levels, stars, credits and permanent upgrades (saved in this browser)
const CHAPTERS=[
  {id:'desert',name:'Desert Outpost',icon:'🌵',col:'#ffb347'},
  {id:'industrial',name:'Frozen Foundry',icon:'❄️',col:'#8fdcff'},
  {id:'nature',name:'Jungle Citadel',icon:'🌿',col:'#73e38c'},
  {id:'cyber',name:'Inferno Core',icon:'🔥',col:'#ff7a3a'},
];
const LEVELS=[];
for(let k=1;k<=16;k++){
  const ch=Math.floor((k-1)/4),bossLv=k%4===0;
  LEVELS.push({k,ch,map:CHAPTERS[ch].id,waves:4+Math.floor((k-1)/3),off:Math.round((k-1)*.65),
    boss:bossLv?(k%8===0?'void_dragon':'warlord_mech'):null,coins:Math.round((100+(k-1)*50+(k-1)*(k-1)*2)/10)*10,reward:60+k*20});
}
// what a level throws at you (used for the preview)
function levelEnemies(L){const top=L.off+L.waves;const ids=Object.keys(UNLOCK).filter(id=>UNLOCK[id]<=top).sort((a,b)=>UNLOCK[b]-UNLOCK[a]).slice(0,4);if(L.boss)ids.unshift(L.boss);return ids.slice(0,4)}

const UPG=[
  {id:'chest',ic:'💰',name:'War Chest',desc:'+40 starting coins',max:5,cost:[80,160,280,440,650]},
  {id:'wall',ic:'🧱',name:'Thick Walls',desc:'+10% base HP',max:5,cost:[100,200,340,520,760]},
  {id:'dmg',ic:'💥',name:'Hot Rounds',desc:'+6% gun damage',max:5,cost:[120,240,400,600,880]},
  {id:'rate',ic:'⚡',name:'Fast Hands',desc:'+5% fire rate',max:5,cost:[120,240,400,600,880]},
  {id:'bounty',ic:'🪙',name:'Bounty Hunter',desc:'+8% coins per kill',max:5,cost:[90,180,320,500,720]},
];
const CAR=Object.assign({stars:Array(16).fill(0),cr:0,up:{},sel:0},store.get('career',{}));
if(CAR.stars.length<16)CAR.stars=CAR.stars.concat(Array(16-CAR.stars.length).fill(0));
const saveCar=()=>store.set('career',CAR);
const perk=id=>CAR.up[id]||0;
// TESTING: true opens every level. Set to false for the real release.
const UNLOCK_ALL=true;
const unlocked=i=>UNLOCK_ALL||i===0||CAR.stars[i-1]>0;
const starTotal=()=>CAR.stars.reduce((a,b)=>a+b,0);
function nextLevel(){const i=CAR.stars.findIndex(s=>s===0);return i<0?15:i}

// hooks used by the game
const careerOn=()=>S&&S.career;
function careerWave(){return S.wave-S.career.off}
function careerBossWave(){return careerOn()&&S.career.boss&&careerWave()===S.career.waves}
function careerWin(){
  const L=S.career,i=L.k-1,hpOk=S.wallHP/S.wallMax>=.5,fewOk=S.maxGunners<=3;
  const got=1+(hpOk?1:0)+(fewOk?1:0),old=CAR.stars[i],first=old===0;
  const earn=Math.round(L.reward*(first?1:.35))+Math.max(0,got-old)*25;
  CAR.stars[i]=Math.max(old,got);CAR.cr+=earn;if(first&&i<15)CAR.sel=i+1;saveCar();
  S.mode='won';hudHide();SND.play('clear');
  const st=$('winStars');st.innerHTML=[0,1,2].map(j=>`<i class="${j<got?'on':''}" style="animation-delay:${.25+j*.3}s">★</i>`).join('');
  $('winLvl').textContent='CHAPTER '+(L.ch+1)+' · LEVEL '+L.k;
  $('winObj').innerHTML=[['Complete the level',true],['Keep base HP above 50%',hpOk],['Use 3 or fewer gunners',fewOk]].map(([t,ok])=>`<div class="${ok?'ok':''}">${ok?'★':'☆'} ${t}</div>`).join('');
  $('winCr').textContent='+'+earn;$('nextBtn').classList.toggle('hidden',i>=15);
  setTimeout(()=>showScreen('win'),900);
}
