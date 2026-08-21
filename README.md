# 🟣 Orbies

**A game about hatching new Orbies, idle gameplay, upgrades, farming, leaderboards, and becoming the best.**

Orbies is an addictive incremental **idle & gacha** game where you break rocks, earn coins, and summon/collect tiny creatures called *Orbies* that fight and idle for you.

## ▶️ Play it live

### 👉 https://nors3ai.github.io/Orbies/

Landing page with a bite-sized teaser and a **Play** button. To jump straight
into the full game:

### 🎮 https://nors3ai.github.io/Orbies/play/

> **Note on the links:** GitHub Pages URLs are **case-sensitive**. The host `nors3ai` is always lowercase, and the path `Orbies` must match the repository name exactly (capital **O**). Use the links exactly as written above — `/orbies/` (lowercase) will **not** work.

## 🎮 Gameplay Loop & Features

- **⛏️ Mining & Combat** — Smash rocks to collect gold coins, push deeper into dungeon floors, and clear boss gates.
- **✨ Summoning & Upgrading** — Pull and level up over 100 unique Orbies, each featuring distinct flavor text and traits.
- **🌱 Gardening & Farming** — Grow crops in your garden to feed your creatures and fuel progression.
- **🏆 Collections & Leagues** — Compete in weekly leaderboards, equip rings, open packs for totem cards, and melt duplicate gear into jewelry dust.

## 🔁 The Core Loop

1. **Break Rocks** — tap and idle to mine gold from the depths.
2. **Summon Orbies** — spend gold to hatch new creatures.
3. **Build Power** — level up, equip rings, and farm crops.
4. **Climb the Arena** — battle for weekly leaderboard glory.

## 🗂️ Project structure

The full game is a dependency-free static site (plain HTML/CSS/JS):

| Path | Purpose |
| --- | --- |
| `docs/index.html` | Landing page + teaser |
| `docs/play/index.html` | The full game |
| `docs/play/styles.css` | Theme & layout |
| `docs/play/js/util.js` | Formatting & helpers |
| `docs/play/js/data.js` | Orby roster & tuning |
| `docs/play/js/state.js` | Save/load & derived stats |
| `docs/play/js/game.js` | Game logic & tick loop |
| `docs/play/js/ui.js` | Rendering |
| `docs/play/js/main.js` | Boot & input |

## 🚀 Deployment

This site is hosted with **GitHub Pages**, published from the **`/docs` folder** on the **`main`** branch (Settings → Pages → *Deploy from a branch* → `main` `/docs`).

Every push to `main` automatically redeploys the live site at **https://nors3ai.github.io/Orbies/**. A `.nojekyll` marker in `docs/` tells Pages to serve the static files as-is (including `docs/play/`), without Jekyll processing.

---

*Orbies is a fan-made project inspired by the idle-RPG genre. All trademarks belong to their respective owners.*
