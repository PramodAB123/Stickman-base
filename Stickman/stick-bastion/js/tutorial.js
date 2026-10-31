'use strict';
// Interactive tutorial for career level 1: big caption at the top, a tapping hand and a ripple ring on the thing to press
(function(){const old=document.getElementById('tut');if(old)old.remove();
  const mk=(tag,id,txt)=>{const e=document.createElement(tag);if(id)e.id=id;if(txt)e.textContent=txt;return e};
  const t=mk('div','tut');t.className='hidden';
  t.append(mk('div','tutRing'),mk('div','tutHand','👆'),mk('div','tutCap'),mk('button','tutSkip','SKIP TUTORIAL'));
  const bp=document.getElementById('basePop');bp.parentNode.insertBefore(t,bp.nextSibling)})();
const TUT={on:false,i:0,slot:1,t0:0};
const TSTEPS=[
  {txt:'TAP ON THE POST TO DEPLOY A GUNNER',at:()=>slotPt(TUT.slot,-34),done:()=>{if(S.popSlot!=null&&!S.slots[S.popSlot].w){TUT.slot=S.popSlot;return true}return false}},
  {txt:'PICK THE RAPID BLASTER',at:()=>elPt('#slotPop .wopt[data-w="blaster"]'),done:()=>!!S.slots[TUT.slot].w,
    enter:()=>{if(S.popSlot!==TUT.slot)openSlot(TUT.slot)}},
  {txt:'NOW UPGRADE YOUR GUNNER BY TAPPING ON HIM',at:()=>slotPt(TUT.slot,-50),done:()=>S.popSlot===TUT.slot&&!!$('gpHp'),
    enter:()=>{closePops();S.coins=Math.max(S.coins,upCost(WMAP[S.slots[TUT.slot].w],S.slots[TUT.slot].lvl)+5)}},
  {txt:'TAP UPGRADE',at:()=>elPt('#slotPop .upbig'),done:()=>S.slots[TUT.slot].lvl>=1,
    enter:()=>{tutOpen();S.coins=Math.max(S.coins,upCost(WMAP[S.slots[TUT.slot].w],S.slots[TUT.slot].lvl)+5)}},
  {txt:'OUCH, HE GOT HIT! TAP THE WRENCH TO REPAIR',at:()=>elPt('#gpFix'),done:()=>S.slots[TUT.slot].hp>=S.slots[TUT.slot].maxHp,
    enter:()=>{const s=S.slots[TUT.slot];s.hp=Math.round(s.maxHp*.4);s.hurt=.4;explodeFx(s.x,s.y-s.crate-40,26);tutOpen();S.coins=Math.max(S.coins,repairCost(s)+boostCost()+5)}},
  {txt:'TAP BOOST FOR DOUBLE FIRE RATE',at:()=>elPt('#gpBoost'),done:()=>S.slots[TUT.slot].boost>0,
    enter:()=>{tutOpen();S.coins=Math.max(S.coins,boostCost()+5)}},
  {txt:'CLOSE THE PANEL',at:()=>elPt('#slotPop .gx'),done:()=>S.popSlot==null},
  {txt:'WELL DONE, COMMANDER!',wait:1.8},
  {txt:'TAP CALL NOW TO START THE FIRST WAVE',at:()=>elPt('#callBtn'),done:()=>S.waveActive},
];
const tutOn=()=>TUT.on;
function tutStart(){TUT.on=true;TUT.slot=S.slots.findIndex(s=>!s.w);if(TUT.slot<0)TUT.slot=1;S.banner=null;$('tut').classList.remove('hidden');tutGo(0)}
function tutEnd(){TUT.on=false;$('tut').classList.add('hidden')}
function tutOpen(){if(S.popSlot!==TUT.slot)openSlot(TUT.slot)}
function tutGo(i){
  if(i>=TSTEPS.length){tutEnd();return}
  TUT.i=i;TUT.t0=performance.now();const st=TSTEPS[i];if(st.enter)st.enter();
  const c=$('tutCap');c.textContent=st.txt;c.classList.toggle('win',!!st.wait);c.style.animation='none';void c.offsetWidth;c.style.animation='';
  if(i>0)SND.play(st.wait?'clear':'click');
  tutTick();
}
// canvas point (logical) or DOM element -> % of the stage
function slotPt(i,dy){const s=S.slots[i];return{x:s.x/W*100,y:(s.y-s.crate+dy)/H*100,r:4.5}}
function elPt(sel){const el=document.querySelector(sel);if(!el||!el.offsetParent)return null;const a=el.getBoundingClientRect(),b=stage.getBoundingClientRect();
  return{x:(a.left+a.width/2-b.left)/b.width*100,y:(a.top+a.height/2-b.top)/b.height*100,r:Math.min(Math.max(a.width,a.height),a.height*2.2)/2/b.width*100+1.5}}
function tutHold(){return TUT.on}
function tutTick(){
  if(!TUT.on)return;
  if(!S||S.mode==='over'||S.demo){tutEnd();return}
  if(S.waveActive&&TUT.i<TSTEPS.length-1){tutEnd();return}
  const st=TSTEPS[TUT.i];
  if(st.wait?performance.now()-TUT.t0>st.wait*1000:(st.done&&st.done())){tutGo(TUT.i+1);return}
  const p=st.at?st.at():null,h=$('tutHand'),rg=$('tutRing');
  h.classList.toggle('hidden',!p);rg.classList.toggle('hidden',!p);
  if(p){h.style.left=p.x+'%';h.style.top=p.y+'%';rg.style.left=p.x+'%';rg.style.top=p.y+'%';rg.style.width=(p.r*2)+'%'}
}
$('tutSkip').onclick=()=>{SND.play('click');tutEnd()};
