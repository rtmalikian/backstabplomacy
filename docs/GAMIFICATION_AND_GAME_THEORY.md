# Engagement, trophies & game theory — design notes

Researched and written for Backstabplomacy, November 2026. Two literatures, one design.

## Part 1 — Why players come back (game design / gamification research)

**Self-Determination Theory (Deci & Ryan).** Durable motivation comes from *autonomy, competence, relatedness* — not from points alone. Mapped here:
- **Autonomy** → custom & variant maps, seven-plus playable personas, your own AI endpoint (or none), hot-seat or solo.
- **Competence** → contextual hints, pre-submit order validation (learn *why* a move fails, before it costs you), Clean Sheet / Full Slate trophies, visible XP levels.
- **Relatedness** → press, public pledges, in-character personas that make friends reply, a map built for a real church group (Caucasus & Caspian).

**Points, Badges, Leaderboards (Werbach & Hunter's PBL triad)** — used, but deliberately not *only* used: XP (points) and 24 trophies (badges) sit on top of quests (map trophies), narrative (personas, historic maps) and social play (press). The scoreboard is the game's own centre count — competition that is the game itself, not a bolted-on leaderboard.

**Goal-gradient effect** — effort rises as a goal nears: the level progress bar, "XP to next rank", and the always-visible "Win at N ★" centre counter both exploit it honestly.

**Streaks & loss aversion (Kahneman & Tversky)** — a "days played" flame and a Second Dawn trophy reward returning, but **nothing is ever taken away**: no expiring streaks, no punishment. The research critiques of streak pressure are real; this design takes the retention benefit and refuses the dark pattern.

**Fogg's behaviour model (motivation × ability × prompt)** — notifications are the *prompt*, one-tap map orders lower the *ability* cost, and trophies/personas supply *motivation* at the moment of the prompt.

**Variable rewards** — bot replies, the rotating game-theory tip, and persona rewrites vary in flavour; fixed, predictable rewards habituate fastest (Hamari et al.'s review also warns effects are context-dependent — hence trophies reward *playing well and socially*, not raw grinding, and there is no pay-to-win anything).

## Part 2 — Game theory, taught by the game itself (Schelling, Axelrod, Nash)

Diplomacy is applied game theory with a map. Backstabplomacy names the concepts where they occur:

- **Focal points / Schelling points (Schelling, *The Strategy of Conflict*, 1960).** Coordination without communication converges on the obvious. In-game: the *Schelling Point* trophy for your first Support, hints that flag "the obvious centre", a daily GT tip.
- **Credible commitment.** A threat or promise works when it visibly binds you. In-game: **public pledges** in press (🤝) — you stake reputation in front of the whole table, plus the *My Word Is Bond* trophy.
- **Costly signalling.** Support orders are the game's costly signal — a unit spent helping you is a unit not defending home. The coach tips say so explicitly ("believe movements, discount adjectives").
- **Iterated Prisoner's Dilemma / shadow of the future (Axelrod, *The Evolution of Cooperation*, 1984).** Repeated interaction sustains cooperation; tit-for-tat with forgiveness beats vendetta spirals. The GT tips teach it; the long-form game structure embodies it.
- **Nash equilibrium & balance of power.** When a leader nears 18, coalition-against-the-leader is the equilibrium-restoring move — the hints engine literally suggests building that coalition.
- **Chicken & brinkmanship.** Two powers racing one neutral centre are playing chicken; the tips advise negotiating the split before the bounce. Brinkmanship is framed as spending a scarce currency (credibility).
- **Backward induction / endgame unravelling.** Finite-horizon cooperation decays near the end — the tips warn new players to expect the final-year stab rather than be wounded by it.

## The trophies (24)
Onboarding (Signed & Sealed, Face of an Empire, First Orders, First Dispatch), craft (Full Slate, Clean Sheet, Convoy Captain, Schelling Point), conquest (First Conquest → Expansionist → Superpower → Solo Victory), endurance (First Shots Fired, Survivor, Marathon Diplomat, Second Dawn), exploration (Cartographer, Child of the Caucasus, Time Traveller), mind (Student of Schelling, AI Whisperer, In Character, My Word Is Bond) — and one for the name of the game: **The Classic Backstab** 🗡️.

Sources: Deci & Ryan, Self-Determination Theory; Werbach & Hunter, *For the Win* (2012); Hamari, Koivisto & Sarsa (2014) gamification literature review; Kahneman & Tversky, Prospect Theory (1979); Schelling, *The Strategy of Conflict* (1960); Axelrod, *The Evolution of Cooperation* (1984); Fogg, Behavior Model (2009).
