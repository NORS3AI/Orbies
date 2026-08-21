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

  // ================= Expanded roster =================
  // ---- Common ----
  ['snaily',     'Snaily',     '🐌', 'common', 'Earth',    'power',    'Slow, steady, and weirdly good at demolition.'],
  ['chirpling',  'Chirpling',  '🐤', 'common', 'Air',      'tap',      'Sings a tapping rhythm you cannot help but follow.'],
  ['tadwick',    'Tadwick',    '🐟', 'common', 'Water',    'balanced', 'Not quite a frog yet, and already a hard worker.'],
  ['pinepix',    'Pinepix',    '🌲', 'common', 'Nature',   'lucky',    'Sheds little cones that clink suspiciously like coins.'],
  ['emberling',  'Emberling',  '🔥', 'common', 'Fire',     'tap',      'A spark with two tiny legs and enormous ambition.'],
  ['pebblepup',  'Pebblepup',  '🐩', 'common', 'Earth',    'balanced', 'Fetches rocks so you have something to break.'],
  ['droplet',    'Droplet',    '🌧️', 'common', 'Water',    'lucky',    'Wherever it drizzles, small change appears.'],
  ['fuzzbee',    'Fuzzbee',    '🐞', 'common', 'Nature',   'tap',      'Ladybug luck folded into a hardworking package.'],
  ['staticat',   'Staticat',   '🐈‍⬛', 'common', 'Electric', 'tap',      'Every pat gives off a small, helpful zap.'],
  ['minnow',     'Minnow',     '🐡', 'common', 'Water',    'tap',      'Small, spiky, and endlessly enthusiastic.'],
  ['sootmoth',   'Sootmoth',   '🌫️', 'common', 'Dark',     'lucky',    'Flutters through the soot and comes out shiny.'],
  ['acoret',     'Acoret',     '🐿️', 'common', 'Nature',   'lucky',    'Hoards acorns and, every so often, gold.'],
  ['breezle',    'Breezle',    '💨', 'common', 'Air',      'tap',      'A giggling gust that loves to knock on stone.'],
  ['crablet',    'Crablet',    '🦀', 'common', 'Water',    'power',    'Pinches boulders apart, sideways, out of spite.'],

  // ---- Uncommon ----
  ['tuskling',   'Tuskling',   '🐗', 'uncommon', 'Earth',    'power',    'Charges rocks like they owe it money.'],
  ['galepine',   'Galepine',   '🪶', 'uncommon', 'Air',      'tap',      'Rides thermals, then dives on stubborn stones.'],
  ['reefox',     'Reefox',     '🐙', 'uncommon', 'Water',    'balanced', 'Eight arms means eight times the mining.'],
  ['glowbug',    'Glowbug',    '🪲', 'uncommon', 'Electric', 'lucky',    'Lights up gold veins with a soft green buzz.'],
  ['bouldric',   'Bouldric',   '🗿', 'uncommon', 'Earth',    'power',    'An outcrop that up and decided to help out.'],
  ['frostpaw',   'Frostpaw',   '🐾', 'uncommon', 'Ice',      'power',    'Leaves frozen pawprints and cracked stone.'],
  ['saplin',     'Saplin',     '🌿', 'uncommon', 'Nature',   'balanced', 'A cheerful shoot that simply refuses to stop growing.'],
  ['cindercub',  'Cindercub',  '🐅', 'uncommon', 'Fire',     'power',    'Bats rocks to pieces with molten little paws.'],
  ['brineel',    'Brineel',    '🐍', 'uncommon', 'Water',    'tap',      'Zips through tunnels leaving salt and sparks.'],
  ['duskraven',  'Duskraven',  '🐦‍⬛', 'uncommon', 'Dark',     'lucky',    'Trades secrets for shiny things at dusk.'],
  ['flarefin',   'Flarefin',   '🦈', 'uncommon', 'Fire',     'power',    'A shark that runs warm and bites through rock.'],
  ['meadowlark', 'Meadowlark', '🐦', 'uncommon', 'Air',      'lucky',    'Its morning song makes the whole garden richer.'],
  ['quartzkit',  'Quartzkit',  '🐇', 'uncommon', 'Earth',    'tap',      'Thumps quartz until it sings and splits.'],
  ['seedling',   'Seedling',   '🌾', 'uncommon', 'Nature',   'lucky',    'Scatters grain that sometimes lands as coin.'],

  // ---- Rare ----
  ['thunderroc', 'Thunderroc', '🦤', 'rare', 'Electric', 'power',    'Wingbeats crack like thunder over the deep.'],
  ['emberox',    'Emberox',    '🐂', 'rare', 'Fire',     'power',    'Snorts embers; its horns split basalt clean.'],
  ['coralith',   'Coralith',   '🐚', 'rare', 'Water',    'balanced', 'A living reef with a discerning taste for treasure.'],
  ['verdania',   'Verdania',   '🦥', 'rare', 'Nature',   'lucky',    'So slow it finds the gold everyone else walked past.'],
  ['plumida',    'Plumida',    '🦚', 'rare', 'Light',    'lucky',    'Fans out feathers that glitter like fresh-minted coins.'],
  ['gravelox',   'Gravelox',   '🦬', 'rare', 'Earth',    'power',    'A boulder-bison that flattens whatever it charges.'],
  ['frostfang',  'Frostfang',  '🐊', 'rare', 'Ice',      'power',    'A cold-blooded ambusher with a diamond bite.'],
  ['tidepiper',  'Tidepiper',  '🦭', 'rare', 'Water',    'tap',      'Claps the waves and cracks the seafloor stones.'],
  ['lumewisp',   'Lumewisp',   '🕯️', 'rare', 'Light',    'lucky',    'A wandering flame that points the way to riches.'],
  ['duneroc',    'Duneroc',    '🦂', 'rare', 'Earth',    'power',    'Stings stone into submission out in the wastes.'],
  ['prismray',   'Prismray',   '🌈', 'rare', 'Light',    'lucky',    'Bends light into loot nobody else can even see.'],
  ['voltiger',   'Voltiger',   '🐯', 'rare', 'Electric', 'tap',      'Stripes crackle; every swat is a thunderclap.'],
  ['grovemother','Grovemother','🌳', 'rare', 'Nature',   'balanced', 'The oldest sapling, root-deep in quiet fortune.'],

  // ---- Epic ----
  ['stormdrake',  'Stormdrake',  '🐲', 'epic', 'Electric', 'power', 'A storm given scales, teeth, and a temper.'],
  ['frostwyrm',   'Frostwyrm',   '❄️', 'epic', 'Ice',      'power', 'Breathes blizzards that shatter boss gates.'],
  ['voidraven',   'Voidraven',   '🌑', 'epic', 'Dark',     'lucky', 'Wings folded from the space between the stars.'],
  ['titanox',     'Titanox',     '🦏', 'epic', 'Earth',    'power', 'A living mountain range with an attitude.'],
  ['aurelion',    'Aurelion',    '🌞', 'epic', 'Light',    'power', 'A pocket sunrise that burns away the dark.'],
  ['maelling',    'Maelling',    '🌊', 'epic', 'Water',    'power', 'A whirlpool with a will and a grudge against rock.'],
  ['phoenixia',   'Phoenixia',   '🐦‍🔥', 'epic', 'Fire',     'tap',   'Reborn from every rock it reduces to ash.'],
  ['verdantitan', 'Verdantitan', '🌴', 'epic', 'Nature',   'power', 'Its roots crack continents; its leaves shade your gold.'],
  ['galewing',    'Galewing',    '🌪️', 'epic', 'Air',      'tap',   'A cyclone that learned to tap on command.'],
  ['shadepard',   'Shadepard',   '🖤', 'epic', 'Dark',     'power', 'Stalks the dark and pounces clean through stone.'],

  // ---- Legendary ----
  ['astravalt',  'Astravalt',   '🌠', 'legendary', 'Cosmic', 'power',    'Rides a falling star straight through the bedrock.'],
  ['luminark',   'Luminark',    '🌟', 'legendary', 'Light',  'lucky',    'A beacon that turns any midnight mine to high noon.'],
  ['tempestria', 'Tempestria',  '⛈️', 'legendary', 'Electric','power',    'Keeps a private thunderstorm as an obedient pet.'],
  ['gaialoth',   'Gaialoth',    '🏔️', 'legendary', 'Earth',  'power',    'Wears a mountain the way you might wear a hat.'],
  ['abyssaria',  'Abyssaria',   '🌌', 'legendary', 'Dark',   'lucky',    'Fishes for fortune in the very deepest dark.'],
  ['floralux',   'Floralux',    '🌸', 'legendary', 'Nature', 'lucky',    'Blooms once an age; its petals fall as gemstones.'],
  ['pyrothos',   'Pyrothos',    '🌋', 'legendary', 'Fire',   'power',    'A volcano patiently taught to purr and to mine.'],
  ['glacierna',  'Glacierna',   '🧊', 'legendary', 'Ice',    'balanced', 'An eternal winter, gentle as a lullaby.'],

  // ---- Mythic ----
  ['cosmara',    'Cosmara',      '🪐', 'mythic', 'Cosmic', 'lucky',    'Wears the rings of a whole planet as a crown.'],
  ['eterna',     'Eterna',       '♾️', 'mythic', 'Cosmic', 'balanced', 'Has always been here. Will always be mining.'],
  ['dracosol',   'Dracosol',     '☄️', 'mythic', 'Fire',   'power',    'A comet with wings; boss gates simply evaporate.'],
  ['umbrix',     'Umbrix',       '🕳️', 'mythic', 'Dark',   'power',    'The hunger of the void, given a friendly little face.'],
  ['lumina',     'Lumina Prime', '💫', 'mythic', 'Light',  'lucky',    'Pure daylight, folded small enough to carry.'],
  ['gaiacore',   'Gaiacore',     '🌍', 'mythic', 'Earth',  'balanced', 'The steady heartbeat at the center of the world.'],
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
