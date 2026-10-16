# Desk Editor — Recipe setup

The website is deployed independently. A separate TRMNL Recipe has not yet been created or submitted. These files prepare that Recipe; downloading them does not install it or establish approval.

1. With TRMNL Developer add-on or BYOD access, create one private plugin named **Desk Editor**. Preserve existing plugins and playlist entries.
2. Select Polling, GET, no headers/body, no Serverless transform, framework 3.4. Choose 30-minute refresh or a supported account interval.
3. Paste `form-fields.yml` as the custom fields. Set polling URL to:

```
https://desk-editor-trmnl.vercel.app/api/editor?mode={{ editorial_mode }}&timezone={{ timezone | url_encode }}&city={{ city }}&repo={{ repository }}&topics={{ topics | url_encode }}&cadence={{ cadence }}&format=trmnl
```

4. Paste `shared.liquid` into Shared. Paste the four named `.liquid` files into their matching Full, Half horizontal, Half vertical and Quadrant tabs. No extra JS transform is needed.
5. Icon is `icon.svg` in the archive. Generate marketplace previews only after reviewing actual OG and X landscape/portrait renders. This package does not claim actual renderer or hardware verification.
6. Test the configured URL. Default is balanced, America/Los_Angeles, no weather, Node.js, no topic filter, one-hour selection window. No company, home city or paid account is inferred.
7. Add the private plugin to the owner's playlist without replacing entries. Confirm renders separately from physical device receipt.
8. Publish this existing master as its own Recipe under **Desk Editor**, description “A little judgment for your desk.”, support/source GitHub Manny4C/trmnl-community, website https://desk-editor-trmnl.vercel.app. The author has authorized public Recipe submissions; keep actual license acceptance requirements and persisted review state distinct.
9. Record Recipe ID, owner settings URL, submission state and verified public install URL in launch-plan.json. Website release.json remains prepared until submission succeeds, then submitted; set approved and the real recipe_url only after human approval.

## Data policy

Only fixed public source endpoints are fetched. No API key is required. Preferences are public query parameters and may appear in standard hosting logs. No private inbox, calendar, tasks or business account data is connected. NWS is supported for six listed US cities only. Weather is a periodically refreshed snapshot, not emergency monitoring. No new paid services or language model are used.

## Freshness and selection

HN: up to 24 front-page items from the last 72 hours, checked every ten minutes per warm service. GitHub: latest stable release, checked hourly. NWS forecast: checked every fifteen minutes; active severe/extreme alerts: every five minutes. Device refresh can be slower. Cached sources keep their original check time; stale alerts are never replayed after a failed check. Routine suggestions are authored content, not source events.

Selection is deterministic within 30/60/120-minute windows for the same candidate set and source states. A new source item or an active alert can change it sooner. The source pool rotates; no persistent cross-instance memory or scheduled model run is required. All selection happens on the server when polled; TRMNL receives compact JSON under 5 kB and renders an image. A website time demo only reranks its fetched snapshot and never changes device settings.

Source docs: https://github.com/HackerNews/API ; https://docs.github.com/en/rest/releases/releases ; https://www.weather.gov/documentation/services-web-api ; https://trmnl.com/framework/docs/3.4

Our original source and markup are offered under CC BY 4.0. Source stories, project release notes and third-party marks retain their own rights. Support: https://github.com/Manny4C/trmnl-community/issues
