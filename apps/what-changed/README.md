# The Daily TRMNL

Prompt-based personalized news with ten include/exclude preset interests, custom interests and names, original-source headlines and excerpts, and per-prompt edition memory.

Production: https://the-daily-trmnl.vercel.app. Existing Recipe master 505118 remains submitted for public review. Do not create a duplicate. Deploy from this directory to personal Vercel project `what-changed` in `manny4c-personal`.

Choose **1–20 headlines**, default **8**, in the website composer and Recipe. Full-screen 1–3 editions use larger titles and more original-feed detail, 4–8 compact rows, and 9–20 two columns. Half layouts show at most two and quadrant at most one, respecting a setting of one. Fewer matching articles yields fewer headlines; never fill with unrelated material. GDELT results may not include excerpts; no extra details are invented.

The rich website endpoint is `/api/briefing?prompt=...&count=8`. It retains links and feed excerpts up to 420 characters. TRMNL polls the same URL with `&format=trmnl`; its compact tuple rows omit URLs and repeated property names. Its response is bounded below 5 kB while preserving requested rows, and Serverless reconstructs the layout fields. Saved State stores compact tuple rows plus up to sixty fingerprints; it trims old fingerprints to stay under 8192 bytes. Old object-based saved editions migrate automatically. The four legacy topic endpoints and no-count compact responses remain compatible.

Run `npm install`, `npm test`, and `npm run dev`. The local server uses port 4317. All four Liquid layouts, shared CSS, transform and configuration are in `trmnl/`; regenerate `public/plugin.zip` after any changes there. The website uses the same density rules and lets the user copy a count-specific compact polling endpoint. Prompt and count settings remain independent; changing count retains history for that prompt.

Support: https://github.com/Manny4C/trmnl-community/issues
