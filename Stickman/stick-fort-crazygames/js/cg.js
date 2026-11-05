'use strict';
// CrazyGames SDK v3 bridge. Loaded first: it starts the SDK, then loads the game scripts.
// Everything here also works when the SDK is missing or disabled (other sites, adblock): the game just runs without it.
//  - saves go to the CrazyGames data module (synced to the player's account), else localStorage
//  - gameplayStart / gameplayStop follow S.mode (checked every frame from main.js)
//  - midgame ad between levels (Next / Retry / Play again), rewarded "double credits" on the win screen
//  - audio is muted while an ad plays and whenever CrazyGames' muteAudio setting is on
const CG = {
  sdk: null, env: 'disabled', on: false, playing: false, busy: false, adPlaying: false, muted: false,
  adblock: false, rewardFail: false, lastEarn: 0, rewardTaken: false,
  async init() {
    const c = window.CrazyGames && window.CrazyGames.SDK;
    if (!c) return;
    try { await c.init(); this.sdk = c; this.env = c.environment; this.on = this.env === 'crazygames' || this.env === 'local' } catch (e) { this.on = false }
    if (!this.on) return;
    this.call(s => s.game.loadingStart());
    this.call(s => { this.muted = !!(s.game.settings && s.game.settings.muteAudio); s.game.addSettingsChangeListener(n => { this.muted = !!(n && n.muteAudio); this.audio() }) });
    try { this.adblock = !!(await this.sdk.ad.hasAdblock()) } catch (e) { }
  },
  call(fn) { if (!this.on) return; try { fn(this.sdk) } catch (e) { } },
  // ---- saves ----
  getItem(k) {
    if (this.on && this.sdk.data) { try { return this.sdk.data.getItem(k) } catch (e) { } }
    try { return localStorage.getItem(k) } catch (e) { return null }
  },
  setItem(k, v) {
    if (this.on && this.sdk.data) { try { this.sdk.data.setItem(k, v); return } catch (e) { } }
    try { localStorage.setItem(k, v) } catch (e) { }
  },
  // ---- gameplay events (called every frame) ----
  tick() {
    const want = !!(typeof S !== 'undefined' && S && S.mode === 'play' && !S.demo && !this.busy);
    if (want === this.playing) return;
    this.playing = want;
    this.call(s => want ? s.game.gameplayStart() : s.game.gameplayStop());
  },
  loaded() { this.call(s => s.game.loadingStop()) },
  happy() { this.call(s => s.game.happytime()) },
  // ---- audio ----
  hush() { return this.adPlaying || this.muted },
  audio() {
    if (typeof SND === 'undefined' || !SND.ctx) return;
    try { if (this.hush()) { if (SND.ctx.state === 'running') SND.ctx.suspend() } else if (SND.ctx.state === 'suspended' && !document.hidden) SND.ctx.resume() } catch (e) { }
  },
  // ---- ads ----
  block(on) { const b = document.getElementById('adWait'); if (b) b.classList.toggle('hidden', !on) },
  ad(type, done, fail) {
    if (!this.on || this.busy) { (fail || done)(); return }
    this.busy = true; this.block(true); this.tick();
    let ended = false;
    const end = ok => { if (ended) return; ended = true; this.busy = false; this.adPlaying = false; this.block(false); this.audio(); (ok ? done : (fail || done))() };
    try {
      this.sdk.ad.requestAd(type, {
        adStarted: () => { this.adPlaying = true; this.audio() },
        adFinished: () => end(true),
        adError: () => end(false)
      });
    } catch (e) { end(false) }
  },
  // midgame between levels; skipped right after a rewarded ad (CrazyGames rule)
  midgame(next) { if (this.rewardTaken) { this.rewardTaken = false; next(); return } this.ad('midgame', next) },
  // win screen: offer the rewarded "double credits" only when it can work
  offerReward(earn) {
    this.lastEarn = earn; this.rewardTaken = false;
    const b = document.getElementById('dblBtn'), n = document.getElementById('dblNote');
    if (!b) return;
    const show = this.on && !this.adblock && !this.rewardFail && earn > 0;
    b.classList.toggle('hidden', !show); n.classList.add('hidden');
    if (show) b.querySelector('b').textContent = '+' + earn;
  },
  watchReward() {
    const b = document.getElementById('dblBtn'), n = document.getElementById('dblNote');
    b.disabled = true;
    this.ad('rewarded', () => {
      CAR.cr += this.lastEarn; saveCar(); this.rewardTaken = true;
      document.getElementById('winCr').textContent = '+' + this.lastEarn * 2;
      b.classList.add('hidden'); b.disabled = false; n.textContent = 'Credits doubled!'; n.classList.remove('hidden');
      if (typeof SND !== 'undefined') SND.play('buy');
    }, () => {
      this.rewardFail = true; b.classList.add('hidden'); b.disabled = false;
      n.textContent = 'No video available right now.'; n.classList.remove('hidden');
    });
  }
};

// boot: start the SDK (max 6 s wait), then load the game scripts in order
(function () {
  const files = ['core', 'icons', 'audio', 'music', 'data', 'enemies', 'state', 'gunners', 'combat', 'waves', 'career', 'render', 'ui', 'mapart', 'menu', 'basetray', 'tutorial', 'hudskin', 'meta', 'main'];
  let started = false;
  const go = () => {
    if (started) return; started = true;
    files.forEach(f => { const s = document.createElement('script'); s.src = 'js/' + f + '.js'; s.async = false; document.body.appendChild(s) });
  };
  setTimeout(go, 6000);
  CG.init().then(go, go);
})();
