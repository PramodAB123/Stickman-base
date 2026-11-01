'use strict';
// ---------- enemy roster ----------
// h: on-screen height · beh: behaviour · crit: weak spot (fraction of sprite) · muz: where shots come from
const ET = {
  rifle_grunt: { name: 'Rifle Grunt', h: 64, hp: 84, spd: 62, dmg: 9, rate: 1.5, coin: 6, cost: 1, w: 3, beh: 'shoot', crit: [.5, .15], muz: [.03, .6], shot: 'bullet', stopR: [160, 300] },
  blade_raider: { name: 'Blade Raider', h: 58, hp: 22, spd: 125, dmg: 6, rate: .55, coin: 7, cost: 1.1, w: 2, beh: 'melee', crit: [.37, .12] },
  heavy_gunner: { name: 'Heavy Gunner', h: 74, hp: 70, spd: 46, dmg: 12, rate: 2.6, coin: 15, cost: 2.6, w: 1.2, beh: 'shoot', crit: [.5, .12], muz: [.03, .68], shot: 'bullet' },
  shield_brute: { name: 'Shield Brute', h: 66, hp: 50, spd: 44, dmg: 10, rate: 1.7, coin: 15, cost: 2.6, w: 1.2, beh: 'shoot', crit: [.62, .15], shield: 90, muz: [.3, .62], shot: 'bullet', stopR: [110, 220] },
  bomb_runner: { name: 'Bomb Runner', h: 60, hp: 26, spd: 92, dmg: 55, rate: 1, coin: 10, cost: 2, w: 1.1, beh: 'suicide', crit: [.45, .3] },
  mech_walker: { name: 'Mech Walker', h: 80, hp: 190, spd: 34, dmg: 28, rate: 1.4, coin: 28, cost: 4.4, w: .9, beh: 'melee', crit: [.45, .3] },
  scout_drone: { name: 'Scout Drone', h: 26, hp: 18, spd: 135, dmg: 12, rate: 1, coin: 6, cost: .9, w: 1.4, beh: 'ram', fly: 1, alt: [260, 380], crit: [.4, .6] },
  wing_raider: { name: 'Wing Raider', h: 54, hp: 42, spd: 78, dmg: 14, rate: 3, coin: 16, cost: 3, w: 1, beh: 'bomb', fly: 1, alt: [200, 300], crit: [.48, .3] },
  stealth_assassin: { name: 'Stealth Assassin', h: 62, hp: 60, spd: 82, dmg: 16, rate: .8, coin: 18, cost: 2.8, w: .9, beh: 'melee', cloak: 1, crit: [.45, .15] },
  healer_support: { name: 'Healer Support', h: 72, hp: 80, spd: 44, dmg: 8, rate: 1.2, coin: 20, cost: 3.6, w: .7, beh: 'heal', crit: [.55, .3] },
  hover_bike: { name: 'Hover Bike', h: 46, hp: 45, spd: 150, dmg: 30, rate: 1, coin: 12, cost: 2.2, w: 1, beh: 'ram', fly: 1, alt: [548, 556], crit: [.5, .12] },
  spiked_beast: { name: 'Spiked Beast', h: 66, hp: 120, spd: 66, dmg: 22, rate: 1, coin: 22, cost: 3.4, w: .9, beh: 'charge', crit: [.2, .5] },
  attack_drone: { name: 'Attack Drone', h: 40, hp: 40, spd: 84, dmg: 10, rate: 2.2, coin: 14, cost: 2.6, w: 1, beh: 'shoot', fly: 1, alt: [180, 280], crit: [.35, .6], muz: [.02, .55], shot: 'bullet' },
  mind_controller: { name: 'Mind Controller', h: 68, hp: 90, spd: 40, dmg: 8, rate: 6, coin: 26, cost: 4, w: .6, beh: 'mind', crit: [.4, .13] },
  turret_carrier: { name: 'Turret Carrier', h: 78, hp: 160, spd: 36, dmg: 22, rate: 3, coin: 30, cost: 5, w: .7, beh: 'shoot', crit: [.5, .45], muz: [.2, .1], shot: 'shell' },
  bomber_drone: { name: 'Bomber Drone', h: 56, hp: 90, spd: 52, dmg: 30, rate: 3.5, coin: 26, cost: 4.5, w: .8, beh: 'bomb', fly: 1, alt: [170, 250], crit: [.4, .45] },
  juggernaut: { name: 'Juggernaut', h: 112, hp: 1080, spd: 24, dmg: 45, rate: 1.6, coin: 55, cost: 8, w: .6, beh: 'melee', crit: [.5, .25] },
  sky_reaper: { name: 'Sky Reaper', h: 72, hp: 260, spd: 60, dmg: 20, rate: 2, coin: 45, cost: 7, w: .6, beh: 'shoot', fly: 1, alt: [150, 230], crit: [.32, .4], muz: [.05, .45], shot: 'bullet' },
  warlord_mech: { name: 'Warlord Mech', h: 200, hp: 820, spd: 22, dmg: 55, rate: 1.6, coin: 250, cost: 0, w: 0, beh: 'melee', boss: 1, crit: [.43, .25], muz: [.12, .15], shot: 'shell', srate: 4.5, sdmg: 16 },
  void_dragon: { name: 'Void Dragon', h: 230, hp: 880, spd: 40, dmg: 18, rate: 2.4, coin: 320, cost: 0, w: 0, beh: 'bomb', boss: 1, fly: 1, alt: [200, 240], crit: [.42, .25], muz: [.4, .3] },
};
const UNLOCK = {
  rifle_grunt: 1, blade_raider: 2, heavy_gunner: 3, shield_brute: 4, bomb_runner: 5, mech_walker: 5, scout_drone: 6, wing_raider: 7, stealth_assassin: 8,
  healer_support: 9, hover_bike: 10, spiked_beast: 11, attack_drone: 12, mind_controller: 13, turret_carrier: 14, bomber_drone: 16, juggernaut: 18, sky_reaper: 20
};
// overall toughness: raise these to make every enemy stronger
const FAST = 1.2, tough = n => clamp(2.2 - .12 * n, 1.15, 2.2);
const hpMul = n => 1 + .22 * (n - 1) + .02 * (n - 1) * (n - 1) + .0015 * (n - 1) * (n - 1) * (n - 1);
const bossFor = n => n % 10 === 0 ? 'void_dragon' : 'warlord_mech';
for (const k in ET) { const d = ET[k]; d.id = k; d.img = loadImg('assets/enemies/' + k + '.webp'); d.aspect = ENEMY_SIZE[k][0] / ENEMY_SIZE[k][1] }

let uid = 0;
function spawnEnemy(type, demo) {
  const d = ET[type], n = Math.max(1, S.wave), hm = demo ? 1 : hpMul(n) * (d.boss ? .8 : 1) * (d.boss ? 1.15 : tough(n)) * (S.career ? 1 / (1 + .07 * Math.max(0, n - 6)) : 1), sm = 1 + Math.min(.3, .015 * n);
  const sc = d.boss ? 1 : rand(.94, 1.06), h = d.h * sc, w = h * d.aspect;
  const e = {
    id: ++uid, type, d, x: W + w / 2 + rand(10, 70), y: GY, w, h, s: h / 60, hp: d.hp * hm, maxHp: d.hp * hm, spd: d.spd * rand(.9, 1.1) * (demo ? 1 : sm * FAST), state: 'walk', phase: rand(0, 6.28),
    flash: 0, atkT: rand(.3, 1), abT: rand(1, 3), sw: 0, kx: 0, shield: d.shield ? d.shield * hm : 0, shieldMax: d.shield ? d.shield * hm : 0, t: rand(0, 9), dead: false, demo: !!demo, cloak: 0, age: 0, L: { headOnly: true }
  };
  e.contactX = WALL.x1 + w * .42 + rand(2, 26);
  if (d.beh === 'shoot' || d.beh === 'mind') e.stopX = WALL.x1 + rand(150, 300);
  if (d.beh === 'heal') e.stopX = WALL.x1 + rand(110, 220);
  if (d.stopR) e.stopX = WALL.x1 + rand(d.stopR[0], d.stopR[1]);
  if (d.fly) { e.baseY = rand(d.alt[0], d.alt[1]); e.y = e.baseY; if (d.beh === 'bomb') e.stopX = WALL.x1 + rand(90, 230); if (d.beh === 'shoot') e.stopX = WALL.x1 + rand(170, 320) }
  if (d.boss && d.fly) e.stopX = WALL.x1 + rand(180, 260);
  computeBody(e); S.enemies.push(e); return e;
}
// hitboxes, weak spot and gun position from the sprite's size
function computeBody(e) {
  const d = e.d, w = e.w, h = e.h, fly = d.fly, x0 = e.x - w / 2, y0 = fly ? e.y - h / 2 : e.y - h, bob = e.bob || 0;
  const P = (fx, fy) => ({ x: x0 + fx * w - (e.sw * 8), y: y0 + fy * h + bob });
  const B = [];
  if (w > h * 1.15) { const a = P(.22, .55), b = P(.78, .55); B.push([a.x, a.y, b.x, b.y, h * .34, 'body']) }
  else { const a = P(.5, .32), b = P(.5, .74); B.push([a.x, a.y, b.x, b.y, w * .33, 'body']) }
  if (e.shield > 0) { const a = P(.22, .25), b = P(.22, .9); B.unshift([a.x, a.y, b.x, b.y, w * .17, 'shield']) }
  e.B = B; const c = P(.5, .55); e.core = c; e.topY = y0 + bob;
  const cr = P(d.crit[0], d.crit[1]); e.crit = { x: cr.x, y: cr.y, r: Math.max(5, Math.min(w, h) * .14) };
  if (d.muz) e.muz = P(d.muz[0], d.muz[1]);
}
function updateEnemy(e, dt) {
  const d = e.d;
  e.t += dt; e.age = (e.age || 0) + dt; e.flash = Math.max(0, e.flash - dt); e.sw = Math.max(0, e.sw - dt * 4);
  e.x += e.kx * dt; e.kx *= Math.exp(-7 * dt); e.x = Math.min(e.x, W + 160);
  const ground = !d.fly;
  let slow = 1;
  if (ground && S.spikes > 0 && e.x > WALL.x1 && e.x < WALL.x1 + 190) {
    slow = .55;
    damageEnemy(e, (8 + 10 * S.spikes) * dt * hpMul(Math.max(1, S.wave)) * .5, { dot: true }); if (e.dead) return
  }
  if (e.slowT > 0) { e.slowT -= dt; slow *= 1 - e.slowF; if (Math.random() < dt * 10) S.parts.push({ type: 'chip', x: e.core.x + rand(-.4, .4) * e.w, y: e.core.y + rand(-.4, .3) * e.h, vx: rand(-30, 30), vy: rand(-60, 0), life: .5, max: .5, size: rand(2, 3.5), g: 300, col: '#bff2ff' }) }
  if (e.burnT > 0) { e.burnT -= dt; damageEnemy(e, e.burnD * dt, { dot: true }); if (Math.random() < dt * 18) S.parts.push({ type: 'fire', x: e.core.x + rand(-.3, .3) * e.w, y: e.core.y + rand(-.3, .2) * e.h, vx: rand(-20, 20), vy: rand(-110, -50), life: rand(.25, .45), max: .45, size: rand(3, 7) * Math.sqrt(e.s), g: 0 }); if (e.dead) return }
  if (e.acidT > 0) { e.acidT -= dt; damageEnemy(e, e.acidD * dt, { dot: true }); if (Math.random() < dt * 10) S.parts.push({ type: 'drop', x: e.core.x + rand(-.3, .3) * e.w, y: e.core.y, vx: rand(-15, 15), vy: rand(0, 40), life: .6, max: .6, size: rand(2, 3.5), g: 700, col: '#9cff3a' }); if (e.dead) return }
  if (ground) { for (const m of S.mines) { if (!m.used && Math.abs(m.x - e.x) < e.w * .3 + 6) { m.used = true; explode(m.x, GY - 6, 95, 90 * hpMul(Math.max(1, S.wave)) * .6 + 40); } } }
  if (e.dead) return;
  if ((S.mode === 'dying' || S.mode === 'over') && e.state !== 'cheer') e.state = 'cheer';
  // special abilities
  if (d.cloak && e.state !== 'cheer') { e.abT -= dt; if (e.abT <= 0) { if (e.cloak > 0) { e.cloak = 0; e.abT = rand(2.2, 3.2) } else { e.cloak = 1; e.abT = rand(1.8, 2.6); smokePuff(e.core.x, e.core.y, '#5a3a7a') } } }
  if (d.beh === 'heal' && e.state !== 'cheer') {
    e.abT -= dt; if (e.abT <= 0) {
      e.abT = 1.6; let n = 0;
      for (const o of S.enemies) { if (n >= 3) break; if (o.dead || o === e || o.hp >= o.maxHp || o.d.boss) continue; if (Math.hypot(o.core.x - e.core.x, o.core.y - e.core.y) < 170) { o.hp = Math.min(o.maxHp, o.hp + o.maxHp * .05); n++; S.parts.push({ type: 'plus', x: o.core.x, y: o.topY, vx: 0, vy: -40, life: .8, max: .8, g: 0 }) } }
      if (n) S.parts.push({ type: 'ring', x: e.core.x, y: e.core.y, life: .5, max: .5, size: 110, g: 0, col: '110,255,120' })
    }
  }
  if (d.beh === 'mind' && e.state === 'shoot') {
    e.abT -= dt; if (e.abT <= 0) {
      e.abT = d.rate * rand(.8, 1.2); const tg = S.slots.filter(s => s.w && !s.down && !s.ko && !(s.stun > 0));
      if (tg.length) { const s = tg[Math.floor(Math.random() * tg.length)]; s.stun = 3; const J = gunnerJ(s); S.parts.push({ type: 'bolt', pts: [{ x: e.crit.x, y: e.crit.y }, { x: J.head.x, y: J.head.y }], x: e.x, y: e.y, life: .35, max: .35, g: 0, col: '190,90,255' }); floater(J.head.x, J.head.y - 30, 'STUNNED!', '#d08cff', .8); SND.play('zap') }
    }
  }
  if (d.boss && d.shot === 'shell' && e.state !== 'cheer' && e.x < W - 60) { e.abT -= dt; if (e.abT <= 0) { e.abT = d.srate * rand(.8, 1.2); fireShell(e) } }
  switch (e.state) {
    case 'walk': {
      let sp = e.spd * slow;
      if (d.beh === 'charge') { const c = (Math.sin(e.t * 1.6) + 1) / 2; sp *= .5 + c * 1.6 }
      e.x -= sp * dt; e.phase += dt * sp * .11 / Math.sqrt(e.s);
      if (!d.fly) {
        const sg = Math.sin(e.phase) > 0; if (sg !== e.ls) {
          e.ls = sg; const R = RIG[d.id];
          if (e.x < W + 20) {
            S.parts.push({ type: 'smoke', x: e.x + rand(-.2, .2) * e.w, y: GY - 3, vx: rand(10, 40), vy: rand(-20, -5), life: .35, max: .35, size: rand(3, 5) * Math.sqrt(e.s), g: 0, col: '#b9a58c' });
            if (R && R.stomp && !S.demo) { S.shake = Math.max(S.shake, d.boss ? 5 : 3); SND.play('thud') }
          }
        }
      }
      if (d.fly && d.beh !== 'ram') e.y = e.baseY + Math.sin(e.t * 2) * 8;
      if (d.fly && d.beh === 'ram') { e.y = e.baseY + Math.sin(e.t * 3) * 6; if (e.x <= e.contactX + 10) { ramBlow(e); return } }
      else if ((d.beh === 'bomb') && e.x <= e.stopX) { e.state = 'hover'; e.atkT = rand(.6, 1.5) }
      else if ((d.beh === 'shoot' || d.beh === 'mind' || d.beh === 'heal') && e.stopX && e.x <= e.stopX) { e.state = 'shoot'; e.atkT = rand(.8, 1.6) }
      else if (!d.fly && e.x <= e.contactX) {
        e.x = e.contactX;
        if (d.beh === 'suicide') { ramBlow(e); return }
        e.state = 'attack'; e.atkT = rand(.2, .6); S.reached = (S.reached || 0) + 1
      }
      break
    }
    case 'attack':
      if (e.x > e.contactX + 8) { e.state = 'walk'; break }
      e.atkT -= dt; if (e.atkT <= 0) { e.atkT = d.rate; e.sw = 1; { const dd = d.dmg * (S.demo ? 0 : 1) * (1 + .04 * (S.wave - 1)); hitWall(dd, WALL.x1 + rand(-4, 2), GY - rand(.2, .7) * e.h); if (Math.random() < .35) hurtGunner(nearGunner(WALL.x1, GY - 60, 200), dd * .6) } if (e.cloak) e.cloak = 0 }
      break;
    case 'shoot':
      if (e.x > e.stopX + 30) { e.state = 'walk'; break }
      if (d.fly) e.y = e.baseY + Math.sin(e.t * 2) * 8;
      if (d.beh === 'shoot') { e.atkT -= dt; if (e.atkT <= 0) { e.atkT = d.rate * rand(.85, 1.15); fireShell(e) } }
      if (d.beh === 'heal' && !S.enemies.some(o => !o.dead && o !== e && o.x < e.x + 60)) { e.state = 'walk'; e.stopX = 0 }
      break;
    case 'hover':
      e.y = e.baseY + Math.sin(e.t * 2) * 10; e.x += Math.sin(e.t * .8) * 12 * dt;
      if (e.x > e.stopX + 60) e.x -= e.spd * dt;
      e.atkT -= dt; if (e.atkT <= 0) { e.atkT = d.rate * rand(.85, 1.2); dropBomb(e) }
      break;
  }
  if (!d.fly) { e.bob = e.state === 'walk' ? -Math.abs(Math.sin(e.phase)) * e.h * .035 : 0 } else e.bob = 0;
  if (d.fly && !d.boss && Math.random() < dt * 14) S.parts.push({ type: 'smoke', col: '#6a5a78', x: e.x + e.w * .4, y: e.y, vx: rand(20, 60), vy: rand(-10, 20), life: .3, max: .3, size: rand(3, 6), g: 0 });
  if (d.beh === 'suicide' && Math.random() < dt * 20) { S.parts.push({ type: 'spark', x: e.x + e.w * .1, y: e.topY + 4, vx: rand(-80, 80), vy: rand(-160, -40), life: .2, max: .25, size: 2, g: 300, col: '#ffd23f' }) }
  computeBody(e);
}
function smokePuff(x, y, col) { for (let i = 0; i < 8; i++)S.parts.push({ type: 'smoke', x: x + rand(-14, 14), y: y + rand(-14, 14), vx: rand(-40, 40), vy: rand(-50, 0), life: .6, max: .6, size: rand(8, 14), g: 0, col }) }
function ramBlow(e) { e.dead = true; explode(e.core.x, e.core.y, 90, 40); hitWall(e.d.dmg * (1 + .04 * (S.wave - 1)) * (S.demo ? 0 : 1), WALL.x1, Math.min(GY - 40, e.y)); enemyDeath(e, { ix: 300 }); }
function fireShell(e) {
  const m = e.muz || e.core, shell = e.d.shot === 'shell', tx = rand(WALL.x1 - 40, WALL.x1 - 4), ty = WALL.top + rand(-6, 80), g = shell ? 480 : 120; e.sw = 1;
  const T = Math.abs(tx - m.x) / (shell ? rand(420, 500) : rand(700, 800));
  S.eproj.push({ kind: shell ? 'shell' : 'bolt', x: m.x, y: m.y, vx: (tx - m.x) / T, vy: (ty - m.y) / T - .5 * g * T, g, dmg: (e.d.sdmg || e.d.dmg) * (1 + .05 * (S.wave - 1)) });
  if (shell) for (let i = 0; i < 5; i++)S.parts.push({ type: 'smoke', x: m.x, y: m.y, vx: rand(-60, 10), vy: rand(-40, 10), life: .6, max: .6, size: rand(6, 10), g: 0 });
  S.parts.push({ type: 'flash', x: m.x, y: m.y, a: Math.atan2(ty - m.y, tx - m.x), life: .06, max: .06, size: shell ? 1.2 : .8, g: 0 }); SND.play(shell ? 'thud' : 'smg');
}
function dropBomb(e) {
  const dragon = e.type === 'void_dragon', src = dragon && e.muz ? e.muz : { x: e.core.x, y: e.core.y + e.h * .25 }, tx = rand(WALL.x0 + 30, WALL.x1 - 10), ty = WALL.top + 10, g = dragon ? 260 : 600;
  const T = clamp(Math.abs(tx - src.x) / (dragon ? 420 : 260), .5, 1.6);
  S.eproj.push({ kind: dragon ? 'fireball' : 'bomb', x: src.x, y: src.y, vx: (tx - src.x) / T, vy: (ty - src.y) / T - .5 * g * T, g, dmg: e.d.dmg * (1 + .05 * (S.wave - 1)), rot: 0 });
  if (dragon) { e.sw = 1; SND.play('flame') }
}
// ---------- animation rigs ----------
// leg: legs below y (fraction) between x0..x1 swing as two halves · quad: n leg strips · wing: outer parts flap around pivot
// rotor/jet: effects drawn on top · aura: pulsing glow colour
var RIG = {
  rifle_grunt: { k: 'leg', y: .7, L: [[.26, .62], [.62, 1]], amp: .07, sw: .03 },
  blade_raider: { k: 'leg', y: .72, L: [[.16, .47], [.47, .86]], amp: .07, sw: .03 },
  heavy_gunner: { k: 'leg', y: .76, L: [[.22, .59], [.59, 1]], amp: .05, sw: .02 },
  shield_brute: { k: 'leg', y: .76, L: [[.56, .97]], amp: .06, sw: .02 },
  bomb_runner: { k: 'leg', y: .68, L: [[.26, .62], [.62, 1]], amp: .08, sw: .03 },
  stealth_assassin: { k: 'leg', y: .66, L: [[.1, .43], [.43, .92]], amp: .07, sw: .03 },
  healer_support: { k: 'leg', y: .72, L: [[.34, .66], [.66, 1]], amp: .05, sw: .02, aura: '110,255,140' },
  mind_controller: { k: 'quad', y: .62, amp: .1, aura: '190,90,255' },
  juggernaut: { k: 'leg', y: .78, L: [[.2, .5], [.5, .93]], amp: .04, sw: .015, stomp: 1 },
  warlord_mech: { k: 'leg', y: .76, L: [[.24, .5], [.5, .79]], amp: .035, sw: .012, stomp: 1, aura: '255,80,40' },
  mech_walker: { k: 'quad', y: .5, amp: .22 },
  turret_carrier: { k: 'quad', y: .48, amp: .22 },
  spiked_beast: { k: 'quad', y: .66, amp: .26 },
  wing_raider: { k: 'wing', a: .37, b: .63, py: .38, amp: .38, fr: 10 },
  sky_reaper: { k: 'wing', a: .29, b: .56, py: .35, amp: .3, fr: 7, aura: '255,60,60' },
  void_dragon: { k: 'wing', a: .33, b: .65, py: .32, amp: .26, fr: 4, aura: '200,80,255' },
  scout_drone: { k: 'rotor', pts: [[.12, .1, .11], [.88, .1, .11]] },
  attack_drone: { k: 'jet', pts: [[.97, .42]] },
  bomber_drone: { k: 'jet', pts: [[.97, .33]] },
  hover_bike: { k: 'jet', pts: [[.9, .72]] },
};
// each rig part is pre-cut once into its own full-size canvas (no sub-rect sampling, so no seams)
const partCache = {};
function rigParts(d, col) {
  const k = d.id + (col || ''); if (partCache[k]) return partCache[k];
  const R = RIG[d.id], src = col ? tinted(d, col) : d.img, iw = d.img.naturalWidth, ih = d.img.naturalHeight; if (!iw) return null;
  const cut = (a, b, c, e) => {
    const cv = document.createElement('canvas'); cv.width = iw; cv.height = ih; const x = cv.getContext('2d'); x.beginPath();
    x.rect(Math.floor(a * iw) - 1, Math.floor(b * ih) - 1, Math.ceil((c - a) * iw) + 2, Math.ceil((e - b) * ih) + 2); x.clip(); x.drawImage(src, 0, 0); return cv
  };
  const P = { legs: [], rest: [] };
  if (R.k === 'leg') {
    P.legs = R.L.map(([a, b]) => cut(a, R.y, b, 1));
    // everything except the leg rectangles stays still
    const cv = document.createElement('canvas'); cv.width = iw; cv.height = ih; const x = cv.getContext('2d'); x.drawImage(src, 0, 0); x.globalCompositeOperation = 'destination-out';
    for (const [a, b] of R.L) x.fillRect(Math.floor(a * iw) + 1, Math.ceil(R.y * ih) + 2, Math.floor((b - a) * iw) - 2, ih); P.rest = [cv]
  }
  else if (R.k === 'quad') { P.band = cut(0, R.y, 1, 1); P.rest = [cut(0, 0, 1, R.y + .02)] }
  else if (R.k === 'wing') { P.wl = cut(0, 0, R.a, 1); P.wr = cut(R.b, 0, 1, 1); P.rest = [cut(R.a, 0, R.b, 1)] }
  return partCache[k] = P;
}
function drawRig(g, e, R, col) {
  const w = e.w, h = e.h, src = col ? tinted(e.d, col) : e.d.img;
  const P = R && R.k !== 'rotor' && R.k !== 'jet' ? rigParts(e.d, col) : null;
  if (!P) { g.drawImage(src, -w / 2, -h, w, h); return }
  const walk = e.state === 'walk' && !e.d.fly, ph = e.phase, D = (c, dx, dy) => g.drawImage(c, -w / 2 + dx, -h + dy, w, h);
  if (R.k === 'leg') { const s = Math.sin(ph); R.L.forEach((L, i) => { const sg = i % 2 ? -1 : 1; D(P.legs[i], walk ? Math.cos(ph) * R.sw * w * sg : 0, walk ? -Math.max(0, s * sg) * R.amp * h : 0) }) }
  else if (R.k === 'quad') {
    const ty = -h + R.y * h, sk = walk ? Math.sin(ph) * R.amp : Math.sin(e.t * 2) * R.amp * .15, sq = walk ? 1 - Math.abs(Math.cos(ph)) * .06 : 1;
    g.save(); g.translate(0, ty); g.transform(1, 0, sk, sq, 0, 0); g.drawImage(P.band, -w / 2, -R.y * h, w, h); g.restore()
  }
  else if (R.k === 'wing') {
    const f = Math.sin(e.t * R.fr + e.phase), ang = f * R.amp, sq = 1 - .18 * Math.abs(f), py = -h + R.py * h;
    for (const [c, px, sg] of [[P.wl, R.a, 1], [P.wr, R.b, -1]]) { g.save(); g.translate(-w / 2 + px * w, py); g.rotate(ang * sg); g.scale(1, sq); g.drawImage(c, -px * w, -R.py * h, w, h); g.restore() }
  }
  for (const c of P.rest) D(c, 0, 0);
}
function drawEnemy(g, e) {
  const d = e.d, im = d.img; if (!im.complete || !im.naturalWidth) return;
  const R = RIG[d.id], melee = e.state === 'attack', sh = e.state === 'shoot' || e.state === 'hover';
  const lunge = melee ? Math.sin(Math.min(1, e.sw) * Math.PI) * e.w * .12 : 0, recoil = sh ? e.sw * 6 * Math.sqrt(e.s) : 0;
  const x0 = e.x - e.w / 2 - lunge + recoil, y0 = (d.fly ? e.y - e.h / 2 : e.y - e.h) + (e.bob || 0);
  if (!d.fly) { g.fillStyle = 'rgba(30,10,25,.3)'; g.beginPath(); g.ellipse(e.x, GY + 2, e.w * .42 * (1 - (e.bob || 0) / e.h), 5 * Math.sqrt(e.s), 0, 0, 7); g.fill() }
  else if (e.y > GY - 120) { g.fillStyle = 'rgba(30,10,25,.18)'; g.beginPath(); g.ellipse(e.x, GY + 2, e.w * .3, 4, 0, 0, 7); g.fill() }
  const alpha = (e.cloak ? .16 + .06 * Math.sin(e.t * 20) : 1) * Math.min(1, (e.age || 0) * 4);
  if (R && R.aura && !e.cloak) {
    const r = Math.max(e.w, e.h) * .62, pu = .22 + .1 * Math.sin(e.t * 4), c = e.core, gr = g.createRadialGradient(c.x, c.y, 0, c.x, c.y, r);
    gr.addColorStop(0, 'rgba(' + R.aura + ',' + pu + ')'); gr.addColorStop(1, 'rgba(' + R.aura + ',0)'); g.fillStyle = gr; g.beginPath(); g.arc(c.x, c.y, r, 0, 7); g.fill()
  }
  let tilt = d.fly ? Math.sin(e.t * 2.2) * .05 - (e.state === 'walk' ? .06 : 0) : (e.state === 'walk' ? Math.sin(e.phase * 2) * .02 - .03 : 0);
  if (melee) tilt -= Math.sin(Math.min(1, e.sw) * Math.PI) * .16; if (sh) tilt += e.sw * .07;
  const q = e.flash > 0 ? e.flash / .08 : 0, br = (melee || sh || e.state === 'cheer') ? Math.sin(e.t * 3.4) * .018 : 0;
  g.save(); g.globalAlpha = alpha; g.translate(x0 + e.w / 2, y0 + e.h); g.rotate(tilt); g.scale(1 + .08 * q, 1 - .08 * q + br);
  drawRig(g, e, R);
  const fx = e.flash > 0 ? '#ffffff' : e.slowT > 0 ? '#8fe8ff' : e.acidT > 0 ? '#9cff3a' : e.burnT > 0 ? '#ff7a2a' : null;
  if (fx) { g.globalAlpha = alpha * (e.flash > 0 ? .45 : .28); drawRig(g, e, R, fx) }
  if (R && !e.cloak && (R.k === 'rotor' || R.k === 'jet')) {
    g.globalAlpha = alpha; g.globalCompositeOperation = 'lighter';
    for (const p of R.pts) {
      const px = -e.w / 2 + p[0] * e.w, py = -e.h + p[1] * e.h;
      if (R.k === 'rotor') {
        const r = p[2] * e.w * 1.4; g.fillStyle = 'rgba(200,220,255,.28)'; g.beginPath(); g.ellipse(px, py, r, r * .16, 0, 0, 7); g.fill();
        g.strokeStyle = 'rgba(240,250,255,.4)'; g.lineWidth = 1; const c = Math.cos(e.t * 55) * r; g.beginPath(); g.moveTo(px - c, py); g.lineTo(px + c, py); g.stroke()
      }
      else {
        const L = (12 + Math.random() * 8) * Math.sqrt(e.s), hh = 4 * Math.sqrt(e.s); const gr = g.createLinearGradient(px, 0, px + L, 0); gr.addColorStop(0, 'rgba(255,250,210,.95)'); gr.addColorStop(.35, 'rgba(255,150,60,.8)'); gr.addColorStop(1, 'rgba(255,60,30,0)');
        g.fillStyle = gr; g.beginPath(); g.moveTo(px - 2, py - hh); g.lineTo(px + L, py); g.lineTo(px - 2, py + hh); g.closePath(); g.fill()
      }
    }
    g.globalCompositeOperation = 'source-over'
  }
  g.restore();
  if (e.cloak) return;
  if (!d.boss && e.hp < e.maxHp) { const w = Math.max(34, Math.min(70, e.w * .6)), x = e.core.x - w / 2, y = e.topY - 8; g.fillStyle = 'rgba(10,5,15,.75)'; g.fillRect(x - 2, y - 2, w + 4, 8); g.fillStyle = e.hp / e.maxHp > .5 ? '#ff5a4f' : '#ff2d2d'; g.fillRect(x, y, w * Math.max(0, e.hp / e.maxHp), 4); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x, y, w * Math.max(0, e.hp / e.maxHp), 1.5) }
  if (e.shield > 0 && e.shieldMax) { const w = 34, x = e.core.x - w / 2, y = e.topY - 14; g.fillStyle = '#cfe6ff'; g.fillRect(x, y, w * e.shield / e.shieldMax, 3) }
}
const tintCache = {};
function tinted(d, col) {
  const k = d.id + col; if (tintCache[k]) return tintCache[k]; const im = d.img; if (!im.naturalWidth) return im; const c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight;
  const g = c.getContext('2d'); g.drawImage(im, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, c.width, c.height); return tintCache[k] = c
}
function enemyDeath(e, o) {
  const c = e.core, s = Math.sqrt(e.s);
  S.shake = Math.max(S.shake, 2 + s * 2.5); SND.play('explode');
  S.parts.push({ type: 'boom', x: c.x, y: c.y, life: .18, max: .18, size: (22 + 14 * s) * s, g: 0 });
  for (let i = 0; i < 14; i++) { const a = rand(0, 6.28), v = rand(60, 300) * s; S.parts.push({ type: 'fire', x: c.x, y: c.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 100, life: rand(.25, .5), max: .5, size: rand(4, 9) * s, g: 200 }) }
  for (let i = 0; i < 6; i++)S.parts.push({ type: 'smoke', x: c.x + rand(-14, 14) * s, y: c.y, vx: rand(-40, 40), vy: rand(-80, -20), life: rand(.8, 1.4), max: 1.4, size: rand(12, 22) * s, g: 0 });
  const cols = ['#2a2433', '#433b52', '#ff5a3c', '#e8a33a'];
  for (let i = 0; i < 6 + s * 4; i++)S.parts.push({ type: 'debris', x: c.x + rand(-12, 12) * s, y: c.y + rand(-10, 10) * s, vx: rand(-220, 280) + (o.ix || 0) * .25, vy: rand(-460, -150), life: rand(1.2, 2), max: 2, size: rand(4, 9) * s, g: 1100, rot: rand(0, 6), vr: rand(-14, 14), col: cols[i % 4], floor: GY - 2 });
  // break the sprite apart into tumbling chunks
  const fly = e.d.fly, nx = e.w > e.h * 1.3 ? 3 : 2, ny = e.d.boss ? 3 : 2, ox = e.x - e.w / 2, oy = fly ? e.y - e.h / 2 : e.y - e.h;
  for (let i = 0; i < nx; i++)for (let j = 0; j < ny; j++) {
    const cw = e.w / nx, ch = e.h / ny, cx = ox + (i + .5) * cw, cy = oy + (j + .5) * ch;
    S.parts.push({
      type: 'chunk', d: e.d, fx: i / nx, fy: j / ny, fw: 1 / nx, fh: 1 / ny, x: cx, y: cy, w: cw, h: ch, vx: (cx - c.x) * rand(3, 6) + (o.ix || 120) * .3 + rand(-40, 60), vy: (cy - c.y) * rand(2, 4) - rand(220, 420),
      life: rand(1.1, 1.6), max: 1.6, g: 1100, rot: 0, vr: rand(-7, 7), floor: GY - ch * .3
    })
  }
}
function killEnemy(e, o) {
  e.dead = true;
  if (!e.demo && !S.demo) {
    const c = Math.round(e.d.coin * (1 + .03 * (S.wave - 1)) * (o.head ? 1.25 : 1) * (1 + .08 * perk('bounty')));
    S.coins += c; S.kills++; if (o.head) S.heads++;
    floater(e.core.x, e.topY - 8, '+' + c, '#ffd35a', .9);
    S.coinfx.push({ x: e.core.x, y: e.core.y, t: 0 });
    if (o.head && !o.blast) floater(e.core.x, e.topY - 32, 'CRITICAL!', '#ff6b5b', .95);
    SND.play('coin');
  }
  enemyDeath(e, o);
  if (e.d.beh === 'suicide') explode(e.core.x, e.core.y, 95, 60 * hpMul(Math.max(1, S.wave)));
  if (e.d.boss) { S.slow = 1.1; S.shake = 18; const st = S, cx = e.core.x, cy = e.core.y; for (let i = 0; i < 5; i++)setTimeout(() => { if (S === st) explodeFx(cx + rand(-80, 80), cy + rand(-80, 60), 70) }, i * 180); S.banner = { text: e.d.name.toUpperCase() + ' DOWN!', sub: '', t: 0, col: '#ffd35a' } }
}
