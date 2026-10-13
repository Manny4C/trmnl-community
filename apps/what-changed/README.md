# What Changed?

A calm topic-based news briefing for the web and TRMNL. This Vercel app serves both the website and `/api/briefing` for the plugin.

Choose Technology, Business, World or Science. The endpoint returns compact attributed headlines and short excerpts from an allowlist of sources. Both the browser and plugin remember previous editions independently and prioritize new or updated stories. No personal API keys or paid AI are required.

Run `npm install`, `npm test`, and `npm run dev`. Deploy from this directory with `vercel deploy --prod --scope manny4c-personal`.

Plugin installation instructions are in `trmnl/SETUP.txt`. The public website contains the live preview, setup endpoint, downloadable bundle, privacy information and support link. Public Recipe approval is tracked in `public/release.json`.
