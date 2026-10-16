# Newsflash — separate Recipe setup

This completely replaces the earlier Desk Editor concept in the same Day 4 app and personal Vercel project. No Desk Editor Recipe exists, so create ONE separate Recipe named Newsflash. Never duplicate the existing Daily, YC Scout or Sounds Like My Company Recipes.

1. Create private plugin **Newsflash** with Polling GET, framework 3.4, no headers/body and no Serverless transform.
2. Paste `form-fields.yml` into custom fields. Polling URL:

```
https://newsflash-trmnl.vercel.app/api/flash?interests={{ interests | url_encode }}&follow={{ follow | url_encode }}&hours={{ news_window }}&format=trmnl
```

3. Shared receives shared.liquid. Paste the four matching Liquid files into their Full/Half horizontal/Half vertical/Quadrant tabs. Icon is icon.svg. The native image-dither class asks the TRMNL platform to dither source imagery to the actual device palette. Images are URLs, not embedded payloads.
4. Refresh interval 30 minutes or an account-supported interval; the AI cloud editor is hourly and may be delayed. Device refreshes never spend model tokens. Interest choices filter the shared ranked pool.
5. Validate actual OG and X landscape/portrait image loading, long headlines, empty state, AI/fallback/cached labels and provenance. Automated Liquid checks are not official-renderer or physical-device verification. Generate marketplace previews only after this.
6. Install on Manuel’s playlist without removing any existing plugins. Source images/thumbnails keep their source attribution. A video thumbnail is not necessarily the actual winning frame. TRMNL displays still images, never video playback.
7. Publish as a separate Newsflash Recipe, short description “Your world. In a flash.”, support/source GitHub Manny4C/trmnl-community, website https://newsflash-trmnl.vercel.app. Record real Recipe ID/settings/submission/review/install URL in launch-plan.json. There is no Recipe ID until created.
8. Website release.json remains prepared until public submission actually succeeds, then submitted. After human approval, set approved and the verified recipe_url. Never guess installation links.

## Operation and provenance

Official source feeds: MLB, NBA, Tesla, Marques Brownlee, Nintendo, Xbox, PlayStation, OpenAI, Google DeepMind, Google AI, NVIDIA and NASA. Bounded recent posts (72-hour maximum), not every story or all world news. Source images only in the first version; automatic paid image generation is disabled. Label a future generated illustration as such, never as documentary photography. No arbitrary video downloading or frame extraction.

The AI model sees bounded source titles/context and returns only candidate IDs, importance and reasons. It cannot supply arbitrary URLs, alter headlines or invent images. Freshness fallback is explicitly labeled if a story lacks a recent AI decision. Full source links and source/AI timestamps are on the website. Requests to provider feeds may fail; source availability is exposed. Source cache ten minutes, dated outage fallback six hours, AI decisions expire after six hours. Feed publication dates still determine eligibility.

## Cloud AI and budget

User authorized $5/month for Newsflash on October 16, 2026. Manuel later authorized keeping his existing 15-day key instead of creating a new OpenAI project. Hosting/source remain personal; API usage bills the project that owns the selected key. Do not change any other project’s limit. Production NEWSFLASH_OPENAI_API_KEY is stored in the personal Vercel project and copied securely to the same-named secret in Manny4C/trmnl-community. Keys never enter tracked files, browser UI, logs or chat.

Set repository variable NEWSFLASH_AI_ENABLED to true only after installing the complete owner-authorized secret. It stays false before activation. GitHub workflow .github/workflows/newsflash-editor.yml runs hourly on hosted runners, independent of Manuel’s Mac. It reads a durable CAS-protected state file newsflash.json on branch newsflash-data. It reserves a conservative worst-case request cost BEFORE making exactly one Responses API call. GITHUB_TOKEN scopes only this repository. Model gpt-6-luna, Standard/default tier, no tools, no caching discount, reasoning none, maximum 3000 output tokens, serialized body at most 18,000 bytes. Pricing reserve doubles current standard input/output prices, adds 4096 input-token overhead and never refunds failed reservations. The hard application gate stops before total reservations exceed $5 per UTC calendar month. It stops closed on invalid/missing ledger or a concurrent update conflict. Workflow concurrency serializes scheduled/manual runs; retries have the same run ID and cannot spend twice. Model/provider pricing changes need review before changing this policy. This gate covers this application, not other use of the account/key. OpenAI’s own project hard limit is a separate account control.

Current actual activation/Recipe state is recorded in launch-plan.json; file preparation alone does not establish a successful AI call or Recipe submission.
