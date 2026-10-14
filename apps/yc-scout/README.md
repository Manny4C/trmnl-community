# YC Scout

Production: https://yc-launch-scout.vercel.app

Independent community launch radar for a TRMNL e-ink display, with a responsive live website and four Recipe layouts. No keys, accounts here, paid services or AI model required.

## Product

Filter by eight title-based sectors, optional YC batch code, launch window (30/90/365 days), and a company/product phrase. Latest sorts by HN posting date. Daily discovery deterministically rotates once each UTC calendar day. Full shows three launches on OG, up to four on X and six on X portrait; half layouts two, quadrant one. Each website card links to the announcement and shows its batch and posting date.

## Sources and scope

HN Search by Algolia discovers IDs in a 200-hit title query. Every accepted post is fetched from the official Hacker News API and must be a live `story` matching `Launch HN: Company (YC BATCH) – subtitle`. No affiliation is inferred from Show HN. Batch evidence is the official HN announcement title, not an independent audit of current corporate status. No YC directory scraper or third-party directory mirror is used.

Coverage is bounded to 80 discovered launches, not all YC companies or every launch in a selected year. Sectors use product-title keywords and are explicitly labeled as topic matches, not official YC categories. Empty filters never backfill unrelated companies. Titles are source excerpts; no generated investment judgments or founder contact information.

Source references:
- https://github.com/HackerNews/API
- https://hn.algolia.com/api
- https://news.ycombinator.com/item?id=27877280 (HN moderator explanation of Launch HN)
- https://www.ycombinator.com/legal (directory extraction restrictions; no directory extraction used)

## Operation

`npm test` runs behavior and failure checks. `npm run dev` serves localhost:4318. Node 22 production, no runtime dependencies. Vercel functions host `/api/scout`; buildless public assets use `public/`. Deploy from this directory to `manny4c-personal`, never from the repository root. The canonical production domain is registered to project `yc-scout`.

One shared in-process source cache refreshes hourly and coalesces concurrent requests. Up to ten official requests run concurrently with six-second timeouts and an 18-second scheduling deadline. Failed records set `partial`; a full refresh failure can reuse an in-process successful pool for 24 hours with `stale: true` and the original checked time. Cold instances without a cache return 503, never a fabricated feed. TRMNL keeps the last successful screen on polling failure; its Timeline exposes failures. CDN responses cache for 15 minutes. Daily discovery can therefore change slightly after midnight UTC, at the next cache refresh and device check-in.

Filters are allowlisted/length-limited. No user-provided URL is fetched. The website uses text nodes; Liquid source values are escaped. Response size is bounded for TRMNL's 5 kB polling budget. Refresh floor is hourly. Plugin fields are nonsecret preferences; standard host request logs may contain them. No analytics SDK, user database or cookies are used.

## Recipe

`trmnl/` contains four layouts, shared CSS, form configuration and setup instructions. `public/plugin.zip` contains the same files for pending-review manual setup. The website reads `public/release.json`; only add a real verified public Recipe URL after human approval. Until then the public install button states the actual pending status.

Support: https://github.com/Manny4C/trmnl-community/issues

Preserve existing plugins and playlist entries. Creating this separate private plugin automatically adds it to Manuel's playlist. Device receipt must be verified separately from rendering and installation.
