# Desk Editor

A small off-device rules-based agent selects a useful TRMNL edition according to local time, chosen editorial mode and fresh public data. One lead card and up to two supporting kinds; every selection has an explanation. No LLM cost, private account access or invented source content.

Production: https://desk-editor-trmnl.vercel.app (verify deployment records in launch-plan.json).

## What it does

- Balanced, Builder and Quiet editorial modes.
- Optional weather for San Francisco, New York, Seattle, Los Angeles, Austin or Chicago; default off. Independent IANA time zone defaults to America/Los_Angeles.
- Up to 24 official HN front-page posts from the last 72 hours; optional exact title words match any word. No topic matches means no story card, not unrelated filler.
- Latest published stable release from Node.js, React or Next.js, or off. The published date stays visible; an old latest release is never labeled newly released.
- NWS current/next forecast and active severe/extreme alerts. Actual/likely-or-observed alerts take priority. This is periodic e-ink content, not emergency monitoring.
- Time-of-day original routine suggestions. These are not calendar/task data.
- Deterministic ranking within selection windows for the same candidate set. A source update or active alert can change it sooner. Device refresh and ranking window are separate.
- Live browser preview with four approximate layouts, source notebook, reasons and a labeled time-of-day simulation. Demo hours do not modify production device output.

## Reliability

Requests use a fixed source allowlist, bounded response sizes, five-second timeouts and at most six parallel HN item requests. Warm-instance caches coalesce concurrent fetches. HN cache ten minutes, GitHub one hour, NWS forecast fifteen minutes, NWS alerts five minutes. Source outages are explicit. Story/release fallbacks expire after 24 hours; forecast cache after three hours, and forecast periods expire at their actual end time. Alerts have no stale fallback. No persistent storage is needed; a cold outage yields an original routine and unavailable source states, not a fabricated event. No claim of continuous background monitoring; the server executes when polled.

## TRMNL

All four native framework 3.4 layouts and a shared title bar live in `trmnl/`. `public/plugin.zip` includes them, configuration, icon and setup guide. Compact response caps three cards and each field by UTF-8 bytes; no Saved State transform or credential is needed. `format=trmnl` is the device endpoint. Full responses retain source links and timestamps. Do not expose internal candidates to device polling.

Current release state: website deployed and production verified; separate Recipe creation/submission and owner installation are deferred under Manuel's instruction not to control his screen. Record exact verified state; do not mark these completed because package files exist. Existing Recipes 505118/506494/507810 must be preserved. Public install URL is pending, not guessed.

## Develop and deploy

`npm test` runs behavior checks. `npm run dev` serves http://127.0.0.1:4320. Node 22, no runtime dependencies. Test templates with LiquidJS as a development dependency. Deploy **from this directory** with `vercel deploy --prod --scope manny4c-personal --yes`; never use Paper Star. Keep .vercel ignored.

## Data and reuse

No new paid subscriptions. Only public preferences in URL parameters; normal hosting logs can contain them. No private account keys collected. User settings may be saved in browser-local storage. Data sources: [HN API](https://github.com/HackerNews/API), [GitHub Releases](https://docs.github.com/en/rest/releases/releases), [NWS API](https://www.weather.gov/documentation/services-web-api). Original source/markup: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Source content keeps original rights.
