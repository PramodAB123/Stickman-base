'use strict';
// Core: screen size, helpers, canvas scaling, saved settings
const W=1280,H=720,GY=612;
const rand=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const $=id=>document.getElementById(id);
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

const stage=$('stage'),cv=$('cv'),ctx=cv.getContext('2d');
let SC=1,K=1,bg=null,rotateDismissed=false,S=null,ROT=false;
function fit(){
  const vw=window.innerWidth,vh=window.innerHeight;
  // phone held upright: lay the whole game on its side so it fills the screen (works even with rotation lock on)
  ROT=vh>vw*1.05&&('ontouchstart' in window||navigator.maxTouchPoints>0);
  const aw=ROT?vh:vw,ah=ROT?vw:vh;
  SC=Math.min(aw/W,ah/H);
  const w=Math.floor(W*SC),h=Math.floor(H*SC);
  Object.assign(stage.style,{width:w+'px',height:h+'px',left:((vw-w)/2)+'px',top:((vh-h)/2)+'px',fontSize:clamp(16*SC,11,18)+'px',transform:ROT?'rotate(90deg)':'',transformOrigin:'50% 50%'});
  const dpr=Math.min(window.devicePixelRatio||1,2);
  cv.width=Math.max(1,Math.round(w*dpr));cv.height=Math.max(1,Math.round(h*dpr));
  K=cv.width/W;bg=null;
  $('rotate').classList.remove('show');
  if(S&&S.popSlot!=null)placeSlotPop();
}
// screen point -> fraction (0..1) across the stage, accounting for the sideways (portrait) layout
function stageFrac(cx,cy){const r=stage.getBoundingClientRect(),dx=cx-(r.left+r.width/2),dy=cy-(r.top+r.height/2);
  return ROT?{x:.5+dy/r.height,y:.5-dx/r.width}:{x:.5+dx/r.width,y:.5+dy/r.height}}
window.addEventListener('resize',fit);
window.addEventListener('orientationchange',()=>setTimeout(fit,200));
$('rotOk').onclick=()=>{rotateDismissed=true;$('rotate').classList.remove('show')};

const store={get(k,d){try{const v=localStorage.getItem('stickbastion.'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem('stickbastion.'+k,JSON.stringify(v))}catch(e){}}};

const INK='#170e1f';
function shade(hex){const n=parseInt(hex.slice(1),16),r=(n>>16)*.6|0,g=((n>>8)&255)*.6|0,b=(n&255)*.6|0;return`rgb(${r},${g},${b})`}
function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function loadImg(src){const im=new Image();im.decoding='async';im.src=src;return im}
