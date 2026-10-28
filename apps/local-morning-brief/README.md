# Local Morning Brief

Latest Recipe status — October 28, 2026: master **522315** is submitted for public human review. Icons and OG/X marketplace assets are saved, native views checked, and Community Plugin License acceptance explicitly approved by Manuel. Reloaded native settings show **Plugin in review**. Approval, public installation URL and physical receipt remain unconfirmed.




Day7, built October22in Manuel's PERSONAL launch series. Separate website/plugin service for a Bay Area morning briefing: city-center NWS forecast/active alerts, BART network advisories and official community notices. San Francisco is an explicitly labeled example default, not an inferred home. Oakland/Berkeley have their own weather points. Community coverage is BART for all cities and SF Rec & Park RSS for SF; it does not claim comprehensive journalism or route-specific transit. No private location/login/API key/paid model/service.

## Local development

Run `npm ci`, `npm test`, `npm run dev` within this directory. Node22production; localhost4329. Polling GET `/api/brief?city=sf&units=F&days=30&count=4&format=trmnl`; omitformatfor rich website data. Citysf/oakland/berkeley; unitsF/C; days7/14/30; count3/4/6. No arbitrary source URL or coordinates accepted. Invalid preferences400; source outages return200with honest per-source unavailable/partial states. All-source outage returns empty, unavailable edition.

## Source behavior

NWS mapping is rediscovered daily using documented points API; forecast URL must match the allowed api.weather.gov gridpoints path. Forecast selected only if its period includesnow and source issue time is <=36hoursold/notfuture. ConvertF/C, preserve unknown precipitation rather than0. Alert tests/cancels/expired/futureeffective entries excluded; count indicates all eligible notices, displaymax2. BART legacyBSAAPIuses the officially published shared developer key (public, not a credential); validates source clock <=15minutesold, retains posted wording and limits2noticeswhile preserving fullcount. It does not turn planned work into an active delay claim. BARTRSSoften lacks pubDate; only verified date in source articleURL is used and explicitly labeled. SF Rec & Park feeds use official published dates. Dedupe links and titles; newestdated first; no bodies/images; safeHTTPSagency links only.

Bounded750kBupstream reads,10secondrequesttimeout, one same-origin redirect, XMLentity/DOCTYPE/malformed bodies rejected. Fixed source/city cache keys only. Warm single-flight TTLs: mapping24hours,forecast15minutes,alerts/transit2minutes,news30minutes. On failed refresh forecastmayfallback<=2hours onlyifperiodstillvalid; news<=6hours withinselectedwindow. Fallbacks retain check time. Alerts/transit NEVER outagefallback, and their cached entries are revalidated against current time. No durable state or cached-source replay disguised as a new successful check.

Device response contains no RSS bodies/URLs/context/history, bounded4700UTF8bytes including allsource metadata. The website has live source links, issue/check/agency times, shareable public edition/pollingURL, public-preference-only localStorage, and Color/B&W/fourlayout controls. No geolocation, trackers, cookies or paid service. Standard hosting logs may include public preferences.

## Status

Native visual, marketplace, separate Recipe creation/install/submission and physicalreceipt are NOT confirmed. Public/plugin.zip contains configuration, Shared/four native framework layouts, originalicon and setup. Use existing series no-screen preference; never bypass browser restrictions or create duplicates. Set release.json only to actual submission/approval state. No public install URL until approval.

## Official documentation and data license

- https://www.weather.gov/documentation/services-web-API — open data, required identifying UserAgent, point mapping and forecast/alert APIs.
- https://www.bart.gov/schedules/developers/api — public shared legacy key and supported feed alternatives.
- https://www.bart.gov/schedules/developers/developer-license-agreement — reproduce/redistribute data, no official trademarks/artwork, asis/asavailable, BARTretainsrights andmaywithdraw.
- https://www.bart.gov/news/rss — official RSS discovery.
- https://recpark.sf.gov/rss.aspx — agency's published news feeds; use title/link/date, not articlebody or sourcephotography.

KQEDwas considered but NOT used: its feed endpoint failed and terms restrict commercial reuse. This app's original icon/markup is independent of agencybranding. No promised earnings or publicapproval.
