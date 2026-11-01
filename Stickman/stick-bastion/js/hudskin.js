'use strict';
// HUD extras for the new look: the wave tab under the banner and the two-colour tutorial caption
(function(){
  const sub=$('waveSub');
  setInterval(()=>{if(!S||S.demo)return;
    // during a wave: how many enemies are still to beat; between waves: which wave is next
    let t;if(S.waveActive){const left=S.queue.length+S.enemies.filter(e=>!e.dead).length;t=left+(left===1?' ENEMY LEFT':' ENEMIES LEFT')}
    else if(S.career){const w=careerWave(),n=S.career.waves;t='NEXT: WAVE '+Math.min(n,w+1)+' / '+n}
    else t='NEXT: WAVE '+(S.wave+1);
    if(sub.textContent!==t)sub.textContent=t},150);
  // split the caption: the part after the first " TO " (or the last two words) is drawn in yellow
  const cap=document.getElementById('tutCap');if(!cap)return;
  new MutationObserver(()=>{if(cap.querySelector('em'))return;const s=cap.textContent;if(!s||cap.classList.contains('win'))return;
    let i=s.indexOf(' TO ');let a,b;if(i>0){a=s.slice(0,i+4);b=s.slice(i+4)}else{const w=s.split(' ');b=w.splice(w.length>3?-2:-1).join(' ');a=w.join(' ')+' '}
    const em=document.createElement('em');em.textContent=b;cap.textContent=a;cap.append(em)}).observe(cap,{childList:true});
})();
