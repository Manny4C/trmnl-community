# One More Room — campaign model

Version 1 · October 28, 2026 · Owner: Manuel · Weekly development: Mondays, 10 a.m. America/Los_Angeles.

This is the working model for writing and shipping a long-running, coherent campaign. It is a persistent authoring system plus a small deterministic game engine. It is not a machine-learning model, an improv transcript, or a promise that every player has made the same choices.

## The experience

The Lantern Company is trying to return a stolen sun. A frame should feel like one clear moment at a tabletop: someone sees a problem, a hero does one understandable thing, and the result changes what happens next. The game makes that choice automatically unless a browser player intervenes. The player does not need to manage a character sheet, read a wall of lore, or pick from ten near-identical actions.

The long campaign should move from survival, to understanding the loss, to deciding what a restored dawn should mean. The party makes friends, keeps promises, discovers why the keepers hold the embers, and earns different ways through the world. Dungeons remain useful places in this story; they should not become interchangeable containers for loot.

Rich authoring belongs in this folder. A screen gets a short situation, three plain choices, a visible result and a useful recent summary. A good expansion adds consequences and relationships, not just nouns.

## Four separate kinds of truth

| Layer | What belongs here | What may change it |
| --- | --- | --- |
| Shared canon | The six established regions, what sunlight can do, a faction's charter, an NPC's original role | A reviewed, sourced addition in `canon.json`; stable facts are append-only |
| Release fiction | A chapter's initial problem, encounters, rumors, motives, and possible endings | An unpublished candidate; after release its pack is immutable |
| Party truth | Who this party helped, learned from, frightened, owed or defeated | An actual committed game action; stored as bounded earned facts |
| Future plans | Possible revelations, draft locations, twists and unused hooks | The author; never describe a plan as an event that already happened |

An author's secret is not automatically known to Mira. An NPC's belief can be wrong without making the narration contradictory. A player learning a rumor does not prove it. A weekly authoring run does not kill a keeper for every installed party.

## Identity and memory

Every established entity has a stable lowercase ID. Names are presentation; IDs establish identity. Retain aliases if a name changes. Never reuse a retired ID for another person or place.

`canon.json` records entities, stable facts, public beliefs, private motives, relationships, geography, and authored sources. Runtime packs use only referenced public identities and appropriate scene knowledge. A fact in a party save is an earned condition such as `promise_kept`, not a paragraph of prose.

An active chapter holds a small set of local beat flags and seen encounter IDs. Durable facts survive chapter changes. An append-only ID/index registry stores them as a compact bitset, so a short recap or a new chapter never silently drops an old promise. Recent prose is a recap, not the authoritative state. Losing a recap must not cause an oath to be forgotten or a reward to be claimed again.

Version 1 save compatibility is preserved: the old party, RNG, room layout, explored bits, health, gold, supplies, turn and frame token remain valid. The campaign extension is optional. Existing parties adopt story content only at a safe floor boundary; new parties may begin with it immediately. Do not regenerate an active floor or reset a seed to introduce content.

## Causality before novelty

Before approving a scene, answer six questions:

1. Why is this happening now?
2. Why is it happening here?
3. Who wants something, and what can they actually do?
4. What can the party know at this point?
5. Which prior fact or choice makes this scene eligible?
6. What observable change follows each choice, including a setback?

Use the chain **established condition → pressure → action → consequence → new possibility**. A bandit should want food, access, money, shelter or leverage. They should not appear merely because the last room was quiet. A bridge breaking closes or complicates a route until someone repairs or bypasses it. A warning learned in an inscription should matter at the next relevant hazard.

Coincidence can introduce a problem once. It cannot repeatedly solve problems, provide missing knowledge, or transport the same NPC between distant sites. If an NPC travels, record their route, reason and limits. If an NPC appears in more than one dungeon, use an established courier network or a message; do not teleport a stationary witness.

## Geography and travel

The existing atlas has six repeating dungeon families: Sunken Abbey, Briar Archive, Clockwork Crypt, Glass Catacombs, Ember Observatory and Hollow Orchard. They are families of sites within a larger realm, not the exact same named room returning from the dead. Generated floor numbers track the party's expedition, not a universal calendar.

The world view presents the current six-site chapter. The dungeon view shows actual generated rooms and the current party. Written additions must use this structure until an explicitly designed migration changes it. A weekly release must not relabel an already explored room or move an old landmark to fit a new plot.

Surface travel is expressed as short transitions and safe-boundary scenes. One frame still performs one action. Do not narrate a week-long journey, a negotiation, a fight and an entire rescue as one button press.

## Campaign pacing

Use small arcs, not an endless escalation of bigger villains:

- **Beat 1 — invitation:** a concrete need, recognizable face or useful clue.
- **Beat 2 — complication:** something makes the straightforward answer costly.
- **Beat 3 — discovery:** connect the problem to an established cause.
- **Beat 4 — decision:** offer two or three understandable approaches with different consequences.
- **Beat 5 — payoff:** acknowledge the choice, close a promise, and leave one useful opening.

A chapter normally contains one required arc and one optional side thread. Required beats remain reachable. Starting a side thread is a promise: its continuation must stay available until resolved. Do not begin new optional threads after the required arc is finished if that would prevent an otherwise ready chapter from ending.

After a tense moment, allow wonder, kindness, humor, repair or rest. Aim for more than half of added scenes to be noncombat. Preserve uncertainty without making every friendly person a betrayer. A keeper can be bound, mistaken or afraid; combat remains an engine-supported route, but weekly stories should offer more than combat explanations.

Use two scales of progress. Small progress includes opening a route, learning a name or repaying a favor. Large progress includes recovering embers and understanding the stolen sun. Every week should deliver some small payoff. Reserve major revelations for earned, seeded arcs.

## Simple actions and writing

The core verbs are **look, talk, help, cross, repair, rest, take, leave, fight**. More specific labels are welcome when still understandable: “Mend the bell rope,” “Share a ration,” “Ask about the mark.” Keep choices short and distinguish their intent.

Each encounter has three authored approaches; one requiring food or money is unavailable when the party cannot afford it, and at least one approach is always free. Each available choice has a hero who can perform it, one difficulty check and bounded effects. A choice must not promise an action the engine cannot resolve. Do not disguise the same outcome as three choices without a reason. Never punish a sensible option with an unforeshadowed catastrophic consequence.

Use everyday words. Name the relevant object instead of stacking fantasy modifiers. Prefer “The bell rings, though its rope is cut” to a paragraph about an eldritch resonance. Screen setup text stays under 156 characters; action labels under 35; success/setback text under 160. The full lore dossier can be much longer.

Success grants a cleaner result or a small reward. A setback changes the situation and charges a small cost, but the required clue or route remains available. A failed reading can reveal the warning while damaging the lantern. A failed repair can make a noisy but usable bridge. Do not lock an entire campaign behind one dice roll.

## Release and chapter boundaries

Every released content pack is immutable and addressable by ID. Keep its JSON and digest in the catalog. A Monday adds a pack; it does not overwrite last Monday's pack.

A party pins its active release. That release remains available through its required arc and any optional thread the party started. Only at the next floor boundary, after those obligations are resolved, may it adopt the latest release. Carry durable facts into the new chapter; clear only that chapter's local flags and repetition window.

If the newest pack is unavailable or invalid, keep the last known good content. If a pinned pack is unavailable, preserve the save and do not invent a replacement scene. Duplicate or older frame tokens remain no-ops. Authoring and catalog refreshes never take player actions.

The web client can fetch an immutable pinned pack and the current catalog. A content-aware native Serverless bridge receives the pinned and latest pack through its polling endpoint, validates them, then returns only bounded merge data and state. The native Recipe needs that one-time bridge deployment before it can use future packs. Source, website, installed native rules, public approval and physical receipt must always be recorded separately.

## What changes in the world each week

The scheduler is an author, not an unattended player. It may add motivated opportunities, change a release's starting background conditions, and advance a small shared faction clock where no party-specific result is assumed. It may not report that Brann accepted a bargain or that all players saved a village.

A background clock needs an owner, a goal, a resource, a next step and a limit. Advance at most a few small steps in a weekly dossier. Make later encounters test earned facts when a party's choices can alter that clock. Candidate clocks are plans until published as the starting conditions of a new chapter.

Maintain a rolling six-week horizon with dependencies. Detail the next release; outline later possibilities. A horizon is not a fixed script. Re-plan when the latest release creates a better question. Resolve or deepen existing threads before adding new factions.

## Checks before publication

The compiler and tests check schema, stable IDs, known references, limits, prerequisite reachability, required-arc completion, started-side-thread completion, immutable release hashes, safe text, resource bounds, deterministic selection, replay idempotency, legacy saves, all four Liquid layouts and byte budgets. Tests cannot prove good storytelling; the writer must also perform a contradiction and voice review.

Read a sample path aloud. Can a returning player understand it without the dossier? Do NPCs act from their motives? Is a choice remembered? Does each failure still lead somewhere? Are there enough quiet moments? If an expansion fails these checks, keep it as a candidate and preserve the live release.

## Success after several months

The world should feel familiar enough that meeting an old ferrier matters, different enough that the next room is not predictable, and consistent enough that the player can make a reasonable guess. Bigger is not the measure. Remembered promises, visible consequences, recurring places, and earned endings are.
