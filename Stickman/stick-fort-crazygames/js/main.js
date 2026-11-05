'use strict';
// Game loop and start-up
let last=performance.now();
function frame(now){
  let dt=Math.min(.033,(now-last)/1000);last=now;
  if(S.slow>0){S.slow-=dt;dt*=.35}
  if(S.mode!=='paused'&&dt>0){const n=S.mode==='play'?S.speed:1;for(let i=0;i<n;i++)update(dt)}
  drawWorld();hudUpdate();CG.tick();
  requestAnimationFrame(frame);
}
S=freshState(true);fit();sndLabel();updateBest();showTab(hubTab);
// brand-new players (no stars yet) skip the menu and land straight in level 1 with the tutorial
if(!CAR.stars.some(v=>v>0)){CAR.sel=0;newGame(LEVELS[0])}
// browsers only allow sound after the first tap anywhere on the page
document.addEventListener('pointerdown',()=>SND.unlock(),{once:true,capture:true});
requestAnimationFrame(t=>{last=t;requestAnimationFrame(frame);CG.loaded()});

window.__bastion={get S(){return S},CAR,LEVELS,showTab,careerWin,update,newGame,startWave,callNow,callStrike,spawnEnemy,toMenu,WEAPONS,ET,openSlot,renderBase,upCost};
