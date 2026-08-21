/* ============================================================
   ORBIES — an idle & gacha RPG (vanilla JS, no build step)
   Break rocks → earn coins → summon Orbies → farm → arena.
   Saves to localStorage. Runs fully client-side on GitHub Pages.
   ============================================================ */
(function () {
  'use strict';

  const SAVE_KEY = 'orbies_save_v1';
  const $ = (id) => document.getElementById(id);
  const el = (t, c) => { const e = document.createElement(t); if (c) e.className = c; return e; };

  /* ---------------- number formatting ---------------- */
  const UNITS = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc'];
  function fmt(n) {
    if (n < 1000) return (Math.floor(n) === n ? n : n.toFixed(1)).toString();
    let u = 0;
    while (n >= 1000 && u < UNITS.length - 1) { n /= 1000; u++; }
    return (n >= 100 ? n.toFixed(0) : n.toFixed(2)) + UNITS[u];
  }
  function fmtTime(s) {
    s = Math.max(0, Math.floor(s));
    if (s < 60) return s + 's';
    const m = Math.floor(s / 60), r = s % 60;
    if (m < 60) return m + 'm' + (r ? ' ' + r + 's' : '');
    const h = Math.floor(m / 60);
    return h + 'h ' + (m % 60) + 'm';
  }

  /* ---------------- rarities ---------------- */
  const RARITIES = {
    common:    { name: 'Common',    idx: 0, color: '#9aa6b2', weight: 62,  power: 6 },
    uncommon:  { name: 'Uncommon',  idx: 1, color: '#5be08a', weight: 25,  power: 16 },
    rare:      { name: 'Rare',      idx: 2, color: '#4aa8ff', weight: 9,   power: 42 },
    epic:      { name: 'Epic',      idx: 3, color: '#c06bff', weight: 3,   power: 120 },
    legendary: { name: 'Legendary', idx: 4, color: '#ffca3a', weight: 0.9, power: 340 },
    mythic:    { name: 'Mythic',    idx: 5, color: '#ff5d7a', weight: 0.2, power: 950 },
  };
  const RKEYS = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];
  const rarityByIdx = (i) => RKEYS[Math.max(0, Math.min(5, i))];

  /* ---------------- Orbie roster (generated: 28 creatures × 6 elements = 168) ---------------- */
  const CREATURES = [
    { n: 'Pib',    e: '🐣', r: 0, f: 'A freshly hatched Orbie that peeps happily with every swing.' },
    { n: 'Tuft',   e: '🐤', r: 0, f: 'Fluffy and fearless, it dives beak-first into any rock.' },
    { n: 'Mow',    e: '🐱', r: 0, f: 'Naps 20 hours a day, mines furiously for the other four.' },
    { n: 'Woof',   e: '🐶', r: 0, f: 'Loyal to a fault; buries spare coins for a rainy day.' },
    { n: 'Hop',    e: '🐰', r: 0, f: 'Its powerful hind legs make surprisingly good pickaxes.' },
    { n: 'Squee',  e: '🐭', r: 0, f: 'Tiny, quick, and weirdly good at finding hidden veins.' },
    { n: 'Chomp',  e: '🐹', r: 0, f: 'Stuffs ore into its cheeks and delivers it to the vault.' },
    { n: 'Cluck',  e: '🐔', r: 0, f: 'Lays a golden coin about once an hour. No one questions it.' },
    { n: 'Quill',  e: '🦔', r: 1, f: 'Rolls into a spiny ball and smashes clean through granite.' },
    { n: 'Waddle', e: '🐧', r: 1, f: 'Slides belly-first down mineshafts to save on travel time.' },
    { n: 'Croak',  e: '🐸', r: 1, f: 'Its sticky tongue snags gems from cracks others can’t reach.' },
    { n: 'Hoot',   e: '🦉', r: 1, f: 'Sees perfectly in the dark. Judges your mining efficiency.' },
    { n: 'Piggle', e: '🐷', r: 1, f: 'Sniffs out truffle-shaped nuggets of pure gold.' },
    { n: 'Moo',    e: '🐮', r: 1, f: 'Slow but unstoppable, like a very polite avalanche.' },
    { n: 'Baa',    e: '🐑', r: 1, f: 'Its wool is soft enough to cushion falling boulders.' },
    { n: 'Fang',   e: '🦊', r: 2, f: 'Clever enough to talk rocks into breaking themselves.' },
    { n: 'Snout',  e: '🐗', r: 2, f: 'Charges headlong and asks questions never.' },
    { n: 'Stripe', e: '🐯', r: 2, f: 'Prowls the deep floors, claiming the richest seams.' },
    { n: 'Coil',   e: '🐍', r: 2, f: 'Squeezes into fissures and pops out with fistfuls of ore.' },
    { n: 'Gecko',  e: '🦎', r: 2, f: 'Sticks to any wall and mines the ceiling for fun.' },
    { n: 'Shell',  e: '🐢', r: 2, f: 'Ancient and patient; has out-waited entire mountains.' },
    { n: 'Claw',   e: '🦀', r: 2, f: 'Two pincers, twice the rocks, half the complaining.' },
    { n: 'Trunk',  e: '🐘', r: 3, f: 'One stomp and the whole cavern reconsiders its life.' },
    { n: 'Ink',    e: '🐙', r: 3, f: 'Eight arms means eight pickaxes. The math is undeniable.' },
    { n: 'Chomps', e: '🦈', r: 3, f: 'Swims through solid stone as if it were warm water.' },
    { n: 'Mane',   e: '🦁', r: 4, f: 'The undisputed king of the mines. Every rock bows first.' },
    { n: 'Rawr',   e: '🦖', r: 4, f: 'A relic from an age when rocks were merely snacks.' },
    { n: 'Wing',   e: '🐲', r: 4, f: 'A true dragon Orbie. Legends are told of a single flap.' },
  ];
  const ELEMENTS = [
    { k: 'ember',   adj: 'Ember',   badge: '🔥', bump: 0, pf: 1.00, twist: 'Wreathed in cozy flame, it never once feels the chill of the deep.' },
    { k: 'frost',   adj: 'Frost',   badge: '❄️', bump: 0, pf: 1.00, twist: 'It leaves tiny frost-flowers blooming wherever it takes a nap.' },
    { k: 'verdant', adj: 'Verdant', badge: '🍃', bump: 0, pf: 0.95, twist: 'Coins sprout around its feet like little spring buds.' },
    { k: 'storm',   adj: 'Storm',   badge: '⚡', bump: 1, pf: 1.12, twist: 'Static crackles through its fur an instant before every big hit.' },
    { k: 'shadow',  adj: 'Shadow',  badge: '🌑', bump: 1, pf: 1.18, twist: 'It slips between the shadows to sniff out the very rarest ore.' },
    { k: 'radiant', adj: 'Radiant', badge: '✨', bump: 2, pf: 1.45, twist: 'A shifting prismatic aura marks it as one of the rarest Orbies alive.' },
  ];

  const ROSTER = [];
  const BY_RARITY = { common: [], uncommon: [], rare: [], epic: [], legendary: [], mythic: [] };
  CREATURES.forEach((c) => {
    ELEMENTS.forEach((elm) => {
      const rar = rarityByIdx(c.r + elm.bump);
      const o = {
        id: c.n.toLowerCase() + '_' + elm.k,
        name: elm.adj + ' ' + c.n,
        emoji: c.e,
        badge: elm.badge,
        rarity: rar,
        power: Math.round(RARITIES[rar].power * elm.pf),
        trait: elm.adj + ' Touch',
        flavor: c.f + ' ' + elm.twist,
      };
      ROSTER.push(o);
      BY_RARITY[rar].push(o);
    });
  });
  const ORBIE = {};
  ROSTER.forEach((o) => (ORBIE[o.id] = o));

  /* ---------------- floors / biomes ---------------- */
  const BIOMES = ['The Shallow Caves', 'Mossgrove Tunnels', 'Emberdeep Mines', 'Frostbite Hollow',
    'Sunken Ruins', 'Crystal Abyss', 'Stormspire Vault', 'Shadowroot Warrens', 'Astral Catacombs',
    'The Molten Core', 'Voidglass Depths', 'Dragonbone Pit'];
  const ROCK_EMOJI = ['🪨', '⛰️', '🗿', '💠', '🔮', '👹'];
  const isBoss = (f) => f % 10 === 0;
  const floorName = (f) => BIOMES[Math.floor((f - 1) / 10)] || ('Abyssal Floor ' + f);
  const rockHp = (f) => Math.ceil(18 * Math.pow(f, 1.65) + f * 4);
  const coinReward = (f) => Math.ceil(6 * Math.pow(f, 1.42) + 4);

  /* ---------------- upgrades ---------------- */
  const UPGRADES = [
    { id: 'pick', ico: '⛏️', name: 'Sharper Pickaxe', desc: 'Increase tap damage.', cost0: 25, rate: 1.8, max: 999 },
    { id: 'crit', ico: '🎯', name: 'Lucky Strike', desc: '+3% crit chance (crits ×3).', cost0: 120, rate: 2.1, max: 20 },
    { id: 'coach', ico: '📣', name: 'Orbie Coach', desc: '+8% Orbie power.', cost0: 150, rate: 1.85, max: 999 },
    { id: 'gold', ico: '💰', name: 'Golden Touch', desc: '+6% coins from rocks.', cost0: 130, rate: 1.8, max: 999 },
    { id: 'auto', ico: '🤖', name: 'Auto-Digger', desc: '+10% auto-mining speed.', cost0: 220, rate: 1.9, max: 999 },
    { id: 'boss', ico: '🧭', name: 'Treasure Sense', desc: '+12% boss gem reward.', cost0: 400, rate: 2.0, max: 999 },
  ];
  const upCost = (u, lvl) => Math.ceil(u.cost0 * Math.pow(u.rate, lvl));

  /* ---------------- crops ---------------- */
  const CROPS = [
    { id: 'carrot', n: 'Carrot',    e: '🥕', cost: 40,   time: 20,  yield: 6,   floor: 1 },
    { id: 'berry',  n: 'Berry',     e: '🫐', cost: 140,  time: 45,  yield: 18,  floor: 3 },
    { id: 'corn',   n: 'Corn',      e: '🌽', cost: 380,  time: 90,  yield: 46,  floor: 6 },
    { id: 'pump',   n: 'Pumpkin',   e: '🎃', cost: 1100, time: 180, yield: 140, floor: 10 },
    { id: 'star',   n: 'Starfruit', e: '⭐', cost: 3800, time: 300, yield: 480, floor: 15 },
  ];
  const CROP = {}; CROPS.forEach((c) => (CROP[c.id] = c));

  /* ---------------- totems ---------------- */
  const TOTEM_SETS = [
    { k: 'wood', name: 'Woodland Charms', bonus: '+15% Coins', cards: ['🌰', '🍄', '🌻', '🦌'], apply: (m) => (m.coin *= 1.15) },
    { k: 'storm', name: 'Tempest Sigils', bonus: '+15% Orbie Power', cards: ['🌩️', '🌊', '🌀', '🔱'], apply: (m) => (m.orbie *= 1.15) },
    { k: 'cosmic', name: 'Cosmic Relics', bonus: '+1 Arena Ticket, +10% Coins', cards: ['🌙', '⭐', '☄️', '🪐'], apply: (m) => { m.coin *= 1.10; m.ticketBonus += 1; } },
  ];

  /* ---------------- rings ---------------- */
  const RING_STATS = [
    { t: 'coin',  label: 'Coins',       mult: 'coin',  stone: '🟡' },
    { t: 'orbie', label: 'Orbie Power',  mult: 'orbie', stone: '🟣' },
    { t: 'click', label: 'Tap Damage',   mult: 'click', stone: '🔴' },
    { t: 'dust',  label: 'Jewelry Dust', mult: 'dust',  stone: '⚪' },
    { t: 'luck',  label: 'Summon Luck',  mult: 'luck',  stone: '🟢' },
  ];
  const RING_BASE = [3, 6, 10, 18, 30, 50]; // % by rarity idx
  const ringValue = (r) => Math.round(RING_BASE[RARITIES[r.rarity].idx] * (1 + 0.25 * r.level) * 10) / 10;
  const ringMeltDust = (r) => Math.round((RARITIES[r.rarity].idx + 1) * 5 * (1 + r.level * 0.5));
  const ringUpCost = (r) => Math.ceil(8 * (RARITIES[r.rarity].idx + 1) * Math.pow(1.6, r.level));

  /* ---------------- arena leagues ---------------- */
  const LEAGUES = [
    { n: 'Bronze', min: 0 }, { n: 'Silver', min: 200 }, { n: 'Gold', min: 600 },
    { n: 'Platinum', min: 1500 }, { n: 'Diamond', min: 3500 }, { n: 'Master', min: 8000 },
  ];
  const LB_NAMES = ['SparkLord', 'MinerMaya', 'OrbKing_Zed', 'PixelPip', 'GemGoblin', 'Rockzilla',
    'FluffyDoom', 'CaveQueen', 'NoobSlayer99', 'TinyTitan', 'AuroraFox', 'DeepDiver', 'CoinCrusher',
    'MythicMomo', 'ShadowSnek', 'BossHunter', 'PebblePete', 'StarNomad', 'VaultViper', 'GlimmerGal'];
  const TICKET_MAX = 5, TICKET_SECS = 180;

  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const weekIndex = () => Math.floor(Date.now() / (7 * 24 * 3600 * 1000));
  const leagueOf = (tr) => { let L = LEAGUES[0]; for (const l of LEAGUES) if (tr >= l.min) L = l; return L; };
  const ringSlots = () => 2 + (S.trophies >= 600 ? 1 : 0) + (S.trophies >= 3500 ? 1 : 0);

  /* ================= STATE ================= */
  let S = null;
  function freshState() {
    return {
      coins: 0, gems: 0, food: 0, dust: 0, trophies: 0,
      floor: 1, maxFloor: 1, floorProgress: 0,
      orbies: {},              // id -> {copies, level, fed}
      upgrades: {},            // id -> level
      garden: { plots: 4, crops: [] }, // crops: [{crop, at}|null]
      seed: 'carrot',
      rings: [], equipped: [], ringSeq: 1,
      totems: {},              // cardId -> count
      arena: { tickets: TICKET_MAX, ticketAt: Date.now(), lastOpp: null, week: weekIndex(), bestTrophies: 0 },
      stats: { taps: 0, breaks: 0, summons: 0, wins: 0 },
      lastActive: Date.now(),
      created: Date.now(),
      firstRun: true,
    };
  }

  /* ---------------- save / load ---------------- */
  function save() {
    S.lastActive = Date.now();
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) {}
  }
  function load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return false;
      const d = JSON.parse(raw);
      S = Object.assign(freshState(), d);
      // patch nested defaults
      S.garden = Object.assign({ plots: 4, crops: [] }, d.garden || {});
      S.arena = Object.assign({ tickets: TICKET_MAX, ticketAt: Date.now(), week: weekIndex() }, d.arena || {});
      S.stats = Object.assign({ taps: 0, breaks: 0, summons: 0, wins: 0 }, d.stats || {});
      return true;
    } catch (e) { return false; }
  }

  /* ================= DERIVED STATS ================= */
  let M = null; // multiplier cache
  function orbiePower(id) {
    const rec = S.orbies[id]; if (!rec) return 0;
    const base = ORBIE[id].power;
    return base * (1 + 0.22 * (rec.level - 1)) * (1 + 0.03 * (rec.fed || 0));
  }
  function recalc() {
    const m = { coin: 1, orbie: 1, click: 1, dust: 1, luck: 1, ticketBonus: 0 };
    // upgrades
    m.orbie *= Math.pow(1.08, S.upgrades.coach || 0);
    m.coin *= Math.pow(1.06, S.upgrades.gold || 0);
    // rings
    S.equipped.forEach((rid) => {
      const r = S.rings.find((x) => x.uid === rid); if (!r) return;
      const st = RING_STATS.find((x) => x.t === r.type);
      if (st) m[st.mult] *= 1 + ringValue(r) / 100;
    });
    // totems
    TOTEM_SETS.forEach((set) => {
      const done = set.cards.every((_, i) => (S.totems[set.k + i] || 0) > 0);
      if (done) set.apply(m);
    });
    M = m;
    // collection power
    let cp = 0;
    for (const id in S.orbies) cp += orbiePower(id);
    const basePower = cp * m.orbie;
    const dpsMult = Math.pow(1.10, S.upgrades.auto || 0);
    S._power = basePower;
    S._dps = basePower * dpsMult;
    S._click = (5 * Math.pow(1.8, S.upgrades.pick || 0) + basePower * 0.02) * m.click;
    S._crit = Math.min(0.6, 0.03 * (S.upgrades.crit || 0));
    S._collectionCount = Object.keys(S.orbies).length;
  }

  /* ================= UI HELPERS ================= */
  function toast(msg) {
    const t = el('div', 'toast'); t.textContent = msg;
    $('toasts').appendChild(t);
    setTimeout(() => t.remove(), 2100);
  }
  function floater(x, y, text, crit) {
    const f = el('div', 'floater' + (crit ? ' crit' : '')); f.textContent = text;
    f.style.left = (x - 10) + 'px'; f.style.top = (y - 10) + 'px';
    $('floaters').appendChild(f);
    setTimeout(() => f.remove(), 1000);
  }
  function openModal(html, onClose) {
    const bd = el('div', 'modal-backdrop show');
    const m = el('div', 'modal'); m.innerHTML = html;
    bd.appendChild(m); document.body.appendChild(bd);
    const close = () => { bd.remove(); if (onClose) onClose(); };
    bd.addEventListener('click', (e) => { if (e.target === bd) close(); });
    return { bd, m, close };
  }
  function canAfford(res, n) { return S[res] >= n; }
  function rarClass(r) { return 'r-' + r; }

  /* ================= MINING ================= */
  function spawnRock() {
    const boss = (S.floor === S.maxFloor && isBoss(S.floor));
    const hp = rockHp(S.floor) * (boss ? 8 : 1);
    S.rock = { hp, maxHp: hp, boss };
    S.bossTimeLeft = boss ? 30 : 0;
    const rm = $('rock-emoji');
    if (boss) rm.textContent = '👹';
    else rm.textContent = ROCK_EMOJI[Math.min(ROCK_EMOJI.length - 2, Math.floor((S.floor - 1) / 10))] || '🪨';
    renderMineHp();
  }
  function gainCoins(n) { S.coins += n; }
  function dealDamage(dmg, fromClick, x, y) {
    if (!S.rock) spawnRock();
    let crit = false;
    if (fromClick && Math.random() < S._crit) { dmg *= 3; crit = true; }
    S.rock.hp -= dmg;
    if (fromClick && x != null) floater(x, y, '-' + fmt(dmg), crit);
    let guard = 0;
    while (S.rock.hp <= 0 && guard++ < 300) breakRock();
    renderMineHp();
  }
  function breakRock() {
    S.stats.breaks++;
    let reward = coinReward(S.floor) * M.coin;
    const wasBoss = S.rock && S.rock.boss;
    if (wasBoss) reward *= 10;
    reward = Math.ceil(reward);
    gainCoins(reward);

    // frontier progression
    if (S.floor === S.maxFloor) {
      const needed = wasBoss ? 1 : 10;
      S.floorProgress++;
      if (S.floorProgress >= needed) {
        if (wasBoss) {
          const g = Math.ceil((3 + S.floor * 0.6) * Math.pow(1.12, S.upgrades.boss || 0));
          S.gems += g;
          toast('👹 Boss defeated! +' + g + ' 💎');
          if (Math.random() < 0.7) dropRing(S.floor);
        }
        S.maxFloor++;
        S.floor = S.maxFloor;
        S.floorProgress = 0;
        renderMineHead();
      }
    }
    spawnRock();
    renderMineFp();
  }
  function setFloor(f) {
    f = Math.max(1, Math.min(S.maxFloor, f));
    S.floor = f;
    if (f !== S.maxFloor) S.floorProgress = 0;
    spawnRock(); renderMineHead(); renderMineFp();
  }

  /* ================= SUMMON ================= */
  function rollRarity(minIdx) {
    minIdx = minIdx || 0;
    // luck shifts weight toward higher rarities
    const luck = 1 + (M.luck - 1);
    let total = 0; const w = {};
    RKEYS.forEach((k) => {
      const r = RARITIES[k];
      if (r.idx < minIdx) { w[k] = 0; return; }
      let ww = r.weight;
      if (r.idx >= 2) ww *= luck;
      w[k] = ww; total += ww;
    });
    let roll = Math.random() * total;
    for (const k of RKEYS) { roll -= w[k]; if (roll <= 0) return k; }
    return 'common';
  }
  function summonOne(minIdx) {
    const rar = rollRarity(minIdx);
    const pool = BY_RARITY[rar];
    const o = pool[Math.floor(Math.random() * pool.length)];
    const rec = S.orbies[o.id] || { copies: 0, level: 1, fed: 0 };
    let isNew = !S.orbies[o.id];
    rec.copies++;
    let leveled = false;
    while (rec.copies >= rec.level) { rec.copies -= rec.level; rec.level++; leveled = true; }
    S.orbies[o.id] = rec;
    S.stats.summons++;
    return { o, isNew, leveled };
  }
  function doSummon(count, minIdx, useGems) {
    const results = [];
    for (let i = 0; i < count; i++) {
      const mi = (count === 10 && i === 9) ? Math.max(minIdx || 0, 2) : (minIdx || 0);
      results.push(summonOne(mi));
    }
    recalc();
    renderSummonResult(results);
    renderResources();
    return results;
  }
  function renderSummonResult(results) {
    const host = $('summon-result'); host.innerHTML = '';
    results.forEach((res, i) => {
      const o = res.o, r = RARITIES[o.rarity];
      const c = el('div', 'pull-card');
      c.style.setProperty('--rar-color', r.color);
      c.style.animationDelay = (i * 0.05) + 's';
      c.innerHTML = `<div class="pull-emoji">${o.emoji}</div>
        <div class="pull-name">${o.name}</div>
        <div class="pull-rar ${rarClass(o.rarity)}">${r.name}</div>
        ${res.isNew ? '<div class="pull-new">NEW!</div>' : '<div class="pull-dup">+shard</div>'}`;
      c.onclick = () => showOrbie(o.id);
      host.appendChild(c);
    });
  }

  /* ================= GARDEN ================= */
  function plantSeed(idx) {
    const crop = CROP[S.seed];
    if (!crop) return;
    if (S.garden.crops[idx]) return;
    if (crop.floor > S.maxFloor) { toast('🔒 Unlocks on floor ' + crop.floor); return; }
    if (!canAfford('coins', crop.cost)) { toast('Not enough 🪙'); return; }
    S.coins -= crop.cost;
    S.garden.crops[idx] = { crop: crop.id, at: Date.now() };
    renderGarden(); renderResources();
  }
  function harvestPlot(idx) {
    const p = S.garden.crops[idx]; if (!p) return;
    const crop = CROP[p.crop];
    if (Date.now() - p.at < crop.time * 1000) return;
    S.food += crop.yield;
    S.garden.crops[idx] = null;
    toast('🌽 +' + crop.yield + ' food');
    renderGarden(); renderResources();
  }
  function expandGarden() {
    const cost = Math.ceil(500 * Math.pow(2, S.garden.plots - 4));
    if (S.garden.plots >= 12) { toast('Garden is at max size'); return; }
    if (!canAfford('coins', cost)) { toast('Not enough 🪙'); return; }
    S.coins -= cost; S.garden.plots++;
    renderGarden(); renderResources();
  }

  /* ================= RINGS ================= */
  function dropRing(floor) {
    const rIdx = Math.min(5, Math.floor(Math.random() * 3) + Math.floor(floor / 12));
    const rarity = rarityByIdx(rIdx);
    const st = RING_STATS[Math.floor(Math.random() * RING_STATS.length)];
    const ring = { uid: S.ringSeq++, type: st.t, rarity, level: 0 };
    S.rings.push(ring);
    toast(RARITIES[rarity].name + ' ring found! 💍');
    return ring;
  }
  function equipRing(uid) {
    if (S.equipped.includes(uid)) return;
    if (S.equipped.length >= ringSlots()) { toast('All ring slots full'); return; }
    S.equipped.push(uid); recalc(); renderCollection(); renderResources();
  }
  function unequipRing(uid) {
    S.equipped = S.equipped.filter((x) => x !== uid);
    recalc(); renderCollection();
  }
  function meltRing(uid) {
    const i = S.rings.findIndex((r) => r.uid === uid); if (i < 0) return;
    const r = S.rings[i];
    const d = Math.round(ringMeltDust(r) * M.dust);
    S.dust += d;
    S.rings.splice(i, 1);
    S.equipped = S.equipped.filter((x) => x !== uid);
    toast('✨ +' + d + ' dust');
    recalc(); renderCollection(); renderResources();
  }
  function upgradeRing(uid) {
    const r = S.rings.find((x) => x.uid === uid); if (!r) return;
    const cost = ringUpCost(r);
    if (!canAfford('dust', cost)) { toast('Need ' + cost + ' ✨ dust'); return; }
    S.dust -= cost; r.level++;
    recalc(); renderCollection(); renderResources();
  }

  /* ================= ARENA ================= */
  function refillTickets(dt) {
    if (S.arena.tickets >= TICKET_MAX + M.ticketBonus) { S.arena.ticketAt = Date.now(); return; }
    const elapsed = (Date.now() - S.arena.ticketAt) / 1000;
    if (elapsed >= TICKET_SECS) {
      const gained = Math.floor(elapsed / TICKET_SECS);
      S.arena.tickets = Math.min(TICKET_MAX + M.ticketBonus, S.arena.tickets + gained);
      S.arena.ticketAt = Date.now() - (elapsed - gained * TICKET_SECS) * 1000;
    }
  }
  function arenaFight() {
    const cap = TICKET_MAX + M.ticketBonus;
    if (S.arena.tickets <= 0) { toast('No tickets — they refill over time'); return; }
    if (S._power <= 0) { toast('Summon an Orbie first!'); return; }
    S.arena.tickets--;
    if (S.arena.tickets < cap && !S._wasFull) S.arena.ticketAt = S.arena.ticketAt || Date.now();
    const oppPower = Math.max(1, Math.round(S._power * (0.7 + Math.random() * 0.7)));
    const oppName = LB_NAMES[Math.floor(Math.random() * LB_NAMES.length)];
    const chance = S._power / (S._power + oppPower);
    const win = Math.random() < chance;
    const log = $('battle-log');
    if (win) {
      S.stats.wins++;
      const L = leagueOf(S.trophies);
      const tr = 8 + LEAGUES.indexOf(L) * 4 + Math.floor(Math.random() * 6);
      const gm = 2 + Math.floor(Math.random() * 3);
      S.trophies += tr; S.gems += gm;
      S.arena.bestTrophies = Math.max(S.arena.bestTrophies || 0, S.trophies);
      let extra = '';
      if (Math.random() < 0.22) { dropRing(S.maxFloor); extra = ' + a ring 💍'; }
      log.innerHTML = `<span class="win">✅ Victory vs ${oppName}! +${tr} 🏆 +${gm} 💎${extra}</span>`;
    } else {
      const tr = Math.max(0, 2);
      S.trophies += tr;
      log.innerHTML = `<span class="lose">❌ Defeated by ${oppName} (Power ${fmt(oppPower)}). +${tr} 🏆</span>`;
    }
    recalc(); renderArena(); renderResources();
  }
  function buildLeaderboard() {
    const wk = weekIndex();
    const rng = mulberry32(wk * 2654435761 % 2147483647);
    const L = leagueOf(S.trophies);
    const base = L.min + 100;
    const rows = [];
    const names = LB_NAMES.slice().sort(() => rng() - 0.5).slice(0, 11);
    names.forEach((n, i) => {
      const score = Math.round(base * (0.4 + rng() * 2.2) + rng() * 150);
      rows.push({ name: n, score, you: false });
    });
    rows.push({ name: 'You', score: S.trophies, you: true });
    rows.sort((a, b) => b.score - a.score);
    return rows;
  }

  /* ================= PACKS ================= */
  function openTotemPack() {
    if (!canAfford('gems', 15)) { toast('Need 15 💎'); return; }
    S.gems -= 15;
    const got = [];
    for (let i = 0; i < 3; i++) {
      const set = TOTEM_SETS[Math.floor(Math.random() * TOTEM_SETS.length)];
      const ci = Math.floor(Math.random() * set.cards.length);
      const cid = set.k + ci;
      S.totems[cid] = (S.totems[cid] || 0) + 1;
      got.push(set.cards[ci]);
    }
    $('pack-result').innerHTML = got.map((g) => `<div class="pull-card"><div class="pull-emoji">${g}</div><div class="pull-name">Totem</div></div>`).join('');
    toast('Opened Totem Pack!');
    recalc(); renderCollection(); renderResources();
  }
  function openRingPack() {
    if (!canAfford('gems', 25)) { toast('Need 25 💎'); return; }
    S.gems -= 25;
    const got = [];
    for (let i = 0; i < 2; i++) { const r = dropRing(S.maxFloor + 6); got.push(r); }
    $('pack-result').innerHTML = got.map((r) => {
      const st = RING_STATS.find((x) => x.t === r.type);
      return `<div class="pull-card" style="--rar-color:${RARITIES[r.rarity].color}"><div class="pull-emoji">💍</div><div class="pull-name">+${ringValue(r)}% ${st.label}</div><div class="pull-rar ${rarClass(r.rarity)}">${RARITIES[r.rarity].name}</div></div>`;
    }).join('');
    recalc(); renderCollection(); renderResources();
  }

  /* ================= UPGRADES ================= */
  function buyUpgrade(id) {
    const u = UPGRADES.find((x) => x.id === id);
    const lvl = S.upgrades[id] || 0;
    if (lvl >= u.max) return;
    const cost = upCost(u, lvl);
    if (!canAfford('coins', cost)) { toast('Not enough 🪙'); return; }
    S.coins -= cost; S.upgrades[id] = lvl + 1;
    recalc(); renderUpgrades(); renderResources();
  }

  /* ================= RENDERING ================= */
  function renderResources() {
    $('r-coins').textContent = fmt(S.coins);
    $('r-gems').textContent = fmt(S.gems);
    $('r-food').textContent = fmt(S.food);
    $('r-dust').textContent = fmt(S.dust);
    $('r-trophies').textContent = fmt(S.trophies);
  }
  function renderPowerStrip() {
    $('ps-power').textContent = fmt(S._power);
    $('ps-dps').textContent = fmt(S._dps);
    $('ps-floor').textContent = S.floor + (S.floor === S.maxFloor ? '' : '/' + S.maxFloor);
    $('ps-collection').textContent = S._collectionCount + '/' + ROSTER.length;
  }
  function renderMineHead() {
    $('floor-name').textContent = floorName(S.floor);
    $('floor-sub').textContent = 'Floor ' + S.floor + (isBoss(S.floor) && S.floor === S.maxFloor ? ' — BOSS GATE' : '');
    $('floor-prev').disabled = S.floor <= 1;
    $('floor-next').disabled = S.floor >= S.maxFloor;
  }
  function renderMineHp() {
    if (!S.rock) return;
    const pct = Math.max(0, S.rock.hp / S.rock.maxHp * 100);
    $('rock-hp-fill').style.width = pct + '%';
    $('rock-hp-text').textContent = fmt(Math.max(0, S.rock.hp)) + ' / ' + fmt(S.rock.maxHp);
  }
  function renderMineFp() {
    if (S.floor === S.maxFloor) {
      const needed = (isBoss(S.floor)) ? 1 : 10;
      $('fp-fill').style.width = (S.floorProgress / needed * 100) + '%';
      $('fp-text').textContent = isBoss(S.floor)
        ? 'Defeat the boss to descend!'
        : S.floorProgress + ' / ' + needed + ' rocks cleared → next floor';
    } else {
      $('fp-fill').style.width = '100%';
      $('fp-text').textContent = '✓ Cleared — farming for coins (▶ to go deeper)';
    }
  }
  function renderMineBoss() {
    const t = $('boss-timer');
    if (S.rock && S.rock.boss) t.textContent = '⏳ ' + Math.ceil(S.bossTimeLeft) + 's';
    else t.textContent = '';
  }

  function renderSummonMeta() {
    const single = Math.ceil(100 * Math.pow(1.02, S.stats.summons));
    S._singleCost = single;
    $('summon1-cost').textContent = fmt(single);
    $('summon-1').disabled = !canAfford('coins', single);
    $('summon-10').disabled = !canAfford('gems', 10);
    const odds = $('odds'); odds.innerHTML = '';
    let tot = 0; RKEYS.forEach((k) => tot += RARITIES[k].weight);
    RKEYS.forEach((k) => {
      const r = RARITIES[k];
      const o = el('div', 'odd ' + rarClass(k));
      o.textContent = r.name + ' ' + (r.weight / tot * 100).toFixed(r.weight < 1 ? 2 : 1) + '%';
      odds.appendChild(o);
    });
  }

  let orbFilter = 'all';
  function renderOrbies() {
    const filt = $('orbies-filter'); filt.innerHTML = '';
    const chips = [['all', 'All']].concat(RKEYS.map((k) => [k, RARITIES[k].name]));
    chips.forEach(([k, lbl]) => {
      const c = el('div', 'filter-chip' + (orbFilter === k ? ' on' : ''));
      c.textContent = lbl; c.onclick = () => { orbFilter = k; renderOrbies(); };
      filt.appendChild(c);
    });
    const grid = $('orbies-grid'); grid.innerHTML = '';
    const owned = Object.keys(S.orbies).map((id) => ORBIE[id])
      .filter((o) => orbFilter === 'all' || o.rarity === orbFilter)
      .sort((a, b) => RARITIES[b.rarity].idx - RARITIES[a.rarity].idx || b.power - a.power);
    $('orbies-empty').style.display = Object.keys(S.orbies).length ? 'none' : 'block';
    owned.forEach((o) => {
      const rec = S.orbies[o.id];
      const c = el('div', 'orb-card');
      c.style.setProperty('--rar-color', RARITIES[o.rarity].color);
      c.innerHTML = `<div class="orb-fav">${o.badge}</div>
        <div class="orb-emoji">${o.emoji}</div>
        <div class="orb-name">${o.name}</div>
        <div class="orb-lvl">Lv ${rec.level}</div>
        <div class="orb-pow">⚡${fmt(orbiePower(o.id))}</div>`;
      c.onclick = () => showOrbie(o.id);
      grid.appendChild(c);
    });
  }
  function showOrbie(id) {
    const o = ORBIE[id]; const rec = S.orbies[id] || { level: 1, copies: 0, fed: 0 };
    const r = RARITIES[o.rarity];
    const feedCost = 10 * ((rec.fed || 0) + 1);
    const html = `<div class="orb-detail">
      <div class="big-emoji">${o.emoji}</div>
      <h3 class="${rarClass(o.rarity)}">${o.name}</h3>
      <div class="orb-trait">${o.badge} ${o.trait}</div>
      <div class="orb-flavor">"${o.flavor}"</div>
      <div class="orb-stats-row">
        <div class="orb-stat"><b>${rec.level}</b><span>LEVEL</span></div>
        <div class="orb-stat"><b>${fmt(orbiePower(id))}</b><span>POWER</span></div>
        <div class="orb-stat"><b>${rec.copies}/${rec.level}</b><span>SHARDS</span></div>
        <div class="orb-stat"><b>${rec.fed || 0}</b><span>FED</span></div>
      </div>
      <button class="btn primary" id="feed-btn">🌽 Feed (${feedCost} food) — +3% power</button>
      <button class="btn ghost" id="orb-close">Close</button>
    </div>`;
    const mod = openModal(html);
    mod.m.querySelector('#orb-close').onclick = mod.close;
    mod.m.querySelector('#feed-btn').onclick = () => {
      if (!S.orbies[id]) { toast('Summon this Orbie first'); return; }
      if (!canAfford('food', feedCost)) { toast('Not enough 🌽'); return; }
      S.food -= feedCost; S.orbies[id].fed = (S.orbies[id].fed || 0) + 1;
      recalc(); renderResources(); mod.close(); showOrbie(id); renderOrbies();
    };
  }

  function renderGarden() {
    const sp = $('seed-picker'); sp.innerHTML = '';
    CROPS.forEach((c) => {
      const locked = c.floor > S.maxFloor;
      const chip = el('div', 'seed-chip' + (S.seed === c.id ? ' on' : '') + (locked ? ' locked' : ''));
      chip.innerHTML = `<div class="seed-emoji">${c.e}</div><div class="seed-name">${c.n}</div>
        <div class="seed-cost">${locked ? '🔒 F' + c.floor : '🪙' + fmt(c.cost)}</div>`;
      chip.onclick = () => { if (locked) { toast('Unlocks on floor ' + c.floor); return; } S.seed = c.id; renderGarden(); };
      sp.appendChild(chip);
    });
    const grid = $('garden-grid'); grid.innerHTML = '';
    for (let i = 0; i < S.garden.plots; i++) {
      const p = S.garden.crops[i];
      const plot = el('div', 'plot' + (p ? '' : ' empty'));
      if (p) {
        const crop = CROP[p.crop];
        const elapsed = (Date.now() - p.at) / 1000;
        const ready = elapsed >= crop.time;
        const pct = Math.min(100, elapsed / crop.time * 100);
        plot.innerHTML = `<div class="plot-crop">${crop.e}</div>
          <div class="plot-grow" style="height:${ready ? 100 : pct}%"></div>
          ${ready ? '<div class="plot-ready"></div><div class="plot-timer">✓ TAP</div>'
            : '<div class="plot-timer">' + fmtTime(crop.time - elapsed) + '</div>'}`;
        plot.onclick = () => harvestPlot(i);
      } else {
        plot.innerHTML = '<div class="plot-crop" style="opacity:.35">➕</div>';
        plot.onclick = () => plantSeed(i);
      }
      grid.appendChild(plot);
    }
    const cost = Math.ceil(500 * Math.pow(2, S.garden.plots - 4));
    const eb = $('expand-garden');
    if (S.garden.plots >= 12) { eb.textContent = 'Garden fully expanded 🌻'; eb.disabled = true; }
    else { $('expand-cost').textContent = fmt(cost); eb.disabled = !canAfford('coins', cost); }
  }

  function renderArena() {
    const cap = TICKET_MAX + (M ? M.ticketBonus : 0);
    $('arena-tickets').textContent = S.arena.tickets;
    $('arena-tickets').parentElement.innerHTML = 'Tickets: <b id="arena-tickets">' + S.arena.tickets + '</b> / ' + cap + ' <span class="ticket-timer" id="ticket-timer"></span>';
    const L = leagueOf(S.trophies);
    $('league-badge').textContent = L.n + ' League';
    $('arena-fight').disabled = S.arena.tickets <= 0;
    // leaderboard
    const rows = buildLeaderboard();
    const lb = $('leaderboard'); lb.innerHTML = '';
    let shown = 0;
    rows.forEach((r, i) => {
      if (i >= 10 && !r.you) return;
      shown++;
      const row = el('div', 'lb-row' + (r.you ? ' you' : ''));
      row.innerHTML = `<div class="lb-rank ${i < 3 ? 'top' : ''}">${i + 1}</div>
        <div class="lb-name">${r.you ? '👑 You' : r.name}</div>
        <div class="lb-score">${fmt(r.score)} 🏆</div>`;
      lb.appendChild(row);
    });
    const yourRank = rows.findIndex((r) => r.you) + 1;
    $('league-reset').textContent = 'You are rank #' + yourRank + ' this week';
    if (!$('arena-opponent').innerHTML) {
      $('arena-opponent').innerHTML = '<div class="opp-name">Ready to battle</div><div class="opp-power">Your Power: ' + fmt(S._power) + '</div>';
    }
  }

  let colSub = 'rings';
  function renderCollection() {
    document.querySelectorAll('#col-subtabs .subtab').forEach((b) => b.classList.toggle('active', b.dataset.sub === colSub));
    document.querySelectorAll('.subpanel').forEach((p) => p.classList.remove('active'));
    $('sub-' + colSub).classList.add('active');
    // rings
    $('ring-slots').textContent = ringSlots();
    const eq = $('equipped-rings'); eq.innerHTML = '';
    for (let i = 0; i < ringSlots(); i++) {
      const uid = S.equipped[i];
      const slot = el('div', 'ring-slot' + (uid != null ? ' filled' : ''));
      if (uid != null) {
        const r = S.rings.find((x) => x.uid === uid);
        if (r) {
          const st = RING_STATS.find((x) => x.t === r.type);
          slot.style.setProperty('--rar-color', RARITIES[r.rarity].color);
          const upc = ringUpCost(r);
          slot.innerHTML = `<div class="ring-emoji">💍</div>
            <div class="ring-name ${rarClass(r.rarity)}">Lv${r.level} ${RARITIES[r.rarity].name}</div>
            <div class="ring-stat">+${ringValue(r)}% ${st.label}</div>
            <div class="ring-actions">
              <button class="up">⬆ ${fmt(upc)}✨</button>
              <button class="uneq">Unequip</button>
            </div>`;
          slot.querySelector('.up').onclick = () => upgradeRing(uid);
          slot.querySelector('.uneq').onclick = () => unequipRing(uid);
        }
      } else {
        slot.innerHTML = '<div class="ring-emoji" style="opacity:.3">💍</div><div class="ring-name">Empty Slot</div>';
      }
      eq.appendChild(slot);
    }
    const inv = $('ring-inventory'); inv.innerHTML = '';
    const unequipped = S.rings.filter((r) => !S.equipped.includes(r.uid));
    $('rings-empty').style.display = unequipped.length ? 'none' : (S.rings.length ? 'none' : 'block');
    unequipped.forEach((r) => {
      const st = RING_STATS.find((x) => x.t === r.type);
      const card = el('div', 'ring-inv-card');
      card.style.setProperty('--rar-color', RARITIES[r.rarity].color);
      card.innerHTML = `<div class="ring-emoji">💍</div>
        <div class="ring-name ${rarClass(r.rarity)}">Lv${r.level} ${RARITIES[r.rarity].name}</div>
        <div class="ring-stat">+${ringValue(r)}% ${st.label}</div>
        <div class="ring-actions">
          <button class="eq">Equip</button>
          <button class="melt">Melt +${ringMeltDust(r)}✨</button>
        </div>`;
      card.querySelector('.eq').onclick = () => equipRing(r.uid);
      card.querySelector('.melt').onclick = () => meltRing(r.uid);
      inv.appendChild(card);
    });
    // totems
    const ts = $('totem-sets'); ts.innerHTML = '';
    TOTEM_SETS.forEach((set) => {
      const done = set.cards.every((_, i) => (S.totems[set.k + i] || 0) > 0);
      const box = el('div', 'totem-set');
      let cardsHtml = '';
      set.cards.forEach((c, i) => {
        const cnt = S.totems[set.k + i] || 0;
        cardsHtml += `<div class="totem-card ${cnt ? '' : 'missing'}">${c}${cnt > 1 ? '<span class="tc-count">×' + cnt + '</span>' : ''}</div>`;
      });
      box.innerHTML = `<div class="ts-head"><div class="ts-name">${set.name}</div>
        <div class="ts-bonus ${done ? 'active' : ''}">${done ? '✓ ' : ''}${set.bonus}</div></div>
        <div class="ts-cards">${cardsHtml}</div>`;
      ts.appendChild(box);
    });
  }

  function renderUpgrades() {
    const list = $('upgrade-list'); list.innerHTML = '';
    UPGRADES.forEach((u) => {
      const lvl = S.upgrades[u.id] || 0;
      const maxed = lvl >= u.max;
      const cost = upCost(u, lvl);
      const row = el('div', 'upgrade');
      row.innerHTML = `<div class="up-ico">${u.ico}</div>
        <div class="up-body">
          <div class="up-name">${u.name} <span class="up-lvl">Lv ${lvl}${maxed ? ' MAX' : ''}</span></div>
          <div class="up-desc">${u.desc}</div>
        </div>
        <button class="up-buy" ${maxed || !canAfford('coins', cost) ? 'disabled' : ''}>
          ${maxed ? 'MAX' : '🪙 ' + fmt(cost)}<small>${maxed ? '' : 'buy'}</small>
        </button>`;
      if (!maxed) row.querySelector('.up-buy').onclick = () => buyUpgrade(u.id);
      list.appendChild(row);
    });
  }

  function renderMenuStats() {
    const created = new Date(S.created);
    $('menu-stats').innerHTML = `
      🐣 Orbies collected: <b>${S._collectionCount} / ${ROSTER.length}</b><br>
      ⛏️ Rocks broken: <b>${fmt(S.stats.breaks)}</b><br>
      🔮 Summons: <b>${fmt(S.stats.summons)}</b><br>
      ⚔️ Arena wins: <b>${fmt(S.stats.wins)}</b><br>
      🏆 Best trophies: <b>${fmt(S.arena.bestTrophies || 0)}</b><br>
      📅 Playing since: <b>${created.toLocaleDateString()}</b>`;
  }

  /* ================= PANEL SWITCHING ================= */
  function switchPanel(name) {
    document.querySelectorAll('.panel').forEach((p) => p.classList.remove('active'));
    $('panel-' + name).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach((b) => b.classList.toggle('active', b.dataset.panel === name));
    if (name === 'summon') renderSummonMeta();
    if (name === 'orbies') renderOrbies();
    if (name === 'garden') renderGarden();
    if (name === 'arena') renderArena();
    if (name === 'collection') renderCollection();
    if (name === 'upgrades') renderUpgrades();
    $('content').scrollTop = 0;
  }

  /* ================= OFFLINE PROGRESS ================= */
  function processOffline() {
    const now = Date.now();
    const away = Math.min((now - (S.lastActive || now)) / 1000, 8 * 3600); // cap 8h
    if (away < 60 || S._dps <= 0) return;
    // sustained coins/sec at current floor
    const rocksPerSec = S._dps / rockHp(S.floor);
    const coinsPerSec = rocksPerSec * coinReward(S.floor) * M.coin * 0.5; // 50% offline efficiency
    const earned = Math.floor(coinsPerSec * away);
    if (earned <= 0) return;
    S.coins += earned;
    const body = $('offline-body');
    body.innerHTML = `You were away for <b>${fmtTime(away)}</b>.<br>Your Orbies mined <b>🪙 ${fmt(earned)}</b> coins while you rested!`;
    $('offline-modal').classList.add('show');
  }

  /* ================= MAIN LOOP ================= */
  let lastTick = performance.now();
  let saveTimer = 0, gardenTimer = 0;
  function tick() {
    const now = performance.now();
    let dt = (now - lastTick) / 1000; lastTick = now;
    if (dt > 1) dt = 1; // clamp big gaps

    // auto mining
    if (S._dps > 0) dealDamage(S._dps * dt, false);

    // boss timer
    if (S.rock && S.rock.boss) {
      S.bossTimeLeft -= dt;
      if (S.bossTimeLeft <= 0) { S.rock.hp = S.rock.maxHp; S.bossTimeLeft = 30; renderMineHp(); toast('⏳ Boss recovered! Hit harder!'); }
      renderMineBoss();
    }

    // tickets
    refillTickets(dt);

    // periodic renders
    renderResources(); renderPowerStrip();

    // ticket timer text + arena refresh if visible
    if ($('panel-arena').classList.contains('active')) {
      const cap = TICKET_MAX + M.ticketBonus;
      const tt = $('ticket-timer');
      if (tt && S.arena.tickets < cap) {
        const left = TICKET_SECS - (Date.now() - S.arena.ticketAt) / 1000;
        tt.textContent = '(next in ' + fmtTime(left) + ')';
      } else if (tt) tt.textContent = '(full)';
    }

    // garden live refresh
    gardenTimer += dt;
    if (gardenTimer > 1) {
      gardenTimer = 0;
      if ($('panel-garden').classList.contains('active')) renderGarden();
    }

    // summon button affordability while open
    if ($('panel-summon').classList.contains('active')) {
      $('summon-1').disabled = !canAfford('coins', S._singleCost || 100);
      $('summon-10').disabled = !canAfford('gems', 10);
    }

    // autosave
    saveTimer += dt;
    if (saveTimer > 15) { saveTimer = 0; save(); }
  }

  /* ================= EVENT WIRING ================= */
  function wire() {
    // rock
    const rock = $('rock');
    const hitRock = (clientX, clientY) => {
      S.stats.taps++;
      dealDamage(S._click, true, clientX, clientY);
      rock.classList.remove('hit'); void rock.offsetWidth; rock.classList.add('hit');
    };
    rock.addEventListener('click', (e) => hitRock(e.clientX, e.clientY));

    // floor nav
    $('floor-prev').onclick = () => setFloor(S.floor - 1);
    $('floor-next').onclick = () => setFloor(S.floor + 1);

    // nav
    document.querySelectorAll('.nav-btn').forEach((b) => b.onclick = () => switchPanel(b.dataset.panel));

    // summon
    $('summon-1').onclick = () => {
      if (!canAfford('coins', S._singleCost)) { toast('Not enough 🪙'); return; }
      S.coins -= S._singleCost; doSummon(1, 0, false); renderSummonMeta();
    };
    $('summon-10').onclick = () => {
      if (!canAfford('gems', 10)) { toast('Need 10 💎'); return; }
      S.gems -= 10; doSummon(10, 0, true); renderSummonMeta();
    };

    // garden
    $('expand-garden').onclick = expandGarden;

    // arena
    $('arena-fight').onclick = arenaFight;

    // collection subtabs
    document.querySelectorAll('#col-subtabs .subtab').forEach((b) => b.onclick = () => { colSub = b.dataset.sub; renderCollection(); });
    $('open-totem-pack').onclick = openTotemPack;
    $('open-ring-pack').onclick = openRingPack;

    // menu
    $('menu-btn').onclick = () => { renderMenuStats(); $('menu-modal').classList.add('show'); };
    $('btn-close-menu').onclick = () => $('menu-modal').classList.remove('show');
    $('menu-modal').addEventListener('click', (e) => { if (e.target === $('menu-modal')) $('menu-modal').classList.remove('show'); });
    $('btn-save').onclick = () => { save(); toast('💾 Saved!'); };
    $('btn-export').onclick = () => {
      const data = btoa(unescape(encodeURIComponent(JSON.stringify(S))));
      const m = openModal('<h3>📤 Export Save</h3><p style="font-size:12px;color:var(--ink-dim)">Copy this code to back up your game:</p><textarea style="width:100%;height:120px;background:#1a1030;color:#fff;border-radius:8px;border:1px solid #444;padding:8px;font-size:11px">' + data + '</textarea><button class="btn ghost" id="ex-close">Close</button>');
      m.m.querySelector('#ex-close').onclick = m.close;
      m.m.querySelector('textarea').select();
    };
    $('btn-import').onclick = () => {
      const m = openModal('<h3>📥 Import Save</h3><p style="font-size:12px;color:var(--ink-dim)">Paste a save code:</p><textarea id="imp" style="width:100%;height:120px;background:#1a1030;color:#fff;border-radius:8px;border:1px solid #444;padding:8px;font-size:11px"></textarea><button class="btn primary" id="imp-go">Import</button><button class="btn ghost" id="imp-close">Cancel</button>');
      m.m.querySelector('#imp-close').onclick = m.close;
      m.m.querySelector('#imp-go').onclick = () => {
        try {
          const raw = decodeURIComponent(escape(atob(m.m.querySelector('#imp').value.trim())));
          const d = JSON.parse(raw);
          S = Object.assign(freshState(), d); save();
          location.reload();
        } catch (e) { toast('Invalid save code'); }
      };
    };
    $('btn-reset').onclick = () => {
      const m = openModal('<h3>🗑️ Hard Reset</h3><p style="font-size:13px">This erases <b>everything</b> and starts a brand new game. Are you sure?</p><button class="btn danger" id="rs-yes">Yes, wipe it all</button><button class="btn ghost" id="rs-no">Cancel</button>');
      m.m.querySelector('#rs-no').onclick = m.close;
      m.m.querySelector('#rs-yes').onclick = () => { localStorage.removeItem(SAVE_KEY); location.reload(); };
    };

    // offline collect
    $('btn-collect-offline').onclick = () => $('offline-modal').classList.remove('show');

    // save on hide/unload
    document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
    window.addEventListener('beforeunload', save);
  }

  /* ================= INIT ================= */
  function init() {
    if (!load()) { S = freshState(); }
    // weekly reset check
    if (S.arena.week !== weekIndex()) {
      S.arena.week = weekIndex();
      toast('🏅 New arena week! Leaderboard reset.');
    }
    recalc();

    // starter gift on very first run
    if (S.firstRun && Object.keys(S.orbies).length === 0) {
      S.orbies['pib_ember'] = { copies: 0, level: 1, fed: 0 };
      S.coins = 50;
      S.firstRun = false;
      recalc();
      setTimeout(() => toast('🎁 A wild Ember Pib joined you! Tap rocks to begin.'), 900);
    }

    spawnRock();
    renderMineHead(); renderMineFp(); renderResources(); renderPowerStrip();
    wire();
    processOffline();

    // boot fade
    setTimeout(() => { $('boot').classList.add('hide'); }, 650);

    // start loop
    setInterval(tick, 100);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
