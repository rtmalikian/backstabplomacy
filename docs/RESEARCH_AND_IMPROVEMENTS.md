# Research notes — Backstabbr, Diplomacy, vDiplomacy (November 2026)

## What Backstabbr is (from its own site/FAQ and player reports)
- A browser Diplomacy platform for 2–7 players plus an optional Gamemaster, classic map only.
- Login is **Google accounts only** (its FAQ: you can use a Google account tied to a non-Gmail address). In Feb 2020 it migrated login systems; users who changed their profile email got locked out of old games — a cautionary tale baked into this project's design (saves keyed to the Google `sub`, not the email).
- Loved for: clean, legible orders; a genuinely useful **sandbox** to test adjudication; tick-box group press; email notifications for press, adjudication and impending deadlines; decent mobile adaptation.
- Its FAQ is explicit that **map variants are the #1 feature request and are not supported**, because its clickable-map pipeline was manual/tedious.
- Player complaints found in community threads: illegal orders are accepted and simply fail (including split-coast mistakes), high NMR/CD rates with no built-in nudges, no in-client hints for new players, and a functional-but-plain interface.

Sources: backstabbr.com/faq; webdiplomacy.net forum thread comparing platforms; community game-recruitment threads (Online-Go forums, Realms Beyond).

## Classic Diplomacy essentials (rulebook / teaching guides)
- 7 Great Powers (England, France, Germany, Italy, Austria, Russia, Turkey), Europe 1901.
- 75 named provinces in the standard data model (land, coastal, sea), **34 supply centres**, powers start with 3 centres (Russia 4); **18 centres after a Fall turn wins**.
- No dice, no randomness. Orders are simultaneous and secret: **Hold, Move, Support, Convoy**. Strength = 1 + supports; equal strength bounces; support is cut by an attack from elsewhere; dislodged units retreat or disband; winter builds/disbands equalise units to centres; builds only in home centres.
- Each year: Spring moves (+retreats), Fall moves (+retreats), Winter adjustments.

Sources: PlayDiplomacy rules summary (adapted from Edi Birsan's 5-minute teaching guide); Windy City Weasels teaching guide; DATC adjudication reference.

## vDiplomacy / webDiplomacy variants — what "compatibility" means technically
- vDiplomacy is the variant fork of webDiplomacy. A variant = a set of files: map images **plus structured data** — each territory has an id/name, a type (land/coast/sea), supply-centre and home-power flags, **unit-placement coordinates and a border/adjacency graph** (its Variant Creation Guide describes defining territories and drawing move/support arrows between them; coasts can be separate territories).
- Variants range from Classic (75 territories) to World War IV (hundreds of territories, 35 players), plus rule-twist variants on the Classic map (e.g. Ankara Crescent).
- So compatibility for a new engine = **speaking that data model**: import/export JSON with territories, types, borders, centres, homes and coordinates, including split-coast territories as separate entries. That is exactly what `variants/classic.json` and the in-app variant importer implement here. Map *artwork* is not copied — this project's art and coordinates are original (real lat/lon per province).

Sources: vdiplomacy.com variants pages; webDiplomacy Variant Creation Guide (webdiplomacy.ru mirror).

## Improvements shipped in Backstabplomacy (vs. the clunky status quo)
1. **Game-like GUI** — dark command-room theme, one-tap map orders (tap unit → highlighted neighbour), colour-coded powers, live scoreboard, sticky phase bar. Backstabbr's text-first flow is replaced by direct map manipulation.
2. **Illegal orders explained, not silently failed** — terrain/adjacency validation with a plain-English reason in the turn log.
3. **Beginner system** — 5-minute guide in-app, classic openings per power, contextual rule-based **Hints** every turn, and an optional **AI Strategist**.
4. **Push notifications** — PWA notifications for press and phase events, plus a documented VAPID Web Push path; Backstabbr relies on email.
5. **Android as a first-class citizen** — installable PWA ( Add to Home Screen ), offline app shell, plus Capacitor/TWA packaging paths in `android/`.
6. **vDiplomacy-model variant maps** — import variant JSON and play it; the #1 Backstabbr feature request.
7. **In-character press (new)** — optional OpenAI-compatible endpoint rewrites your English press into your power's theatrical persona (Bond-villain Russia, polite-colonel Germany, musketeer-chef France…) with meaning locked; offline styliser fallback.
8. **AI Strategist (new)** — same endpoint, opt-in, sends board state only, returns concrete orders + a diplomatic move + a risk warning.
9. **Google Sign-In parity + safer saves** — GIS sign-in keyed to `sub`, autosave of game/orders/press per profile, export/import.
10. **Open source** — the thing Raphael's play group asked the original for. MIT-style openness: fork it, host it, mod the map.
