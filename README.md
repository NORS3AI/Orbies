# 🟣 Orbies

**A game about hatching new Orbies, idle gameplay, upgrades, farming, leaderboards, and becoming the best.**

Orbies is an incremental **idle & gacha** game. You hatch orbs into tiny creatures called *Orbies* that **battle rocks for you** — they deal DPS, earn gold, and you sell duplicates for treats, level your keepers, and evolve them into rare final forms.

## ▶️ Play it live

### 👉 https://nors3ai.github.io/Orbies/

> **Note on the link:** GitHub Pages URLs are **case-sensitive**. The host `nors3ai` is always lowercase, and the path `Orbies` must match the repository name exactly (capital **O**). Use the link exactly as written above — `/orbies/` (lowercase) will **not** work.

## 🎮 How it plays

- **🔮 Hatch Orbs** — You start with **5 orbs**. Open each to reveal an Orbie of a random rarity — you never know what you'll get. Or hit **⚙️ Auto-Open** to rip through a whole pile one at a time: tick the rarities you want to **keep** — when your hold is full it **pauses and lets you Sell or Replace** (just like a normal open) — and everything else is **auto-sold** for treats.
- **🪨 Auto-Battle** — You **can't tap the rock**. Your Orbies do the work: they take turns striking it for DPS, **up to 8 at a time**. Each floor has **10 rocks**, and rock HP **doubles every floor**.
- **⬇️ Descend, per rock** — Each cleared rock shows a **Descend +5** button: tap it to collect **5 orbs** (growing +10% per floor) and advance to the next rock — meanwhile your Orbies **keep beating the rock for gold** until you descend, so you can farm as long as you like. After all **10 rocks**, tap **Fight Boss** for a timed **30-second** fight (Boss 1 = **1000 HP**, scaling each floor). Beat it to reach the **Next Floor**; run out of time, or hit **Give Up**, and you drop back to farm and level up before trying again.
- **🧺 Hold & Sell** — You can hold **3 Orbies to start** (expandable up to 8 with gold). Sell duplicates for **treats**, the currency used to level up your keepers. Every hatch lets you **Keep** the new Orbie or **Sell** it for treats — and you can keep opening even when your hold is full, choosing to **Sell** the new one or **Replace** one you're holding (the replaced Orbie is sold for treats too). The replace list color-codes every held Orbie against the new one — **green** = upgrade, **red** = downgrade, **blue** = same DPS — so you can see at a glance whether it's a good swap.
- **✨ Level & Evolve** — Spend treats to level up. At **Lv 20** an Orbie can **evolve**, and at **Lv 50** it evolves into its **final form**. Each evolution jumps it **+2 rarities** above its previous form.
- **📱 Mobile-friendly** — On iOS, pinch-zoom and double-tap-zoom are disabled so taps never accidentally zoom the board.

- **🌱 Farm** — A garden **scene** with a grid of **plots** (start with 1, buy up to **32**), laid out **square or diamond** with a one-tap layout toggle. A **🛠️ Build** bottom-sheet buys more plots; a **🌱 Seeds** bottom-sheet switches between **Food** and **Orbs** tabs and shows a live **Restocks in** countdown — both sheets **swipe down** to dismiss. Pick a seed there, then **tap a plot** to plant it and tap again to harvest (**long-press** the garden to plant/harvest every plot at once). Grow **6 veggies** (Lettuce → Pumpkin) for **treats** and **6 orb seeds** (Glimmerbud → Shadowthorn) for **orbs**; each costs gold, grows on its own timer (10s → 3 days), and some have a limited **seed stock** that renews over time (veggies 9h, orb seeds 3h). Crops keep growing while you're away.
- **🔁 Background Auto-Open** — Once you start Auto-Open it keeps running **in the background** across tabs and while the menu is closed, opening orbs as they arrive (including the ones your **orb-seed harvests** produce) and only pausing to ask when your hold is full.

- **⚔️ Arena** — A **100-slot leaderboard** ranked by **arena points** (you start at **0** and climb). You're slotted into the board with a highlighted **(you)** row, the top three seats are gilded, and every entry shows its avatar, handle, DPS and points. Hit **CHALLENGE** (costs **1 flag**) to fight the rival directly above you: a full **battle screen** opens where your Orbies (left) trade blows with theirs (right) **one Orbie per turn**, striking the front-most enemy until one team is wiped — with a **2× speed** button to fast-forward. A results card then tallies each side's **total damage**, **team DPS** and survivors, and the **arena points** you won. Each Orbie has **health** scaled by its rarity and level. Win enough to top your tier and you rank up through **15 metals × 10 tiers** (Bronze → Diamond). You hold **5 challenge flags** that regenerate **1 every 2 minutes**, and the NPC field **reshuffles every 2 hours**.

### 🏅 Rarities (low → high)

`Trash · Common · Uncommon · Rare · Epic · Legendary · Mythic · Relic · Phasebound · Lightsworn · Voidborn`

### 🔁 The core loop

1. **Hatch** — open orbs to collect new Orbies.
2. **Battle & Descend** — Orbies auto-clear each rock; tap **Descend +5** to bank orbs and advance, then a timed boss to reach the next floor.
3. **Sell** — melt down duplicates into treats.
4. **Level & Evolve** — pour treats into your best Orbies and evolve them toward Voidborn.

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
