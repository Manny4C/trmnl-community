# TRMNL Community

A personal project by Manuel: seven useful TRMNL apps, built one per weekday. The release checklist for each app includes a Vercel website, plugin data service, separate TRMNL Recipe, all four layouts, configuration, icon and marketplace preview. Each website displays its actual release status and adds a public installation link after approval. Draft and deferred work are recorded in launch-plan.json.

GitHub owner: **Manny4C**. Vercel team: **Manuel's Personal Projects (`manny4c-personal`)**. Never deploy this project to Paper Star.

The launch automation returns to the original Codex chat at **10 a.m. Pacific on weekdays**. The computer and desktop app must be running for local scheduled work. `launch-plan.json` records current scope, dates, access, verified release URLs and publication status. Delays shift the remaining build dates. Public TRMNL review is independent of Vercel deployment.

| Day | Target | App |
| --- | --- | --- |
| 1 | Tue, October 13, 2026 | The Daily TRMNL — a customized news briefing with memory |
| 2 | Wed, October 14 | YC Scout — source-checked Launch HN announcements |
| 3 | Thu, October 15 | Sounds Like My Company — similar recently launched companies |
| 4 | Fri, October 16 | Newsflash — an image-first AI news editor |
| 5 | Mon, October 19 | TRMNL Plays: Tiny Planet — one shared cooperative world |
| 6 | Wed, October 21 | Game Night Radar — updates for followed Steam games |
| 7 | Thu, October 22 | Local Morning Brief — local news, weather and transit |

## The Daily TRMNL

- [Production website](https://the-daily-trmnl.vercel.app)
- [Live data](https://the-daily-trmnl.vercel.app/api/briefing?prompt=Find+recent+news+about+AI+and+technology.)
- [Support](https://github.com/Manny4C/trmnl-community/issues)
- Owner's private TRMNL instance: `505118`, installed on Manuel's TRMNL.

The Daily TRMNL Recipe (master ID `505118`) was submitted for public TRMNL review on October 13, 2026. Its [owner review status](https://trmnl.com/plugin_settings/505118/edit) is **Plugin in review**; its public install URL is pending approval. Human approval is pending. Manuel approved the [Community Plugin License](https://trmnl.com/plugin-license) for this Recipe; its design, parsing logic and markup are reusable under CC BY 4.0. Source articles retain their publishers' rights.

Public listing status is tracked separately in `launch-plan.json` and the app's `public/release.json`. Do not label a pending Recipe as publicly approved.

## YC Scout

- [Production website](https://yc-launch-scout.vercel.app)
- [Live launch data](https://yc-launch-scout.vercel.app/api/scout)
- [Owner Recipe settings](https://trmnl.com/plugin_settings/506494/edit), master `506494`, added to Manuel's playlist.

Eight title-matched sectors, optional YC batch and product/company search, launch window, latest launches or daily discovery. Every displayed post is checked through the official Hacker News API. Batch evidence comes from its Launch HN title; the bounded feed does not represent the complete YC directory. Show HN is excluded. No YC directory extraction or unlicensed directory mirror is used. Source links, coverage and timestamps remain visible.

Thirteen automated checks passed, alongside live filtering/empty-state checks, mobile review, four OG layouts and full TRMNL X landscape/portrait renders. The October 14 density update shows up to ten recent launches in the full-screen edition. The separate Recipe has saved configuration, icon and marketplace previews. Manuel approved the Community Plugin License and the separate public Recipe was submitted on October 14, 2026. Reloaded settings verify **Plugin in review**; public approval and the installation URL remain pending. Physical receipt remains unconfirmed.

See [app documentation](apps/yc-scout/README.md) for source scope, cache/outage behavior and developer setup. Production Vercel project `yc-scout` belongs to `manny4c-personal`; deploy from `apps/yc-scout` only.

## Sounds Like My Company

- [Production website](https://sounds-like-my-company.vercel.app)
- [Owner Recipe settings](https://trmnl.com/plugin_settings/507810/edit), master `507810`, installed in Manuel's playlist.
- [App documentation](apps/sounds-like-my-company/README.md)

Public product/customer description radar across Launch HN and Show HN, with source-based matching explanations, keyword exclusions and 3/6/8-result editions. An audience match alone cannot qualify an unrelated product. Each title and date is checked through the official HN API. Coverage is a bounded sample of two HN feeds, not every recently launched company or a verified competitor list.

Seventeen automated checks passed, including matching quality, source/recency filters, stale and cold outages, deduplication and the 5 kB payload limit. Automated preflight feedback was addressed before submission with native framework typography, a shared title bar, responsive sizing and native clamping. Four OG layouts, TRMNL X landscape/portrait and a 390-pixel-wide website were reviewed. The separate Recipe has an icon and marketplace previews. Manuel approved the Community Plugin License on October 15 and the final public submission succeeded. Reloaded settings verify **Plugin in review**; human approval and the public installation URL remain pending. Physical receipt remains unconfirmed. The owner installation is configured for Echo’s Mac AI notetaker and managed agents platform, using the user-provided public descriptions, six results and focused meeting/agent/workflow keywords. Settings were saved and a fresh render requested on October 16.

## Newsflash

- [Production website](https://newsflash-trmnl.vercel.app)
- [Prepared Recipe package](https://newsflash-trmnl.vercel.app/plugin.zip)
- [App documentation](apps/desk-editor/README.md)

Day 4 was rebuilt on October 16 at Manuel’s request, replacing Desk Editor completely. An image-first news editor selects one current visual story for the user’s chosen interests, with original headline, source image/video preview, attribution, dates and a selection reason. Eight interests cover technology, AI, video games, baseball, basketball, Tesla/electric cars, video drops and space/science. The actual source pool is a bounded set of official channels and feeds; it does not cover all world news. A source video thumbnail is not claimed to be the decisive frame. No routines, forecasts or software-release dashboard remains.

Thirty automated checks pass, including safe image-first Liquid rendering, image/source allowlists, interest filters, stale/outage states, output validation, the 5 kB data budget and the $15 monthly AI budget gate. Sources and real thumbnail URLs are verified in production. The shared hourly cloud AI workflow and durable reservation ledger are prepared; the first cloud AI run succeeded with 29 decisions and the public feed serves the verified AI edition. The $15 application gate reserved $0.005585 for that run. Browsing/device polls never trigger model calls, and pending or expired AI choices use a labeled freshness fallback. Hosting/source remain personal. Legacy Desk Editor URLs serve the replacement.

The **separate Newsflash Recipe 512643 is created and added to the owner playlist**, with configuration, Shared and four layouts saved on October 19 during the five-minute authorized setup window. It remains a private draft, not publicly submitted or approved. Native data Test request succeeded, but actual image/layout visual QA, icon upload, marketplace images and public submission remain pending. Physical receipt is unconfirmed. This remains Day 4.

## Personalized news

The Daily TRMNL replaces the original four-topic selector with ten Include / Exclude / Leave out interests: AI and technology, startups, Y Combinator, markets and stocks, video games, world affairs, science and space, climate and energy, business and economy, and local news. Users add their own interests, companies, places, or exclusions. The website composes a readable prompt, generates a live feed, and copies that prompt into the Recipe's **Your news prompt** field. Local include/exclude choices require a place.

Prompts are matched as topics, keywords, names and phrases. This is a free source-matching service; it does not promise to interpret arbitrary writing instructions. Named companies remain specific; Show HN alone is not treated as YC affiliation. No matching articles yields an explicit empty state, never unrelated filler. Histories are separate per prompt and browser storage retains at most eight feed profiles.

The public API supports `/api/briefing?prompt=...` (600-character limit). The headline-count setting accepts 1–20, defaults to 8, and uses two columns for 9–20. Smaller full-screen editions show larger titles and more source excerpt text. Use `&count=8&format=trmnl` for the compact device response; the website uses rich responses with source links. Compact tuple rows and bounded saved history preserve the 5 kB polling and 8192-byte Saved State budgets. The four legacy `?topic=` endpoints remain supported for existing manual installations. The old site address remains a compatibility alias. The new address is registered as a **production project domain**, so normal production deployments update it automatically and public users/devices can fetch without Vercel authentication. Keep deployment protection enabled for preview URLs.

Source discovery combines a cached allowlist of public source feeds with the [GDELT DOC API](https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/). GDELT [permits commercial use with attribution](https://www.gdeltproject.org/about.html#termsofuse); the website and Recipe credit it. Search was rate-limited during live verification; source-feed fallback continues matching the actual prompt and displays a partial-source notice. Narrow or local prompts may have no matches when global search is unavailable. Headlines and excerpts retain source attribution; GDELT discovery dates are labeled Indexed.

## Creator Fund follow-up

The [September 2026 fund report](https://trmnl.com/blog/creator-fund-09-2026), verified October 13, reports a minimum of **50 connections (installs + forks)** for monthly payout qualification. Earnings depend on age on active playlists, playlist presence and actual device impressions relative to other community plugins; publication alone does not establish earnings. After review approval, add the verified install link to the website, track connections and uninstall reasons in TRMNL Analytics, and prioritize fixes that keep the app useful in daily playlists. Verify the current threshold and payout requirements before claiming eligibility.

## Development

From `apps/what-changed`, install dependencies with `npm install`, run `npm test`, then `npm run dev`. The local service runs at `http://127.0.0.1:4317`. Vercel production deployment uses `vercel deploy --prod --scope manny4c-personal` from the app directory.

The data service uses a fixed allowlist of public RSS sources. It removes markup and tracking parameters, filters unsafe URLs, suppresses obvious duplicates, limits payloads, and reports partial outages. Successful data is cached; stale fallbacks preserve their real timestamp. It does not accept arbitrary feed URLs or store account credentials.

The website remembers its displayed briefing separately for each prompt in browser-local storage and keeps a dated last-successful copy for outages, expiring after 24 hours. It refreshes automatically while visible and cancels superseded topic requests. The TRMNL Serverless function maintains a separate bounded Saved State for each installation, detects changed story fingerprints, and preserves prior stories through outages. Smaller layouts show a subset of the full edition. The plugin cannot know whether a person actually looked at a screen.

All four Liquid layouts, shared styles and the Serverless memory function live in `apps/what-changed/trmnl/`. Rebuild `public/plugin.zip` after changing these files. Test in a separate private clone after the Recipe is published, because edits to a Recipe master reach installed copies automatically.

## Tiny Planet requirements

Everyone views the same original world on the public website and their TRMNL. Only server-verified TRMNL owners can make moves. Use a stable verified user identity; a cookie, shared URL or client-supplied device ID is insufficient. Enforce one move per user per UTC calendar day in durable database transactions. Unlimited users may act each day. Log every applied move and update the world atomically.

A labeled owner autopilot must make at least one move every calendar day, including weekends, even with no community participation. Implement an idempotent production scheduler plus recovery checks; do not depend on the weekday Codex automation. Public participation authentication and storage must be complete before launch.

## Release practice

Finish the first useful version, run meaningful tests, verify the responsive website and TRMNL layouts, deploy on the personal Vercel team, install on the owner's device, and submit for TRMNL review. Ask for edits after delivery. Preserve existing device content. Never publish secrets or claim physical screen verification based only on an editor preview.

## Color and black & white

All current and future apps must follow [DISPLAY-DESIGN.md](DISPLAY-DESIGN.md): native red/yellow accents, readable monochrome fallbacks, labeled states and pure black/white QR codes. All websites include a palette preview. After installing the Sounds Like My Company development dependencies, run `node --test test/color.test.mjs` from the repository root to verify cross-app palette behavior alongside each app’s own tests.

## TRMNL Plays: Tiny Planet

[Shared island and website](https://tiny-planet-trmnl.vercel.app) · [Source and activation notes](apps/tiny-planet/README.md). One shared original island, server-verified TRMNL ownership, one account move per UTC day, atomic PostgreSQL state and a separately labeled daily owner autopilot. The free Neon database is initialized and the shared-world service is online. TRMNL OAuth app262 is registered; real owner sign-in still needs verification. Private Recipe512639 is created/added to the owner playlist with all four layouts saved, pending native visual checks, marketplace assets and public submission. The seven-day autopilot is enabled: its first protected production move and same-day replay are verified; scheduled execution is verified, with exactly one daily autopilot move on October 19, 20 and 21. Actual execution evidence is recorded in launch-plan.json.

## Game Night Radar

[Production website](https://game-night-radar.vercel.app) · [App documentation](apps/game-night-radar/README.md) · [Prepared Recipe package](https://game-night-radar.vercel.app/plugin.zip). Follow one to six public Steam App IDs or store URLs; default Deep Rock Galactic, Valheim and Terraria. Shows up to eight recent developer announcements, title-based patch/event filters, source links, browser-local history and separate per-Recipe Saved State. No Steam account, private library access, model or secret is needed. Every website preview has color/B&W and four size choices.

Seventeen automated checks pass; anonymous production verifies eight posts in a 981-byte device payload, update filtering, honest empty results and invalid-input rejection. Full transform including memory stays below 4800 bytes even with multibyte titles and maximum history. Separate Recipe configuration/Shared/four layouts/transform/icon/setup are prepared. Native visual OG/X checks, Recipe creation, owner installation, marketplace assets and public submission remain deferred under the no-screen-control instruction; no Recipe ID or physical receipt is claimed. October 21 consumes one new-app slot; Local Morning Brief moves to October 22.

## TRMNL Draws — additional requested game

[Website](https://trmnl-draws.vercel.app) · [Source](apps/trmnl-draws/README.md). Explicitly requested October21 after Game Night Radar, outside the scheduled seven-app series. One shared100×60 pixel canvas with an original black cat,16colors, smart monochrome and ten pixel placements per verified account/dayUTC. A four-character daily QR doorway is followed by real account/device verification; reconnecting/sharing links cannot multiply allowance. Full-screen art/protected QR corner, conflict-aware atomic batches, replay safety and versioned images. No paid model/new paid service. The existing Tiny Planet integration adds a narrow fixed-origin one-use server-to-server PKCE exchange; keys stay separate and original gameplay/playlists are intact.23new checks plus32existing checks pass. See launch-plan.json for actual deployment/Recipe status; native visual/publication/device steps remain deferred. Local Morning Brief remains October22.

## Future ideas

- **Sun & Moon** — Accurate sun/moon positions, sunrise/sunset and moonrise/moonset, moon phase, weather and local time. A slowly moving sky on the companion website; investigate device-supported motion, with refresh-based snapshots as the standard TRMNL fallback. Color and B&W. Requested October 22; backlog only, no build date assigned.

## One More Room — additional requested dungeon game

[Play the adventure](https://one-more-room-trmnl.vercel.app) · [TRMNL package](https://one-more-room-trmnl.vercel.app/plugin.zip) · [Source and setup](apps/one-more-room/README.md). Requested October 24 outside the seven-app series. Four persistent original heroes explore connected procedural dungeon floors, resolve visible dice checks, recover fragments of the stolen sun and continue after defeat. Full screen places the illustrated atlas, quest/recent journey and party on the left, with generated scene art and choices on the right; all four color/B&W layouts are prepared. Every fresh plugin update advances one automatic action, with duplicate/older frame protection and no missed-turn catch-up. Browser campaigns have local saving, autopilot/pause, manual choices, seeds, battle instincts and a journal. Generation uses deterministic rules and authored story fragments; no model calls, paid service or database.

The companion site is live on personal Vercel, with anonymous page/API/ZIP verification and deployed game/style/package hashes matching local source. Seventeen app checks and eight cross-app palette checks pass; background browser QA verifies controls/mobile/saving, eight dimension/palette snapshots and 52 room/layout combinations without clipping. A separate Recipe is **prepared only**, not created, installed, submitted or approved. Existing background-only/screen-control limits and all playlist contents are preserved. Native TRMNL rendering and physical receipt remain unverified. Exact status and pending follow-through are in `launch-plan.json`.

October 25 visual update: nine original ImageGen assets (world/dungeon atlas backgrounds and seven encounter scenes), a live journey trail and automatic world/dungeon camera are deployed. The map pulls back at milestones and frames the current dungeon during exploration, with a closer view for encounters. World overview covers the current six-dungeon chapter; cumulative embers track overall progress. Browser camera pins do not advance play. Quest progress, concise recent events and party health share the left overview. Live production preserves an original v1 campaign exactly; artwork/prompt originals are retained in the app. Recipe and physical-device status remain unchanged.

## Framework review revisions, October 27

TRMNL reviewer Mario requested native items/automatic overflow and responsive OG/X layouts in YC Scout ticket 145500957. The revision now covers the entire nine-app community collection: Daily, YC Scout and Sounds use native typography/items/columns/overflow/title bars; every layout supplies its available edition to the fitting engine instead of discarding data at fixed small-screen limits. Daily preserves the selected 1–20 cap and longer excerpts for small editions. Game Night Radar and Local Morning Brief also use automatic item fitting. Tiny Planet uses native responsive arrangement around its original board. Newsflash fixes portrait layout direction. One More Room uses native prose/layout and retains only original atlas/image geometry; TRMNL Draws intentionally preserves its full-bleed image/QR layout and corrects its outdated 800×480/photo description.

All 235 automated checks pass. The nine downloadable packages and release metadata are deployed on personal Vercel and independently hash-verified against source. This verifies publication of source packages, not native layout fit, approval or physical receipt. Existing Daily/YC/Sounds review status and Newsflash/Tiny draft status remain separate from these package updates. Native saving started on YC 506494, then stopped when the previous screen-control restriction was discovered; a complete source-to-dashboard comparison is necessary, especially because another chat was editing its local templates at the same time. All other revised markup remains prepared for native saving. No new reviewer email was sent.

Continue from `launch-plan.json`, preserving the five existing masters and playlist entries. Native OG color/B&W and X landscape/portrait/four-layout checks, refreshed marketplace previews, missing-master creation and final draft submissions remain pending renewed browser permission. New binding license acceptance remains a separate final action. Rebuild canonical ZIPs with `python3 scripts/package-recipes.py`; `apps/one-more-room/trmnl/shared.liquid` is now canonical and its package script no longer replaces native markup with browser CSS.

## Native Recipe setup completed, October 28

All nine community Recipe masters are now created, added to the owner playlist, and saved with canonical Shared/four layouts compared after reload. Default owner data was checked in144native cases: OG color/B&W plus X landscape/portrait across four views per app, with no clipped content. This is native preview verification; physical receipt remains unconfirmed.

| Recipe | Master | Current publication phase |
| --- | --- | --- |
| The Daily TRMNL |505118| Framework revisions saved; re-review reply sent October 28 |
| YC Scout |506494| Framework revisions saved; re-review reply sent October 28 |
| Sounds Like My Company |507810| Native revision/code/QR saved; awaiting human review |
| Newsflash |512643| Private draft; review findings fixed and native-verified |
| Tiny Planet |512639| Private draft; review findings fixed and native-verified |
| Game Night Radar |522310| Private draft; review fixes saved; follow-up trmy checking |
| Local Morning Brief |522315| Private draft; review fixes saved; follow-up trmy checking |
| TRMNL Draws |522317| Private draft; review fixes saved; follow-up trmy checking |
| One More Room |522318| Private draft; review fixes saved; follow-up trmy checking |

Native checks found and fixed the compact Sounds QR taking over the results area, Newsflash image letterboxing, narrow portrait column selection, compact Local weather sizing, the unsupported Local weather category, and numeric normalization of Game Night Radar defaults. The game default now uses Steam store URLs. One More Room's native content uses bounded overflow and prioritizes its automatic action. Author/support metadata is saved on Tiny Planet. Marketplace previews were regenerated.

The six drafts still need their prepared original icons uploaded, final Community Plugin License acceptance, and public human submission. Manuel authorized the extension file-URL setting, but tool policy blocked opening Chrome's internal extensions page; the actual switch still needs manual action. No new reviewer email, public approval, physical receipt or real human game action is claimed. Existing state, services, credentials and playlist entries are preserved. Authoritative status and queued review URLs are in launch-plan.json.

October 28 review follow-through: all six automated reports and their screenshots were read. Their layout/density/local-time findings are fixed and saved in the existing masters. Tiny Planet and Newsflash passed native verification after their fixes; four targeted follow-up checks are queued for the other drafts. Manuel chose proportional 5:3 drawing with margins rather than stretching; native dithering now handles the source at the final screen size. Re-review replies for Daily and YC Scout were explicitly approved, sent to Mario, and verified in HEY. Six draft icons and final license/publication steps remain pending; no approval or physical receipt is claimed.

October 28 upload/follow-up completion: all six original draft icons are saved and reload-verified. All four follow-up reports are read and remaining issues addressed. The six drafts are ready for final Community Plugin License confirmation and public human submission; none is claimed approved.
