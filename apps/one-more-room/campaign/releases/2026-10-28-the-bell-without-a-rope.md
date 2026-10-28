# Foundation release — The Bell Without a Rope

Date: October 28, 2026. Week key: 2026-10-26. Release ID: `foundation_2026_10_28`. Status: published on the website; catalog, pack, module, page and package hashes verified in production. The native bridge is prepared, not saved. This foundation is built before the first scheduled Monday, November 2.

## Dramatic question

Can a company looking for the sun afford to stop for a small broken signal? The chapter answers through useful consequences, not a speech. Repairing an ordinary route connects the larger quest to people still doing work in the dark.

The premise follows directly from the existing underworld, lantern, keepers and six site families. The Lantern Road supplies a practical reason for messages and travelers to appear at maintained posts in different regions. Its members have limited tools and local knowledge; no one provides a convenient explanation of the whole stolen sun.

## Required arc

```text
A courier note
  → understand the broken signal
  → make the marked crossing usable
  → send/mark a working signal
  → a distant post answers
```

The four beat flags are `bell_message`, `bell_tested`, `bell_mended`, and `bell_done`. All three choices at each beat can advance that beat. An approach that needs food or money is offered only when the party can afford it; a free approach remains. A setback may yield a rougher result, a lost coin, an injury in the physical repair, or an unearned bonus; it never hides the essential direction forever. Restoring the signal is remembered as an earned permanent fact on both a clean and a costly completion.

The signal post is not moved between regions. There are multiple maintained posts in the established route network. The party encounters a local instance along its expedition. The distant answer travels through a connected passage, not across the whole world.

## Optional thread

```text
Letter in a courier tin
  ├─ secure it and leave it for its regular courier → no accepted obligation
  └─ carry/protect it
       → identify the matching route mark
       → leave it in the correct sheltered box
       → remember that the company kept it safe
```

Choosing to leave the letter safely does not start the side arc. If the party takes it, the active chapter cannot be replaced until the delivery is resolved. The letter is never opened by an unrelated roll. A wrapping choice can be remembered separately from basic safe delivery.

This is a personal promise. The world bible does not claim that every player delivered the same physical letter in a shared universe. A later release can acknowledge this party's care through its earned fact.

## Nine further scenes

| Scene | Place/cause | Purpose |
| --- | --- | --- |
| Nessa's loose rail | Sunken Abbey approaches; a ferry needs work | A practical favor or shared food |
| Tamsin's careful copy | Briar Archive; a fragile original needs a traveling copy | Careful preservation without invented missing text |
| Ada's shutter | Clockwork edge; a bent pin wastes oil | Repair an existing source of light |
| Sel's warning | Glass entry hall; two incomplete reports disagree | Communicate a useful uncertainty |
| The scratched star chart | Ember Observatory; a damaged date limits a forecast | Distinguish a bearing from a promise of dawn |
| Ivo's seed shelter | Hollow Orchard; a leak threatens one tray | Immediate care with a delayed harvest |
| A watch worth sharing | A safe shrine | Brann accepts help; the party gets a quiet moment |
| A traveler's small problem | The maintained road | Repair, advice or food without creating dependence |
| A familiar bell note | Only after this party restored a signal | Show a concrete callback to useful earlier work |

Unique ambient cards do not repeat within a pinned chapter. Existing procedural combat, traps, keepers and travel remain available between authored scenes and after a chapter's authored cards are exhausted. The chapter is an addition to the expedition rather than a forced replacement for its dungeon layout.

## Two example paths

### Careful company

Mira reads the note. The company carries a letter rather than opening it. A later inscription explains the signal; Pip fixes the crossing pin. The group checks the reed mark and leaves the letter in a dry box. Mira marks the repaired signal. The saved facts include a restored route and a safely handled letter. Only after the required beat and accepted letter delivery are finished can a new release become eligible at the next floor boundary.

### Costly company

The note is damp and several marks cannot be recovered. The surviving direction still reaches the crossing. Brann's repair hurts, but the beam holds. The company secures the letter tin and leaves it for its regular courier, so it owes no delivery. The first bell note catches; the next reaches the neighboring post. The road is still restored. The required fact is remembered, while clean-success bonuses were missed.

Neither path restores the entire sun, resolves the missing names, or proves a final villain. Those remain open questions.

## Continuity audit

- **Knowledge:** Orin's note contains route instructions, not the sun's explanation. Tamsin labels a missing line as missing. Sel and the chart distinguish uncertainty from proof.
- **Place:** the six named residents remain at their established home regions. Portable message and repair beats use the existing waystone network. The courier's route explains the messages without teleporting a resident.
- **Time:** no real-world week is forced into a party save. Each roll resolves one action and its immediate consequence. Growing a seed remains future work.
- **Cause:** a cut rope, bent pin, cracked cover or damaged record gives each problem a visible source. A nearby answer establishes that the repaired signal reaches someone.
- **Memory:** restoration and delivery facts survive setbacks when the work actually succeeded at a cost. Facts use stable indices in compact permanent memory; local beat flags may reset only on chapter adoption.
- **Rewards:** no default injury is attached to reading or conversation. Physical hazards declare their injury. Shared food costs a supply even on a setback. Unique ambient favors are not an infinite repeatable payment loop.
- **Promises:** optional delivery is either declined clearly or retained until its actual end. New releases cannot silently strand it.
- **Limits:** no new spell, universal resurrection, final culprit, region or runtime paid service is introduced.

## Verification

The authoring validator checks the pack's schema, 24 kB runtime limit, catalog digest, canon references, permanent fact indices and all reachable local obligation states. The current pack has 16 cards and 33 reachable obligation states; each state has a route to a valid ending. Success and setback branches are both included.

Tests cover automatic completion under three instincts and several seeds, repeated setbacks, old saves, immutable packs, missing pinned content, frame replay, side-thread pinning, chapter handoff and permanent memory. A deliberately distant fact index is retained to show that a growing registry does not require storing every fact name in Saved State. The compiled content-aware native bridge is simulated with actual pack delivery and byte budgets.

The unchanged native Shared template remains canonical. This source build does not save the new bridge into Recipe 522318 or alter its installed polling settings. The existing installed game continues on its prior rules until the one-time bridge update is explicitly authorized and verified.

## Next useful questions

A repaired signal may expose an inconsistency: someone marked another repair complete when it still needs work. That is a lead, not proof of sabotage. A carefully delivered letter may bring a modest personal acknowledgment. Neither hook requires adding a faction or escalating immediately to a world-ending villain.

The first Monday run should choose a connected consequence, write it fully, and revise the horizon if the resulting chapter suggests a better next question. It should not repeat this foundation or announce it again as a new release.

## Publication record

The live website and 13 production routes were verified, including the backward-compatible minute endpoint and opt-in pinned-content endpoint. All 34 app tests and 14 shared palette/framework tests pass. The compiled native bridge also resolved and replayed a frame using actual production chapter data. No user-screen control or native settings were used. Deployment ID and dated verification evidence are recorded in `../ledger.json`.
