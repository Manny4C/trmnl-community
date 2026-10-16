# TRMNL Community

A personal project by Manuel: seven useful TRMNL apps, built one per weekday. Each app has its own Vercel website, plugin data service, and separate TRMNL Recipe submitted under that app's name. Each Recipe includes all four layouts, configuration, icon and marketplace preview; each website displays its real review status and links to installation after approval.

GitHub owner: **Manny4C**. Vercel team: **Manuel's Personal Projects (`manny4c-personal`)**. Never deploy this project to Paper Star.

The launch automation returns to the original Codex chat at **10 a.m. Pacific on weekdays**. The computer and desktop app must be running for local scheduled work. `launch-plan.json` records current scope, dates, access, verified release URLs and publication status. Delays shift the remaining build dates. Public TRMNL review is independent of Vercel deployment.

| Day | Target | App |
| --- | --- | --- |
| 1 | Tue, October 13, 2026 | The Daily TRMNL — a customized news briefing with memory |
| 2 | Wed, October 14 | YC Scout — source-checked Launch HN announcements |
| 3 | Thu, October 15 | Sounds Like My Company — similar recently launched companies |
| 4 | Fri, October 16 | Desk Editor — a dynamic off-device editor |
| 5 | Mon, October 19 | TRMNL Plays: Tiny Planet — one shared cooperative world |
| 6 | Tue, October 20 | Game Night Radar — updates for followed Steam games |
| 7 | Wed, October 21 | Local Morning Brief — local news, weather and transit |

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

Seventeen automated checks passed, including matching quality, source/recency filters, stale and cold outages, deduplication and the 5 kB payload limit. Automated preflight feedback was addressed before submission with native framework typography, a shared title bar, responsive sizing and native clamping. Four OG layouts, TRMNL X landscape/portrait and a 390-pixel-wide website were reviewed. The separate Recipe has an icon and marketplace previews. Manuel approved the Community Plugin License on October 15 and the final public submission succeeded. Reloaded settings verify **Plugin in review**; human approval and the public installation URL remain pending. Physical receipt remains unconfirmed. The owner installation still uses the labeled developer-infrastructure demo. Manuel supplied an Echo profile; applying it is deferred under his instruction not to control the screen.

## Desk Editor

- [Production website](https://desk-editor-trmnl.vercel.app)
- [Prepared Recipe package](https://desk-editor-trmnl.vercel.app/plugin.zip)
- [App documentation](apps/desk-editor/README.md)

Day 4 was built early on October 16. The free, rules-based agent selects a lead and up to two supporting cards based on local time, chosen editorial mode and dated public sources. It includes real HN posts, a chosen GitHub release, optional weather for six US cities and clearly labeled original routines. Every choice has an explanation. Website includes a live preview, four approximate layouts, source notebook and a time-of-day demo. No language model or private account access is used.

Twenty-one automated checks passed and the personal Vercel production service and ZIP are verified. All four Liquid templates were rendered in automated checks; actual browser/device layout verification remains pending. The **separate Recipe is prepared but has not been created, installed or submitted** because Manuel asked us to stop controlling his screen. Four layouts, shared markup, configuration, icon and setup notes are ready; marketplace image generation, owner installation and submission require later browser access. No approval or public install URL is claimed. This app consumes Friday's build slot; Tiny Planet remains Monday's next new app.

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
