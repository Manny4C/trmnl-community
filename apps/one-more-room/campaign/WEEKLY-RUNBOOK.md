# Monday campaign expansion runbook

Schedule: Mondays at 10:00 a.m. America/Los_Angeles, returning to this chat. First scheduled run: November 2, 2026. The app's native scheduler owns the schedule; do not create cron jobs, duplicate automations or a new chat each week.

## Purpose and authority

The user asked for sustained, generous work to grow a simpler tabletop-style campaign. Spend meaningful effort on causes, continuity, choices, callbacks and actual playable content. A short brainstorming list does not satisfy the run. Long output alone does not satisfy it either.

Read the latest source and project state. This runbook, CAMPAIGN-MODEL.md, WORLD-BIBLE.md, canon.json and ledger.json make the task durable across context loss. Manuel gave standing authorization on October 30, 2026 to keep improving this game without waiting, including website deployment, existing native Recipe updates and browser verification during weekly runs. Follow applicable tool requirements; preserve unrelated work and private saved progress. Recipe 522318 exists, is installed, and is in human review; never recreate it or confuse source changes with saved native rules.

## 1. Reconcile and choose the week

- Use America/Los_Angeles for the local Monday week key. Read `ledger.json`, recent release dossiers, catalog hashes, Git status and remote status.
- If this week is already published and verified, do not create another pack. If a previous run stopped after saving or deployment, reconcile its exact candidate, commit and deployment before retrying.
- Preserve concurrent changes. Do not reset a working tree or overwrite another app's metadata. If source cannot safely merge, retain the writing and report the concrete integration blocker.
- Read the last two published dossiers and the six-week horizon. Separate genuinely new feedback from old status notices.

## 2. Audit the world before writing

Build a short internal continuity brief: active questions, promises, factual limits, NPC locations and knowledge, faction resources, unfinished chapter hooks and tone balance. Identify which facts are immutable and which are only rumors or plans.

Choose one central question that builds on existing material. Examples: who benefits when a warning fails, how can a record travel without being destroyed, what counts as a fair promise for a future harvest? Do not choose another final villain merely because a week has passed.

Give every proposed development a cause and a source ID. If an NPC must move, write a plausible route and reason. If a faction clock changes, state whose action and resources make it possible. Most weeks should deepen an existing region rather than add a new map area.

## 3. Produce a substantial, bounded release

Normal target:

| Deliverable | Expected shape |
| --- | --- |
| Main chapter | One required 3–5 beat arc with a reachable payoff |
| Optional thread | One linked side story with a clear start and finish |
| Encounter variety | 12–18 distinct cards, including the arc beats |
| Recurrence | At least two meaningful callbacks to existing entities or earned facts |
| Noncombat | At least three situations involving help, talk, investigation, travel or repair |
| Party texture | One quiet exchange or small disagreement grounded in a hero's voice |
| Consequence | One resolution, repaired thing, honored debt, or changed relationship |
| World motion | A few motivated starting conditions, never fabricated universal player outcomes |
| Future | A revised six-week horizon with dependencies and open questions |

Targets guide scope, not filler. A smaller, complete and coherent release can be justified in its dossier when integration work or a strong ending makes that better. Do not ship 18 recolored copies of the same trap.

Each runtime card needs stable IDs, allowed locations/slots, eligibility conditions, three short choices, hero/approach/DC, successful and setback text, bounded effects, local flags or durable facts, and an appropriate existing art category. Scene setup remains under 156 characters, choices under 35, outcomes under 160. Design every required clue so all sensible actions can move the arc forward, with different costs or rewards.

Keep a runtime pack under 24,000 UTF-8 bytes. Rich rationale belongs in the dossier. Retain old packs verbatim; add a new file rather than editing a published one. Pack IDs must be stable, lowercase and unique. The catalog's SHA-256 digest is the published identity.

## 4. Write the dossier and canon changes

Create `campaign/releases/YYYY-MM-DD-title.md` with:

1. Week key, release ID, status and parent release.
2. The dramatic question and why it follows from established facts.
3. The arc graph and all meaningful branches, including setbacks.
4. What each recurring NPC knows, wants and can do here.
5. Canon additions with source IDs; rumors and draft plans kept separate.
6. A content/variety count and at least two sample playthroughs.
7. Continuity audit: geography, time, knowledge, cause, reward, consequences and unresolved promises.
8. Runtime validation/test results and actual website/native deployment status.
9. What remains open and what the next run should revisit.

Update `canon.json` append-only where possible. Existing facts cannot be quietly edited. A correction needs an explicit dated amendment and migration impact. Update `ledger.json` and the six-week horizon after reconciling actual release status. Do not mark a candidate as published before deployment verifies it.

## 5. Integrate and validate

Read existing IDs from the catalog. Add the immutable candidate pack and update the catalog only as a deliberate release operation. The authoring validator must reject changed hashes for previously published packs, unknown entity references, invalid art keys, bad effects, excessive text, deadlocked required arcs and unresolved started side threads.

Run:

```sh
npm run validate:campaign
npm test
npm run package
```

Run applicable cross-app palette/native-framework tests from the repository root when package or layout integration changes. Native Shared is canonical: never overwrite it with browser CSS. Respect standard merge-data and Saved State byte budgets. Maintain duplicate/older-frame protection, outage preservation, deterministic selection, seed isolation, one-action advancement and compatibility with old saves.

A content release should not require a rules change. If it does, explain and implement the smallest general capability. Do not create a new combat subsystem each Monday. Test success, setback, replay, adoption boundaries, missing pinned packs and eventual chapter completion. Existing parties must retain their active pack until its required arc and any started side thread finish.

Use CLI/HTTP/DOM/Liquid validation routinely. Browser and native verification for One More Room are authorized by the October 30 standing instruction. Ship worthwhile focused improvements alongside the weekly chapter when evidence supports them. Verify saved native fields and output whenever native code changes. Do not request ordinary release approval again.

## 6. Publish and prove it

Use the existing personal Vercel project, `one-more-room-trmnl`, under `manny4c-personal`. Keep GitHub source in `Manny4C/trmnl-community`. No Paper Star hosting/billing, new database or paid runtime inference.

Deploy the validated website, data endpoint and prepared package. Check the production catalog and new immutable pack anonymously; compare hashes with local files. Check the public frame endpoint with a pinned release and the latest release. Preserve working archives and installed Recipe data. A successful website or package response is not evidence that the native Serverless bridge was saved or that a physical screen was seen.

If publication fails, retain the last good live catalog. Do not delete archived packs. Reconcile an uncertain deployment before making another. Preserve the candidate and report the exact failed step.

## 7. Report the meaningful result

After a genuinely new verified release, give a concise player-facing summary: the new adventure, what is different, the important remembered connection, which choices have consequences, tests, live website and exact native status. Link the dossier for the substantial detail. Do not expose writer-only twists in the brief player-facing summary.

If there is no new release because this week's run was already completed, treat it as a no-op. If blocked, state what was completed and the concrete remaining action. Do not manufacture progress or repeatedly announce unchanged review/screen status.

## Rolling horizon at foundation

- **Week 1, Nov 2:** deepen a kept signal or returned letter; introduce a consequence of the first practical favor.
- **Week 2, Nov 9:** a disputed record; at least one independent source lets the party test a rumor.
- **Week 3, Nov 16:** a repair with two fair beneficiaries; return to a previously helped trade or route.
- **Week 4, Nov 23:** a quiet travel chapter followed by a small earned payoff; reduce accumulated tension.
- **Week 5, Nov 30:** develop one faction's reasonable disagreement using evidence and limited resources.
- **Week 6, Dec 7:** resolve a seeded local question and offer a credible next region or deeper duty.

These are plans, not released facts or promises that a particular player will encounter them on those dates. Re-plan in response to what has actually been authored and shipped.
