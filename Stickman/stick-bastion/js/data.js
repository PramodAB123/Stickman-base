'use strict';
// Game data: guns, bases, sprite sizes
// Bases: x1 = front edge, top = front deck height, slots = gunner posts (all in sprite pixels)
const MAPS={"industrial":{"name":"Industrial Fortress","icon":"⚙️","x1":760,"top":298,"slots":[[680,298],[570,200],[455,84],[270,75]],"th":{"sky":["#3f9be8","#8cc9f5","#d6effb"],"far":"#a9cde9","snow":"#eef7ff","mid":"#86b2d9","near":"#a27b90","g1":"#e2702c","g2":"#7a3b2e","g3":"#3e1d22","deco":"cactus"},
  "w":724,"h":425,"ox":46},
  "nature":{"name":"Nature Citadel","icon":"🌿","x1":785,"top":290,"slots":[[700,290],[590,205],[390,120],[255,198]],"th":{"sky":["#46a6ee","#9ad6f5","#e4f8ee"],"far":"#9fcbe0","snow":"#f2fbff","mid":"#74b866","near":"#4a9a4c","g1":"#7fcc4a","g2":"#6b4428","g3":"#2e1c14","deco":"tree","grass":1,"sunX":300},
  "w":782,"h":403,"ox":9},
  "cyber":{"name":"Cyber Tech Base","icon":"💠","x1":760,"top":300,"slots":[[660,300],[560,185],[400,104],[310,150]],"th":{"sky":["#070a24","#24145a","#8a2c8e"],"far":"#2a1f5c","mid":"#1d1745","near":"#130f30","g1":"#ff3fd0","g2":"#1d1838","g3":"#0a0818","deco":"city","night":1},
  "w":736,"h":430,"ox":34},
  "desert":{"name":"Desert Outpost","icon":"🌵","x1":760,"top":296,"slots":[[705,296],[600,205],[495,158],[220,98]],"th":{"sky":["#58a6e8","#f3d9a8","#ffbe72"],"far":"#e8b779","mid":"#dc9a55","near":"#c67c3c","g1":"#f6cf8a","g2":"#d49650","g3":"#8a5226","deco":"cactus","sunX":760,"sunY":300,"sunR":46},
  "w":743,"h":430,"ox":55}};
const MAPIDS=['industrial','nature','cyber','desert'];
let MAP=null;
for(const id of MAPIDS){const m=MAPS[id];m.id=id;m.src='assets/bases/'+id+'.webp';m.img=loadImg(m.src)}
const WEAPONS=[
  {id:'blaster',name:'Rapid Blaster',price:60,dmg:12,rate:2.6,spread:.03,speed:2000,pellets:1,pierce:1,recoil:4,shake:0,range:950,turn:6,headCh:.3,col:'#ffb020',bc:'255,170,50',snd:'pistol',desc:'Cheap and quick'},
  {id:'shock',name:'Shock Gun',price:110,dmg:26,rate:1.6,speed:1e6,hit:'chain',chain:4,range:820,recoil:5,shake:.5,turn:6,headCh:0,col:'#4fe3ff',snd:'zap',desc:'Lightning jumps between enemies'},
  {id:'flame',name:'Flame Thrower',price:160,dmg:6,rate:14,spread:.1,speed:760,pellets:1,pierce:3,life:.9,recoil:1.5,shake:0,range:540,turn:6,headCh:0,burn:12,col:'#ff6a2a',snd:'flame',desc:'Burns machines up close'},
  {id:'frost',name:'Frost Ray',price:210,dmg:17,rate:4.6,spread:.025,speed:1800,pellets:1,pierce:1,recoil:3,shake:0,range:900,turn:6,headCh:.15,slow:.45,col:'#8fe8ff',bc:'140,230,255',snd:'ice',desc:'Freezes and slows enemies'},
  {id:'acid',name:'Acid Sprayer',price:270,dmg:36,rate:1.6,spread:.02,speed:1050,grav:70,pellets:1,pierce:1,radius:62,acid:14,recoil:5,shake:.5,range:820,turn:5,headCh:0,col:'#9cff3a',fx:'156,255,58',snd:'goo',desc:'Acid splash melts armor'},
  {id:'laser',name:'Laser Beam',price:330,dmg:11,rate:7,speed:1e6,hit:'beam',range:1150,recoil:1,shake:0,turn:4.5,headCh:.1,col:'#c070ff',snd:'laser',desc:'Cuts every enemy in its line'},
  {id:'railgun',name:'Railgun',price:380,dmg:95,rate:.9,spread:.004,speed:3400,pellets:1,pierce:4,recoil:12,shake:1,range:2000,turn:4,headCh:.55,col:'#4fb8ff',snd:'sniper',desc:'Hunts the toughest enemy'},
  {id:'saw',name:'Saw Blaster',price:430,dmg:40,rate:1.3,spread:.01,speed:720,pellets:1,pierce:7,life:2,recoil:7,shake:.6,range:1000,turn:5,headCh:0,col:'#ff9a20',snd:'saw',desc:'Blades slice through lines'},
  {id:'plasma',name:'Plasma Cannon',price:490,dmg:75,rate:1.3,spread:.01,speed:1300,pellets:1,pierce:1,radius:80,recoil:10,shake:2,range:1500,turn:4,headCh:0,col:'#3ff0ff',fx:'80,240,255',snd:'plasma',desc:'Plasma blasts hit groups'},
  {id:'rocket',name:'Rocket Launcher',price:560,dmg:125,rate:.8,spread:.015,speed:950,grav:60,pellets:1,pierce:1,radius:110,recoil:14,shake:3,range:2000,turn:3.5,headCh:0,col:'#ff5a4f',snd:'rocket',desc:'Huge explosions'},
  {id:'gravity',name:'Gravity Gun',price:640,dmg:60,rate:.9,spread:.01,speed:900,pellets:1,pierce:1,radius:110,push:true,slow:.3,recoil:9,shake:2.5,range:1300,turn:4,headCh:0,col:'#a060ff',fx:'170,100,255',snd:'grav',desc:'Vortex flings enemies back'},
  {id:'minigun',name:'Minigun',price:720,dmg:10,rate:18,spread:.09,speed:2200,pellets:1,pierce:2,recoil:2.5,shake:.4,range:1100,turn:3,headCh:.15,col:'#ffc13a',bc:'255,190,60',snd:'minigun',desc:'A storm of lead'},
];
const WMAP={};WEAPONS.forEach(w=>WMAP[w.id]=w);
const MAXLV=5;
// all guns: damage and fire-rate multipliers (lower = weaker guns)
const GUN_DMG=.9,GUN_RATE=.85;
const wDmg=(w,l)=>w.dmg*(1+.3*l)*(1+.06*perk('dmg'))*GUN_DMG;
const gHP=l=>Math.round(150*(1+.25*l));
const repairCost=s=>Math.max(10,Math.round((s.maxHp-s.hp)*.35+S.wave*2));
const boostCost=()=>15+Math.max(0,S.wave)*4;
const wRate=(w,l)=>w.rate*(1+.06*l)*(1+.05*perk('rate'))*GUN_RATE;
const upCost=(w,l)=>Math.round((w.price*.55+60)*(l+1)/10)*10;


// Gun sprites: [width, height, bore y, muzzle x, grip x, grip y, length] in source pixels
const GUNM={blaster: [353, 130, 50, 353, 90, 100, 96], plasma: [362, 137, 60, 362, 90, 100, 104], flame: [372, 135, 50, 290, 160, 100, 104], frost: [361, 139, 58, 300, 88, 110, 100], rocket: [359, 138, 50, 359, 135, 100, 106], laser: [368, 131, 50, 275, 75, 90, 102], shock: [369, 137, 52, 290, 75, 100, 100], minigun: [363, 143, 60, 335, 40, 70, 108], railgun: [361, 135, 55, 361, 105, 95, 110], acid: [364, 141, 50, 290, 155, 100, 104], saw: [351, 163, 83, 273, 75, 120, 102], gravity: [363, 140, 55, 255, 80, 100, 104]};
const GUNIMG={},GSP={};
for(const id in GUNM){GUNIMG[id]=loadImg('assets/guns/'+id+'.webp');const [w,h,by,tx,gx,gy,len]=GUNM[id],k=len*.85/w,px=gx+40;
  GSP[id]={x0:-px*k,y0:-by*k,w:w*k,h:h*k,tip:(tx-px)*k,grip:[-40*k,(gy-by)*k]}}
const ENEMY_SIZE={rifle_grunt: [119, 117], shield_brute: [153, 130], blade_raider: [163, 119], heavy_gunner: [183, 150], bomb_runner: [151, 140], mech_walker: [215, 150], spiked_beast: [181, 128], juggernaut: [279, 196], scout_drone: [177, 60], attack_drone: [212, 86], hover_bike: [164, 98], wing_raider: [276, 114], bomber_drone: [249, 119], sky_reaper: [327, 151], stealth_assassin: [89, 121], mind_controller: [116, 132], healer_support: [128, 155], turret_carrier: [222, 149], warlord_mech: [362, 203], void_dragon: [389, 238]};
