Current owner status, October 28, 2026: existing master 522315 is created and added to the owner playlist, with canonical Shared/four layouts saved and reloaded against source. Native OG color/B&W and X landscape/portrait checks passed at owner defaults. The first automated trmy review is read and its findings are fixed; a targeted follow-up review is checking. Original icon upload, applicable final Community Plugin License acceptance and public submission remain pending. No approval or physical receipt is claimed. Continue this master; never create a duplicate.

# Local Morning Brief — separate prepared Recipe

Create ONE separate Polling plugin named Local Morning Brief, framework3.4.3 or later. No auth headers, API key, request body or Serverless transform. Copy the form fields and Shared/four layouts, then save the original icon. A30minute refresh is suggested.

Polling URL (Liquid):
https://local-morning-brief.vercel.app/api/brief?city={{ city }}&units={{ units }}&days={{ days }}&count={{ result_count }}&format=trmnl

All choices are bounded public metadata. Supported city-center forecasts: San Francisco (example default, not inferred home), Oakland and Berkeley. UnitsF/C, community lookback7/14/30days, maximum3/4/6headlines. All cities receive network-wide BART advisories and BART community headlines; SF also receives SF Rec & Park notices. This is official agency information, not comprehensive city reporting or route-filtered transit. Weather temperature is a current forecast period, not an observation. BART notices may describe planned future work. Article dates inferred from BART URLs are labeled URLdate. No source article bodies or photographs are reproduced.

All views show weather, alert status and one BART network notice, then fit available official community headlines using native items and responsive overflow. The full edition permits two columns; narrower views use one. A hidden-item counter makes smaller editions explicit. Shared includes native title_bar, red/yellow with explicit1bit/2bit/4bit fallbacks and large-screen typography. Website preview is an approximation, not a native render.

Sources are independent; errors never become a healthy no-alert condition. Temporary warm per-instance caches coalesce requests: forecast15minutes, mapping24hours, NWSalerts/BART2minutes, news30minutes. Forecast fallback max2hours and only while its current period and issue time remain valid. RSS fallback max6hours; retained titles still obey the chosen date window. All fallbacks are labeled with original successful check time. Alerts and transit never use outage replay. Cache checks are not proof of real-time conditions, and TRMNL's own refresh is separate. Source statuses and checked time are displayed; complete source times, issue time, URLs and exact agency posted wording are on the website. No durable-cache claim.

Compact device response is bounded4700bytes. News is a tuple of title/source/date/date-label; article URLs live in the corresponding website edition. No SavedState, secret, account data or request context is returned.

Earlier prepared-only status is superseded by the October 28 owner status above. Native OG color/B&W, X landscape/portrait and all four visual checks, icon/marketplace save, owner playlist installation and public submission await renewed browser authorization under Manuel's no-screen-control instruction. Record the new master ID immediately, preserve every existing playlist entry and seek applicable final Community Plugin License confirmation only once native assets/QA are ready. Never equate this ZIP or Vercel deployment with submission, approval or physical receipt. Public install URL stays null until approved.

Source/support: https://github.com/Manny4C/trmnl-community/tree/main/apps/local-morning-brief
Website: https://local-morning-brief.vercel.app
Data terms: https://www.bart.gov/schedules/developers/developer-license-agreement
NWS: https://www.weather.gov/documentation/services-web-API
Agency RSS: https://www.bart.gov/news/rss and https://recpark.sf.gov/rss.aspx

October 28 automated review resolution: Larger full-view headlines, valid X weather value tier, single-column quadrant fitting, compact inline BART attribution and installer-local checked time.
