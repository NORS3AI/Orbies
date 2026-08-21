# 🟣 Orbies

**A game about hatching new Orbies, idle gameplay, upgrades, farming, leaderboards, and becoming the best.**

Orbies is an incremental **idle & gacha** game. You hatch orbs into tiny creatures called *Orbies* that **battle rocks for you** — they deal DPS, earn gold, and you sell duplicates for treats, level your keepers, and evolve them into rare final forms.

## ▶️ Play it live

### 👉 https://nors3ai.github.io/Orbies/

> **Note on the link:** GitHub Pages URLs are **case-sensitive**. The host `nors3ai` is always lowercase, and the path `Orbies` must match the repository name exactly (capital **O**). Use the link exactly as written above — `/orbies/` (lowercase) will **not** work.

## 🎮 How it plays

- **🔮 Hatch Orbs** — You start with **5 orbs**. Open each to reveal an Orbie of a random rarity — you never know what you'll get.
- **🪨 Auto-Battle** — You **can't tap the rock**. Your Orbies do the work: they take turns striking it for DPS, **up to 8 at a time**. Each floor has **10 rocks**, and rock HP **doubles every floor**.
- **⚔️ Floors & Bosses** — Clear a floor's 10 rocks, then tap **Fight Boss** for a timed **30-second** fight (Boss 1 = **1000 HP**, scaling each floor). Win and **Descend** to the next floor for an orb payout — **5 orbs per rock (≈50 on floor 1) and +10% each deeper floor**. Run out of time, or hit **Give Up**, and you drop back to the floor to farm and level up before trying again.
- **🧺 Hold & Sell** — You can hold **3 Orbies to start** (expandable up to 8 with gold). Sell duplicates for **treats**, the currency used to level up your keepers. Every hatch lets you **Keep** the new Orbie or **Sell** it for treats — and you can keep opening even when your hold is full, choosing to **Sell** the new one or **Replace** one you're holding (the replaced Orbie is sold for treats too). The replace list color-codes every held Orbie against the new one — **green** = upgrade, **red** = downgrade, **blue** = same DPS — so you can see at a glance whether it's a good swap.
- **✨ Level & Evolve** — Spend treats to level up. At **Lv 20** an Orbie can **evolve**, and at **Lv 50** it evolves into its **final form**. Each evolution jumps it **+2 rarities** above its previous form.
- **📱 Mobile-friendly** — On iOS, pinch-zoom and double-tap-zoom are disabled so taps never accidentally zoom the board.

### 🏅 Rarities (low → high)

`Trash · Common · Uncommon · Magic · Rare · Epic · Legendary · Esoteric · Mythic · Relic · Untouched · Phase-bound · Light-sworn · Void-born`

### 🔁 The core loop

1. **Hatch** — open orbs to collect new Orbies.
2. **Battle** — Orbies auto-clear 10 rocks per floor, then a timed boss; descend for a pile of orbs.
3. **Sell** — melt down duplicates into treats.
4. **Level & Evolve** — pour treats into your best Orbies and evolve them toward Void-born.

## 🗂️ Project structure

The whole game is a single dependency-free static file:

| Path | Purpose |
| --- | --- |
| `docs/index.html` | The complete game (HTML + CSS + JS, no build step) |
| `docs/.nojekyll` | Tells Pages to serve the static files as-is |

## 🚀 Deployment

This site is hosted with **GitHub Pages**, published from the **`/docs` folder** on the **`main`** branch (Settings → Pages → *Deploy from a branch* → `main` `/docs`).

Every push to `main` automatically redeploys the live site at **https://nors3ai.github.io/Orbies/**. A `.nojekyll` marker in `docs/` tells Pages to serve the static file as-is, without Jekyll processing.

---

*Orbies is a fan-made project inspired by the idle-RPG genre. All trademarks belong to their respective owners.*
