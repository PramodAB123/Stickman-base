'use strict';
// Career mode: chapters, levels, stars, credits and permanent upgrades (saved in this browser)
const CHAPTERS = [
  { id: 'desert', name: 'Desert Outpost', icon: '', col: '#ffb347' },
  { id: 'industrial', name: 'Frozen Foundry', icon: '', col: '#8fdcff' },
  { id: 'nature', name: 'Jungle Citadel', icon: '', col: '#73e38c' },
  { id: 'cyber', name: 'Inferno Core', icon: '', col: '#ff7a3a' },
  { id: 'volcanic', name: 'Volcanic Wastelands', icon: '', col: '#ff9a4a' },
  { id: 'crystal', name: 'Crystal Caverns', icon: '', col: '#c48cff' },
];
const NLV = CHAPTERS.length * 4;
const LEVELS = [];
for (let k = 1; k <= NLV; k++) {
  const ch = Math.floor((k - 1) / 4), bossLv = k % 4 === 0;
  LEVELS.push({
    k, ch, map: CHAPTERS[ch].id, waves: 4 + Math.floor((k - 1) / 3), off: Math.round((k - 1) * .65),
    boss: bossLv ? (k % 8 === 0 ? 'goliath_mech' : 'warlord_mech') : null, coins: k === 1 ? 160 : Math.round((100 + (k - 1) * 50 + (k - 1) * (k - 1) * 2) / 10) * 10, reward: 60 + k * 20
  });
}
// what a level throws at you (used for the preview)
function levelEnemies(L) { const top = L.off + L.waves, ord = id => UNLOCK[id] != null ? UNLOCK[id] : 100 + LATE[id].sv; const ids = Object.keys(UNLOCK).filter(id => UNLOCK[id] <= top).concat(Object.keys(LATE).filter(id => L.ch >= LATE[id].ch)).sort((a, b) => ord(b) - ord(a)).slice(0, 4); if (L.boss) ids.unshift(L.boss); return ids.slice(0, 4) }

const UPG = [
  { id: 'chest', ic: IC.bag, name: 'War Chest', desc: '+40 starting coins', max: 5, cost: [80, 160, 280, 440, 650] },
  { id: 'wall', ic: IC.bricks, name: 'Thick Walls', desc: '+10% base HP', max: 5, cost: [100, 200, 340, 520, 760] },
  { id: 'dmg', ic: IC.boom, name: 'Hot Rounds', desc: '+6% gun damage', max: 5, cost: [120, 240, 400, 600, 880] },
  { id: 'rate', ic: IC.bolt, name: 'Fast Hands', desc: '+5% fire rate', max: 5, cost: [120, 240, 400, 600, 880] },
  { id: 'bounty', ic: IC.coins, name: 'Bounty Hunter', desc: '+8% coins per kill', max: 5, cost: [90, 180, 320, 500, 720] },
];
const CAR = Object.assign({ stars: Array(NLV).fill(0), cr: 0, up: {}, sel: 0, own: [] }, store.get('career', {}));
if (!Array.isArray(CAR.own)) CAR.own = [];
// premium guns are usable in battle only after they are bought in the Armory
const owned = id => !WMAP[id].prem || CAR.own.includes(id);
if (CAR.stars.length < NLV) CAR.stars = CAR.stars.concat(Array(NLV - CAR.stars.length).fill(0));
const saveCar = () => store.set('career', CAR);
const perk = id => CAR.up[id] || 0;
// TESTING: true opens every level. Set to false for the real release.
const UNLOCK_ALL = false;
// a chapter opens once the previous chapter has CH_NEED stars (out of 12)
const CH_NEED = 10;
const chStars = c => CAR.stars.slice(c * 4, c * 4 + 4).reduce((a, b) => a + b, 0);
const chapterUnlocked = c => UNLOCK_ALL || c === 0 || (chapterUnlocked(c - 1) && chStars(c - 1) >= CH_NEED);
// inside a chapter, each level needs a star on the one before it
function unlocked(i) { if (UNLOCK_ALL || i === 0) return true; if (!chapterUnlocked(Math.floor(i / 4))) return false; return i % 4 === 0 || (unlocked(i - 1) && CAR.stars[i - 1] > 0) }
// clear stars left on levels the player can't reach (e.g. saved while testing with UNLOCK_ALL)
if (!UNLOCK_ALL) { let fixed = false; for (let i = 0; i < NLV; i++) if (CAR.stars[i] && !unlocked(i)) { CAR.stars[i] = 0; fixed = true } if (fixed) saveCar() }
const OBJ = ['Complete the level', 'Keep base HP above 50%', 'No gunner knocked out'];
const starTotal = () => CAR.stars.reduce((a, b) => a + b, 0);
function nextLevel() { let last = 0; for (let i = 0; i < NLV; i++) { if (!unlocked(i)) break; last = i; if (!CAR.stars[i]) return i } return last }

// hooks used by the game
const careerOn = () => S && S.career;
function careerWave() { return S.wave - S.career.off }
function careerBossWave() { return careerOn() && S.career.boss && careerWave() === S.career.waves }
function careerWin() {
  const L = S.career, i = L.k - 1, hpOk = S.wallHP / S.wallMax >= .5, fewOk = !S.kos;
  const got = 1 + (hpOk ? 1 : 0) + (fewOk ? 1 : 0), old = CAR.stars[i], first = old === 0;
  const earn = Math.round(L.reward * (first ? 1 : .35)) + Math.max(0, got - old) * 25;
  CAR.stars[i] = Math.max(old, got); CAR.cr += earn; if (first && i < NLV - 1 && unlocked(i + 1)) CAR.sel = i + 1; saveCar();
  S.mode = 'won'; hudHide(); SND.play('clear');
  const st = $('winStars'); st.innerHTML = [0, 1, 2].map(j => `<i class="${j < got ? 'on' : ''}" style="animation-delay:${.25 + j * .3}s">★</i>`).join('');
  $('winLvl').textContent = 'CHAPTER ' + (L.ch + 1) + ' · LEVEL ' + L.k;
  $('winObj').innerHTML = [[OBJ[0], true], [OBJ[1], hpOk], [OBJ[2], fewOk]].map(([t, ok]) => `<div class="${ok ? 'ok' : ''}">${ok ? '★' : '☆'} ${t}</div>`).join('');
  $('winCr').textContent = '+' + earn; $('nextBtn').classList.toggle('hidden', i >= NLV - 1 || !unlocked(i + 1));
  setTimeout(() => showScreen('win'), 900);
}
