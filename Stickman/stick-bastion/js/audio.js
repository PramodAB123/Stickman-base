'use strict';
// Sound effects (synthesised, no audio files)
const SND={ctx:null,on:store.get('snd',true),noise:null,last:{},master:null,
  unlock(){
    if(this.ctx){if(this.ctx.state==='suspended')this.ctx.resume();return}
    try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
      this.ctx=new AC();const len=this.ctx.sampleRate;const b=this.ctx.createBuffer(1,len,this.ctx.sampleRate);const d=b.getChannelData(0);
      for(let i=0;i<len;i++)d[i]=Math.random()*2-1;this.noise=b;this.master=this.ctx.createGain();this.master.gain.value=.4;this.master.connect(this.ctx.destination);
    }catch(e){this.ctx=null}
  },
  nz(dur,freq,q,vol,type,when){const c=this.ctx,t=c.currentTime+(when||0);const s=c.createBufferSource();s.buffer=this.noise;const f=c.createBiquadFilter();f.type=type||'lowpass';f.frequency.value=freq;f.Q.value=q;const g=c.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f);f.connect(g);g.connect(this.master);s.start(t,Math.random()*.4);s.stop(t+dur+.05)},
  tone(freq,dur,type,vol,slide,when){const c=this.ctx,t=c.currentTime+(when||0);const o=c.createOscillator();o.type=type;o.frequency.setValueAtTime(freq,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+dur);const g=c.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(this.master);o.start(t);o.stop(t+dur+.05)},
  play(k){
    if(!this.on||!this.ctx||this.ctx.state!=='running')return;
    const now=performance.now(),gap={smg:55,minigun:50,hit:40,coin:50,thud:70,head:45,explode:60,arrow:80,pistol:60,shotgun:90,sniper:90,rocket:90,zap:80,flame:70,ice:70,goo:90,laser:60,saw:90,plasma:90,grav:120}[k]||0;
    if(gap&&now-(this.last[k]||0)<gap)return;this.last[k]=now;
    try{switch(k){
      case'pistol':this.nz(.12,2200,1,.4,'bandpass');this.tone(190,.08,'square',.1,70);break;
      case'smg':this.nz(.07,2800,1,.28,'bandpass');this.tone(150,.05,'square',.05,80);break;
      case'shotgun':this.nz(.32,1100,.7,.75);this.tone(95,.22,'sine',.4,40);break;
      case'sniper':this.nz(.4,2400,.8,.6);this.tone(150,.3,'sawtooth',.15,40);break;
      case'rocket':this.nz(.55,700,.5,.4);this.tone(220,.45,'sawtooth',.1,70);break;
      case'minigun':this.nz(.05,3300,1,.25,'bandpass');break;
      case'zap':this.tone(900,.16,'sawtooth',.1,120);this.nz(.12,4200,2,.22,'highpass');break;
      case'flame':this.nz(.16,650,.6,.2);break;
      case'ice':this.tone(1500,.12,'triangle',.1,700);this.nz(.07,5200,1,.14,'highpass');break;
      case'goo':this.tone(260,.18,'sine',.25,90);this.nz(.1,900,1,.18,'bandpass');break;
      case'laser':this.tone(1700,.06,'square',.04,900);break;
      case'saw':this.tone(560,.25,'sawtooth',.07,260);this.nz(.15,3000,3,.14,'bandpass');break;
      case'plasma':this.tone(760,.3,'sawtooth',.11,120);this.nz(.25,1200,1,.28);break;
      case'grav':this.tone(130,.5,'sine',.4,40);this.tone(620,.4,'triangle',.07,150);break;
      case'explode':this.nz(1,380,.6,.9);this.tone(70,.7,'sine',.55,28);break;
      case'hit':this.tone(820,.04,'square',.04,420);break;
      case'head':this.tone(1500,.09,'triangle',.13,2300);break;
      case'coin':this.tone(1320,.06,'square',.04);this.tone(1980,.09,'square',.04,0,.05);break;
      case'thud':this.nz(.22,260,1,.5);break;
      case'arrow':this.nz(.18,4800,2,.12,'highpass');break;
      case'wave':this.tone(220,.7,'sawtooth',.1,330);this.tone(330,.7,'sawtooth',.07,495,.12);break;
      case'clear':[523,659,784,1046].forEach((f,i)=>this.tone(f,.18,'square',.07,0,i*.09));break;
      case'buy':this.tone(660,.08,'square',.09);this.tone(990,.14,'square',.09,0,.07);break;
      case'deploy':this.tone(440,.08,'square',.09);this.tone(660,.08,'square',.09,0,.07);this.tone(880,.16,'square',.09,0,.14);break;
      case'sell':this.tone(900,.08,'square',.08,500);break;
      case'nope':this.tone(180,.15,'square',.08,120);break;
      case'over':this.tone(320,1.3,'sawtooth',.14,55);break;
      case'click':this.tone(700,.04,'square',.05);break;
      case'plane':this.nz(1.6,500,.4,.25,'bandpass');break;
    }}catch(e){}
  }
};
