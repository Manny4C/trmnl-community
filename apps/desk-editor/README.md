# Newsflash

Your world, in a flash. A complete replacement of Day 4’s Desk Editor: an image-first AI news screen with interests, one important headline, existing source imagery/video previews, dates, links and a grounded selection reason.

Production target: https://newsflash-trmnl.vercel.app. Same personal Vercel project desk-editor, source folder apps/desk-editor. Legacy URLs and /api/editor remain compatible aliases; old Desk Editor query fields are ignored, the image-led Newsflash response replaces the old card contract. No deployed TRMNL Recipe depends on that old contract.

## Product

Eight interests: Technology, AI & breakthroughs, Video games, Baseball, Basketball, Tesla & electric cars, New video drops, Space & science. Users select any mix, optional exact follow words, and a 24/48/72-hour window. The primary screen leads with one existing publisher image or official video thumbnail, the original source headline and attribution. The website has an original-color/e-ink approximation toggle, four approximate screen sizes, source notebook, alternatives to preview and manual install package.

Bounded first-party feeds: MLB, NBA, Tesla, Marques Brownlee, Nintendo, Xbox, PlayStation, OpenAI, Google DeepMind, Google AI, NVIDIA, NASA. Not comprehensive world news or independent verification of promotional claims. No old routine/forecast/software-release dashboard remains. A video preview is not necessarily the decisive frame. No arbitrary video downloading, thumbnail upscaling or paid image generation. Existing source imagery is strongly preferred and always tied to its own story. Source content and marks retain their rights; our markup and original code are CC BY 4.0.

## AI and spending

Shared hourly GitHub-hosted editor, not a Mac heartbeat or per-viewer model request. Responses API, gpt-6-luna, bounded text-only source context, strict JSON candidate-ID/importance/reason output. No untrusted feed instruction, URL or model-written headline is used. It never claims to inspect the linked photo. User interest filters determine eligible stories within the shared pool. Unreviewed stories/expired AI decisions have a truthful labeled freshness fallback. Missing images are not replaced with unrelated art.

User authorized a **$15/month** Newsflash model budget. Manuel authorized keeping his existing 15-day key; API usage bills its owning OpenAI project. The protected Vercel curator makes the paid runtime call; the workflow keeps the OpenAI key inside Vercel and reserves conservative maximum cost in a durable public ledger **before** each paid call. CAS state writes and workflow concurrency prevent concurrent overspend. Every request has bounded input/output, no tools, no retries, and reservations persist after failure. Ledger is on newsflash-data branch, file newsflash.json; the public API reads it without credentials. Code never creates a missing ledger or silently resets an invalid one. UTC month changes reset the month only. The Newsflash application cap is enforced before inference; the app gate does not cover unrelated account/key usage or future provider price changes.

See trmnl/SETUP.md for exact setup/activation/budget details. Manuel chose to keep his existing 15-day key rather than create a new OpenAI project. The application retains its $15 gate. The workflow is gated by repository variable NEWSFLASH_AI_ENABLED, which is true after successful cloud activation. Do not change other projects’ limits or credentials.

## Reliability and limits

Fixed feed/URL/image-host allowlists, HTTPS only, no arbitrary fetching, XML entity/doctype rejection, response-size/time limits and cache coalescing. Stories expire by real post date, not retrieval date. Source cache ten minutes; dated source outage fallback six hours. Decisions expire after six hours. Full responses retain source/provenance metadata; device JSON stays below 5 kB with UTF-8 field limits and a single URL-backed image, never image bytes or Saved State. All four layouts use native typography, shared title_bar and image-dither.

## Development and publication

Node 22. npm test; npm run dev at http://127.0.0.1:4320. Deploy only from this directory with vercel deploy --prod --scope manny4c-personal --yes. Original three Recipes remain intact. This remains Day 4, not an eighth app or an additional daily build.

Separate Newsflash Recipe is prepared, not created, installed or submitted; browser/official-renderer QA and marketplace previews await explicit browser-use authorization under Manuel’s no-screen-control preference. This rebuild does not automatically approve browser takeover. Opening the key setup pages at his request was a narrow exception. Record deployment, successful AI operation, Recipe creation/submission/approval and physical device receipt separately.

The OpenAI key is a Sensitive Production variable in Vercel and is never exported to GitHub. The scheduled job uses its short-lived repository token to reserve budget and authorize a single /api/curate call. The Vercel endpoint atomically claims that exact state SHA with repository write permission before calling the model, then validates and publishes its decisions. Public visits, unauthorized callers, races and replays fail before inference. A rejected/expired provider key pauses future scheduled calls until owner activation.

Verified activation October 16: hosted workflow run 38940080432 succeeded, published 29 model decisions, and reserved $0.005585 under the original $5 gate, subsequently raised to $15 at Manuel’s request. The public feed serves AI choices. If a valid reviewed story matches an interest, unreviewed items cannot displace it. Broad NVIDIA AI-model stories are excluded from gaming unless their title explicitly matches gaming terms. The public snapshot reader has a GitHub Contents fallback for raw-host outages.


## Cost forecast — October 16, 2026

The owner raised the application AI cap to **$15 per UTC calendar month**. The durable ledger retains existing reservations and call history. The cap is shared across all viewers, not a separate allowance per device. It does not change the OpenAI project's account-wide settings.

Current production uses existing publisher images/video thumbnails: **$0 image-generation API cost**. The shared editor runs hourly (720 calls per 30 days, 744 per 31), independent of the suggested 30-minute TRMNL refresh and ten-minute visible web refresh. The first edit reserved $0.005585, projecting to $4.0212 per 30 days or $4.15524 per 31. This is conservative reserved allowance, **not measured provider billing**; input is overcounted, prices doubled, output reserved at its maximum. At the configured largest input the reservation ceiling is $0.00742/call, or $5.3424 per 30 days. Actual invoices, hosting/transfer and third-party media costs are not measured here. Model selection is shared; it does not multiply with subscriber count.

Hypothetical generated-image forecast only: generation remains **disabled**. OpenAI's current GPT Image 2.5 calculator estimates output tokens from explicit quality and dimensions. At **1024×768**, Standard pricing ($30/million image output tokens), text-only 200-token prompt ($5/million text input tokens), no reference images, no streaming partials or retries:

| Quality | Image output tokens | Output cost | Estimated total/image | 720 images/30 days + $4.0212 editor reserve |
| --- | ---: | ---: | ---: | ---: |
| Low | 134 | $0.00402 | $0.00502 | $7.64 |
| Medium | 301 | $0.00903 | $0.01003 | $11.24 |
| High | 1204 | $0.03612 | $0.03712 | $30.75 |

At medium quality, one new shared image/day projects to $4.32 total/month; every four hours $5.83; hourly $11.24; every 30 minutes $18.46, each including the same conservative hourly editor reserve. At 31 days hourly medium is about $11.62. These are calculator estimates, not sampled bills or a guaranteed upper bound. Actual token consumption can vary; measure returned usage before activating and reserve conservatively under the same durable cap. Multiple different story images per hour multiply the image portion. Reusing a story image across devices costs no new generation. Prefer existing source images; generate/cache only an explicitly labeled fallback illustration, never fabricate documentary imagery.

Official sources checked October 16: [OpenAI pricing](https://developers.openai.com/api/docs/pricing), [image generation calculator and cost notes](https://developers.openai.com/api/docs/guides/image-generation/index.html#gpt-image-25-and-gpt-image-2-output-tokens). Forecast assumes the user's 15-day key is renewed for a full month. Refresh schedules have not changed.


Owner's selected operating policy (October 16): keep the shared hourly AI editor and existing story-linked photos/video thumbnails only. Paid image generation stays disabled. The prepared Recipe recommends a 30-minute refresh; no Newsflash device installation or actual refresh setting is claimed. Expected conservative reserve is about $4/month from the first edit, at most $5.52048 for 744 scheduled edits at the current maximum request reservation. Manual calls also consume the same $15 cap. Preserve prior reservations; stop paid calls before crossing the cap and use the existing labeled fallback. Do not enable generation just because a hypothetical forecast fits the budget.
