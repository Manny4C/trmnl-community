# Newsflash

Your world, in a flash. A complete replacement of Day 4’s Desk Editor: an image-first AI news screen with interests, one important headline, existing source imagery/video previews, dates, links and a grounded selection reason.

Production target: https://newsflash-trmnl.vercel.app. Same personal Vercel project desk-editor, source folder apps/desk-editor. Legacy URLs and /api/editor remain compatible aliases; old Desk Editor query fields are ignored, the image-led Newsflash response replaces the old card contract. No deployed TRMNL Recipe depends on that old contract.

## Product

Eight interests: Technology, AI & breakthroughs, Video games, Baseball, Basketball, Tesla & electric cars, New video drops, Space & science. Users select any mix, optional exact follow words, and a 24/48/72-hour window. The primary screen leads with one existing publisher image or official video thumbnail, the original source headline and attribution. The website has an original-color/e-ink approximation toggle, four approximate screen sizes, source notebook, alternatives to preview and manual install package.

Bounded first-party feeds: MLB, NBA, Tesla, Marques Brownlee, Nintendo, Xbox, PlayStation, OpenAI, Google DeepMind, Google AI, NVIDIA, NASA. Not comprehensive world news or independent verification of promotional claims. No old routine/forecast/software-release dashboard remains. A video preview is not necessarily the decisive frame. No arbitrary video downloading, thumbnail upscaling or paid image generation. Existing source imagery is strongly preferred and always tied to its own story. Source content and marks retain their rights; our markup and original code are CC BY 4.0.

## AI and spending

Shared hourly GitHub-hosted editor, not a Mac heartbeat or per-viewer model request. Responses API, gpt-6-luna, bounded text-only source context, strict JSON candidate-ID/importance/reason output. No untrusted feed instruction, URL or model-written headline is used. It never claims to inspect the linked photo. User interest filters determine eligible stories within the shared pool. Unreviewed stories/expired AI decisions have a truthful labeled freshness fallback. Missing images are not replaced with unrelated art.

User authorized a **$5/month** Newsflash model budget, personal OpenAI project ONLY. Source app has no paid runtime call; the workflow stores its secret separately from public output and reserves conservative maximum cost in a durable public ledger **before** each paid call. CAS state writes and workflow concurrency prevent concurrent overspend. Every request has bounded input/output, no tools, no retries, and reservations persist after failure. Ledger is on newsflash-data branch, file newsflash.json; the public API reads it without credentials. Code never creates a missing ledger or silently resets an invalid one. UTC month changes reset the month only. Use OpenAI’s own project hard limit in addition; the app gate does not cover unrelated account/key usage or future provider price changes.

See trmnl/SETUP.md for exact setup/activation/budget details. Manuel chose to keep his existing 15-day key rather than create a new OpenAI project. The application retains its $5 gate. The workflow is gated by repository variable NEWSFLASH_AI_ENABLED, which stays false until a complete usable secret is securely installed. Do not change other projects’ limits or credentials.

## Reliability and limits

Fixed feed/URL/image-host allowlists, HTTPS only, no arbitrary fetching, XML entity/doctype rejection, response-size/time limits and cache coalescing. Stories expire by real post date, not retrieval date. Source cache ten minutes; dated source outage fallback six hours. Decisions expire after six hours. Full responses retain source/provenance metadata; device JSON stays below 5 kB with UTF-8 field limits and a single URL-backed image, never image bytes or Saved State. All four layouts use native typography, shared title_bar and image-dither.

## Development and publication

Node 22. npm test; npm run dev at http://127.0.0.1:4320. Deploy only from this directory with vercel deploy --prod --scope manny4c-personal --yes. Original three Recipes remain intact. This remains Day 4, not an eighth app or an additional daily build.

Separate Newsflash Recipe is prepared, not created, installed or submitted; browser/official-renderer QA and marketplace previews await explicit browser-use authorization under Manuel’s no-screen-control preference. This rebuild does not automatically approve browser takeover. Opening the key setup pages at his request was a narrow exception. Record deployment, successful AI operation, Recipe creation/submission/approval and physical device receipt separately.
