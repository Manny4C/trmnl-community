Current owner status, October 28, 2026: existing master 522310 is submitted for public human review. Canonical Shared/four layouts are saved/reloaded against source, original icon and marketplace assets are saved, and native OG/X checks passed. Manuel explicitly accepted the Community Plugin License for this submission. Reloaded settings show Plugin in review. Public approval, installation URL and physical receipt remain unconfirmed. Continue this existing master; never create a duplicate.

# Game Night Radar — prepared separate Recipe

October 21, 2026: website, public data service and this package prepared. No Game Night Radar Recipe has been created, installed, submitted or approved. Browser-dependent native visual QA, marketplace images and owner installation remain deferred under Manuel's no-screen-control preference. Do not claim physical receipt. Never duplicate the other five existing Recipe masters.

Manual copy: create a Polling private plugin named Game Night Radar, framework 3.4.3 or later, GET, no headers/body and no personal API key. Copy form-fields.yml to custom fields, shared.liquid to Shared, and the four matching layout files. Set 60-minute refresh (or slower); the server reuses per-game source snapshots for 30 minutes in warm instances and successful responses may be cached for 10 minutes.

Polling URL:

```
https://game-night-radar.vercel.app/api/radar?apps={{ apps | url_encode }}&days={{ days }}&count={{ result_count }}&kind={{ kind }}&format=trmnl
```

Add transform.js as the Serverless function. It reads compact row tuples, adds game names/NEW labels and returns bounded trmnl_state (last 60 IDs, under 8192 bytes). NEW means not in this installation's recent successful-refresh history. First edition is not NEW. A different settings key resets history, cached data does not advance it, and an all-source outage returns 503. The platform can keep its last screen on polling failures; do not claim it is a fresh source check. Browser history is separate and not synchronized. All layouts supply the configured edition to native items/automatic overflow, using responsive columns and a hidden-item counter. Smaller screens show as many complete rows as fit; X and portrait can use their extra space.

Use the original icon.svg. Color uses native red/yellow with explicit 1bit/2bit/4bit black/white fallbacks; meaning also appears in text and borders. No touch, animation or live game code runs on TRMNL. Website preview is approximate.

Source: documented public Steam ISteamNews/GetNewsForApp/v2, no API key, feed steam_community_announcements ONLY. Up to 24 posts per game, 1–6 IDs, 7/30/90 days, newest first. Titles/date/URL are source data; Update/Event/News labels are transparent title-word rules. An Event post is NOT a verified event time or current live event. Not an exhaustive news archive; a quiet game may have no eligible posts. Unknown IDs keep their numeric name; no store scraping, account library, friends access or model service.

Sources: https://partner.steamgames.com/doc/webapi/ISteamNews and https://steamcommunity.com/dev/apiterms . Display Steam attribution/source links and the data as-is notice from the website in the public Recipe description/learn-more path. No private user Steam data is stored. Standard hosting logs may include public game/filter URLs; browser history/preferences stay local.

Before actual publication: create ONE separate master, record its ID immediately, install without removing other playlist entries, verify all four native OG color/B&W layouts plus X landscape/portrait (including long titles/unknown IDs/empty/partial/cached states), save icon and generate marketplace previews. Complete public submission under the applicable Community Plugin License confirmation. Distinguish private draft, submitted, approved and physical receipt. Set public/release.json submitted only after submission succeeds; put the verified public install URL there only after approval.

Website: https://game-night-radar.vercel.app
Source/support: https://github.com/Manny4C/trmnl-community/tree/main/apps/game-night-radar

October 28 automated review resolution: Larger full/half-vertical X titles and labels, installer-local timestamps, native fitting supplied with all selected posts.

October 28 targeted follow-up: Follow-up: full X portrait titles step up for readability; selected result/window limits remain explicit rather than padding with invented posts.
