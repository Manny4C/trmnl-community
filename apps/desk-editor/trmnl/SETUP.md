Current owner status, October 28, 2026: existing master 512643 is submitted for public human review. Canonical Shared/four layouts are saved/reloaded against source, original icon and marketplace assets are saved, and native OG/X checks passed. Manuel explicitly accepted the Community Plugin License for this submission. Reloaded settings show Plugin in review. Public approval, installation URL and physical receipt remain unconfirmed. Continue this existing master; never create a duplicate.

# Newsflash — separate Recipe setup

This completely replaces the earlier Desk Editor concept in the same Day 4 app and personal Vercel project. Existing owner Newsflash Recipe **512643** is created and added to Manuel’s playlist: https://trmnl.com/plugin_settings/512643/edit. Its configuration, Shared and all four layouts are saved, and the native data Test request returned HTTP 200 with a real AI-selected MLB headline and source thumbnail. The actual image/layout render has not been visually verified. Icon upload, marketplace images, native OG/X checks and public submission remain pending. It is a private draft, not submitted or approved; physical receipt is unconfirmed. Continue this Recipe and never create a duplicate Desk Editor or Newsflash master.

The following instructions also allow another user to make a manual private copy before a public install link is available.

1. Create private plugin **Newsflash** with Polling GET, framework 3.4, no headers/body and no Serverless transform.
2. Paste `form-fields.yml` into custom fields. Polling URL:

```
https://newsflash-trmnl.vercel.app/api/flash?interests={{ interests | url_encode }}&follow={{ follow | url_encode }}&hours={{ news_window }}&format=trmnl
```

3. Shared receives shared.liquid. Paste the four matching Liquid files into their Full/Half horizontal/Half vertical/Quadrant tabs. Icon is icon.svg. The native image-dither class asks the TRMNL platform to dither source imagery to the actual device palette. Images are URLs, not embedded payloads.
4. Refresh interval 30 minutes or an account-supported interval; the AI cloud editor is hourly and may be delayed. Device refreshes never spend model tokens. Interest choices filter the shared ranked pool.
5. Validate actual OG and X landscape/portrait image loading, long headlines, empty state, AI/fallback/cached labels and provenance. Automated Liquid checks are not official-renderer or physical-device verification. Generate marketplace previews only after this.
6. Preserve existing owner Recipe 512643 and every other playlist entry; it is already added to Manuel’s playlist. For a manual copy, add it to your own playlist. Source images/thumbnails keep their source attribution. A video thumbnail is not necessarily the actual winning frame. TRMNL displays still images, never video playback.
7. Publish as a separate Newsflash Recipe, short description “Your world. In a flash.”, support/source GitHub Manny4C/trmnl-community, website https://newsflash-trmnl.vercel.app. Record actual submission/review/install status against existing Recipe 512643 in launch-plan.json. Do not infer approval from creation or a successful data test.
8. Website release.json is draft_installed while the owner Recipe is private; change to submitted only after public submission actually succeeds. After human approval, set approved and the verified recipe_url. Never guess installation links.

## Operation and provenance

Official source feeds: MLB, NBA, Tesla, Marques Brownlee, Nintendo, Xbox, PlayStation, OpenAI, Google DeepMind, Google AI, NVIDIA and NASA. Bounded recent posts (72-hour maximum), not every story or all world news. Source images only in the first version; automatic paid image generation is disabled. Label a future generated illustration as such, never as documentary photography. No arbitrary video downloading or frame extraction.

The AI model sees bounded source titles/context and returns only candidate IDs, importance and reasons. It cannot supply arbitrary URLs, alter headlines or invent images. Freshness fallback is explicitly labeled if a story lacks a recent AI decision. Full source links and source/AI timestamps are on the website. Requests to provider feeds may fail; source availability is exposed. Source cache ten minutes, dated outage fallback six hours, AI decisions expire after six hours. Feed publication dates still determine eligibility.

## Cloud AI and budget

User authorized $15/month for Newsflash on October 16, 2026. Manuel later authorized keeping his existing 15-day key instead of creating a new OpenAI project. Hosting/source remain personal; API usage bills the project that owns the selected key. Do not change any other project’s limit. Production NEWSFLASH_OPENAI_API_KEY stays as a Sensitive variable in the personal Vercel project. It is never exported or copied to GitHub. Keys never enter tracked files, browser UI, logs or chat.

Set repository variable NEWSFLASH_AI_ENABLED to true only after deploying the protected Vercel curator with the owner-authorized secret. It stays false before activation. GitHub workflow .github/workflows/newsflash-editor.yml runs hourly on hosted runners, independent of Manuel’s Mac. It uses the short-lived workflow GITHUB_TOKEN to read a durable CAS-protected state file newsflash.json on branch newsflash-data. It reserves a conservative worst-case request cost BEFORE making exactly one Responses API call. GITHUB_TOKEN scopes only this repository. Model gpt-6-luna, Standard/default tier, no tools, no caching discount, reasoning none, maximum 3000 output tokens, serialized body at most 18,000 bytes. Pricing reserve doubles current standard input/output prices, adds 4096 input-token overhead and never refunds failed reservations. The hard application gate stops before total reservations exceed $15 per UTC calendar month. It stops closed on invalid/missing ledger or a concurrent update conflict. Workflow concurrency serializes scheduled/manual runs; retries have the same run ID and cannot spend twice. Model/provider pricing changes need review before changing this policy. This gate covers this application, not other use of the account/key. This does not change the billing project’s account-wide settings.

Current actual activation/Recipe state is recorded in launch-plan.json; file preparation alone does not establish a successful AI call or Recipe submission.

The cloud runner reserves budget, then posts the source candidates and exact reservation SHA to the protected Vercel /api/curate endpoint using its short-lived repository token. Vercel requires a matching current reservation and a successful one-time CAS claim with repository write access before using its own Sensitive key. No OpenAI key is copied into GitHub, source, logs or chat. A failed provider credential pauses the schedule until replacement/activation; do not repeatedly retry it.


COLOR AND BLACK & WHITE
Use TRMNL framework 3.4.3 or later. Red/yellow accents adapt to the device palette automatically. Every grayscale tier uses explicit black/white text and badge fallbacks; labels and borders carry meaning without color. Headlines and sources remain black. Photos use image-dither for the target device palette; QR codes remain pure black/white. Website palette controls affect only the web preview, not your TRMNL settings.

October 28 automated review resolution: Half-horizontal photo stretches vertically, reason uses two X lines; publication and checked times use installer UTC offset. Optional interests multi-select deferred to preserve existing field compatibility.
