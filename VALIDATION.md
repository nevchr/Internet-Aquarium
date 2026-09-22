# V1.2 validation — September 22, 2026

This report separates implemented behaviour from observed test evidence. The delivered extension is under `dist/`; test data/profiles/screenshots are ignored by Git.

## Passed

- Strict TypeScript and production Vite build, including Manifest V3 service worker, bundled extension pages and PNG icons.
- 32 automated logic checks covering hostname normalization/exclusions, stable hash and traits, category boundaries, visit-driven bounded growth, active-time maturity, recency, local-midnight filters, tracking consent/toggle, long-gap timing exclusion, import validation, reset isolation, custom-name validation/persistence/backward compatibility, popularity ranking, non-destructive crowding and responsive capacity.
- Real production build loaded unpacked in Chrome 153.0.8010.53 using an isolated profile. Onboarding rendered with no browser/host permissions before consent. No aquarium data was stored while the native permission request awaited acceptance.
- Real Chrome history events produced fish; `www.github.com` and `github.com` merged, repeated visits accumulated, and URL paths/query tokens/page titles were absent from stored summaries.
- Focused active-tab intervals accumulated time; a real periodic Chrome alarm persisted time without navigation; time stopped on the aquarium dashboard.
- Custom fish names, pins, fish, onboarding and settings survived closing Chrome, reopening the same test profile and reloading the unpacked extension through CDP.
- Turning off visit recording prevented a new domain from being added.
- Reset removed aquarium state and returned to onboarding; Chrome history contents were compared before/after and remained identical.
- Browser UI suite: 80 animated fish, direct swimming-fish hover/click, search/detail selection, persistent pin toggle, period emphasis, PNG and JSON downloads, automatic crowding with 500 records, a 2,000-record directory with search locating a fish outside the initial rendered set, reset confirmation/cancel, import replacement, popup, 390×844 layout and mobile onboarding bounds.
- Popularity update: the actual renderer grows the same fish with visits and stops at the cap even with one billion visits. With 500 saved records, the 82 most-visited fish swim at 1440×960; resizing to 390×844 reduces this to 19 without deleting records. Tests verify newly popular fish return, names survive, resting fish can be located, and dismissal restores the popularity ranking.
- Fish interaction update: actual mouse dragging at DPR 2, held-fish stability while other fish swim, dragging across a record update, release without recentering, continued swimming after release, containment at tank boundaries, release outside the canvas, emulated touch dragging/cancellation, reduced-motion and paused-motion dragging, reset during a drag. This is automated browser pointer-input evidence, not a physical touchscreen test.
- Naming UI: save, search by nickname, reload, cancel with Escape, clear back to species name, export/import retention and popup display. Selection now uses a soft silhouette glow, visually reviewed without the old circle.
- Desktop, fish-detail and mobile/onboarding screenshots were inspected. A mobile onboarding positioning bug found in visual review was corrected and guarded by a browser assertion.
- Before automatic crowding, the V1.1 renderer measured **45–66 FPS with 500 fish at 1440×960, DPR 1** in local headless Chrome runs. V1.2 caps that viewport at 82 fish; the latest current-population sample is recorded as `fpsCrowded` in `docs/browser-report.json`. These are local samples, not a guarantee of 60 FPS. All historical records remain available when simulation is capped.
- Runtime source contains no fetch, XMLHttpRequest, WebSocket or beacon calls. The production manifest has no host permissions or content scripts, excludes incognito and sets `connect-src 'none'`.

## Test boundary

Native Chrome permission dialogs are outside Playwright's page automation. The real production welcome page and pre-consent state were tested, but clicking the native **Allow / Deny** buttons was not automated. Tracking tests use an isolated copy with `history` and `tabs` moved from optional to required permissions in that copy only. Its worker and UI bundles are identical to production. This does **not** claim end-to-end native optional-permission acceptance was tested.

The tracking, permission and browser-restart evidence above was collected for V1.1. V1.2 changes presentation and population selection; the production build, logic and browser UI suites were rerun. Tracking and persistence code is unchanged.

All test website navigations were locally fulfilled HTML fixtures under normal HTTPS hostnames. No personal browsing history was read or modified, and no test was run in the user's daily browser profile. The real toolbar's popup-opening affordance was not clicked; the bundled popup page was exercised directly.

## Still needs a manual trial

1. Load the production `dist` in your normal Chrome profile. Deny the first permission request, retry, then allow it. Verify the first normal website visit appears without reloading the extension. This checks Chrome's optional-permission event lifecycle.
2. Check switching to another app, minimizing Chrome, computer sleep/wake and normal manual restart. Automated checks cover tab/dashboard transitions and a process restart; native OS focus/minimize and sleep are not yet verified.
3. Browse over multiple days. Older/small/new records and lighting are represented by synthetic fixtures, not an elapsed multi-day soak.
4. Check performance at your actual resolution and display scaling. Lower the fish limit if needed.

## Reproducing

```powershell
.\scripts\project.ps1 install
.\scripts\project.ps1 build
.\scripts\project.ps1 test
.\scripts\project.ps1 test:browser
.\scripts\project.ps1 test:extension
```

The browser suite owns its loopback Vite server. Both browser scripts default to the standard Windows Chrome path (`CHROME_PATH` overrides it). Reports and screenshots are under `test-results/`, including `browser-report.json` and `extension-report.json`. The extension harness needs recent Chrome's `Extensions.loadUnpacked` debugging API.

Snapshots of the final reports and desktop preview are preserved in `docs/` for review. Reports only contain synthetic test evidence.
