# TRMNL Plays: Tiny Planet

Status at initial delivery: production preview and game code ready. Shared PostgreSQL database awaits Neon Free plan terms acceptance. TRMNL OAuth app registration is pending. No Recipe has been created, installed or submitted; no physical receipt or official renderer verification is claimed.

Create one separate private plugin called TRMNL Plays: Tiny Planet. Use Polling, GET and framework 3.4.3 or later. Refresh every 30 minutes or slower.

Polling URL: https://tiny-planet-trmnl.vercel.app/api/world?format=trmnl

No authentication header, Serverless transform or personal configuration is required: everyone sees the same island. Copy shared.liquid to Shared and the four other Liquid files to their corresponding Full, Half horizontal, Half vertical and Quadrant tabs. Use icon.svg (also available at https://tiny-planet-trmnl.vercel.app/icon.svg). The package includes an original black/white icon. Before public submission verify all four views on OG color/B&W and X landscape/portrait, generate marketplace previews, install on the owner playlist without removing other entries and record the new Recipe ID. The community license acceptance is a separate final action.

Red/yellow accents use native utilities, with explicit 1bit/2bit/4bit black/white fallbacks. Symbols and labels carry meaning independently of color. Body text stays black. No client game code runs on TRMNL; the website sends accepted moves to the server and devices receive snapshots on their normal refresh.

Rules: plant a meadow for 1 seed, water a sapling for 1 water (+2 seeds/+1 wood), gather from water/grove/rock. A beacon on a meadow costs 6 wood+4 stone. Reach 8 groves and sail from a beacon to the next island. Clearing a sapling/grove/beacon makes room. A beacon returns 2 wood + 1 stone. Each verified account gets one accepted move per UTC day across all devices. Everyone can view. Owner autopilot is a separate, visibly labeled daily system actor; daily and hourly cloud checks include weekends and use atomic idempotency. Outages can delay jobs; catch-up entries show their original quota day and actual execution time.

Support/source: https://github.com/Manny4C/trmnl-community/tree/main/apps/tiny-planet
