'use strict';
// Background music, generated live with Web Audio (no music files).
// A low, warm groove that sits UNDER the gunfire: everything is kept below ~1.6 kHz, so the
// shots, booms and clinks stay crisp on top. F# minor, 84 BPM:
//   - a held drone (F#2 + F#3 + C#4) that slowly breathes,
//   - a soft plucked arpeggio in the 180-450 Hz range that follows the chords,
//   - a round bass pulse on the 8ths and a muffled thump on the beat (battle only).
// Menu = drone + slow arpeggio; battle = full groove; boss = faster arpeggio and a heavier pulse.
const BGM={bus:null,timer:null,step:0,next:0,mode:'off',
  BPM:84,
  // one chord per bar over the F# pedal (8-bar loop): F#m F#m D E F#m F#m Bm C#
  bass:[42,42,38,40,42,42,47,37],
  arps:[[54,57,61,66],[54,57,61,66],[54,57,62,66],[56,59,64,68],[54,57,61,66],[57,61,64,69],[54,59,62,66],[56,61,65,68]],
  pat:[0,1,2,3, 2,1,0,1, 0,2,3,2, 1,2,0,1],
  mf:n=>440*Math.pow(2,(n-69)/12),
  // master chain: gain -> lowpass (keeps the music out of the gun-sound range) -> speakers + a soft room delay
  makeBus(c){const bus=c.createGain(),lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1600;lp.Q.value=.5;
    const dl=c.createDelay(.6),fb=c.createGain(),wet=c.createGain();dl.delayTime.value=60/this.BPM*.75;fb.gain.value=.25;wet.gain.value=.18;
    bus.connect(lp);lp.connect(c.destination);lp.connect(dl);dl.connect(fb);fb.connect(dl);dl.connect(wet);wet.connect(c.destination);return bus},
  init(){const c=SND.ctx;if(!c||this.bus)return;
    this.bus=this.makeBus(c);this.bus.gain.value=0;
    this.next=c.currentTime+.1;this.timer=setInterval(()=>this.tick(),30);
  },
  // which version should play right now
  want(){if(!SND.on||typeof S==='undefined'||!S)return'off';if(S.demo)return'menu';if(S.mode==='paused')return'pause';
    if(S.mode!=='play')return'menu';return S.enemies.some(e=>!e.dead&&e.d.boss)?'boss':'battle'},
  tick(){const c=SND.ctx;if(!c||c.state!=='running')return;
    const m=this.want(),target={off:0,pause:.1,menu:.65,battle:.6,boss:.66}[m];this.mode=m;
    this.bus.gain.setTargetAtTime(target,c.currentTime,.5);
    const sd=60/this.BPM/4;
    if(this.next<c.currentTime-.2)this.next=c.currentTime+.05;
    while(this.next<c.currentTime+.12){if(target>0)this.play(this.step,this.next,sd,m);this.next+=sd;this.step=(this.step+1)%128}
  },
  play(st,t,sd,m){const s=st%16,bar=Math.floor(st/16),full=m==='battle'||m==='boss',boss=m==='boss',ch=this.arps[bar],b=this.bass[bar];
    // drone: re-voiced every 2 bars, long overlapping swells
    if(st%32===0)this.drone(t,sd*32);
    // arpeggio: 8ths on the menu, 16ths in battle (boss pushes the accents)
    if(full||s%2===0){const n=ch[this.pat[s]]+(boss&&s>=8&&s%4===2?12:0);this.pluck(t,n,full?sd*1.6:sd*3,(s%4===0?.075:.05)*(full?1:.8))}
    if(full){
      // round bass on the 8ths, accent on the beat
      if(s%2===0)this.bassNote(t,b,sd*1.7,s%4===0?.2:.12);
      // muffled thump: beats 1 and 3, every beat on a boss
      if(s===0||s===8||(boss&&s%4===0))this.thump(t,s===0?.55:.4);
      // low tom fill at the end of every 2nd bar
      if(bar%2===1&&(s===13||s===14||s===15))this.tom(t,s===15?b+7:b+12,.22);
      if(boss&&s%4===2)this.tom(t,b+12,.12);
    }else if(s===0)this.bassNote(t,b,sd*12,.1);
  },
  drone(t,dur){const c=SND.ctx,lp=c.createBiquadFilter(),g=c.createGain();lp.type='lowpass';lp.Q.value=1.5;
    lp.frequency.setValueAtTime(260,t);lp.frequency.linearRampToValueAtTime(560,t+dur*.5);lp.frequency.linearRampToValueAtTime(300,t+dur+1);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.06,t+1.4);g.gain.setValueAtTime(.06,t+dur-.4);g.gain.linearRampToValueAtTime(0,t+dur+1.2);
    for(const [n,ty,d] of [[42,'sawtooth',-4],[54,'sawtooth',5],[61,'triangle',0],[54,'triangle',-9]]){const o=c.createOscillator();o.type=ty;o.frequency.value=this.mf(n);o.detune.value=d;o.connect(lp);o.start(t);o.stop(t+dur+1.3)}
    lp.connect(g);g.connect(this.bus)},
  pluck(t,n,dur,vol){const c=SND.ctx,o=c.createOscillator(),o2=c.createOscillator(),lp=c.createBiquadFilter(),g=c.createGain();
    o.type='triangle';o2.type='square';o.frequency.value=o2.frequency.value=this.mf(n);o2.detune.value=7;
    const g2=c.createGain();g2.gain.value=.25;lp.type='lowpass';lp.Q.value=3;
    lp.frequency.setValueAtTime(1300,t);lp.frequency.exponentialRampToValueAtTime(380,t+dur);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.008);g.gain.exponentialRampToValueAtTime(.001,t+dur);
    o.connect(lp);o2.connect(g2);g2.connect(lp);lp.connect(g);g.connect(this.bus);o.start(t);o2.start(t);o.stop(t+dur+.02);o2.stop(t+dur+.02)},
  bassNote(t,n,dur,vol){const c=SND.ctx,o=c.createOscillator(),o2=c.createOscillator(),lp=c.createBiquadFilter(),g=c.createGain();
    o.type='sine';o2.type='sawtooth';o.frequency.value=this.mf(n);o2.frequency.value=this.mf(n);
    const g2=c.createGain();g2.gain.value=.35;lp.type='lowpass';lp.frequency.setValueAtTime(520,t);lp.frequency.exponentialRampToValueAtTime(160,t+dur);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.012);g.gain.exponentialRampToValueAtTime(.001,t+dur);
    o.connect(lp);o2.connect(g2);g2.connect(lp);lp.connect(g);g.connect(this.bus);o.start(t);o2.start(t);o.stop(t+dur+.02);o2.stop(t+dur+.02)},
  thump(t,vol){const c=SND.ctx,o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(95,t);o.frequency.exponentialRampToValueAtTime(44,t+.14);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.006);g.gain.exponentialRampToValueAtTime(.001,t+.32);o.connect(g);g.connect(this.bus);o.start(t);o.stop(t+.34)},
  tom(t,n,vol){const c=SND.ctx,o=c.createOscillator(),g=c.createGain(),f=this.mf(n);o.type='sine';o.frequency.setValueAtTime(f*1.5,t);o.frequency.exponentialRampToValueAtTime(f,t+.07);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.005);g.gain.exponentialRampToValueAtTime(.001,t+.28);o.connect(g);g.connect(this.bus);o.start(t);o.stop(t+.3)},
};
// start once the browser allows audio (first tap/click), and keep checking in case the context is created later
setInterval(()=>{if(SND.ctx&&!BGM.bus)BGM.init()},300);
