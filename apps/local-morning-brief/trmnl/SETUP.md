# Local Morning Brief — separate prepared Recipe

Create ONE separate Polling plugin named Local Morning Brief, framework3.4.3 or later. No auth headers, API key, request body or Serverless transform. Copy the form fields and Shared/four layouts, then save the original icon. A30minute refresh is suggested.

Polling URL (Liquid):
https://local-morning-brief.vercel.app/api/brief?city={{ city }}&units={{ units }}&days={{ days }}&count={{ result_count }}&format=trmnl

All choices are bounded public metadata. Supported city-center forecasts: San Francisco (example default, not inferred home), Oakland and Berkeley. UnitsF/C, community lookback7/14/30days, maximum3/4/6headlines. All cities receive network-wide BART advisories and BART community headlines; SF also receives SF Rec & Park notices. This is official agency information, not comprehensive city reporting or route-filtered transit. Weather temperature is a current forecast period, not an observation. BART notices may describe planned future work. Article dates inferred from BART URLs are labeled URLdate. No source article bodies or photographs are reproduced.

Full view shows weather/alert status, two BART notices and up to six community titles in two columns. Half horizontal shows one notice and two headlines; half vertical one notice and three headlines; quadrant prioritizes weather, alerts and one transit notice. Shared includes native title_bar, red/yellow with explicit1bit/2bit/4bit fallbacks and large-screen typography. Website preview is an approximation, not a native render.

Sources are independent; errors never become a healthy no-alert condition. Temporary warm per-instance caches coalesce requests: forecast15minutes, mapping24hours, NWSalerts/BART2minutes, news30minutes. Forecast fallback max2hours and only while its current period and issue time remain valid. RSS fallback max6hours; retained titles still obey the chosen date window. All fallbacks are labeled with original successful check time. Alerts and transit never use outage replay. Cache checks are not proof of real-time conditions, and TRMNL's own refresh is separate. Source statuses and checked time are displayed; complete source times, issue time, URLs and exact agency posted wording are on the website. No durable-cache claim.

Compact device response is bounded4700bytes. News is a tuple of title/source/date/date-label; article URLs live in the corresponding website edition. No SavedState, secret, account data or request context is returned.

Recipe is PREPARED ONLY. Native OG color/B&W, X landscape/portrait and all four visual checks, icon/marketplace save, owner playlist installation and public submission await renewed browser authorization under Manuel's no-screen-control instruction. Record the new master ID immediately, preserve every existing playlist entry and seek applicable final Community Plugin License confirmation only once native assets/QA are ready. Never equate this ZIP or Vercel deployment with submission, approval or physical receipt. Public install URL stays null until approved.

Source/support: https://github.com/Manny4C/trmnl-community/tree/main/apps/local-morning-brief
Website: https://local-morning-brief.vercel.app
Data terms: https://www.bart.gov/schedules/developers/developer-license-agreement
NWS: https://www.weather.gov/documentation/services-web-API
Agency RSS: https://www.bart.gov/news/rss and https://recpark.sf.gov/rss.aspx
