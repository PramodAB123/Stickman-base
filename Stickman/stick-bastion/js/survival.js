'use strict';
// Survival rewards: upgrade credits (C) per wave cleared and per boss, one-time wave milestones,
// and a daily challenge run (one modifier and one base per day, double credits).
// Saved in the 'surv' key. Loaded after meta.js, before main.js; wraps existing functions like meta.js does.
const SV = Object.assign({ ms: [], cDay: -1, cBest: 0, cBonus: 0 }, store.get('surv', {}));
if (!Array.isArray(SV.ms)) SV.ms = [];
const saveSV = () => store.set('surv', SV);
const SV_WAVE = 4, SV_BOSS = 30;                       // credits per wave cleared / boss killed (x2 in the challenge)
const SV_MS = [[10, 100], [15, 200], [20, 300], [25, 450], [30, 600]]; // [wave, credits], paid once each
const CH_GOAL = 10, CH_BONUS = 150;                    // challenge: reach this wave once a day for a bonus
const CHALS = [
  { id: 'fly', name: 'Air Raid', d: 'Only flying enemies attack. Bosses still walk in.' },
  { id: 'fast', name: 'Rush Hour', d: 'Every enemy moves 25% faster.' },
  { id: 'half', name: 'Cracked Walls', d: 'Your base starts at 50% HP.' },
  { id: 'tough', name: 'Bounty Night', d: 'Enemies have 30% more HP but drop double coins.' },
  { id: 'boss', name: 'Boss Rush', d: 'A Warlord Mech also joins every 3rd wave.' },
];
function todayChal() { const t = dayNum(); return Object.assign({ map: MAPIDS[(t * 7 + 3) % MAPIDS.length] }, CHALS[t % CHALS.length]) }
function chalState() { if (SV.cDay !== dayNum()) { SV.cDay = dayNum(); SV.cBest = 0; SV.cBonus = 0; saveSV() } return SV }
let svArm = false; // true while the player is replaying the daily challenge (Play again keeps it)
const svOn = () => S && !S.demo && !S.career;
function svPay(n, x, y, txt) {
  if (!n) return; CAR.cr += n; saveCar(); S.svEarn = (S.svEarn || 0) + n;
  if (S.mode === 'play') floater(x, y, txt || '+' + n + ' C', '#ffd23a', .9);
}

// ---------- hooks ----------
{
  // wave cleared: credits, milestones, challenge goal
  const _uw = updateWave; updateWave = function (dt) {
    const was = S.waveActive; const r = _uw.apply(this, arguments);
    if (was && !S.waveActive && svOn() && S.mode === 'play') {
      const n = S.wave, k = S.chal ? 2 : 1;
      svPay(SV_WAVE * k, W / 2, 300);
      for (const [w, c] of SV_MS) if (n >= w && !SV.ms.includes(w)) { SV.ms.push(w); saveSV(); svPay(c, W / 2, 260, 'MILESTONE: WAVE ' + w + '  +' + c + ' C'); SND.play('buy') }
      if (S.chal) { const st = chalState(); if (n > st.cBest) st.cBest = n;
        if (n >= CH_GOAL && !st.cBonus) { st.cBonus = 1; svPay(CH_BONUS, W / 2, 230, 'CHALLENGE COMPLETE  +' + CH_BONUS + ' C'); SND.play('buy') }
        saveSV() }
    }
    return r;
  };
  // boss kill bonus
  const _ke = killEnemy; killEnemy = function (e, o) {
    const boss = e && !e.dead && e.d.boss && !e.demo && svOn(), c0 = S.coins; const r = _ke.apply(this, arguments);
    if (boss) svPay(SV_BOSS * (S.chal ? 2 : 1), e.core.x, e.topY - 60, 'BOSS BONUS +' + SV_BOSS * (S.chal ? 2 : 1) + ' C');
    if (S.chal === 'tough' && svOn() && S.coins > c0) S.coins += S.coins - c0;
    return r;
  };
  // challenge modifiers
  const _bw = buildWave; buildWave = function (n) {
    let q = _bw.apply(this, arguments); if (!svOn() || !S.chal) return q;
    if (S.chal === 'fly') { const fl = Object.keys(UNLOCK).filter(k => ET[k].fly && UNLOCK[k] <= Math.max(n, 7));
      q = q.map(k => ET[k].boss || ET[k].fly ? k : fl[Math.floor(Math.random() * fl.length)]) }
    if (S.chal === 'boss' && n % 3 === 0 && n % 5 !== 0) q.splice(Math.floor(q.length * .5), 0, 'warlord_mech');
    return q;
  };
  const _sw = startWave; startWave = function () { const r = _sw.apply(this, arguments);
    if (svOn() && S.chal === 'boss' && S.wave % 3 === 0 && S.wave % 5 !== 0 && S.banner) { S.banner.sub = ET.warlord_mech.name.toUpperCase() + ' APPROACHES!'; S.banner.col = '#ff6b5b' } return r };
  const _se = spawnEnemy; spawnEnemy = function (type, demo) { const e = _se.apply(this, arguments);
    if (!demo && svOn() && S.chal === 'fast') e.spd *= 1.25;
    if (!demo && svOn() && S.chal === 'tough') { e.hp *= 1.3; e.maxHp *= 1.3; e.shield *= 1.3; e.shieldMax *= 1.3 }
    return e };
  // starting a run: the challenge uses today's base without changing the player's chosen base
  const _ng = newGame; newGame = function (L) {
    if (L || !svArm) { const r = _ng.apply(this, arguments); if (S) S.chal = null; return r }
    const ch = todayChal(), keep = store.get('map', 'industrial'); store.set('map', ch.map);
    try { _ng.call(this, null) } finally { store.set('map', keep) }
    S.chal = ch.id; chalState();
    if (ch.id === 'half') S.wallHP = Math.round(S.wallMax * .5);
    S.banner = { text: 'DAILY CHALLENGE', sub: ch.name.toUpperCase() + ' · ' + ch.d.toUpperCase(), t: -.3, col: '#ffd35a' };
  };
  // game over: what the run paid and what's next
  const _so = showOver; showOver = function () {
    const r = _so.apply(this, arguments); if (S.career) { const n = $('svNote'); if (n) n.remove(); return r }
    if (S.chal) { const st = chalState(); $('oBest').textContent = 'Daily challenge · best today: wave ' + st.cBest }
    let n = $('svNote'); if (!n) { n = document.createElement('div'); n.id = 'svNote'; n.className = 'svnote'; $('oBest').after(n) }
    const nx = SV_MS.find(([w]) => !SV.ms.includes(w));
    n.innerHTML = `<div><span>CREDITS EARNED</span><b><span class="crc">C</span> +${S.svEarn || 0}</b></div>` +
      (nx ? `<div><span>NEXT MILESTONE</span><b>WAVE ${nx[0]} · <span class="crc">C</span> ${nx[1]}</b></div>` : '<div><span>ALL MILESTONES REACHED</span></div>');
    return r;
  };
  // Survival tab: milestones + daily challenge card under the base picker
  const _rp = renderMapPick; renderMapPick = function () { const r = _rp.apply(this, arguments); renderSV(); return r };
  const _ub = updateBest; updateBest = function () { const r = _ub.apply(this, arguments); renderSV(); return r };
}
const svBox = (() => { const d = document.createElement('div'); d.id = 'svExtra'; $('bestTxt').after(d); return d })();
const CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
function renderSV() {
  const ch = todayChal(), st = chalState(), nx = SV_MS.findIndex(([w]) => !SV.ms.includes(w));
  svBox.innerHTML = `<div class="svms"><small>WAVE MILESTONES · PAID ONCE</small><div class="msr">${SV_MS.map(([w, c], i) => `<div class="msc${SV.ms.includes(w) ? ' done' : i === nx ? ' next' : ''}"><b>${SV.ms.includes(w) ? CHECK : ''}WAVE ${w}</b><span><span class="crc">C</span>${c}</span></div>`).join('')}</div>
    <p class="svp"><span class="crc">C</span> ${SV_WAVE} per wave cleared · <span class="crc">C</span> ${SV_BOSS} per boss</p></div>
    <div class="svch"><div class="cht"><small>DAILY CHALLENGE · ${MAPS[ch.map].name.toUpperCase()}</small><b>${ch.name}</b><span>${ch.d}</span>
      <em>Double credits · reach wave ${CH_GOAL}: ${st.cBonus ? 'bonus collected' : '<span class="crc">C</span> ' + CH_BONUS + ' bonus'}${st.cBest ? ' · best today: wave ' + st.cBest : ''}</em></div>
      <button class="btn small" id="chalBtn">PLAY</button></div>`;
}
svBox.addEventListener('click', e => { if (!e.target.closest('#chalBtn')) return; SND.unlock(); SND.play('click'); svArm = true; newGame(null) });
// the big SURVIVE button always starts a normal run
$('playBtn').addEventListener('click', () => { svArm = false }, true);
// a new day can roll over while the menu is open
setInterval(() => { if (hubTab === 'survival' && !$('hub').classList.contains('hidden') && SV.cDay !== dayNum()) renderSV() }, 5000);
renderSV();
