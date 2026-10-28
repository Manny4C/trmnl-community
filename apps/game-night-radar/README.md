# Game Night Radar

Latest Recipe status — October 28, 2026: master **522310** is submitted for public human review. Icons and OG/X marketplace assets are saved, native views checked, and Community Plugin License acceptance explicitly approved by Manuel. Reloaded native settings show **Plugin in review**. Approval, public installation URL and physical receipt remain unconfirmed.




A personal Vercel app for public Steam developer announcements. Default games: Deep Rock Galactic, Valheim and Terraria; any 1–6 numeric Steam App IDs or store URLs work. Unknown IDs keep their numeric name rather than guessing a title. No Steam sign-in, AI model, private library access or new paid service.

## Product

The website provides a live source-linked radar, browser-local preferences/recent history, shareable public filter URL, matching polling URL, Color/B&W preview and all four screen sizes. Developer titles are preserved with a bounded length. New means unseen in the last 60 IDs for that configuration, not unread by a person. Each TRMNL installation has separate Serverless Saved State; browser histories retain up to four profiles. Empty results, partial sources, warm-cache outages and cold outages are distinct. User-requested browser/native control is currently disallowed, so native visual verification is deferred. Package preparation is not Recipe creation/submission/physical delivery.

## Source contract

Only the documented [Steam ISteamNews/GetNewsForApp/v2](https://partner.steamgames.com/doc/webapi/ISteamNews), feed `steam_community_announcements`, count24, maxlength1. Fixed HTTPS API origin, numeric uint32 IDs, max6 parallel requests, 9-second source timeout, 256 kB response limit, strict app/feed/date/URL validation. No account key, arbitrary fetch target, store scraping or third-party gaming news feeds. Up to24 most recent developer posts/game; no claim of complete90day coverage or verified future event dates. Source labels are original game/Steam plus deterministic title-word Update/Event/News classification. Use the upstream source URL, not an invented article URL.

Warm per-game cache TTL30minutes, deduplicated concurrent requests, max128 entries; dated fallback at most6hours. Process cache may disappear on serverless restarts; it is not durable history. All-source cold failure503/no-store. Partial/cached data60second CDN TTL, ordinary data10minutes, no unlabeled stale-while-revalidate. Selected window always applies even to fallback. Viewer/device polls do not call models. Steam's terms allow100,000 Web API calls/day; use conservative caching and reconsider durable shared caching before broad scale. No account data is requested. Website includes attribution, terms, privacy and as-is notices. Official [Steam API terms](https://steamcommunity.com/dev/apiterms).

## Run and verify

```
npm ci
npm test
npm run dev
```

Local preview: http://127.0.0.1:4326 . Background work verifies HTTP/DOM/Liquid; native OG/X and visual browser QA remain explicitly deferred. Run with Node22 (production); the developer machine may report a newer Node engine warning.

TRMNL setup: trmnl/SETUP.md. Rebuild public/plugin.zip from the contents of trmnl/ after changes. Compact response <=4600UTF-8 bytes; full transform return including Saved State <=4800bytes (also below the8192byte state ceiling). Maximum full8posts; smaller views4/5/2. Prepared separate Recipe includes configuration, transform, Shared/four layouts, icon/setup; never create a duplicate of another app's master.

Hosting/source ownership: GitHub Manny4C/trmnl-community, Vercel manny4c-personal only. No environment secret is needed for this app. Read launch-plan.json for actual deployment/Recipe/review state. Public installation URL remains null until approved.
