/* Orbies — rendering. Persistent shell in index.html; tabs render into #tabContent.
 * Live values (rock HP, readouts, timers) update in place so animations survive. */

let ACTIVE_TAB = 'mine';
let lastTabRender = 0;
let mineBuilt = false;

const TABS = [
  { id: 'mine',   label: 'Mine',    icon: '⛏️' },
  { id: 'summon', label: 'Summon',  icon: '🥚' },
  { id: 'orbies', label: 'Orbies',  icon: '🐣' },
  { id: 'garden', label: 'Garden',  icon: '🌱' },
  { id: 'arena',  label: 'Arena',   icon: '🏆' },
  { id: 'rings',  label: 'Rings',   icon: '💍' },
  { id: 'stats',  label: 'Stats',   icon: '📊' },
];

// ---------- Shell ----------
function buildTabBar() {
  const bar = el('tabBar');
  bar.innerHTML = '';
  for (const t of TABS) {
    const b = make('button', 'tab' + (t.id === ACTIVE_TAB ? ' active' : ''),
      '<span class="tab-ico">' + t.icon + '</span><span class="tab-lbl">' + t.label + '</span>');
    b.dataset.action = 'switchtab';
    b.dataset.a1 = t.id;
    bar.appendChild(b);
  }
}

function switchTab(name) {
  ACTIVE_TAB = name;
  mineBuilt = false;
  buildTabBar();
  renderActiveTab();
}

// ---------- Header ----------
function updateHeader() {
  el('resGold').textContent = fmt(STATE.gold);
  el('resGems').textContent = fmt(STATE.gems);
  el('resFood').textContent = fmt(STATE.food);
  el('resDust').textContent = fmt(STATE.dust);
}

// ---------- Dispatch ----------
function renderActiveTab() {
  const c = el('tabContent');
  switch (ACTIVE_TAB) {
    case 'mine':   if (!mineBuilt) renderMine(c); else updateMineLive(); break;
    case 'summon': c.innerHTML = renderSummon(); break;
    case 'orbies': c.innerHTML = renderOrbies(); break;
    case 'garden': c.innerHTML = renderGarden(); break;
    case 'arena':  c.innerHTML = renderArena(); break;
    case 'rings':  c.innerHTML = renderRings(); break;
    case 'stats':  c.innerHTML = renderStats(); break;
  }
}

// Called on every state-changing action: immediate full refresh.
function refreshUI() {
  updateHeader();
  renderActiveTab();
}

// Called by the tick loop: cheap live updates, timers refreshed on a throttle.
function tickUI() {
  updateHeader();
  if (ACTIVE_TAB === 'mine') {
    if (!mineBuilt) renderMine(el('tabContent'));
    updateMineLive();
  } else if (ACTIVE_TAB === 'garden' || ACTIVE_TAB === 'arena') {
    if (Date.now() - lastTabRender > 500) { renderActiveTab(); lastTabRender = Date.now(); }
  }
}

// ---------- Mine ----------
function renderMine(c) {
  const bossNext = STATE.rockIndex >= TUNE.rocksPerFloor;
  c.innerHTML = `
    <div class="mine-wrap">
      <div class="floor-head">
        <div id="floorText" class="floor-title"></div>
        <div id="floorSub" class="floor-sub"></div>
      </div>
      <div class="rock-stage">
        <div id="floaterLayer" class="floater-layer"></div>
        <button id="rockBtn" class="rock-btn" data-action="tap" aria-label="Mine the rock">
          <span id="rockEmoji" class="rock-emoji">🪨</span>
        </button>
        <div class="hp-bar"><div id="rockHpFill" class="hp-fill"></div><span id="rockHpText" class="hp-text"></span></div>
      </div>
      <div class="readouts">
        <div class="readout"><span class="ro-ico">⛏️</span><div><div class="ro-val" id="statClick">0</div><div class="ro-lbl">Tap</div></div></div>
        <div class="readout"><span class="ro-ico">⚙️</span><div><div class="ro-val" id="statDps">0</div><div class="ro-lbl">Idle/s</div></div></div>
        <div class="readout"><span class="ro-ico">🪙</span><div><div class="ro-val" id="statGps">0</div><div class="ro-lbl">Gold/s</div></div></div>
      </div>
      <div class="section-title">Upgrades</div>
      <div class="upgrade-list">
        ${Object.keys(UPGRADES).map(renderUpgradeCard).join('')}
      </div>
      <p class="hint">Tap the rock, or let your team idle-mine for you. Clear 10 rocks to face a <b>boss gate</b> and drop deeper.</p>
    </div>`;
  mineBuilt = true;
  updateMineLive();
}

function renderUpgradeCard(key) {
  const u = UPGRADES[key];
  return `
    <div class="up-card">
      <div class="up-ico">${u.icon}</div>
      <div class="up-main">
        <div class="up-name">${u.name} <span class="up-lvl" id="uplvl_${key}"></span></div>
        <div class="up-desc">${u.desc}</div>
      </div>
      <button class="up-buy" data-action="upgrade" data-a1="${key}" id="upbuy_${key}">
        <span id="cost_${key}"></span> 🪙
      </button>
    </div>`;
}

function updateMineLive() {
  if (!mineBuilt) return;
  const d = DERIVED || computeStats();
  const bossPending = STATE.isBoss;
  el('floorText').textContent = 'Floor ' + STATE.floor + (bossPending ? ' — BOSS GATE' : '');
  el('floorSub').textContent = bossPending
    ? 'Defeat the guardian to descend'
    : 'Rock ' + (STATE.rockIndex + 1) + ' / ' + TUNE.rocksPerFloor;
  el('rockEmoji').textContent = bossPending ? '👹' : '🪨';
  el('rockEmoji').classList.toggle('boss', bossPending);

  const pct = clamp((STATE.rockHp / STATE.rockMaxHp) * 100, 0, 100);
  el('rockHpFill').style.width = pct + '%';
  el('rockHpFill').classList.toggle('boss', bossPending);
  el('rockHpText').textContent = fmt(Math.max(0, STATE.rockHp)) + ' / ' + fmt(STATE.rockMaxHp);

  el('statClick').textContent = fmt(d.clickDamage);
  el('statDps').textContent = fmt(d.dps);
  el('statGps').textContent = fmt(d.goldPerSec);

  for (const key in UPGRADES) {
    const cost = upgradeCost(key);
    el('cost_' + key).textContent = fmt(cost);
    el('uplvl_' + key).textContent = 'Lv ' + STATE.upgrades[key];
    el('upbuy_' + key).classList.toggle('afford', STATE.gold >= cost);
  }

  // Floaters
  const layer = el('floaterLayer');
  if (layer) {
    layer.innerHTML = floaters.map(f =>
      `<span class="floater ${f.isGold ? 'gold' : 'dmg'} ${f.crit ? 'crit' : ''}" style="left:${f.x}%;top:${f.y}%;opacity:${clamp(f.t, 0, 1)};transform:translateY(${(1 - f.t) * -40}px)">${f.text}</span>`
    ).join('');
  }
}

// ---------- Summon ----------
function renderSummon() {
  const eggCards = Object.keys(EGGS).map(k => {
    const e = EGGS[k];
    const costStr = Object.entries(e.cost).map(([c, v]) => fmt(v) + ' ' + resIcon(c)).join(' + ');
    return `
      <div class="egg-card">
        <div class="egg-ico">${e.icon}</div>
        <div class="egg-name">${e.name}</div>
        <div class="egg-note">${e.note}</div>
        <button class="btn primary" data-action="summon" data-a1="${k}">Hatch · ${costStr}</button>
      </div>`;
  }).join('');

  const odds = RARITY_ORDER.map(r => {
    const total = RARITY_ORDER.reduce((s, x) => s + RARITIES[x].weight, 0);
    const pc = (RARITIES[r].weight / total * 100);
    return `<div class="odds-row"><span class="dot" style="background:${RARITIES[r].color}"></span>${RARITIES[r].name}<span class="odds-pct">${pc < 0.1 ? pc.toFixed(2) : pc.toFixed(1)}%</span></div>`;
  }).join('');

  return `
    <div class="section-title">Summon Orbies</div>
    <div class="egg-grid">${eggCards}</div>
    <div id="summonResult" class="summon-result">${lastSummonHtml || '<span class="muted">Crack an egg to meet a new friend…</span>'}</div>
    <div class="section-title">Base Odds</div>
    <div class="odds-box">${odds}</div>
    <p class="hint">Luck rings and the Gilded Egg tilt the odds toward rarer Orbies. Duplicates raise a species' ⭐ star bonus.</p>`;
}

let lastSummonHtml = '';
function showSummonReveal(res) {
  const def = ORBIES[res.id];
  const r = RARITIES[def.rarity];
  const count = STATE.orbies[res.id].count;
  lastSummonHtml = `
    <div class="reveal pop rar-${def.rarity}" style="--rc:${r.color}">
      <div class="reveal-emoji">${def.emoji}</div>
      <div class="reveal-name">${def.name} ${res.isNew ? '<span class="new-badge">NEW!</span>' : ''}</div>
      <div class="reveal-rarity" style="color:${r.color}">${r.name} · ${def.element}</div>
      <div class="reveal-flavor">“${def.flavor}”</div>
      <div class="reveal-count">${res.isNew ? 'Added to your collection' : 'Copy ' + count + ' · ⭐ +' + Math.round((count - 1) * TUNE.starPerCopy * 100) + '% power'}</div>
    </div>`;
  const box = el('summonResult');
  if (box) box.innerHTML = lastSummonHtml;
}

// ---------- Orbies (collection + team) ----------
function renderOrbies() {
  const discovered = uniqueOwnedCount(STATE);
  const teamHtml = renderTeamStrip();

  // Full roster, sorted by rarity then name.
  const ids = ORBY_IDS.slice().sort((a, b) => {
    const ra = RARITY_ORDER.indexOf(ORBIES[a].rarity);
    const rb = RARITY_ORDER.indexOf(ORBIES[b].rarity);
    return ra - rb || ORBIES[a].name.localeCompare(ORBIES[b].name);
  });
  const cards = ids.map(renderOrbyCard).join('');

  return `
    <div class="section-title">Your Team <span class="muted">(${STATE.team.length}/${TUNE.teamSize})</span></div>
    <div class="team-strip">${teamHtml}</div>
    <div class="section-title">Collection <span class="muted">${discovered}/${ORBY_IDS.length} discovered</span></div>
    <div class="orby-grid">${cards}</div>`;
}

function renderTeamStrip() {
  const slots = [];
  for (let i = 0; i < TUNE.teamSize; i++) {
    const id = STATE.team[i];
    if (id) {
      const def = ORBIES[id];
      slots.push(`<div class="team-slot filled" style="border-color:${RARITIES[def.rarity].color}" data-action="team" data-a1="${id}" title="Remove ${def.name}"><span class="ts-emoji">${def.emoji}</span><span class="ts-lvl">Lv ${STATE.orbies[id].level}</span></div>`);
    } else {
      slots.push('<div class="team-slot empty">+</div>');
    }
  }
  return slots.join('');
}

function renderOrbyCard(id) {
  const def = ORBIES[id];
  const o = STATE.orbies[id];
  const r = RARITIES[def.rarity];
  if (!o || o.count === 0) {
    return `<div class="orby-card locked"><div class="oc-emoji">❔</div><div class="oc-name">???</div><div class="oc-rarity" style="color:${r.color}">${r.name}</div></div>`;
  }
  const st = orbyStats(id);
  const inTeam = STATE.team.includes(id);
  const c = levelCost(id);
  const stars = o.count > 1 ? ' <span class="stars">⭐×' + o.count + '</span>' : '';
  return `
    <div class="orby-card rar-${def.rarity}" style="--rc:${r.color}">
      <div class="oc-emoji">${def.emoji}</div>
      <div class="oc-name">${def.name}${stars}</div>
      <div class="oc-rarity" style="color:${r.color}">${r.name} · ${def.element}</div>
      <div class="oc-lvl">Lv ${o.level}</div>
      <div class="oc-stats">
        <span title="Idle power">⚙️ ${fmt(st.dps)}</span>
        <span title="Tap power">⛏️ ${fmt(st.tap)}</span>
        <span title="Gold find">🪙 ${fmt(st.goldPts * 2)}%</span>
      </div>
      <div class="oc-actions">
        <button class="btn tiny" data-action="levelup" data-a1="${id}">Lv Up<br><small>${fmt(c.food)}🍖 · ${fmt(c.gold)}🪙</small></button>
        <button class="btn tiny ${inTeam ? 'ghost' : 'primary'}" data-action="team" data-a1="${id}">${inTeam ? 'In Team' : 'Add'}</button>
      </div>
    </div>`;
}

// ---------- Garden ----------
function renderGarden() {
  const plots = [];
  for (let i = 0; i < STATE.plotsUnlocked; i++) {
    const slot = gardenSlot(i);
    if (!slot) {
      const btns = Object.keys(CROPS).map(k => {
        const crop = CROPS[k];
        return `<button class="crop-btn" data-action="plant" data-a1="${i}" data-a2="${k}">${crop.icon}<small>${crop.name}</small><small class="muted">${crop.note}</small></button>`;
      }).join('');
      plots.push(`<div class="plot empty"><div class="plot-head">Plot ${i + 1} · empty</div><div class="crop-picker">${btns}</div></div>`);
    } else {
      const crop = CROPS[slot.crop];
      const ready = Date.now() >= cropReadyAt(slot);
      const remain = Math.max(0, (cropReadyAt(slot) - Date.now()) / 1000);
      const pct = clamp((1 - remain / crop.grow) * 100, 0, 100);
      plots.push(`
        <div class="plot ${ready ? 'ready' : 'growing'}">
          <div class="plot-head">Plot ${i + 1}</div>
          <div class="plot-crop">${crop.icon}</div>
          <div class="plot-name">${crop.name}</div>
          <div class="grow-bar"><div class="grow-fill" style="width:${pct}%"></div></div>
          ${ready
            ? `<button class="btn primary" data-action="harvest" data-a1="${i}">Harvest ✋</button>`
            : `<div class="grow-timer">${fmtTime(remain)}</div>`}
        </div>`);
    }
  }
  const canBuy = STATE.plotsUnlocked < 8;
  const buy = canBuy
    ? `<button class="btn" data-action="buyplot">Unlock Plot ${STATE.plotsUnlocked + 1} · ${fmt(plotUpgradeCost())} 🪙</button>`
    : '<span class="muted">All plots unlocked 🌻</span>';

  return `
    <div class="section-title">Garden <span class="muted">🍖 ${fmt(STATE.food)} food stored</span></div>
    <div class="plot-grid">${plots.join('')}</div>
    <div class="garden-foot">${buy}</div>
    <p class="hint">Crops yield 🍖 <b>food</b> (and sometimes 💎), used to level up your Orbies in the collection.</p>`;
}

// ---------- Arena ----------
function renderArena() {
  regenEnergy();
  const a = STATE.arena;
  const bp = battlePower();
  const nextIn = a.energy >= TUNE.arenaMaxEnergy
    ? 'full'
    : fmtTime(TUNE.arenaEnergyRegen - ((Date.now() - a.energyAt) / 1000) % TUNE.arenaEnergyRegen);
  const board = leaderboard().map(row =>
    `<div class="lb-row ${row.you ? 'you' : ''}"><span class="lb-rank">#${row.rank}</span><span class="lb-name">${row.name}</span><span class="lb-tr">🏆 ${fmt(row.trophies)}</span></div>`
  ).join('');
  const log = a.log.length ? a.log.map(l => `<div class="log-line">${l}</div>`).join('') : '<span class="muted">No battles yet.</span>';

  return `
    <div class="section-title">Arena</div>
    <div class="arena-top">
      <div class="arena-stat"><div class="as-val">${fmt(a.rank)}</div><div class="as-lbl">Rank</div></div>
      <div class="arena-stat"><div class="as-val">🏆 ${fmt(a.trophies)}</div><div class="as-lbl">Trophies</div></div>
      <div class="arena-stat"><div class="as-val">⚡ ${a.energy}/${TUNE.arenaMaxEnergy}</div><div class="as-lbl">Energy${a.energy < TUNE.arenaMaxEnergy ? ' · +1 in ' + nextIn : ''}</div></div>
    </div>
    <div class="arena-fight">
      <div class="muted">Battle Power: <b>${fmt(bp)}</b></div>
      <button class="btn primary big" data-action="fight" ${a.energy <= 0 ? 'disabled' : ''}>Fight! (−1 ⚡)</button>
    </div>
    <div class="arena-log">${log}</div>
    <div class="section-title">Weekly League <span class="muted">week #${currentWeek()}</span></div>
    <div class="leaderboard">${board}</div>
    <p class="hint">Win fights to climb ranks, earn 💎 gems and ✨ dust, and top the weekly board. The board reshuffles each week.</p>`;
}

// ---------- Rings ----------
function renderRings() {
  const equippedSlots = [];
  for (let i = 0; i < 3; i++) {
    const u = STATE.equipped[i];
    const r = u ? STATE.rings.find(x => x.uid === u) : null;
    if (r) {
      const t = RING_TYPES[r.type];
      equippedSlots.push(`<div class="ring-slot filled" data-action="equip" data-a1="${r.uid}" title="Unequip"><div class="ring-ico">${t.icon}</div><div class="ring-lbl">${t.label}</div><div class="ring-val">+${fmt(t.per * r.tier * 100)}%</div><div class="ring-tier">T${r.tier}</div></div>`);
    } else {
      equippedSlots.push('<div class="ring-slot empty">+</div>');
    }
  }

  const inv = STATE.rings.length
    ? STATE.rings.map(r => {
        const t = RING_TYPES[r.type];
        const eq = STATE.equipped.includes(r.uid);
        return `
          <div class="ring-card ${eq ? 'equipped' : ''}">
            <div class="ring-ico">${t.icon}</div>
            <div class="ring-lbl">${t.name}</div>
            <div class="ring-val">+${fmt(t.per * r.tier * 100)}% ${t.label}</div>
            <div class="ring-tier">Tier ${r.tier}</div>
            <div class="ring-actions">
              <button class="btn tiny ${eq ? 'ghost' : 'primary'}" data-action="equip" data-a1="${r.uid}">${eq ? 'Unequip' : 'Equip'}</button>
              <button class="btn tiny danger" data-action="melt" data-a1="${r.uid}">Melt<br><small>+${8 * r.tier}✨</small></button>
            </div>
          </div>`;
      }).join('')
    : '<span class="muted">No rings yet — open a Totem Pack.</span>';

  return `
    <div class="section-title">Equipped Rings <span class="muted">(${STATE.equipped.length}/3)</span></div>
    <div class="ring-slots">${equippedSlots.join('')}</div>
    <div class="section-title">Totem Pack</div>
    <div class="pack-box">
      <div class="pack-ico">🎴</div>
      <div>
        <div>Open a pack for a random ring (Tier 1–5).</div>
        <button class="btn primary" data-action="pack">Open Pack · ${PACK_COST.dust} ✨ dust</button>
      </div>
      <div id="packResult" class="pack-result">${lastPackHtml}</div>
    </div>
    <div class="section-title">Ring Inventory <span class="muted">(${STATE.rings.length})</span></div>
    <div class="ring-grid">${inv}</div>
    <p class="hint">Earn ✨ dust from the Arena and by melting rings you don't need. Rarer tiers give bigger bonuses.</p>`;
}

let lastPackHtml = '';
function showPackReveal(ring) {
  const t = RING_TYPES[ring.type];
  lastPackHtml = `<div class="pop pack-pop"><span class="ring-ico">${t.icon}</span> <b>${t.name}</b> · Tier ${ring.tier} <span class="muted">(+${fmt(t.per * ring.tier * 100)}% ${t.label})</span></div>`;
  const box = el('packResult');
  if (box) box.innerHTML = lastPackHtml;
}

// ---------- Stats ----------
function renderStats() {
  const s = STATE.stats;
  const rows = [
    ['Total gold earned', fmt(s.totalGold) + ' 🪙'],
    ['Rocks broken', fmt(s.rocksBroken)],
    ['Bosses defeated', fmt(s.bossesBeaten)],
    ['Deepest floor', fmt(STATE.floor)],
    ['Taps', fmt(s.taps)],
    ['Orbies summoned', fmt(s.summons)],
    ['Species discovered', uniqueOwnedCount(STATE) + ' / ' + ORBY_IDS.length],
    ['Crops harvested', fmt(s.harvests)],
    ['Best arena rank', fmt(STATE.arena.bestRank)],
  ].map(([k, v]) => `<div class="stat-row"><span>${k}</span><b>${v}</b></div>`).join('');

  const ach = ACHIEVEMENTS.map(a => {
    const got = !!STATE.achievements[a.id];
    return `<div class="ach ${got ? 'got' : ''}" title="${a.desc}"><div class="ach-ico">${a.icon}</div><div class="ach-name">${a.name}</div><div class="ach-desc">${a.desc}</div>${got ? '<div class="ach-check">✓</div>' : ''}</div>`;
  }).join('');
  const achCount = ACHIEVEMENTS.filter(a => STATE.achievements[a.id]).length;

  return `
    <div class="section-title">Statistics</div>
    <div class="stat-list">${rows}</div>
    <div class="section-title">Achievements <span class="muted">${achCount}/${ACHIEVEMENTS.length}</span></div>
    <div class="ach-grid">${ach}</div>
    <div class="section-title">Save</div>
    <div class="save-row">
      <button class="btn" data-action="save">Save Now 💾</button>
      <button class="btn danger" data-action="reset">Reset Game ⚠️</button>
    </div>
    <p class="hint">Progress auto-saves to this browser. Idle earnings accrue while you're away (up to ${TUNE.offlineCapHours}h).</p>
    <p class="credits">Orbies is a fan-made idle game inspired by <b>Orbo Idle RPG</b>. Made for fun. 🐣</p>`;
}

function resIcon(k) {
  return { gold: '🪙', gems: '💎', food: '🍖', dust: '✨' }[k] || k;
}

// ---------- Toasts ----------
function toast(msg) {
  const box = el('toasts');
  if (!box) return;
  const t = make('div', 'toast', msg);
  box.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 2600);
}
function toastMini(msg) {
  floaters.push({ text: msg, isGold: true, crit: true, t: 1.2, x: 45 + Math.random() * 10, y: 25 });
}

// ---------- Welcome-back modal ----------
function showWelcomeBack(info) {
  if (!info || info.gold <= 0) return;
  const box = el('toasts');
  const t = make('div', 'toast welcome',
    `👋 Welcome back! Your Orbies mined <b>${fmt(info.gold)}</b> 🪙 while you were away (${fmtTime(info.seconds)}).`);
  box.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 5200);
}
