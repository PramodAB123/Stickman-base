'use strict';
// Reasons to come back: daily login streak, daily missions, a supply drop every 4 hours and star chests.
// Everything is saved in this browser (localStorage); rewards are upgrade credits (CAR.cr), kept small so the game stays hard.
const META = Object.assign({ dDay: -1, dStreak: 0, mDay: -1, ms: [], supplyAt: 0, chests: 0 }, store.get('meta', {}));
const saveMeta = () => store.set('meta', META);
const dayNum = () => { const d = new Date(); return Math.floor((d.getTime() - d.getTimezoneOffset() * 6e4) / 864e5) };
// one small icon set in the HUD's flat style (single colour, follows currentColor)
const ICO = {
  cal: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="3" fill="#ffd23a"/><rect x="3" y="5" width="18" height="5" rx="2" fill="#e8572a"/><rect x="7" y="2.5" width="2.4" height="5" rx="1.2" fill="#fff"/><rect x="14.6" y="2.5" width="2.4" height="5" rx="1.2" fill="#fff"/><rect x="6.5" y="12.5" width="3" height="3" rx=".6" fill="#7a4a10"/><rect x="10.5" y="12.5" width="3" height="3" rx=".6" fill="#7a4a10"/><rect x="14.5" y="12.5" width="3" height="3" rx=".6" fill="#7a4a10"/><rect x="6.5" y="16.5" width="3" height="3" rx=".6" fill="#7a4a10"/></svg>',
  target: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5" fill="#ffd23a"/><circle cx="12" cy="12" r="6.5" fill="#1c2c5a"/><circle cx="12" cy="12" r="3.6" fill="#ffd23a"/><rect x="11" y="0.5" width="2" height="6" fill="#ffd23a"/><rect x="11" y="17.5" width="2" height="6" fill="#ffd23a"/><rect x="0.5" y="11" width="6" height="2" fill="#ffd23a"/><rect x="17.5" y="11" width="6" height="2" fill="#ffd23a"/></svg>',
  crate: '<svg viewBox="0 0 24 24"><rect x="2.5" y="6" width="19" height="15" rx="1.5" fill="#c98a3c"/><rect x="2.5" y="6" width="19" height="4" fill="#a8692a"/><path d="M4 11 L20 19.5 M20 11 L4 19.5" stroke="#8a5420" stroke-width="2"/><rect x="2.5" y="6" width="19" height="15" rx="1.5" fill="none" stroke="#5a3410" stroke-width="1.6"/><rect x="10" y="3" width="4" height="5" rx="1" fill="#ffd23a"/></svg>',
  skull: '<svg viewBox="0 0 24 24"><path d="M12 2.5C6.8 2.5 3.5 6 3.5 10.5c0 2.8 1.4 4.6 3 5.6V20h11v-3.9c1.6-1 3-2.8 3-5.6C20.5 6 17.2 2.5 12 2.5z" fill="currentColor"/><circle cx="8.6" cy="11" r="2.2" fill="#0d1532"/><circle cx="15.4" cy="11" r="2.2" fill="#0d1532"/><path d="M12 13.5l-1.3 2.3h2.6z" fill="#0d1532"/><rect x="9" y="17" width="1.5" height="3" fill="#0d1532"/><rect x="13.5" y="17" width="1.5" height="3" fill="#0d1532"/></svg>',
  flag: '<svg viewBox="0 0 24 24"><rect x="4" y="2.5" width="2.2" height="19" rx="1" fill="currentColor"/><path d="M6.2 3.5h13l-3 4.2 3 4.3h-13z" fill="currentColor"/></svg>',
  boom: '<svg viewBox="0 0 24 24"><path d="M12 1.5l2.4 5.4 5.6-2.2-2.2 5.6 5.4 2.4-5.4 2.4 2.2 5.6-5.6-2.2L12 22.5l-2.4-5.4-5.6 2.2 2.2-5.6L.8 12.3l5.4-2.4L4 4.7l5.6 2.2z" fill="currentColor"/><circle cx="12" cy="12.3" r="3.6" fill="#0d1532"/></svg>',
  trophy: '<svg viewBox="0 0 24 24"><path d="M6 3h12v5.5c0 3.6-2.6 6.3-6 6.3S6 12.1 6 8.5z" fill="currentColor"/><path d="M6 5H2.8v1.8C2.8 9.3 4.6 11 6.8 11M18 5h3.2v1.8c0 2.5-1.8 4.2-4 4.2" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="10.8" y="14.5" width="2.4" height="3.5" fill="currentColor"/><rect x="7" y="18" width="10" height="3" rx="1" fill="currentColor"/></svg>',
  plane: '<svg viewBox="0 0 24 24"><path d="M21.5 11.2c.8 0 .8 1.6 0 1.6H15l-4.6 8H8l2.3-8H5.4L3.3 15.4H1.5l1.2-3.4-1.2-3.4h1.8l2.1 2.6h4.9L8 3.2h2.4l4.6 8z" fill="currentColor"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="M12 1.8l3.1 6.6 7.2.9-5.3 5 1.4 7.2L12 18l-6.4 3.5L7 14.3l-5.3-5 7.2-.9z" fill="currentColor"/></svg>',
};
const DAILY = [20, 30, 40, 50, 60, 80, 150];
const SUPPLY_MS = 4 * 3600e3;
const MPOOL = [
  { id: 'kill', t: n => `Destroy ${n} enemies`, ic: 'boom', g: [60, 120], r: [40, 70] },
  { id: 'wave', t: n => `Clear ${n} waves`, ic: 'flag', g: [5, 10], r: [35, 60] },
  { id: 'crit', t: n => `Land ${n} critical hits`, ic: 'target', g: [15, 30], r: [40, 65] },
  { id: 'boss', t: n => `Defeat ${n} boss${n > 1 ? 'es' : ''}`, ic: 'skull', g: [1, 2], r: [60, 100] },
  { id: 'win', t: n => `Win ${n} career level${n > 1 ? 's' : ''}`, ic: 'trophy', g: [1, 2], r: [50, 85] },
  { id: 'air', t: n => `Call ${n} airstrikes`, ic: 'plane', g: [2, 4], r: [35, 55] },
  { id: 'star', t: n => `Earn ${n} new star${n > 1 ? 's' : ''}`, ic: 'star', g: [1, 2], r: [45, 75] },
];

// ---------- state helpers ----------
function dailyState() { const t = dayNum(); if (META.dDay === t) return { ready: false, idx: (META.dStreak - 1) % 7 }; const keep = META.dDay === t - 1; return { ready: true, idx: keep ? META.dStreak % 7 : 0, keep } }
function rollMissions() {
  const t = dayNum(); if (META.mDay === t && META.ms.length) return;
  const R = mulberry(t * 7919), pool = MPOOL.slice(), out = [];
  while (out.length < 3) { const m = pool.splice(Math.floor(R() * pool.length), 1)[0], hard = R() < .4 ? 1 : 0; out.push({ id: m.id, goal: m.g[hard], r: m.r[hard], p: 0, done: 0 }) }
  META.mDay = t; META.ms = out; saveMeta();
}
const mDef = id => MPOOL.find(m => m.id === id);
function track(id, n) {
  if (!n || (typeof S !== 'undefined' && S && S.demo)) return; rollMissions(); let ch = 0;
  for (const m of META.ms) if (m.id === id && !m.done && m.p < m.goal) { m.p = Math.min(m.goal, m.p + n); ch = 1; if (m.p >= m.goal && typeof floater === 'function' && S && S.mode === 'play') floater(W / 2, 250, 'MISSION COMPLETE!', '#ffd23a', 1.2) }
  if (ch) { saveMeta(); metaDots() }
}
const supplyLeft = () => Math.max(0, META.supplyAt - Date.now());
const chestGoal = () => (META.chests + 1) * 6;
const chestReady = () => starTotal() >= chestGoal() && META.chests < 8;

// ---------- hooks into the game (wrap existing functions; no gameplay change) ----------
{
  const _ed = enemyDeath; enemyDeath = function (e, o) { if (e && e.d && e.d.boss) track('boss', 1); return _ed.apply(this, arguments) };
  const _cs = callStrike; callStrike = function () { const before = S.strikeCD; const r = _cs.apply(this, arguments); if (S.strikeCD !== before) track('air', 1); return r };
  const _cw = careerWin; careerWin = function () { const before = starTotal(); const r = _cw.apply(this, arguments); track('win', 1); track('star', starTotal() - before); setTimeout(() => metaNote('win'), 950); return r };
  const _so = showOver; showOver = function () { const r = _so.apply(this, arguments); metaNote('over'); return r };
  // kills, crits and cleared waves are read from the live game state a few times a second
  let lastS = null, lk = 0, lh = 0, wasWave = false;
  setInterval(() => {
    if (typeof S === 'undefined' || !S || S.demo) { lastS = S; return }
    if (S !== lastS) { lastS = S; lk = S.kills; lh = S.heads; wasWave = S.waveActive; return }
    if (S.kills > lk) { track('kill', S.kills - lk); lk = S.kills }
    if (S.heads > lh) { track('crit', S.heads - lh); lh = S.heads }
    if (wasWave && !S.waveActive && S.mode !== 'dying' && S.mode !== 'over') track('wave', 1);
    wasWave = S.waveActive;
  }, 250);
}

// ---------- menu buttons (top bar) ----------
const metaBar = (() => {
  const box = document.createElement('div'); box.className = 'metabar';
  box.innerHTML = `<button class="mb m_daily" data-m="daily" aria-label="Daily reward">${ICO.cal}<small class="ml">DAILY</small><i class="dot"></i></button>
    <button class="mb m_missions" data-m="missions" aria-label="Daily missions">${ICO.target}<small class="ml">MISSIONS</small><i class="dot"></i></button>
    <button class="mb m_supply" data-m="supply" aria-label="Supply drop">${ICO.crate}<small class="ml" id="supT">SUPPLY</small><i class="dot"></i></button>`;
  document.querySelector('#hub .chips').prepend(box);
  box.addEventListener('click', ev => { const b = ev.target.closest('.mb'); if (!b) return; SND.unlock(); SND.play('click'); openMeta(b.dataset.m) });
  return box;
})();
function metaDots() {
  rollMissions();
  const set = (m, on, txt) => { const b = metaBar.querySelector(`[data-m="${m}"]`); b.classList.toggle('ready', !!on); const l = b.querySelector('.ml'); if (l.textContent !== txt) l.textContent = txt };
  const d = dailyState().ready, nm = META.ms.filter(m => m.p >= m.goal && !m.done).length + (chestReady() ? 1 : 0), left = supplyLeft();
  set('daily', d, 'DAILY');
  set('missions', nm, 'MISSIONS');
  set('supply', left <= 0, left <= 0 ? 'SUPPLY' : fmtT(left));
}
const fmtT = ms => { const s = Math.ceil(ms / 1000), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return h ? `${h}h ${m}m` : `${m}m ${s % 60}s` };
setInterval(() => { if (!$('hub').classList.contains('hidden')) metaDots() }, 1000);

// ---------- popup ----------
const metaPop = (() => { const d = document.createElement('div'); d.id = 'metaPop'; d.className = 'hidden'; stage.append(d); return d })();
metaPop.addEventListener('click', ev => {
  if (ev.target === metaPop || ev.target.closest('[data-x]')) { closeMeta(); return }
  const b = ev.target.closest('button[data-claim]'); if (!b || b.disabled) return;
  const k = b.dataset.claim;
  if (k === 'daily') { const d = dailyState(); if (!d.ready) return; META.dStreak = (d.keep ? META.dStreak : 0) + 1; META.dDay = dayNum(); saveMeta(); give(DAILY[d.idx], b, () => openMeta('daily')) }
  else if (k === 'supply') { if (supplyLeft() > 0) return; const amt = Math.round(rand(25, 60) / 5) * 5; META.supplyAt = Date.now() + SUPPLY_MS; saveMeta(); give(amt, b, () => openMeta('supply')) }
  else if (k === 'chest') { if (!chestReady()) return; META.chests++; saveMeta(); give(60 + META.chests * 10, b, () => openMeta('missions')) }
  else { const m = META.ms[+k]; if (!m || m.done || m.p < m.goal) return; m.done = 1; saveMeta(); give(m.r, b, () => openMeta('missions')) }
});
function closeMeta() { metaPop.classList.add('hidden'); metaDots() }
function openMeta(kind) {
  rollMissions(); let body = '';
  if (kind === 'daily') {
    const d = dailyState(), cur = d.ready ? d.idx : -1, got = d.ready ? (d.keep ? META.dStreak % 7 : 0) : ((META.dStreak - 1) % 7) + 1;
    body = `<h2>DAILY REWARD</h2><p class="msub">Log in each day to collect. Day 7 is a supply chest.${META.dStreak > 1 && !d.ready ? ' Streak: ' + META.dStreak + ' days.' : ''}</p>
      <div class="days">${DAILY.map((v, i) => `<div class="day ${i < got ? 'got' : ''} ${i === cur ? 'now' : ''} ${i === 6 ? 'big' : ''}"><small>DAY ${i + 1}</small><span class="dic">${i === 6 ? ICO.crate : ICO.star}</span><b><span class="crc">C</span>${v}</b></div>`).join('')}</div>
      ${d.ready ? `<button class="btn" data-claim="daily">CLAIM <span class="crc">C</span> ${DAILY[d.idx]}</button>` : `<div class="mwait">Next reward in ${fmtT(864e5 - (Date.now() - new Date().getTimezoneOffset() * 6e4) % 864e5)}</div>`}`;
  } else if (kind === 'supply') {
    const left = supplyLeft();
    body = `<h2>SUPPLY DROP</h2><p class="msub">A crate of credits arrives every 4 hours.</p>
      <div class="crate ${left <= 0 ? '' : 'closed'}">${ICO.crate}</div>
      ${left <= 0 ? '<button class="btn" data-claim="supply">OPEN CRATE</button>' : `<div class="mwait">Next drop in <b>${fmtT(left)}</b></div>`}`;
  } else {
    const st = starTotal(), goal = chestGoal(), maxed = META.chests >= 8;
    body = `<h2>DAILY MISSIONS</h2><p class="msub">Three new missions every day. Rewards are upgrade credits.</p>
      <div class="mlist">${META.ms.map((m, i) => { const d = mDef(m.id), ok = m.p >= m.goal; return `<div class="mrow ${m.done ? 'done' : ok ? 'ok' : ''}"><span class="mi">${ICO[d.ic]}</span><div class="mt"><b>${d.t(m.goal)}</b><div class="mbar"><i style="width:${m.p / m.goal * 100}%"></i></div><small>${m.p} / ${m.goal}</small></div>
        ${m.done ? '<span class="mdone">✓ DONE</span>' : `<button class="btn small" data-claim="${i}" ${ok ? '' : 'disabled'}><span class="crc">C</span> ${m.r}</button>`}</div>` }).join('')}</div>
      <div class="mrow chest ${chestReady() ? 'ok' : ''}"><span class="mi">${ICO.trophy}</span><div class="mt"><b>${maxed ? 'All star chests opened!' : 'Star chest: earn ' + goal + ' career stars'}</b><div class="mbar"><i style="width:${maxed ? 100 : Math.min(100, st / goal * 100)}%"></i></div><small>${Math.min(st, goal)} / ${goal} ★</small></div>
        ${maxed ? '' : `<button class="btn small" data-claim="chest" ${chestReady() ? '' : 'disabled'}><span class="crc">C</span> ${70 + META.chests * 10}</button>`}</div>`;
  }
  metaPop.innerHTML = `<div class="mpanel m_${kind}"><button class="mx" data-x="1" aria-label="Close">✕</button>${body}</div>`;
  metaPop.classList.remove('hidden');
}
// claiming: show the amount in the panel, update the credits chip, then refresh the panel
function give(amt, fromEl, after) {
  CAR.cr += amt; saveCar(); SND.play('buy');
  if (fromEl) { const g = document.createElement('div'); g.className = 'mgot'; g.innerHTML = `+${amt} <span class="crc">C</span>`; fromEl.replaceWith(g) }
  hubChips(); const chip = $('crTxt').closest('.chip'); if (chip) { chip.classList.remove('bump'); void chip.offsetWidth; chip.classList.add('bump') }
  if (typeof renderUpg === 'function') renderUpg();
  setTimeout(() => { if (!metaPop.classList.contains('hidden')) after && after() }, 900);
}
// mission progress shown under the result panels so every run feels like it moves you forward
function metaNote(where) {
  rollMissions(); const id = where === 'win' ? 'win' : 'over', p = document.querySelector('#' + id + ' .panel'); if (!p) return;
  let n = p.querySelector('.mnote'); if (!n) { n = document.createElement('div'); n.className = 'mnote'; p.append(n) }
  const open = META.ms.filter(m => !m.done);
  n.innerHTML = open.length ? '<small>DAILY MISSIONS</small>' + open.map(m => `<div><span>${mDef(m.id).t(m.goal)}</span><b class="${m.p >= m.goal ? 'ok' : ''}">${m.p >= m.goal ? 'READY ✓' : m.p + '/' + m.goal}</b></div>`).join('') : '<small>ALL DAILY MISSIONS DONE. NEW ONES TOMORROW.</small>';
}

// first visit of the day: pop the daily reward open on the menu (not for brand-new players, who should go straight to level 1)
rollMissions(); metaDots();
setTimeout(() => { if (CAR.stars.some(v => v > 0) && dailyState().ready && !$('hub').classList.contains('hidden') && (typeof TUT === 'undefined' || !TUT.on)) openMeta('daily') }, 900);
{ const _ng = newGame; newGame = function () { metaPop.classList.add('hidden'); return _ng.apply(this, arguments) } }
