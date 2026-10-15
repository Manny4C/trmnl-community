# Sounds Like My Company

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
