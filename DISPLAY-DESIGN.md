# Color and black & white

Manuel requested color for every current and future TRMNL app on October 16, 2026. Use the same information, density and settings in both modes.

- Use TRMNL framework 3.4.3 or later and native color utilities. Red mastheads/signals and yellow highlights suit the owner’s B/W/R/Y device; keep body text and sources black on white.
- Pair `text--red` with `1bit:text--black 2bit:text--black 4bit:text--black`. Pair `bg--yellow` with all three `bg--white` variants plus explicit `text--black`. Red solid signals use black backgrounds on grayscale with white foregrounds.
- Color panels use separate `screen--color-*` classes. Their reported depth may be 4, but they do not use `.screen--4bit`. Never key grayscale fallbacks on a numeric depth alone.
- Preserve meaning through words, numbers, shape and borders. Do not encode status, game rules, categories or charts through color alone. Do not shrink typography to accommodate color accents.
- Keep QR codes pure black/white with their quiet zone; never apply image-dither or colored filters. Preserve source photos and use native image-dither to render them for each panel.
- Provide a labeled Color / Black & white control on every website preview. These controls affect only the preview, not the device. Label image approximations honestly.
- Check all four Liquid layouts; preserve headline counts, launch density and failure states. Check native color and B&W plus responsive sizes when creating or substantially changing a layout. Record web deployment, Recipe save and physical receipt separately.

Cross-app checks: install development dependencies in `apps/sounds-like-my-company`, then run `node --test test/color.test.mjs` from the repository root. Also run each affected app’s own tests. These DOM/Liquid tests do not replace actual TRMNL rendering or physical device receipt.

Official references: [palettes](https://trmnl.com/framework/docs/3.4/color_palettes), [responsive variants](https://trmnl.com/framework/docs/3.4/responsive), [image dithering](https://trmnl.com/framework/docs/3.4/image).

October 16 rollout: all four sites and downloadable packages deployed and verified. Daily 505118 and YC 506494 have all four existing layouts saved. Sounds 507810 shared colors/fallbacks saved and apply to all four existing layouts; its separately prepared short-code/QR changes remain pending. All three remain submitted/in human review. Newsflash’s colored package is prepared; its separate Recipe creation, installation and submission remain pending. Native OG color and B&W checked across the twelve existing layouts. Physical receipt remains unconfirmed.

October 21 status: Newsflash 512643 and Tiny Planet 512639 were created and added to the owner playlist October 19, with Shared/four layouts saved; both remain private drafts and native visual QA is pending. Game Night Radar now has a separate website/package with native color/B&W classes and browser palette control; its Recipe is prepared, not created. These updates supersede the earlier October 16 prepared-only Newsflash note. No physical receipt is confirmed.

October 27 review revision: use native items/content/meta/index, columns/column, responsive overflow with hidden-item counters, native typography/data-clamp and title_bar for text feeds. Supply all available selected items to the fitting engine in every slot; do not cap smaller slots to 1–2 entries when a larger panel can show more. Reserve custom geometry for original boards, maps, photos and the explicitly requested full-bleed drawing. Eight app layout revisions and corrected Draws metadata are tested/deployed as source packages. Complete native OG/X visual checks and saved-source comparison remain pending; package publication is not native receipt or approval.
