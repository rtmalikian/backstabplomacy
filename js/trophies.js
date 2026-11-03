// Trophy cabinet + game-theory coaching tips.
// Design basis (docs/GAMIFICATION_AND_GAME_THEORY.md): Self-Determination
// Theory (autonomy / competence / relatedness), the PBL triad done
// honestly, goal-gradient progress, gentle streaks (loss aversion kept
// kind — streaks never punish), and Schelling/Axelrod game theory
// taught through play.
window.TROPHIES = [
 {id:"account", emoji:"✍️", name:"Signed & Sealed", desc:"Create an account — sign in with Google (or demo sign-in).", xp:20},
 {id:"photo", emoji:"📸", name:"Face of an Empire", desc:"Add a profile photo to your account.", xp:20},
 {id:"first-order", emoji:"👞", name:"First Orders", desc:"Set your very first order.", xp:10},
 {id:"all-orders", emoji:"✅", name:"Full Slate", desc:"Give every one of your units an order in the same phase.", xp:20},
 {id:"clean-sheet", emoji:"🎯", name:"Clean Sheet", desc:"Submit a turn that passes validation with zero errors and zero warnings.", xp:30},
 {id:"first-turn", emoji:"⚔️", name:"First Shots Fired", desc:"Resolve your first turn.", xp:20},
 {id:"first-press", emoji:"💌", name:"First Dispatch", desc:"Send your first press message.", xp:15},
 {id:"pledge", emoji:"🤝", name:"My Word Is Bond", desc:"Make a public pledge in press — a commitment device, Schelling-style.", xp:20},
 {id:"persona", emoji:"🎭", name:"In Character", desc:"Rewrite a press message in your power's persona.", xp:20},
 {id:"support", emoji:"🫱", name:"The Schelling Point", desc:"Order a Support — the costly signal that makes alliances credible.", xp:20},
 {id:"convoy", emoji:"🚢", name:"Convoy Captain", desc:"Order a Convoy across the sea.", xp:20},
 {id:"capture", emoji:"★", name:"First Conquest", desc:"Capture a supply centre.", xp:30},
 {id:"five-sc", emoji:"🏰", name:"Expansionist", desc:"Hold 5 supply centres at once.", xp:30},
 {id:"ten-sc", emoji:"👑", name:"Superpower", desc:"Hold 10 supply centres at once.", xp:50},
 {id:"win", emoji:"🏆", name:"Solo Victory", desc:"Win a game by reaching the centre threshold.", xp:100},
 {id:"year", emoji:"📅", name:"Survivor", desc:"Reach 1902 — survive a full year of Europe.", xp:20},
 {id:"marathon", emoji:"🕰️", name:"Marathon Diplomat", desc:"Reach 1906 in one game.", xp:50},
 {id:"cartographer", emoji:"🗺️", name:"Cartographer", desc:"Load a variant or custom map.", xp:20},
 {id:"caucasus", emoji:"🏔️", name:"Child of the Caucasus", desc:"Play the Caucasus & Caspian map — Armenia, Georgia, Azerbaijan and friends.", xp:25},
 {id:"empires", emoji:"🏛️", name:"Time Traveller", desc:"Play Empires of the Crossroads — Rome, Byzantium, Armenia, Persia…", xp:25},
 {id:"strategist", emoji:"💡", name:"Student of Schelling", desc:"Open the Hints — study the board before you move.", xp:10},
 {id:"ai", emoji:"🤖", name:"AI Whisperer", desc:"Ask the AI Strategist for advice (AI endpoint enabled).", xp:25},
 {id:"second-dawn", emoji:"🌅", name:"Second Dawn", desc:"Come back and play on another day.", xp:20},
 {id:"backstab", emoji:"🗡️", name:"The Classic Backstab", desc:"Capture a centre in a game where you'd been exchanging press like friends.", xp:40}
];
window.LEVELS = [[0,"Cadet Envoy"],[50,"Attaché"],[120,"Envoy"],[220,"Minister Plenipotentiary"],[350,"Chancellor"],[500,"Grand Vizier"],[700,"Puppet Master"],[950,"Shadow Emperor"]];
window.GT_TIPS = [
 "🎯 Schelling point: when you and an ally must coordinate without certainty, pick the obvious option — the natural border, the famous centre. Obvious is a strategy: it's what they'll pick too.",
 "🔒 Credible commitment: a promise is believed when breaking it costs you something. Supporting an ally's attack in public view is a costly signal — that's why it works.",
 "🔁 Axelrod's tit-for-tat: in a long game, cooperate first, answer betrayal once, forgive quickly. Vendettas are how third parties win your war.",
 "♟️ Prisoner's Dilemma, table edition: you and a neighbour both gain by not fighting — but each gains more by striking first. Repetition is the cure: the shadow of next year disciplines this year.",
 "🐔 Chicken: two powers racing for the same neutral centre are playing chicken. Decide in advance who swerves — or communicate, and split the map instead of bouncing.",
 "📢 Cheap talk vs signal: words in press cost nothing, so weigh them lightly. fleets repositioned toward you? That's a signal. Believe movements, discount adjectives.",
 "⚖️ Stop the leader: when one power nears the win threshold, the rational move for everyone else is a coalition — even with yesterday's enemy. Balance of power is a Nash-restoring move.",
 "🪢 Burn a bridge (carefully): Schelling showed that visibly removing your own retreat can strengthen a defence — a supported hold you cannot abandon is a threat opponents must price in.",
 "🎲 Brinkmanship is a tax: threats that might spiral ('attack me and we both fall to Russia') can deter — but each use spends credibility. Spend it like a scarce currency.",
 "🕰️ Endgame honesty: cooperation unravels near a known final turn (backward induction). If a game has a deadline, expect the last-year stab — and don't be the only one surprised."
];
