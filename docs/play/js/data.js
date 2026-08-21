/* Orbies — static game data: roster, rarities, upgrades, crops, rings, tuning. */

const RARITIES = {
  common:    { name: 'Common',    base: 1,   color: '#98a2b3', weight: 5500, dust: 1  },
  uncommon:  { name: 'Uncommon',  base: 3,   color: '#3ecf6b', weight: 2700, dust: 2  },
  rare:      { name: 'Rare',      base: 9,   color: '#3d8bff', weight: 1200, dust: 4  },
  epic:      { name: 'Epic',      base: 30,  color: '#b15cff', weight: 500,  dust: 12 },
  legendary: { name: 'Legendary', base: 120, color: '#ffb020', weight: 90,   dust: 40 },
  mythic:    { name: 'Mythic',    base: 500, color: '#ff4d6d', weight: 10,   dust: 150 },
};
const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];

// How each temperament splits a creature's power budget.
const BIAS = {
  power:    { dps: 1.7, tap: 0.4, gold: 0.4 }, // idle bruiser
  tap:      { dps: 0.8, tap: 1.5, gold: 0.3 }, // click specialist
  lucky:    { dps: 0.7, tap: 0.3, gold: 1.3 }, // gold finder
  balanced: { dps: 1.1, tap: 0.8, gold: 0.8 },
};

// The roster. Stats are derived from rarity + bias so entries stay compact.
// [id, name, emoji, rarity, element, bias, flavor]
const ORBY_DEFS = [
  // ---- Common ----
  ['pebbling',   'Pebbling',   '🐣', 'common', 'Earth',   'balanced', 'Barely hatched, but already eager to help you dig.'],
  ['mossling',   'Mossling',   '🐛', 'common', 'Nature',  'power',    'Smells faintly of a forest right after the rain.'],
  ['dewdrop',    'Dewdrop',    '💧', 'common', 'Water',   'lucky',    'Every tear it sheds hardens into a coin. Weird, but profitable.'],
  ['sparkfly',   'Sparkfly',   '🐝', 'common', 'Electric','tap',      'Zippy, buzzy, and always up for one more tap.'],
  ['cinderpup',  'Cinderpup',  '🐕', 'common', 'Fire',    'power',    'Warm to the touch and loyal to a fault.'],
  ['puddlefrog', 'Puddlefrog', '🐸', 'common', 'Water',   'balanced', 'Ribbits in binary. Nobody has figured out why.'],
  ['sprigg',     'Sprigg',     '🌱', 'common', 'Nature',  'lucky',    'Wherever it wanders, tiny coins sprout in its wake.'],
  ['bramblebun', 'Bramblebun', '🐰', 'common', 'Earth',   'tap',      'Thumps rocks apart with alarming enthusiasm.'],
  ['gustling',   'Gustling',   '🍃', 'common', 'Air',     'tap',      'Faster than it looks, slower than it thinks.'],
  ['embermoth',  'Embermoth',  '🦋', 'common', 'Fire',    'lucky',    'Drawn to anything shiny — especially your gold.'],
  ['mudpip',     'Mudpip',     '🐷', 'common', 'Earth',   'balanced', 'Loves a good wallow between mining shifts.'],
  ['bubblet',    'Bubblet',    '🫧', 'common', 'Water',   'tap',      'Pops rocks the way it pops bubbles: gleefully.'],

  // ---- Uncommon ----
  ['aquafin',   'Aquafin',   '🐬', 'uncommon', 'Water',    'power',    'Rides currents of pure, sloshing enthusiasm.'],
  ['thornback', 'Thornback', '🦔', 'uncommon', 'Earth',    'power',    'Prickly on the outside. Also prickly on the inside.'],
  ['voltkit',   'Voltkit',   '🦊', 'uncommon', 'Electric', 'tap',      'Considers static cling a lifestyle, not a nuisance.'],
  ['bloomcalf', 'Bloomcalf', '🐮', 'uncommon', 'Nature',   'lucky',    'Its gentle moo makes the whole garden grow faster.'],
  ['frostnip',  'Frostnip',  '🐧', 'uncommon', 'Ice',      'balanced', 'Keeps your coins cool and your rocks nice and brittle.'],
  ['duneling',  'Duneling',  '🦎', 'uncommon', 'Earth',    'tap',      'Skitters across dunes, cracking stones for the fun of it.'],
  ['glimmerbat','Glimmerbat','🦇', 'uncommon', 'Dark',     'lucky',    'Deals exclusively in shadows and shiny things.'],
  ['coralkin',  'Coralkin',  '🐠', 'uncommon', 'Water',    'balanced', 'Hums old sea shanties while it works.'],
  ['pyrekit',   'Pyrekit',   '🐈', 'uncommon', 'Fire',     'power',    'Nine lives, and every one of them spent mining.'],
  ['leafcub',   'Leafcub',   '🐨', 'uncommon', 'Nature',   'power',    'Naps in the treetops, wakes up swinging.'],
  ['zapmouse',  'Zapmouse',  '🐭', 'uncommon', 'Electric', 'tap',      'Small shock. Enormous attitude.'],

  // ---- Rare ----
  ['stormtail', 'Stormtail', '🐺', 'rare', 'Electric', 'power',    'Howls thunder until the rocks tremble and split.'],
  ['lumenowl',  'Lumenowl',  '🦉', 'rare', 'Light',    'lucky',    'Can spot a gold vein in total darkness.'],
  ['tidalorca', 'Tidalorca', '🐋', 'rare', 'Water',    'power',    'A gentle giant with an absolutely crushing tap.'],
  ['verdanox',  'Verdanox',  '🦕', 'rare', 'Nature',   'balanced', 'Ancient, patient, and endlessly, stubbornly green.'],
  ['cryostag',  'Cryostag',  '🦌', 'rare', 'Ice',      'tap',      'Antlers sharp enough to chip a diamond in two.'],
  ['auricat',   'Auricat',   '🐆', 'rare', 'Light',    'lucky',    'Purrs, allegedly, in twenty-four karat.'],
  ['prismoth',  'Prismoth',  '🦋', 'rare', 'Light',    'lucky',    'Its wings scatter rainbows — and remarkably rare drops.'],

  // ---- Epic ----
  ['magmawyrm', 'Magmawyrm', '🐉', 'epic', 'Fire',  'power', 'Molten from snout to tail. Melts boss gates like butter.'],
  ['zephyros',  'Zephyros',  '🦅', 'epic', 'Air',   'tap',   'The wind itself, patiently taught how to tap.'],
  ['abyssan',   'Abyssan',   '🦑', 'epic', 'Dark',  'power', 'Hauled up from the trench where light gives up.'],
  ['solmane',   'Solmane',   '🦁', 'epic', 'Light', 'lucky', 'Wears the high-noon sun as a mane.'],

  // ---- Legendary ----
  ['chronoturtle', 'Chronoturtle', '🐢', 'legendary', 'Cosmic', 'balanced', 'Carries yesterday and tomorrow on the same weathered shell.'],
  ['aetherfox',    'Aetherfox',    '🦊', 'legendary', 'Cosmic', 'lucky',    'Nine tails, each one dripping stardust and quiet fortune.'],
  ['terravore',    'Terravore',    '🦖', 'legendary', 'Earth',  'power',    'Eats mountains for breakfast. Leaves the gold behind.'],
  ['glaciathan',   'Glaciathan',   '🐳', 'legendary', 'Ice',    'power',    'An iceberg with strong opinions and a devastating tap.'],

  // ---- Mythic ----
  ['orbomancer', 'Orbomancer', '🔮', 'mythic', 'Cosmic', 'balanced', 'The very first Orby. It remembers when the rocks were young.'],
  ['nyxaria',    'Nyxaria',    '🌙', 'mythic', 'Dark',   'lucky',    'Queen of the quiet hours; the void itself pays her tribute.'],
  ['solaris',    'Solaris Prime','☀️','mythic', 'Light',  'power',    'A captured star, purring contentedly in your pocket.'],
];

// Build a lookup with derived per-copy base stats.
const ORBIES = {};
for (const [id, name, emoji, rarity, element, bias, flavor] of ORBY_DEFS) {
  const base = RARITIES[rarity].base;
  const b = BIAS[bias];
  ORBIES[id] = {
    id, name, emoji, rarity, element, bias, flavor,
    dpsBase: base * b.dps,
    tapBase: base * b.tap,
    goldBase: base * b.gold,
  };
}
const ORBY_IDS = Object.keys(ORBIES);

// ---- Upgrades (cheap early-game boosts; the roster is the real engine) ----
const UPGRADES = {
  pick:    { name: 'Sharper Pickaxe', icon: '⛏️', desc: '+2 tap damage',   base: 15,  mult: 1.16, effect: 2   },
  drill:   { name: 'Auto Drill',      icon: '🛠️', desc: '+3 idle power',   base: 40,  mult: 1.17, effect: 3   },
  fortune: { name: 'Fortune Charm',   icon: '🍀', desc: '+3% gold',        base: 90,  mult: 1.20, effect: 0.03 },
};

// ---- Summoning ----
const EGGS = {
  common:  { name: 'Common Egg',  icon: '🥚', cost: { gold: 120 }, luckBonus: 0,   note: 'Mostly commons, with a chance at more.' },
  premium: { name: 'Gilded Egg',  icon: '🌟', cost: { gems: 45 },  luckBonus: 2.0, note: 'Far better odds. Epics and beyond await.' },
};

// ---- Garden ----
const CROPS = {
  coinbloom: { name: 'Coinbloom', icon: '🌼', grow: 30,  seed: { gold: 40 },  yield: { food: 6 },  note: '30s · +6 food' },
  foodroot:  { name: 'Foodroot',  icon: '🥕', grow: 75,  seed: { gold: 120 }, yield: { food: 20 }, note: '75s · +20 food' },
  gemvine:   { name: 'Gemvine',   icon: '🍇', grow: 300, seed: { gold: 600 }, yield: { food: 15, gems: 1 }, note: '5m · +15 food, +1 gem' },
};

// ---- Rings (from packs; equip up to 3) ----
const RING_TYPES = {
  gold:  { name: 'Coin Ring',   icon: '💛', stat: 'gold',  per: 0.06, label: 'Gold' },
  dps:   { name: 'Power Ring',  icon: '❤️', stat: 'dps',   per: 0.06, label: 'Idle Power' },
  click: { name: 'Tap Ring',    icon: '💙', stat: 'click', per: 0.06, label: 'Tap Power' },
  luck:  { name: 'Luck Ring',   icon: '💚', stat: 'luck',  per: 1.5,  label: 'Rare Odds' },
  gem:   { name: 'Gem Ring',    icon: '💜', stat: 'gem',   per: 0.12, label: 'Gem Find' },
};
const RING_TIER_WEIGHT = [0, 60, 25, 10, 4, 1]; // index = tier 1..5
const PACK_COST = { dust: 60 };

// ---- Tuning constants ----
const TUNE = {
  teamSize: 5,
  rockBaseHp: 12,
  rockFloorGrowth: 1.185,
  rockInFloorStep: 0.09,   // each of the 10 rocks in a floor is a bit tougher
  rocksPerFloor: 10,
  bossHpMult: 7,
  rewardBase: 5,
  rewardFloorGrowth: 1.16,
  bossRewardMult: 8,
  offlineCapHours: 8,
  offlineEfficiency: 0.5,
  arenaMaxEnergy: 5,
  arenaEnergyRegen: 300, // seconds per energy
  starPerCopy: 0.12,
  levelGoldGrowth: 0.5,
  collectionGoldPer: 0.02,
  collectionDpsPer: 0.006,
};

// ---- Achievements ----
const ACHIEVEMENTS = [
  { id: 'firstrock', name: 'First Crack',     desc: 'Break your first rock.',        icon: '🪨', reward: { gems: 5 },  test: s => s.stats.rocksBroken >= 1 },
  { id: 'rock100',   name: 'Rock Hound',      desc: 'Break 100 rocks.',              icon: '⛏️', reward: { gems: 15 }, test: s => s.stats.rocksBroken >= 100 },
  { id: 'rock1k',    name: 'Stone Cold',      desc: 'Break 1,000 rocks.',            icon: '🥌', reward: { gems: 40 }, test: s => s.stats.rocksBroken >= 1000 },
  { id: 'floor10',   name: 'Going Deeper',    desc: 'Reach floor 10.',               icon: '🕳️', reward: { gems: 20 }, test: s => s.floor >= 10 },
  { id: 'floor25',   name: 'Deep Delver',     desc: 'Reach floor 25.',               icon: '🌋', reward: { gems: 60 }, test: s => s.floor >= 25 },
  { id: 'summon10',  name: 'Hatchling',       desc: 'Summon 10 Orbies.',             icon: '🥚', reward: { gems: 15 }, test: s => s.stats.summons >= 10 },
  { id: 'species10', name: 'Collector',       desc: 'Discover 10 species.',          icon: '📖', reward: { gems: 25 }, test: s => uniqueOwnedCount(s) >= 10 },
  { id: 'species25', name: 'Orbypedia',       desc: 'Discover 25 species.',          icon: '📚', reward: { gems: 75 }, test: s => uniqueOwnedCount(s) >= 25 },
  { id: 'legendary', name: 'The Big Pull',    desc: 'Summon a Legendary or Mythic.', icon: '✨', reward: { gems: 50 }, test: s => hasRarity(s, 'legendary') || hasRarity(s, 'mythic') },
  { id: 'harvest20', name: 'Green Thumb',     desc: 'Harvest 20 crops.',             icon: '🌱', reward: { gems: 20 }, test: s => s.stats.harvests >= 20 },
  { id: 'arena10',   name: 'Contender',       desc: 'Reach Arena rank 10.',          icon: '🏆', reward: { gems: 40 }, test: s => s.arena.bestRank >= 10 },
];

// Helpers referenced by achievement tests (state passed in).
function uniqueOwnedCount(s) {
  let n = 0;
  for (const id in s.orbies) if (s.orbies[id] && s.orbies[id].count > 0) n++;
  return n;
}
function hasRarity(s, rarity) {
  for (const id in s.orbies) {
    if (s.orbies[id] && s.orbies[id].count > 0 && ORBIES[id] && ORBIES[id].rarity === rarity) return true;
  }
  return false;
}

// Flavor names for simulated arena rivals / leaderboard.
const RIVAL_NAMES = [
  'PebblePunk', 'GoldGoblin', 'MythicMara', 'IdleIvy', 'CritCarl', 'LuckyLuca',
  'DeepDiverDee', 'OrbLordOtto', 'FarmerFinn', 'GachaGwen', 'RockRhea', 'TapTitan',
  'DustDuke', 'FloorFifty', 'ShinyShae', 'BossBane', 'EmberEli', 'FrostFay',
];
