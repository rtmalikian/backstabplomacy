# Backstabplomacy — Play Diplomacy Online Free | Open-Source Backstabbr Alternative for Browser & Android (PWA)

**▶ Play now: https://rtmalikian.github.io/backstabplomacy/** — no download, no account required to start.

**Backstabplomacy** *(Backstab + Diplomacy — "Diplomacy, with daggers")* is a free, open-source online Diplomacy game: a modern remake of the Backstabbr-style experience that Raphael's play group asked for and couldn't get — so we built it and open-sourced it. Play the classic game of Diplomacy in your browser or install it on Android as a PWA, on a **geographically accurate map of Europe in 1901** (every province sits at its real latitude/longitude), with a game-like GUI, one-tap orders, **pre-submit invalid-order alerts**, a beginner guide, smart hints, an optional **AI strategist**, **in-character AI press personas**, **push notifications**, **Google Sign-In with saved games**, a **24-trophy achievement system**, and **custom & variant maps** — including two maps you won't find anywhere else: **Caucasus & Caspian** (Armenia, Georgia, Azerbaijan, Persia, Russia, Turkey, Greece) and **Empires of the Crossroads** (Rome, Byzantium, the Kingdom of Armenia, Sasanian Persia, Iberia, Caucasian Albania and Egypt in one historic what-if arena).

![Platform](https://img.shields.io/badge/platform-Browser%20%7C%20Android%20PWA%20%7C%20Desktop-blue) ![License](https://img.shields.io/badge/code-MIT-green) ![Cost](https://img.shields.io/badge/cost-free-brightgreen)

## Why another Diplomacy site? (research summary)
Backstabbr is clean and beloved, but its own FAQ says **map variants are its #1 feature request and unsupported**; players report illegal orders silently failing, no beginner help, email-only notifications, and a plain interface — and it isn't open source. Full research: [`docs/RESEARCH_AND_IMPROVEMENTS.md`](docs/RESEARCH_AND_IMPROVEMENTS.md).

## Features
- 🗺️ **Geographically accurate Classic map** — 75 provinces, 34 supply centres, 18 to win, positions from real lat/lon; colour-coded powers, live scoreboard, adjacency overlay.
- 👆 **One-tap orders** — tap a unit, tap a highlighted neighbour. Or use the detailed orders panel (Hold / Move / Support / Convoy).
- 🚫 **Invalid-move alerts BEFORE you submit** — live validation + a hard pre-submit gate: no destination, non-adjacent target, army-to-sea, fleet-inland, support/convoy mistakes are explained in plain English, highlighted in red, toasted on screen and sent as a notification. Turns with invalid orders are *never* submitted by accident.
- 🗺️ **Custom maps & vDiplomacy-compatible variants** — built-ins: Classic, **Ankara Crescent**, **Western Sprint** (teaching map), **Caucasus & Caspian** 🏔️, **Empires of the Crossroads** 🏛️. Import any variant JSON in the vDiplomacy/webDiplomacy data model, paste your own map, or download the current map and edit it. Custom maps are validated before loading. See [`docs/VDIPLOMACY_VARIANTS.md`](docs/VDIPLOMACY_VARIANTS.md).
- 🏆 **24 trophies, XP & ranks** — for signing in, adding a profile photo, your first order, first battle, first conquest, keeping your word, trying new maps, and more — designed on self-determination theory and honest gamification (no dark patterns), with game-theory coaching (Schelling points, credible commitment, tit-for-tat) woven into hints and tips. See [`docs/GAMIFICATION_AND_GAME_THEORY.md`](docs/GAMIFICATION_AND_GAME_THEORY.md).
- 🎭 **In-character press (AI personas)** — connect *any* OpenAI-compatible endpoint (OpenAI, OpenRouter, Ollama, LM Studio…) and rewrite your English press in your power's theatrical voice: Bond-villain Russia ♟️, the polite-colonel Germany of *Inglourious Basterds* fame 🎻, musketeer-chef France 🥐, Viennese waltz Austria 🎼, opera-tenor Italy 🍝, bazaar-storyteller Turkey 🫖, stiff-upper-lip England ☕ — plus Ararat storyteller Armenia 🏔️, supra toastmaster Georgia 🍷, rose-garden Persia 🌹, purple-born Byzantium 👑, senatorial Rome 🦅 and more. Meaning, province names and numbers are locked; an offline styliser works with no endpoint at all.
- 🤖 **AI Strategist** — the same endpoint, opt-in, reads the board (never your private press) and returns concrete orders, one diplomatic move and one risk to watch. Rule-based hints work fully offline either way.
- 🔔 **Push notifications** — turn and press alerts in the browser and the installed Android app (service-worker push handler included; VAPID server path documented).
- 🔐 **Google Sign-In & saved progress** — same login model as Backstabbr (Google Identity Services), saves keyed to your stable Google `sub`, autosave of game + orders + press per profile, export/import between devices. Setup: [`docs/GOOGLE_SIGNIN_AND_PUSH.md`](docs/GOOGLE_SIGNIN_AND_PUSH.md).
- 📱 **Cross-platform** — responsive PWA: install on Android from Chrome, play offline, or wrap for the Play Store (TWA/Capacitor guides in [`android/`](android/)).
- 📖 **Beginner guide built in** — Diplomacy in 5 minutes, classic openings for every power, contextual hints every turn. Also as [`docs/BEGINNER_GUIDE.md`](docs/BEGINNER_GUIDE.md).

## Quick start
- **Play:** open the Pages link above. Pick a power, tap units to move, write press, hit ⚔️ Resolve turn. Other powers are bot-played locally so a game always flows; switch "Playing as" for hot-seat games with friends on one device.
- **Install on Android:** open the site in Chrome → ⋮ → *Install app / Add to Home screen*.
- **Run locally:** `python3 -m http.server` in this folder (service workers and map loading need http, not file://).
- **AI features:** Settings → paste any OpenAI-compatible base URL + model (+ key if needed) → enable. Keys live only in your browser.

## Honesty section — what this edition simplifies
Local-first v1: opponents are simple bots (online multiplayer rooms are the obvious next step — the save format is a single JSON game state, ready to sync); adjudication follows the classic structure (strength = 1 + supports, support cutting, bounces, dislodgement) with **auto-retreats** (nearest legal vacant province, else disband) and guided auto-builds instead of separate retreat/build phases; head-to-head moves use the simplified bounce rule; Bulgaria/Spain/St. Petersburg are single-coast provinces in the bundled Classic (the map schema supports vDiplomacy-style split coasts, and imported split-coast variants play correctly); convoy chains validate the first/last fleet legs. Map artwork and data are original to this project; Diplomacy's rules are public, and this is not affiliated with Backstabbr, webDiplomacy, vDiplomacy, Hasbro or Avalon Hill.

## Project layout
`index.html` (SEO + app shell) · `css/` · `js/` (`data.js` generated classic map, `personas.js`, `trophies.js`, `app.js` engine/UI) · `variants/` (classic/caucasus/empires JSON in the vDiplomacy data model) · `docs/` · `android/` · `sw.js` + `manifest.webmanifest` (PWA) · `tools_build_*.py` (map data generators — one source of truth per map).

## Author & collaboration
Built by **Raphael Malikian** (rtmalikian@gmail.com) — healthcare founder/operator now building clinical AI, and a Diplomacy player whose church group wanted a better board. Open to collaborate with anyone who wants similar help with their problems, and seeking a clinical AI architect role.
GitHub: https://github.com/rtmalikian · X: https://x.com/rtmalikian

Keywords: Diplomacy game online, play Diplomacy free, Backstabbr alternative, Backstabber game remake, Diplomacy Android app, Diplomacy browser game, vDiplomacy variant maps, webDiplomacy custom maps, Caucasus strategy game, Armenia strategy game, Diplomacy PWA, online board game, Diplomacy beginner guide, Diplomacy AI.
