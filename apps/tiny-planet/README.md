# TRMNL Plays: Tiny Planet

An original shared island game: one accepted move per verified TRMNL account per UTC day, no aggregate daily community cap, public viewer, four e-ink layouts and a separately labeled daily owner autopilot.

Production preview: https://tiny-planet-trmnl.vercel.app

## Current release state

The personal Neon Free database is provisioned and its schema initialized. TRMNL public PKCE app262 is registered and its Client ID plus private session/scheduler secrets are configured. Activation deployment9Q3oGum2j3ue5kqB5mAgM6ZkD6oB left the Vercel system build queue; public world now returns200 and sign-in begins with a secure cookie/302 to TRMNL. Real owner consent/callback and a player move still require live verification.

Tiny Planet private Recipe512639 is created and added to the owner playlist, with Shared and all four layouts saved. It is NOT publicly submitted or approved. Marketplace/icon/native visual checks and physical receipt remain pending. Newsflash's separate private Recipe512643 is likewise created/added with configuration/four layouts saved; no duplicate should be created. Screen control was limited to five minutes on October19 and has ended.

Free database terms approval: https://vercel.com/manny4c-personal/~/integrations/accept-terms/neon?source=cli

After approval, provision on the linked **personal** project (never a work team):

```sh
vercel integration add neon --name tiny-planet --plan free_v3 --metadata region=iad1 --metadata auth=false --environment production --no-env-pull --scope manny4c-personal --format json
```

Only `free_v3` is authorized; stop if a paid plan is required. Use the linked Vercel production runtime to run `node scripts/migrate.mjs` with DATABASE_URL in memory/environment. Never print the database connection string or pass credentials in command arguments. Migration is a single transaction over eight checked-in top-level statements. Do not use local/ephemeral files as production state.

## TRMNL sign-in

Register a public PKCE app at https://trmnl.com/developer_apps called **TRMNL Plays: Tiny Planet** with this exact redirect:

`https://tiny-planet-trmnl.vercel.app/api/auth?step=callback`

Select **Cannot keep a secret**. Add its public Client ID to Production as `TINY_PLANET_TRMNL_CLIENT_ID`. A confidential app can instead supply a Sensitive `TINY_PLANET_TRMNL_CLIENT_SECRET`, but the public client requires no shared secret. Never ask players to paste API keys.

Requested scopes are `read profile`: read a verified account identity from `/api/me` and verify at least one device using `/api/devices`. No email or real name is persisted or displayed. Both scopes also permit broader TRMNL operations than this game uses; the game performs only GET requests. Players may restrict or revoke access. Connections with no readable device fail closed. API response shapes and real OAuth need a live-account integration check after registration; mocked contract tests do not prove that integration.

Use a random 32-byte-or-longer `TINY_PLANET_SESSION_SECRET` stored as Sensitive Production configuration. Access tokens are AES-256-GCM encrypted at rest in Postgres, browser cookies are opaque/HttpOnly/Secure/SameSite=Lax and server sessions expire within two hours. We do not retain refresh tokens. Every move verifies the upstream account and device ownership again. A changed/revoked/expired identity cannot move. Hashed account IDs persist for daily quota enforcement across devices and sessions. POSTs require the canonical origin and session-bound CSRF.

## Atomic game and autopilot

`tp_move` takes a row lock on the single world. Validation, resource changes, event history, global turn, unique nonce and unique `(actor, day)` quota are committed together. Failed moves roll back. A retry returns the original result; it cannot charge twice or change the account/action. Public handlers derive the actor from an authenticated server session and never accept a caller-provided account or date.

`tp_autopilot` runs within the same database transaction/lock and uses the dedicated `owner-autopilot` actor, one quota day and nonce per UTC date. It tends the island, builds a beacon and sails after 8 groves. A bounded 31-day catch-up is transparently recorded with original quota dates and actual execution times; this does not claim execution occurred on missed days.

Generate a random `TINY_PLANET_CRON_SECRET`; place it in Sensitive Vercel Production configuration and the repository's GitHub Actions secret of the same name using stdin, not arguments/logs. The owner workflow is `.github/workflows/tiny-planet-autopilot.yml`: daily at 00:17 UTC plus hourly at :47, seven days/week, independent of weekday build automation and Manuel's Mac. It waits for a healthy production world before attempting a move: repository variable `TINY_PLANET_ENABLED=true` enables it. Manually dispatch once, verify one production move and idempotent replay, then verify its next scheduled run before calling it active. Cloud schedule delays/outages remain possible and are exposed rather than hidden.

## Tests and preview

```sh
npm ci
npm test
npm run dev
```

32 checks currently pass, including real PostgreSQL-engine SQL executed through PGlite, competing account attempts, many-account aggregation, resource rollback, practice/SQL agreement, retry identity, day reset, autopilot recovery/progression, ownership and authorization failures, CSRF, protected scheduling, migration splitting, a 48-cell payload below 3 kB, all four Liquid renders and the actual website practice/B&W controls. PGlite is a local PostgreSQL engine, not a hosted Neon concurrency test. Real production database races, OAuth, native TRMNL renderer, mobile visual layout and physical receipt remain unverified until access/setup is finished.

The production website never substitutes an in-memory practice island for the shared world. Practice is explicitly labeled, local, ephemeral and cannot submit a community move. Shared endpoints return 503 during missing database configuration. The public website polls every 30 seconds while visible; devices follow their configured refresh.

## Release follow-through

After activation, update public release status/copy and launch-plan.json, deploy again, verify anonymous viewer plus a real connected owner move and scheduler idempotency, create ONE separate Recipe from `public/plugin.zip`, verify native OG color/B&W and X orientations/four views, generate marketplace previews and install without removing other playlist entries. Accept the Community Plugin License only with action-time human confirmation if the browser requires it. Submit and record actual status; approval and physical receipt are separate.

Official references: [TRMNL Developer Apps](https://help.trmnl.com/en/articles/17225165-developer-apps), [account API](https://docs.trmnl.com/go/private-api/account), [private plugins and payload limits](https://help.trmnl.com/en/articles/9510536-private-plugins), [Vercel integrations CLI](https://vercel.com/docs/cli/integration).
