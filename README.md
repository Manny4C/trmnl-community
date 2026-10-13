# TRMNL Community

A personal project by Manuel: seven useful TRMNL apps, built one per weekday. Each app has its own Vercel website and hosts the data service for its TRMNL Recipe.

GitHub owner: **Manny4C**. Vercel team: **Manuel's Personal Projects (`manny4c-personal`)**. Never deploy this project to Paper Star.

The launch automation returns to the original Codex chat at **10 a.m. Pacific on weekdays**. The computer and desktop app must be running for local scheduled work. `launch-plan.json` records current scope, dates, access, verified release URLs and publication status. Delays shift the remaining build dates. Public TRMNL review is independent of Vercel deployment.

| Day | Target | App |
| --- | --- | --- |
| 1 | Tue, October 13, 2026 | What Changed? — a news briefing with memory |
| 2 | Wed, October 14 | YC Scout — verified YC companies and launches |
| 3 | Thu, October 15 | Sounds Like My Company — similar recently launched companies |
| 4 | Fri, October 16 | Desk Editor — a dynamic off-device editor |
| 5 | Mon, October 19 | TRMNL Plays: Tiny Planet — one shared cooperative world |
| 6 | Tue, October 20 | Game Night Radar — updates for followed Steam games |
| 7 | Wed, October 21 | Local Morning Brief — local news, weather and transit |

## What Changed?

- [Production website](https://what-changed-nine.vercel.app)
- [Live data](https://what-changed-nine.vercel.app/api/briefing?topic=technology)
- [Support](https://github.com/Manny4C/trmnl-community/issues)
- Owner's private TRMNL instance: `505118`, installed on Manuel's TRMNL.

Public listing status is tracked separately in `launch-plan.json` and the app's `public/release.json`. Do not label a pending Recipe as publicly approved.

## Development

From `apps/what-changed`, install dependencies with `npm install`, run `npm test`, then `npm run dev`. The local service runs at `http://127.0.0.1:4317`. Vercel production deployment uses `vercel deploy --prod --scope manny4c-personal` from the app directory.

The data service uses a fixed allowlist of public RSS sources. It removes markup and tracking parameters, filters unsafe URLs, suppresses obvious duplicates, limits payloads, and reports partial outages. Successful data is cached; stale fallbacks preserve their real timestamp. It does not accept arbitrary feed URLs or store account credentials.

The website remembers its displayed briefing in browser-local storage. The TRMNL Serverless function maintains a separate bounded Saved State for each installation, detects changed story fingerprints, and preserves prior stories through outages. Smaller layouts show a subset of the full edition. The plugin cannot know whether a person actually looked at a screen.

All four Liquid layouts, shared styles and the Serverless memory function live in `apps/what-changed/trmnl/`. Rebuild `public/plugin.zip` after changing these files. Test in a separate private clone after the Recipe is published, because edits to a Recipe master reach installed copies automatically.

## Tiny Planet requirements

Everyone views the same original world on the public website and their TRMNL. Only server-verified TRMNL owners can make moves. Use a stable verified user identity; a cookie, shared URL or client-supplied device ID is insufficient. Enforce one move per user per UTC calendar day in durable database transactions. Unlimited users may act each day. Log every applied move and update the world atomically.

A labeled owner autopilot must make at least one move every calendar day, including weekends, even with no community participation. Implement an idempotent production scheduler plus recovery checks; do not depend on the weekday Codex automation. Public participation authentication and storage must be complete before launch.

## Release practice

Finish the first useful version, run meaningful tests, verify the responsive website and TRMNL layouts, deploy on the personal Vercel team, install on the owner's device, and submit for TRMNL review. Ask for edits after delivery. Preserve existing device content. Never publish secrets or claim physical screen verification based only on an editor preview.
