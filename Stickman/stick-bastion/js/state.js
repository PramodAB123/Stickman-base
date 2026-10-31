'use strict';
// Game state and base/map setup
const WALL={x0:20,x1:262,top:396};
const SLOTS=[];
const BS=.66,BX=-14;
function applyMap(id){
  if(!MAPS[id])id='industrial';const m=MAP=MAPS[id];
  const gx=x=>BX+(x-m.ox)*BS,gy=y=>GY+2-(m.h-y)*BS;
  WALL.x0=BX+50;WALL.x1=gx(m.x1);WALL.top=gy(m.top);
  SLOTS.length=0;const names=['Front deck','Upper deck','Roof post','High tower'];
  m.slots.forEach(([x,y],i)=>SLOTS.push({x:gx(x),y:gy(y),crate:0,name:names[i]}));
  bg=null;baseCache.id=null;
}
const baseCache={n:-1,id:null,c:null,red:null,redId:null};
applyMap(store.get('map','industrial'));
function freshState(demo,L){
  const slots=SLOTS.map((d,i)=>({...d,i,w:null,lvl:0,invested:0,aim:-.1,cd:.4,rec:0,spin:0,tgt:null,rt:0,head:false,down:false,hp:gHP(0),maxHp:gHP(0),ko:false,boost:0}));
  slots[0].w='blaster';slots[0].invested=100;
  if(demo){slots[2].w='railgun';slots[1].w='flame'}
  const hp=demo?400:Math.round(400*(1+.1*perk('wall')));
  return{mode:demo?'menu':'play',demo:!!demo,career:L||null,maxGunners:1,wave:L?L.off:0,coins:demo?0:(L?L.coins:150)+perk('chest')*40,kills:0,heads:0,wallMax:hp,wallHP:hp,wallLvl:0,
    slots,spikes:0,mines:[],strikeLvl:0,strikeCD:0,
    enemies:[],bullets:[],eproj:[],parts:[],rags:[],floaters:[],coinfx:[],bombs:[],plane:null,
    queue:[],spawnT:0,waveActive:false,waveTotal:1,breakT:demo?0:12,dyingT:0,speed:1,
    shake:0,time:0,slow:0,banner:null,wallHit:0,demoT:0,cracks:makeCracks(),popSlot:null};
}
function makeCracks(){const r=mulberry(7),out=[];for(let i=0;i<16;i++){let x=.12+r()*.8,y=.3+r()*.55;const pts=[[x,y]];for(let j=0;j<5;j++){x+=(r()-.5)*.04;y+=.012+r()*.03;pts.push([x,y])}out.push(pts)}return out}

applyMap(store.get('map','industrial'));
