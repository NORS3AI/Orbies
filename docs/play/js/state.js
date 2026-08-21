/* Orbies — game state: defaults, persistence, and derived stats. */

const SAVE_KEY = 'orbies_save_v1';
const SAVE_VERSION = 1;

function defaultState() {
  return {
    version: SAVE_VERSION,
    gold: 0,
    gems: 0,
    food: 0,
    dust: 0,

    // Mining progression
    floor: 1,
    rockIndex: 0,          // 0..rocksPerFloor-1, then a boss
    rockHp: 0,             // filled in on init
    rockMaxHp: 0,
    isBoss: false,

    // Upgrades
    upgrades: { pick: 0, drill: 0, fortune: 0 },

    // Roster: id -> { count, level }
    orbies: {},
    team: [],              // ordered list of owned ids, max TUNE.teamSize
    seen: {},              // id -> true, for the collection "discovered" flag

    // Garden
    plotsUnlocked: 3,
    garden: [],            // array of { crop, plantedAt } | null

    // Rings
    rings: [],             // { uid, type, tier }
    equipped: [],          // uids, max 3

    // Arena
    arena: {
      rank: 1,
      bestRank: 1,
      trophies: 0,
      energy: TUNE.arenaMaxEnergy,
      energyAt: 0,         // timestamp of last energy accounting
      week: 0,
      log: [],
    },

    achievements: {},      // id -> true when claimed

    stats: {
      totalGold: 0,
      taps: 0,
      rocksBroken: 0,
      bossesBeaten: 0,
      summons: 0,
      harvests: 0,
    },

    lastSave: Date.now(),
    createdAt: Date.now(),
  };
}

let STATE = defaultState();

// ---- Persistence ----
function saveGame() {
  STATE.lastSave = Date.now();
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(STATE));
  } catch (e) { /* storage may be blocked; game still runs in-memory */ }
}

function loadGame() {
  let raw = null;
  try { raw = localStorage.getItem(SAVE_KEY); } catch (e) { raw = null; }
  if (!raw) { STATE = defaultState(); return false; }
  try {
    const data = JSON.parse(raw);
    STATE = mergeState(defaultState(), data);
    return true;
  } catch (e) {
    STATE = defaultState();
    return false;
  }
}

// Shallow-merge a loaded save onto fresh defaults so new fields are never missing.
function mergeState(base, saved) {
  const out = Object.assign({}, base, saved);
  out.upgrades = Object.assign({}, base.upgrades, saved.upgrades || {});
  out.arena = Object.assign({}, base.arena, saved.arena || {});
  out.stats = Object.assign({}, base.stats, saved.stats || {});
  out.orbies = saved.orbies || {};
  out.team = Array.isArray(saved.team) ? saved.team.slice(0, TUNE.teamSize) : [];
  out.garden = Array.isArray(saved.garden) ? saved.garden : [];
  out.rings = Array.isArray(saved.rings) ? saved.rings : [];
  out.equipped = Array.isArray(saved.equipped) ? saved.equipped : [];
  out.seen = saved.seen || {};
  out.achievements = saved.achievements || {};
  return out;
}

function hardReset() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
  STATE = defaultState();
}

// ---- Derived stats -------------------------------------------------------
// Everything the game reads each frame is computed here from raw state, so the
// numbers can never drift out of sync with what the player owns.

function ownedLevel(id) {
  const o = STATE.orbies[id];
  return o ? o.level : 0;
}

// Effective per-copy stats for one owned species (accounts for level + stars).
function orbyStats(id) {
  const o = STATE.orbies[id];
  const def = ORBIES[id];
  if (!o || !def || o.count <= 0) return { dps: 0, tap: 0, goldPts: 0 };
  const star = 1 + (o.count - 1) * TUNE.starPerCopy;
  const lvl = o.level;
  return {
    dps: def.dpsBase * lvl * star,
    tap: def.tapBase * lvl * star,
    goldPts: def.goldBase * (1 + (lvl - 1) * TUNE.levelGoldGrowth) * star,
  };
}

function ringBonuses() {
  const b = { gold: 0, dps: 0, click: 0, luck: 0, gem: 0 };
  for (const uid of STATE.equipped) {
    const r = STATE.rings.find(x => x.uid === uid);
    if (!r) continue;
    const t = RING_TYPES[r.type];
    b[t.stat] += t.per * r.tier;
  }
  return b;
}

function computeStats() {
  const rings = ringBonuses();

  // Team contributions
  let teamDps = 0, teamTap = 0, goldPts = 0;
  for (const id of STATE.team) {
    const st = orbyStats(id);
    teamDps += st.dps;
    teamTap += st.tap;
    goldPts += st.goldPts;
  }

  // Collection (owned-but-not-required-on-team) passive bonuses
  const uniq = uniqueOwnedCount(STATE);
  const collectionGold = uniq * TUNE.collectionGoldPer;
  const collectionDps = uniq * TUNE.collectionDpsPer;

  const up = STATE.upgrades;

  const baseTap = 1 + up.pick * UPGRADES.pick.effect + teamTap;
  const baseDps = up.drill * UPGRADES.drill.effect + teamDps;

  const clickDamage = baseTap * (1 + rings.click);
  const dps = baseDps * (1 + collectionDps) * (1 + rings.dps);

  const goldMult = 1
    + up.fortune * UPGRADES.fortune.effect
    + goldPts * 0.02
    + collectionGold
    + rings.gold;

  const gemFind = 1 + rings.gem;
  const luckBonus = rings.luck; // extra weight multiplier toward rarer eggs

  return {
    clickDamage, dps, goldMult, gemFind, luckBonus,
    teamDps, teamTap, goldPts, uniq, rings,
    goldPerSec: estimateGps(dps, goldMult),
  };
}

// Rough idle gold/sec, used for the readout and offline earnings.
function estimateGps(dps, goldMult) {
  if (STATE.rockMaxHp <= 0) return 0;
  const perRock = rockReward() * goldMult;
  return (dps / STATE.rockMaxHp) * perRock;
}

// ---- Mining reward / hp curves ----
function rockReward() {
  const r = TUNE.rewardBase * Math.pow(TUNE.rewardFloorGrowth, STATE.floor - 1);
  return STATE.isBoss ? r * TUNE.bossRewardMult : r;
}
function rockMaxHpFor(floor, index, boss) {
  const fh = TUNE.rockBaseHp * Math.pow(TUNE.rockFloorGrowth, floor - 1);
  const withStep = fh * (1 + index * TUNE.rockInFloorStep);
  return boss ? withStep * TUNE.bossHpMult : withStep;
}
