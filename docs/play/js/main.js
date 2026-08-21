/* Orbies — boot, input dispatch, loops. */

// Central click dispatcher: every interactive element carries data-action.
function handleAction(target) {
  const node = target.closest('[data-action]');
  if (!node) return;
  const action = node.dataset.action;
  const a1 = node.dataset.a1;
  const a2 = node.dataset.a2;

  switch (action) {
    case 'switchtab': switchTab(a1); break;
    case 'tap':       tapRock(); pulse(node); break;
    case 'upgrade':   buyUpgrade(a1); break;
    case 'summon': {
      const res = summon(a1);
      if (res) showSummonReveal(res);
      break;
    }
    case 'levelup':   levelUpOrby(a1); break;
    case 'team':      toggleTeam(a1); break;
    case 'plant':     plantCrop(parseInt(a1, 10), a2); break;
    case 'harvest':   harvestCrop(parseInt(a1, 10)); break;
    case 'buyplot':   buyPlot(); break;
    case 'pack': {
      const ring = openPack();
      if (ring) showPackReveal(ring);
      break;
    }
    case 'equip':     equipRing(a1); break;
    case 'melt':      meltRing(a1); break;
    case 'fight': {
      const r = arenaFight();
      if (r) toast(r.win
        ? '🏆 Victory vs ' + r.enemyName + '! Rank ' + r.rank + ' · +' + r.gems + '💎' + (r.dust ? ' +' + r.dust + '✨' : '')
        : '💥 Lost to ' + r.enemyName + '. +2 🏆');
      break;
    }
    case 'save':      saveGame(); toast('Saved 💾'); break;
    case 'reset':
      if (confirm('Reset ALL progress? This cannot be undone.')) {
        hardReset();
        switchTab('mine');
        toast('Game reset.');
      }
      break;
  }
}

// Quick press animation for the rock button.
function pulse(node) {
  node.classList.remove('tapped');
  // force reflow so the animation restarts on rapid clicks
  void node.offsetWidth;
  node.classList.add('tapped');
}

function boot() {
  const loaded = loadGame();
  ensureRock();

  // Give brand-new players a small starter so the first summon works.
  if (!loaded) {
    STATE.gems = 60;
    grantOrby('pebbling');
    saveGame();
  }

  const offline = applyOffline();

  buildTabBar();
  switchTab('mine');
  updateHeader();
  showWelcomeBack(offline);

  // Input: delegate all clicks.
  el('app').addEventListener('click', e => handleAction(e.target));

  // Keyboard: space / enter taps the rock while on the Mine tab.
  document.addEventListener('keydown', e => {
    if ((e.code === 'Space' || e.code === 'Enter') && ACTIVE_TAB === 'mine') {
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'button' || tag === 'input' || tag === 'textarea') return;
      e.preventDefault();
      tapRock();
      const rb = el('rockBtn');
      if (rb) pulse(rb);
    }
  });

  // Loops
  lastTick = Date.now();
  setInterval(tick, 100);        // 10 fps game tick
  setInterval(saveGame, 15000);  // autosave
  window.addEventListener('beforeunload', saveGame);
  document.addEventListener('visibilitychange', () => { if (document.hidden) saveGame(); });
}

window.addEventListener('DOMContentLoaded', boot);
