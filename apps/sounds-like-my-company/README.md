Published status — October 30, 2026: [Sounds Like My Company](https://trmnl.com/recipes/sounds-like-my-company-507810) is published on TRMNL. The exact public link is listed in the official Recipe directory and Mario’s existing review thread reports Published. Physical receipt remains separately unconfirmed.

# Sounds Like My Company

Latest Recipe status — October 28, 2026: master **507810** is saved and native-checked, still awaiting human review. Physical receipt is unconfirmed. Current details are in `../../launch-plan.json`; earlier dated setup/review notes below are historical.


A configurable, sourced product launch radar for TRMNL and a responsive public website. Describe a public product and customer group, optionally require or exclude words, choose Launch HN / Show HN and a 30/90/365-day window, then show 3/6/8 related announcements with evidence.

Production: https://sounds-like-my-company.vercel.app
Support: https://github.com/Manny4C/trmnl-community/issues

Run `npm test` and `npm run dev` (port 4319). No dependencies or secrets. Deploy this directory to Manuel's personal Vercel scope `manny4c-personal`, never Paper Star.

## Data and matching

HN Search (https://hn.algolia.com/api) discovers IDs from recent Launch HN, Show HN and up to two profile/keyword-word searches. Every displayed title, prefix, batch and date is checked through the official HN API (https://github.com/HackerNews/API). Up to 100 IDs per pool, ten concurrent verifications, source fetch timeout 5 seconds and verification scheduling deadline 16 seconds; Vercel duration 30 seconds. Partial sources are labeled.

No YC directory, Product Hunt or DEV scraping. Product Hunt commercial API needs permission, and DEV's published terms restrict commercial/public reuse. Both were researched and excluded. Two feeds here mean Launch HN and Show HN within one community, not broad coverage of all launch platforms. Show HN is never evidence of YC membership or corporate status. An announcement date isn't a founding date or first-ever release.

Relevance uses source title words, customer words and explicit related-word groups. No paid model, semantic embedding, similarity percentage or direct-competitor claim. Generic AI alone cannot match. Audience wording only boosts an otherwise qualified product or explicit keyword match; it cannot supply a match alone. One must-have keyword must appear; any excluded word removes a title. Without a direct word match, two related-topic groups must corroborate a result. Source text remains attributed and links to its original discussion. We do not crawl company URLs or infer undisclosed customer segments.

Pools are keyed by source plus the two discovery terms, cached hourly, coalesced across concurrent requests, bounded to 32 entries and eight in-flight pools. Filters and ranking apply independently per request. A failed refresh may use same-pool data up to 24 hours old with the original checked timestamp. Cold failures return 503. Each pool is a bounded sample; window selection doesn't promise full coverage.

## Device constraints

`/api/matches?...&format=trmnl` omits browser-only evidence and source URLs, and trims by UTF-8 byte budget. Eight multibyte rows remain below 4800 bytes. Rich website responses keep complete titles, evidence and links. No Saved State or on-device JavaScript. Four static-image Liquid layouts target OG 800×480, X 1040×780 and portrait. Device update cadence is hourly or slower.

Profile settings are public descriptions in request URLs; up to two words go to HN Search. No account here, tracking scripts, persisted browser profiles or secret environment variables. Hosting retains its standard logs. Never submit private company plans. Website form edits don't update the device automatically; copy the Recipe settings to TRMNL.

## Publication

Separate Recipe under this app's name; update `public/release.json` truthfully after submission/approval. Never invent a public installation URL while review is pending. Public ZIP contains configuration, four layouts, shared styles and setup. Deployment, owner playlist installation, review and physical display are separate states.

## October 15 automated preflight feedback

The first AI Chef review (1195) was automated feedback, not human marketplace approval. Before final public submission, the layouts were migrated to native framework typography, `lg:`/`portrait:` variants, flex and border utilities, and a shared `title_bar` template placed beside the layout. Seven small CSS selectors remain for equal rows and bounded text clipping; hardcoded font sizes, colors and font-family declarations were removed from the device styles.

Full-screen font size now follows the requested result count explicitly: 3 uses `text--xlarge` (26 px OG, 38 px X), 6 uses `text--large` (21 px OG, 38 px X), and 8 uses `text--base` (16 px OG, 26 px X). The response exposes `result_count` and the Liquid loop uses it as the limit. Native title-bar and label typography replace the old 10/11 px footer and metadata. All four layouts retain their bounded counts and source labels.

The author text and owner profile were checked: the profile is a generic, labeled developer-infrastructure demo, with no confidential company information. The public form description now explicitly says that request URLs may appear in standard hosting logs. A TRMNL Test request returned HTTP 200 with the expected six-row public demo. Privacy notices describe the actual data flow; no claim is made that an arbitrary user-entered profile is private.

A second automated review (1197) led to native `data-clamp` attributes in place of handwritten clamping, a one-line title for the six/eight-result editions, and larger X fonts. The bot also called `text--bold` and `border--h-black` undocumented; both are explicitly present in the current official framework docs, so those classes remain. Automated hints are reviewed against actual docs and renders, not treated as a human approval or a definitive validator.

Final automated review 1198 described the six-row OG/X editions as clean and had no critical findings. Its company_name concern was checked against the polling URL and backend: the field maps to `name`, which the API returns and the header renders. Manuel approved the Community Plugin License on October 15; final public submission succeeded, and reloading Recipe 507810 confirms **Plugin in review**. This is pending human approval, not a public catalog release.

## October 16 visual redesign

The shared launch-radar design replaces plain rows with numbered cards, a company masthead, source/date badges, concise overlap notes and a clean title bar. Six/eight-result full editions use two columns; three uses one column. Red/yellow framework colors have explicit high-contrast 1-bit fallbacks. Half screens and quadrant use the same components. Cached/partial labels remain visible in each layout. The website now has a color/B&W preview switch and matches the card layout.

All 17 data tests pass. Twenty-four Liquid render cases cover four layouts, 3/6/8 results, empty states and escaping. Actual OG color/B&W, smaller layouts and X landscape/portrait were reviewed; titles and overlap notes fit. Phone width390 showed no horizontal overflow. Production HTML, JavaScript, CSS and ZIP match the checked local files. Owner playlist item866518 uses TRMNL fonts; other device content and global font setting are preserved. Native render succeeded; physical delivery awaits rotation.


## Personalized clickable links

Every successful device poll now automatically creates a stable profile code and links page. The full prepared layout includes a native-size 82px black/white QR with four-module quiet zone; all four layouts show a four-character code. Open https://sounds-like-my-company.vercel.app and enter that code, or scan/bookmark `/r/CODE`. The page loads the saved filters and current source links. It can be newer than a device's previous refresh and states that explicitly. Web visitors can create a page after previewing a profile too. No account, device API key or AI call is needed.

Profiles are immutable and canonicalized. New user-facing codes are four uppercase letters/numbers, with a familiar company-name prefix when available. Write-once short-code alias records handle collisions without overwriting another profile. The full SHA-256-derived profile identifier remains internal; earlier 12-character links still resolve and show the new short code. A settings change creates a different page; old links remain valid. Anyone with the code/link can read the public profile and matches: the code is a share link, not authentication or proof of TRMNL ownership. Fields warn to use public data only. Private Vercel Blob stores only the normalized public configuration and creation timestamp, never device credentials. No overwrite/update endpoint. Integrity checks, write-once creation and cold-instance race handling prevent config reassignment. Codes and URLs are rendered as text; announcement targets are verified HN links.

Storage `sounds-company-links` (`store_Kzk66hJKySc7C7Dn`) is connected ONLY to Production on personal Hobby team manny4c-personal. Hobby has free quotas and no overage billing; exceeding limits can make links unavailable. Warm caches/coalescing reduce duplicate reads/writes; records are written once per distinct profile. On storage failure a device still gets its launch edition but no false working code or QR. Existing-code lookups return explicit 503 during outages; invalid/unknown codes return 400/404. The application never exports the production Blob credential, and no profile-list endpoint is exposed. Paths are fixed, validated codes only. Profiles are shareable public information rather than private customer workspaces.

Routes: GET `/api/matches?...&format=trmnl` includes links metadata; POST `/api/links` saves validated settings; GET `/api/links?code=...` returns current matches for saved settings; GET `/api/qr?code=...` returns the QR PNG; `/r/:code` serves the personal web view. Matching stays transparent and unchanged. New dependencies are locked in package-lock.json. Tests cover persistence across cold instances, races and storage/source outages, exact filter mapping, invalid codes, no per-viewer writes, 5kB budget, actual QR decoding at 82px, all four Liquid views/counts, escaped content and DOM flows for opening/editing a saved page.

Device rollout remains separate: prepared Shared/four layout tabs and public ZIP are updated; existing Recipe 507810 has not been changed by this task because screen control is disabled. It still polls the same endpoint and will create its personalized page, but the new QR/code is not claimed on the actual screen until its markup is saved. No browser/official renderer or physical display QA was performed for this change. No duplicate Recipe.

October 30 source sync: top links label now includes `lg:label--large`, matching Mario’s reported native improvement in the Published review email. The production ZIP is synchronized; this background source update did not resave or inspect native settings. Exact native source readback remains deferred. The existing QR service remains operational; the native `qr_code` filter is a future optional simplification.
