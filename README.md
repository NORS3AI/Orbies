# 🔮 Orbies

An addictive **idle & gacha RPG** about hatching friendly little creatures called **Orbies**. Break rocks, earn coins, summon over **160 unique Orbies**, grow a garden, upgrade your power, and climb the Arena leagues.

## ▶️ Play now

**https://nors3ai.github.io/Orbies/**

> ⚠️ **Case-sensitive link!** GitHub Pages URLs are strict about capitalization.
> The subdomain `nors3ai` is **lowercase**, and the path **`/Orbies/`** must keep its **capital `O`** (it matches the repository name exactly). `.../orbies/` (all lowercase) will **not** work.

No install, no account, no backend — it runs entirely in your browser and saves your progress locally.

## 🎮 Gameplay loop & features

- **⛏️ Mining & Combat** — Smash rocks to collect gold coins, push deeper through dungeon floors, and break through **boss gates** every 10 floors.
- **🔮 Summoning & Upgrading** — Pull and level up **160+ unique Orbies** across 6 rarities (Common → Mythic), each with its own emoji, elemental trait, and flavor text. Duplicates become **shards** that power your Orbies up.
- **🌱 Gardening & Farming** — Grow crops in your garden, harvest **Food**, and feed your Orbies to permanently boost their power.
- **⚔️ Collections & Leagues** — Compete on the **weekly Arena leaderboard**, equip **rings** for permanent bonuses, open **packs** for **totem cards** (set bonuses), and **melt** spare gear into **jewelry dust**.
- **😴 Idle progress** — Your Orbies keep mining while you're away, and you collect the coins when you return.

## 🕹️ How to play

1. **Tap the rock** to mine — your Orbies auto-mine alongside you.
2. Spend coins at the **Summoning Altar** to collect new Orbies (more Orbies = more power & auto-mining).
3. Clear floors to unlock deeper biomes, tougher bosses, and better rewards.
4. Plant and harvest in the **Garden**, then **feed** your favorite Orbies.
5. Send your team to the **Arena** for trophies, gems, and gear, and rise through the leagues.
6. Reinvest coins into permanent **Upgrades**.

Your save autosaves every 15 seconds. You can export/import your save from the **⚙️ menu**.

## 🛠️ Run it locally

It's plain HTML/CSS/JS with no build step. Just open `index.html`, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## 🚀 Deployment

Pushing to `main` automatically publishes the site via the GitHub Actions workflow in
[`.github/workflows/pages.yml`](.github/workflows/pages.yml). If Pages isn't live yet, set
**Settings → Pages → Build and deployment → Source** to **GitHub Actions** (or **Deploy from a branch → `main` → `/root`**).

## 📦 Tech

Vanilla JavaScript · no dependencies · no backend · `localStorage` saves · fully static.

---

*Orbies is a fan-made tribute inspired by the idle game **Orbo Idle RPG**.*
