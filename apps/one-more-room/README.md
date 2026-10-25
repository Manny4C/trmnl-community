# One More Room

A new original TRMNL adventure requested October 24, 2026, outside the scheduled seven-app series. Four heroes follow their lantern into procedurally generated dungeons to recover fragments of the stolen sun. Each fresh plugin frame resolves one action automatically.

- Companion website: https://one-more-room-trmnl.vercel.app
- Download: https://one-more-room-trmnl.vercel.app/plugin.zip
- Setup: https://one-more-room-trmnl.vercel.app/setup.html
- Polling endpoint: https://one-more-room-trmnl.vercel.app/api/frame
- Personal Vercel project: `one-more-room-trmnl`, team `manny4c-personal`.

Full-screen layout divides the display evenly: a hand-drawn atlas, recent journey, quest progress and party health on the left; generated scene art, dice result and next actions on the right. The next automatic action has an explicit AUTO label and border as well as a yellow highlight. Includes half horizontal, half vertical and quadrant layouts; reduced layouts compact the content. Color and monochrome share the same rules and information.

## How the adventure works

`public/game.js` is the single rules source for browser play and the bundled TRMNL Serverless function. Seed and floor generate a connected 24-room maze with a reachable keeper. Encounters include battles, traps, forgotten lore, treasure and restorative shrines. Brann the guardian, Pip the rogue, Mira the mage and Fern the ranger resolve visible d20 checks. Decisions change party health, resources, encounter state and outcomes. Defeating a keeper recovers an ember fragment and opens another procedurally generated floor. Defeat loses half the party’s gold and returns them to the entrance with recovered health; it does not end the campaign.

This is procedural generation using original authored story fragments and deterministic rules, **not LLM text generation**. No runtime model, API secret, database, paid AI service or new subscription is needed. Artwork is created with the built-in ImageGen tool during design and selected from a finite scene library at runtime. Map topology, room encounters, enemy selection, dice and results are reproducible from the seed and action history. The same seed starts the same adventure; different choices diverge.

The website runs an automatic 15/30/60-second preview. Users can pause, take the next automatic action immediately, choose a different option, change preview size/palette, read the journey log, or start a new seeded campaign with a balanced, bold or careful battle instinct. Browser storage retains the campaign and the latest 120 actions. Autoplay pauses in hidden tabs and while dialogs are open; it never catches up a backlog. Other tabs adopt newer progress and pause their own autopilot without writing back in a loop. With blocked storage the game still works for the current tab and reports that persistence is unavailable.

Each TRMNL installation has its **own** campaign in Saved State. Seed changes start a new campaign; battle-instinct changes preserve it. The map is reconstructed from the seed/floor, with compact bitmasks for explored and cleared rooms. Six recent events and cumulative quest progress survive. The website and device are deliberately separate campaigns; browser choices do not remotely control the device.

The polling endpoint returns only a public minute token. The Serverless function resolves one action per new token. Duplicate and older tokens do not advance again; a long outage still causes only one action at the next successful update. Missing/failed payloads preserve progress. This is idempotent same-token replay, not a claim of transactional protection against independently overlapping platform transforms. The device does not run browser JavaScript or receive clicks on the displayed options. A cached playlist image cannot signal a new view; progression happens on fresh plugin updates, not every replay of an old screen.

## Develop and package

```sh
npm ci
npm test
npm run package
npm run dev
```

Local server: `http://127.0.0.1:4331`. Packaging regenerates `trmnl/transform.js`, Shared, all four Liquid layouts, icon, setup page, release metadata and `public/plugin.zip` from the tracked source. Python 3 is used only to assemble the ZIP. Edit the rules in `public/game.js`, the illustration/HTML renderer in `public/render.js`, shared display styles in `public/screen.css`, and native template generation in `scripts/package.mjs`; then repackage.

`node scripts/check-preview.mjs` runs headless browser QA against the local server. It needs a compatible Playwright Chromium, optionally selected with `CHROMIUM_EXECUTABLE_PATH`. It checks controls, saving/reloading, the journal, seed/instinct changes, manual actions and mobile overflow; renders the actual Liquid output at all four native pixel dimensions in color/B&W; and checks longest scene variants of every encountered room type for clipping. Artifacts stay in ignored `artifacts/`. These local Chromium renders do not prove native TRMNL-server compatibility or physical receipt.

Tests cover connected maps, seeded replay, action branching, one-action refreshes, stale/retried tokens, thousands of automatic turns under all three instincts, defeat/revival, save validation, outage preservation, configuration changes, output budgets, map visibility, escaped text and all four Liquid layouts. The measured long-run maxima are 3,298 bytes for merge data and 853 bytes for Saved State, below the standard 5 kB data / 8,192-byte state limits.

Deploy from this app directory only:

```sh
vercel deploy --prod --scope manny4c-personal
```

Never deploy to Paper Star. No other app, database, Recipe, device content, automation or playlist is changed by this app.

## Actual release status

Website and package are built; a separate Recipe has not been created, installed, submitted or approved. `public/release.json` and the repository’s `launch-plan.json` record these stages separately. The existing project instruction says to continue background-only work until screen control is explicitly authorized again; this build uses background headless QA and does not control the user’s browser or TRMNL settings. Continue with ONE separate Recipe when authorized, preserve all existing playlist entries, and verify native OG/X layouts, icon, marketplace images, submission and physical receipt separately. See `trmnl/SETUP.md`.

Official platform references: [Saved State](https://help.trmnl.com/en/articles/16777795-saved-state), [Serverless](https://help.trmnl.com/en/articles/14130649-serverless), [refresh rates](https://help.trmnl.com/en/articles/10113695-how-refresh-rates-work).

## October 25 artwork and atlas update

Original ImageGen illustrations replace the old SVG scene stand-ins: exploration, battle, keeper, trap, treasure, lore and sanctuary. The larger right-hand art panel selects an encounter-type vignette; it does not claim to depict each seeded room/foe exactly. Generated originals and the exact prompt set are preserved in `assets/imagegen-v2.json` and `assets/originals/`. `scripts/prepare-art.mjs` produces faithful WebP website and JPEG device delivery copies without changing the composition.

The original fantasy atlas is independent of existing fictional geography. The live overlay shows the actual party, visited paths and dungeon locations. Automatic mode pulls back to the world at the beginning, floor entrances and keeper victories; otherwise it shows the current dungeon, framing explored areas during navigation and moving closer to active encounters. The world overview covers the current six-dungeon chapter; cumulative embers preserve overall progress across chapters. The browser also offers pinned World/Dungeon views; changing the camera never changes the adventure. All pre-update campaign saves remain valid.

Party health and short recent-event summaries now share the left overview. The full browser journal remains available. Native artwork uses TRMNL image dithering; background Chromium color/B&W snapshots remain approximations of the physical device.
