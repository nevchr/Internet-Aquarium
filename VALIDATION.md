# V1 validation — September 22, 2026

This report separates implemented behaviour from observed test evidence. The delivered extension is under `dist/`; test data/profiles/screenshots are ignored by Git.

## Passed

- Strict TypeScript and production Vite build, including Manifest V3 service worker, bundled extension pages and PNG icons.
- 22 automated logic checks covering hostname normalization/exclusions, stable hash and traits, category boundaries, monotonic bounded growth, active-time maturity, recency, local-midnight filters, tracking consent/toggle, long-gap timing exclusion, import validation and reset isolation.
- Real production build loaded unpacked in Chrome 153.0.8010.53 using an isolated profile. Onboarding rendered with no browser/host permissions before consent. No aquarium data was stored while the native permission request awaited acceptance.
- Real Chrome history events produced fish; `www.github.com` and `github.com` merged, repeated visits accumulated, and URL paths/query tokens/page titles were absent from stored summaries.
- Focused active-tab intervals accumulated time; a real periodic Chrome alarm persisted time without navigation; time stopped on the aquarium dashboard.
- Pins, fish, onboarding and settings survived closing Chrome, reopening the same test profile and reloading the unpacked extension through CDP.
- Turning off visit recording prevented a new domain from being added.
- Reset removed aquarium state and returned to onboarding; Chrome history contents were compared before/after and remained identical.
- Browser UI suite: 80 animated fish, direct swimming-fish hover/click, search/detail selection, persistent pin toggle, period emphasis, PNG and JSON downloads, 500 active fish, a 2,000-record directory with search locating a fish outside the initial rendered set, reset confirmation/cancel, import replacement, popup, 390×844 layout and mobile onboarding bounds.
- Desktop, fish-detail and mobile/onboarding screenshots were inspected. A mobile onboarding positioning bug found in visual review was corrected and guarded by a browser assertion.
- The optimized 500-fish renderer measured approximately **60–66 FPS at 1440×960, DPR 1** in headless Chrome. Earlier development iterations varied from 48–63 FPS. These are local samples, not a guarantee of 60 FPS on all desktops or displays. All historical records remain available when simulation is capped.
- Runtime source contains no fetch, XMLHttpRequest, WebSocket or beacon calls. The production manifest has no host permissions or content scripts, excludes incognito and sets `connect-src 'none'`.

## Test boundary

Native Chrome permission dialogs are outside Playwright's page automation. The real production welcome page and pre-consent state were tested, but clicking the native **Allow / Deny** buttons was not automated. Tracking tests use an isolated copy with `history` and `tabs` moved from optional to required permissions in that copy only. Its worker and UI bundles are identical to production. This does **not** claim end-to-end native optional-permission acceptance was tested.

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
