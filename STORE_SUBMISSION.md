# Internet Aquarium — Chrome Web Store submission worksheet

Prepared September 22, 2026 for the current 1.2.0 source and production manifest. This is paste-ready product information, not a submitted or approved listing. Account details, public URLs and graphics remain publisher-supplied where marked. No runtime code or permissions were changed for this worksheet.

## 1. Package and account

- Extension name: **Internet Aquarium**
- Version: **1.2.0**
- Manifest: **V3**
- Minimum Chrome version: **120**
- Prepared package: `build/internet-aquarium-1.2.0.zip`. Its root manifest, version and optional permissions were checked. This is the current production build, not a claim of store approval; finish section 7 before submission. To recreate it, ZIP the contents of `dist`, with `manifest.json` at the ZIP root. Never upload the source folder, developer preview or `test-results/extension-with-test-permissions`.
- Publisher display name: your chosen real publisher identity. This is an account setting, not the extension name.
- Contact/support email: **[YOUR PUBLIC SUPPORT EMAIL]**. Use a monitored address; complete any verification requested by Google.
- Register the publishing account if needed; Google charges a one-time registration fee. Enable Google Account 2-Step Verification. See [registration](https://developer.chrome.com/docs/webstore/register) and [2-Step Verification](https://developer.chrome.com/docs/webstore/program-policies/two-step-verification).
- Complete trader/non-trader self-declaration accurately for your circumstances. A free extension does not by itself establish non-trader status. Trader verification may require legal/contact details that appear publicly. See [Google's trader FAQ](https://developer.chrome.com/docs/webstore/program-policies/trader-verification-faq).

## 2. Store listing

### Suggested category and language

- Category: **Just for Fun**. This is the closest fit in [Google's category guidance](https://developer.chrome.com/docs/webstore/best-practices).
- Language: **English**.
- Mature content: **No**, based on the extension's aquarium artwork and supplied content.
- Payments/in-app purchases, if asked: **No**. There is no purchase, subscription or paid feature in this build.

### Short description — current manifest text

```text
A living, local-only aquarium made from the places you explore online.
```

The name, version and short description are taken from the uploaded manifest. Do not expect an editable dashboard field for every manifest value.

### Detailed description — paste this

```text
Turn the websites you visit into a living aquarium, stored on your device.

Internet Aquarium creates a distinctive fish for each website hostname you discover after enabling it. Return visits help your fish grow, approximate active browsing time adds maturity, and recently visited sites swim more actively.

MAKE YOUR AQUARIUM YOUR OWN
• Drag fish around the tank and give them custom names.
• Click a fish to see its website, recorded visits and approximate active time.
• Search your species directory and pin favourites for easy access.
• Enjoy varied fish shapes, colours, patterns, fins and tails.

ROOM TO GROW
Popular fish grow gradually, with a firm size cap. The tank adjusts to your window: when space is limited, the least-visited fish rest out of view. Their names and history stay in your directory, where you can find them again.

A CALMER VIEW OF YOUR BROWSING
Choose activity emphasis for Today, 7 Days, 30 Days or All Time. Adjust motion, bubbles, water particles and local day/night lighting. System reduced-motion preferences are respected. Fish do not die when you stop visiting a site.

YOUR DATA STAYS WITH YOU
Internet Aquarium uses new browsing-history events and active-tab metadata to create your fish and estimate browsing time. It stores hostname-level summaries locally, including recorded visit counts, first/last visit times and approximate active time, plus your fish names and settings. Full URLs are processed briefly to identify hostnames; URL paths, search queries and page titles are not saved. Webpage contents are not read. Incognito is excluded.

There are no accounts, analytics, ads or cloud uploads. Export or import your aquarium as a local JSON file, save an aquarium picture without domain labels, or reset the aquarium in Settings. Resetting it does not alter Chrome's browsing history.

GETTING STARTED
Open Internet Aquarium, choose “Start my aquarium,” and allow Chrome's optional history and tab permissions. Browse a few websites, then open the extension's toolbar popup and select “Open aquarium.” Existing browsing history is not imported, so a new aquarium starts empty. Meaningful subdomains can become separate fish.

Visit recording and approximate active-time tracking can be paused separately in Settings. Active time measures focused-tab time, not attention or exact screen time. Fish positions are temporary; names and aquarium records are saved locally.
```

### URLs

| Field | What to enter |
| --- | --- |
| Privacy policy | **[PUBLIC HTTPS URL OF THE COMPLETED PRIVACY POLICY]** — required for this extension; must load without signing in. Use the accompanying `PRIVACY_POLICY_DRAFT.md` after filling its publisher/contact fields. |
| Homepage | Optional: a live page describing Internet Aquarium. Do not use the loopback preview URL or an invented, unhosted path. |
| Support | Optional: a working product support/contact page or public issue tracker you maintain. |
| Official URL | Optional: a domain you own and have verified through the dashboard's verification flow. |
| Promotional video | Leave blank if you do not have one; do not invent a YouTube URL. Follow any current dashboard requirement shown for this field. |

Google describes these fields in [listing information](https://developer.chrome.com/docs/webstore/cws-dashboard-listing).

## 3. Privacy practices

### Single purpose — paste this

```text
Internet Aquarium turns the user's website visits into a personal, locally stored aquarium. Each hostname becomes a distinctive fish; recorded visits, approximate active time and recency shape its growth, maturity and activity. Users can view, name, move and find those fish in their aquarium and species directory.
```

### Permission justifications — paste into the matching fields

**storage**

```text
Stores the user's aquarium locally: hostname summaries, visit counts and timestamps, approximate active time, fish traits, custom names, pins and settings. chrome.storage.session holds a temporary timing checkpoint so the background worker can resume safely. The extension does not use chrome.storage.sync or send aquarium data to a server.
```

**alarms**

```text
A periodic Chrome alarm checkpoints approximate active-tab time while the Manifest V3 background worker may be suspended. This time controls fish maturity and appears in fish details. Checkpoints apply only to discovered domains with active-time tracking enabled; long gaps are discarded to avoid counting sleep as browsing.
```

**history — optional**

```text
After the user starts the aquarium and grants permission, chrome.history.onVisited supplies new visit events. The extension extracts the hostname and records visit counts and timestamps to discover fish and control their growth and activity. It does not import existing history, store full URLs or page titles, or modify/delete Chrome history. The permission is requested through the welcome flow before recording starts.
```

**tabs — optional**

```text
After user consent, the extension reads active-tab URLs to identify the current hostname, estimate active browsing time in the focused browser window, and show that site's fish in the toolbar popup. The permission is needed across normal browsing sessions, beyond a single toolbar click. URL paths and queries are discarded before storage. No scripts are injected into websites and no webpage content is read.
```

**Host permissions**, if shown: **None requested**. There is no `<all_urls>` or host-permission declaration.

### Remote code

Select **No, I am not using remote code**.

If an explanation is requested:

```text
All executable JavaScript, styles and artwork are bundled with the extension. There are no remotely hosted scripts, dynamic code downloads, remote WebAssembly modules or server-side execution services. The production extension's Content Security Policy restricts scripts to the package and sets connect-src to 'none'.
```

Google explains [single purpose, permissions, remote code and certification fields here](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy).

### Data usage selections

These recommendations map the current source to the dashboard categories; check the field descriptions in your live dashboard. Local processing must still be disclosed under [Google's User Data FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq).

| Data category | Selection | Reason |
| --- | --- | --- |
| Web history | **Yes** | Hostnames, new visit events, visit counts and first/last visit times. Full URLs are briefly processed, then reduced to hostnames. |
| User activity | **Yes** | Focused active-tab timing and browsing recency used for the aquarium. No keystroke or website click logging. |
| Personally identifiable information | No | No identity/account/profile fields or identification collection. Fish nicknames are labels, not a request for real names. |
| Health information | No | No health records or health measurements. |
| Financial and payment information | No | No payment or financial-record collection. |
| Authentication information | No | No passwords, login tokens or cookies. |
| Personal communications | No | No emails, messages or chats are read. |
| Location | No | No location API, location service or IP geolocation. |
| Website content | No | No visited-page text, images, video, forms or DOM is read or copied. PNG capture contains the extension's aquarium canvas only. |

Custom fish names and settings are also user-provided data stored locally. Explicitly include these in the policy, as the draft does. If your dashboard offers a separate **user-provided/user-generated content** category, select it for fish names. Revisit the mapping if Google's live field definition groups that data under a broader category. Do not select “no data collected” for this extension.

### Data-use certifications

For the current implementation, the three standard certifications are consistent with its behavior:

- No sale or transfer of user data to third parties outside permitted uses.
- No use or transfer for purposes unrelated to the extension's single purpose.
- No use or transfer for creditworthiness or lending decisions.

The publisher must confirm these also match their actual business/support practices. Do not certify broader security guarantees that have not been implemented.

## 4. Reviewer test instructions — paste this

```text
No account, password, payment or special service access is required.

1. Install the extension. The welcome page opens. If needed, open the toolbar popup and choose Open aquarium.
2. Click Start my aquarium and allow the optional history and tabs permissions in Chrome's native permission prompt. Recording is not enabled until onboarding and permissions are complete.
3. Visit https://example.com and https://wikipedia.org in ordinary, non-incognito tabs. Then revisit one of those sites. The extension records only new visits; it does not backfill existing browsing history.
4. Open the toolbar popup and choose Open aquarium. Search for a visited hostname or choose Species. Click a fish to inspect its recorded visits, discovery/last-seen times and approximate active time.
5. Choose Name fish, save a nickname, close the aquarium and reopen it. The name should remain. Drag a visible fish and release it; it resumes swimming from that point. Its position is temporary.
6. To check approximate active time, leave an already discovered site's tab active in a focused browser window for about 60 seconds, then inspect that fish. The aquarium dashboard itself does not accrue browsing time. This is a focused-tab estimate, not a measure of attention.
7. Settings lets you pause visit recording and active-time estimation separately. Export/import and reset affect extension-owned local data only. Reset does not clear Chrome history.

Repeated visits gradually increase fish size with an upper cap. When the tank reaches its window-dependent capacity, least-visited fish stop swimming but remain searchable. Selecting one temporarily brings it back into view. These effects require accumulated visits/domains and are not immediately visible in a new empty aquarium.

All logic and assets are packaged locally. No backend, account or remote code is needed. Incognito is disabled. Browsing data is not transmitted by the extension.
```

## 5. Images to upload

| Asset | Required preparation |
| --- | --- |
| Store icon | 128×128 PNG. `public/icon128.png` exists; review its padding against Google's icon guidance before upload. |
| Screenshots | At least one; up to five. Capture at **1280×800**, square corners, full bleed. 640×400 is also documented. |
| Small promotional tile | **440×280** PNG or JPEG; required. Needs preparation. |
| Marquee promotional tile | **1400×560**; optional. |

Recommended screenshot sequence: main aquarium, named-fish details, species directory, and privacy/settings controls. Use synthetic example data and identify it as example data; never expose personal history. Existing `docs/preview.png` and `docs/named-fish.png` are QA references, not a prepared store image set: they are 1440×960 and show development-preview state. Recapture at the required size instead of stretching them. No final store screenshots or promotional tile were generated as part of this information worksheet.

Dimensions and requirements: [Google's image guide](https://developer.chrome.com/docs/webstore/images).

## 6. Distribution and submission

- Pricing: **Free**, for the current build.
- Visibility: **Public** for a searchable launch; **Unlisted** if you want to share an installation link before a searchable launch. Both undergo review. Private is available for restricted testers.
- Regions: choose the regions you intend to support. English is the current UI language.
- Test login/credentials: **Not required**.
- Automatic publishing: turn it off if you want to inspect the approved listing before making it live. Google documents a limited staged-publication window after approval.

See [distribution](https://developer.chrome.com/docs/webstore/cws-dashboard-distribution) and [submission/deferred publishing](https://developer.chrome.com/docs/webstore/publish). Nothing in this worksheet submits or publishes the extension.

## 7. Items to finish before submission

1. Fill in the publisher/contact fields in the policy draft and host it at a publicly accessible HTTPS URL. Supply working homepage/support links if you choose to include them.
2. Prepare the store screenshots and small promotional tile described above.
3. Complete a manual native Chrome permission test: deny, retry, allow, then confirm a new visit appears. Also check normal minimize/app-focus/sleep/restart behavior. Automated build, 32 logic tests, browser growth/crowding/drag/name tests and earlier isolated tracking tests are recorded in `VALIDATION.md`; native consent acceptance has not been automated.
4. Resolve a security-policy interpretation before making an encryption claim: this build uses ordinary `chrome.storage.local` with no application-level encryption. Google's current User Data FAQ mentions encryption at rest, while its handling-policy page states a broader secure-handling duty. The draft accurately discloses the current storage behavior. Review that requirement for this local browsing-metadata design or obtain clarification from Chrome Web Store support before declaring it compliant; do not claim encrypted storage or guaranteed approval. Sources: [FAQ, question 9](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq), [handling requirements](https://developer.chrome.com/docs/webstore/program-policies/data-handling).
5. Upload only the production ZIP, confirm version/permissions in Package, paste the sections above, and review any dashboard warnings before submitting.
