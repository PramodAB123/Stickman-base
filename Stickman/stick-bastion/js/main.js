'use strict';
// Game loop and start-up
let last=performance.now();
function frame(now){
  let dt=Math.min(.033,(now-last)/1000);last=now;
  if(S.slow>0){S.slow-=dt;dt*=.35}
  if(S.mode!=='paused'&&dt>0){const n=S.mode==='play'?S.speed:1;for(let i=0;i<n;i++)update(dt)}
  drawWorld();hudUpdate();
  requestAnimationFrame(frame);
}
S=freshState(true);fit();sndLabel();updateBest();showTab(hubTab);
requestAnimationFrame(t=>{last=t;requestAnimationFrame(frame)});

window.__bastion={get S(){return S},CAR,LEVELS,showTab,careerWin,update,newGame,startWave,callNow,callStrike,spawnEnemy,toMenu,WEAPONS,ET,openSlot,renderBase,upCost};
