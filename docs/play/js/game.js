/* Orbies — game logic: mining, summoning, garden, arena, packs, the tick loop. */

let DERIVED = null;         // cached computed stats, refreshed each frame
let lastTick = Date.now();
const floaters = [];        // transient "+123" popups over the rock

// ---- Init a rock if none is loaded ----
function ensureRock() {
  if (STATE.rockMaxHp <= 0) {
    STATE.rockMaxHp = rockMaxHpFor(STATE.floor, STATE.rockIndex, STATE.isBoss);
    STATE.rockHp = STATE.rockMaxHp;
  }
}

function grantOrby(id) {
  const o = STATE.orbies[id];
  if (o) { o.count += 1; }
  else { STATE.orbies[id] = { count: 1, level: 1 }; }
  STATE.seen[id] = true;
  // Auto-add to team if there's an empty slot and it's not already there.
  if (STATE.team.length < TUNE.teamSize && !STATE.team.includes(id)) {
    STATE.team.push(id);
  }
}

// ---- Mining ----
function damageRock(amount, fromTap) {
  ensureRock();
  STATE.rockHp -= amount;
  if (fromTap) {
    STATE.stats.taps++;
    addFloater(Math.round(amount), false);
  }
  while (STATE.rockHp <= 0) {
    breakRock();
    if (STATE.rockHp <= 0 && DERIVED && DERIVED.dps <= 0) break; // safety
  }
}

function breakRock() {
  const reward = Math.round(rockReward() * (DERIVED ? DERIVED.goldMult : 1));
  addGold(reward);
  addFloater(reward, true);
  STATE.stats.rocksBroken++;

  if (STATE.isBoss) {
    STATE.stats.bossesBeaten++;
    const gems = Math.round((1 + Math.floor(STATE.floor / 4)) * (DERIVED ? DERIVED.gemFind : 1));
    STATE.gems += gems;
    toast('🎉 Boss down! Floor ' + (STATE.floor + 1) + ' unlocked · +' + gems + ' 💎');
    STATE.floor++;
    STATE.rockIndex = 0;
    STATE.isBoss = false;
  } else {
    STATE.rockIndex++;
    if (STATE.rockIndex >= TUNE.rocksPerFloor) {
      STATE.isBoss = true; // next target is the floor boss
    }
  }
  STATE.rockMaxHp = rockMaxHpFor(STATE.floor, STATE.rockIndex, STATE.isBoss);
  STATE.rockHp = STATE.rockMaxHp;
}

function tapRock() {
  DERIVED = computeStats();
  // Small chance of a x5 critical tap for a bit of juice.
  let dmg = DERIVED.clickDamage;
  const crit = Math.random() < 0.10;
  if (crit) dmg *= 5;
  damageRock(dmg, true);
  if (crit) toastMini('CRIT!');
  refreshUI();
}

function addGold(n) {
  STATE.gold += n;
  STATE.stats.totalGold += n;
}

// ---- Upgrades ----
function upgradeCost(key) {
  const u = UPGRADES[key];
  return Math.ceil(u.base * Math.pow(u.mult, STATE.upgrades[key]));
}
function buyUpgrade(key) {
  const cost = upgradeCost(key);
  if (STATE.gold < cost) { toast('Not enough gold.'); return; }
  STATE.gold -= cost;
  STATE.upgrades[key]++;
  refreshUI();
}

// ---- Summoning ----
function rollRarity(luckBonus) {
  // Higher rarities get their weight multiplied by (1 + luck) so luck up = rarer.
  const boost = 1 + Math.max(0, luckBonus);
  const entries = RARITY_ORDER.map(r => ({
    r,
    w: RARITIES[r].weight * (r === 'common' ? 1 : (r === 'uncommon' ? 1 + luckBonus * 0.2 : boost)),
  }));
  return weightedPick(entries, e => e.w).r;
}

function summon(eggKey) {
  const egg = EGGS[eggKey];
  // Pay cost
  for (const k in egg.cost) {
    if ((STATE[k] || 0) < egg.cost[k]) { toast('Not enough ' + k + '.'); return null; }
  }
  for (const k in egg.cost) STATE[k] -= egg.cost[k];

  const rarity = rollRarity(egg.luckBonus + (DERIVED ? DERIVED.luckBonus : 0));
  const pool = ORBY_IDS.filter(id => ORBIES[id].rarity === rarity);
  const id = choice(pool);
  const isNew = !STATE.orbies[id] || STATE.orbies[id].count === 0;
  grantOrby(id);
  STATE.stats.summons++;
  checkAchievements();
  refreshUI();
  return { id, rarity, isNew };
}

// ---- Leveling & stars ----
function levelCost(id) {
  const o = STATE.orbies[id];
  const rarityMult = { common: 1, uncommon: 1.5, rare: 2.5, epic: 5, legendary: 10, mythic: 25 }[ORBIES[id].rarity];
  const food = Math.ceil((4 + o.level * 3) * rarityMult);
  const gold = Math.ceil((10 + o.level * 8) * rarityMult * Math.pow(1.05, o.level));
  return { food, gold };
}
function levelUpOrby(id) {
  const o = STATE.orbies[id];
  if (!o) return;
  const c = levelCost(id);
  if (STATE.food < c.food) { toast('Need ' + c.food + ' 🍖 food.'); return; }
  if (STATE.gold < c.gold) { toast('Need ' + fmt(c.gold) + ' gold.'); return; }
  STATE.food -= c.food;
  STATE.gold -= c.gold;
  o.level++;
  refreshUI();
}

function toggleTeam(id) {
  const i = STATE.team.indexOf(id);
  if (i >= 0) { STATE.team.splice(i, 1); }
  else {
    if (STATE.team.length >= TUNE.teamSize) { toast('Team is full (' + TUNE.teamSize + ').'); return; }
    STATE.team.push(id);
  }
  refreshUI();
}

// ---- Garden ----
function gardenSlot(i) { return STATE.garden[i] || null; }
function plantCrop(i, cropKey) {
  if (i >= STATE.plotsUnlocked) return;
  const crop = CROPS[cropKey];
  for (const k in crop.seed) {
    if ((STATE[k] || 0) < crop.seed[k]) { toast('Not enough ' + k + ' for seeds.'); return; }
  }
  for (const k in crop.seed) STATE[k] -= crop.seed[k];
  STATE.garden[i] = { crop: cropKey, plantedAt: Date.now() };
  refreshUI();
}
function cropReadyAt(slot) { return slot.plantedAt + CROPS[slot.crop].grow * 1000; }
function harvestCrop(i) {
  const slot = gardenSlot(i);
  if (!slot) return;
  if (Date.now() < cropReadyAt(slot)) return;
  const crop = CROPS[slot.crop];
  for (const k in crop.yield) STATE[k] = (STATE[k] || 0) + crop.yield[k];
  STATE.garden[i] = null;
  STATE.stats.harvests++;
  checkAchievements();
  refreshUI();
}
function plotUpgradeCost() { return Math.ceil(500 * Math.pow(2.2, STATE.plotsUnlocked - 3)); }
function buyPlot() {
  if (STATE.plotsUnlocked >= 8) { toast('All plots unlocked!'); return; }
  const cost = plotUpgradeCost();
  if (STATE.gold < cost) { toast('Need ' + fmt(cost) + ' gold.'); return; }
  STATE.gold -= cost;
  STATE.plotsUnlocked++;
  refreshUI();
}

// ---- Rings / packs ----
function openPack() {
  if (STATE.dust < PACK_COST.dust) { toast('Need ' + PACK_COST.dust + ' dust.'); return null; }
  STATE.dust -= PACK_COST.dust;
  const type = choice(Object.keys(RING_TYPES));
  const tier = weightedPick(
    [1, 2, 3, 4, 5].map(t => ({ t })),
    e => RING_TIER_WEIGHT[e.t]
  ).t;
  const ring = { uid: uid('ring'), type, tier };
  STATE.rings.push(ring);
  refreshUI();
  return ring;
}
function equipRing(u) {
  if (STATE.equipped.includes(u)) { // unequip
    STATE.equipped = STATE.equipped.filter(x => x !== u);
  } else {
    if (STATE.equipped.length >= 3) { toast('Only 3 rings can be equipped.'); return; }
    STATE.equipped.push(u);
  }
  refreshUI();
}
function meltRing(u) {
  const r = STATE.rings.find(x => x.uid === u);
  if (!r) return;
  const dust = 8 * r.tier;
  STATE.rings = STATE.rings.filter(x => x.uid !== u);
  STATE.equipped = STATE.equipped.filter(x => x !== u);
  STATE.dust += dust;
  toast('Melted for +' + dust + ' dust.');
  refreshUI();
}

// ---- Arena ----
function regenEnergy() {
  const a = STATE.arena;
  if (!a.energyAt) a.energyAt = Date.now();
  if (a.energy >= TUNE.arenaMaxEnergy) { a.energyAt = Date.now(); return; }
  const elapsed = (Date.now() - a.energyAt) / 1000;
  const gained = Math.floor(elapsed / TUNE.arenaEnergyRegen);
  if (gained > 0) {
    a.energy = Math.min(TUNE.arenaMaxEnergy, a.energy + gained);
    a.energyAt = a.energy >= TUNE.arenaMaxEnergy ? Date.now() : a.energyAt + gained * TUNE.arenaEnergyRegen * 1000;
  }
}
function battlePower() {
  const d = DERIVED || computeStats();
  return d.dps * 1.0 + d.clickDamage * 3 + d.teamDps * 0.5 + 5;
}
function arenaFight() {
  regenEnergy();
  const a = STATE.arena;
  if (a.energy <= 0) { toast('Out of energy — it refills over time.'); return null; }
  a.energy--;
  if (a.energy === TUNE.arenaMaxEnergy - 1) a.energyAt = Date.now();

  const bp = battlePower();
  const enemy = 20 * Math.pow(1.24, a.rank - 1) * (0.85 + Math.random() * 0.3);
  const winChance = bp / (bp + enemy);
  const win = Math.random() < winChance;

  let result;
  if (win) {
    a.rank++;
    a.bestRank = Math.max(a.bestRank, a.rank);
    const trophies = 10 + a.rank;
    a.trophies += trophies;
    const gems = 2 + Math.floor(a.rank / 3);
    STATE.gems += gems;
    let dust = 0;
    if (Math.random() < 0.5) { dust = randInt(10, 25); STATE.dust += dust; }
    result = { win: true, rank: a.rank, trophies, gems, dust, enemyName: choice(RIVAL_NAMES) };
  } else {
    if (a.rank > 1 && Math.random() < 0.5) a.rank--; // slip a rank sometimes
    a.trophies += 2;
    result = { win: false, rank: a.rank, trophies: 2, gems: 0, dust: 0, enemyName: choice(RIVAL_NAMES) };
  }
  a.log.unshift((win ? '🏆 Beat ' : '💥 Lost to ') + result.enemyName + (win ? ' · +' + result.gems + '💎' : ''));
  a.log = a.log.slice(0, 6);
  checkAchievements();
  refreshUI();
  return result;
}

// Deterministic-ish leaderboard around the player's trophies (regenerates weekly).
function currentWeek() { return Math.floor(Date.now() / (7 * 24 * 3600 * 1000)); }
function leaderboard() {
  const you = STATE.arena.trophies;
  const seed = currentWeek();
  const rows = [];
  for (let i = 0; i < RIVAL_NAMES.length; i++) {
    // Pseudo-random but stable within a week.
    const n = Math.abs(Math.sin(seed * 97 + i * 131) * 10000) % 1;
    const spread = Math.floor((n - 0.5) * Math.max(80, you * 1.4)) + Math.floor(you * (0.6 + n * 0.8));
    rows.push({ name: RIVAL_NAMES[i], trophies: Math.max(0, spread), you: false });
  }
  rows.push({ name: 'You', trophies: you, you: true });
  rows.sort((a, b) => b.trophies - a.trophies);
  return rows.slice(0, 10);
}

// ---- Achievements ----
function checkAchievements() {
  for (const a of ACHIEVEMENTS) {
    if (STATE.achievements[a.id]) continue;
    if (a.test(STATE)) {
      STATE.achievements[a.id] = true;
      for (const k in a.reward) STATE[k] = (STATE[k] || 0) + a.reward[k];
      toast('🏅 ' + a.name + ' — ' + Object.entries(a.reward).map(([k, v]) => '+' + v + ' ' + k).join(', '));
    }
  }
}

// ---- Floaters (visual +damage / +gold text) ----
function addFloater(value, isGold) {
  floaters.push({ text: (isGold ? '+' + fmt(value) : '-' + fmt(value)), isGold, t: 1, x: 30 + Math.random() * 40, y: 40 });
}

// ---- The tick loop ----
function tick() {
  const now = Date.now();
  let dt = (now - lastTick) / 1000;
  lastTick = now;
  dt = clamp(dt, 0, 1); // guard against tab-throttle spikes; offline handled separately

  DERIVED = computeStats();
  ensureRock();

  if (DERIVED.dps > 0) damageRock(DERIVED.dps * dt, false);
  regenEnergy();

  // Age floaters
  for (let i = floaters.length - 1; i >= 0; i--) {
    floaters[i].t -= dt * 1.3;
    if (floaters[i].t <= 0) floaters.splice(i, 1);
  }

  checkAchievements();
  tickUI();
}

// ---- Offline / welcome-back ----
function applyOffline() {
  const now = Date.now();
  const elapsed = Math.min((now - STATE.lastSave) / 1000, TUNE.offlineCapHours * 3600);
  if (elapsed < 30) return null; // ignore short gaps
  DERIVED = computeStats();
  ensureRock();
  const gps = DERIVED.goldPerSec;
  const gold = Math.floor(gps * elapsed * TUNE.offlineEfficiency);
  if (gold > 0) addGold(gold);
  return { seconds: elapsed, gold };
}
