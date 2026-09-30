# Internet Aquarium Privacy Policy

Publisher preparation note: replace **[PUBLISHER NAME]**, **[SUPPORT EMAIL]** and **[EFFECTIVE DATE]**, then remove this note before hosting. This draft describes version 1.2.0 as implemented. Hosting this policy and confirming the publisher's actual support practices remain to be done.

Effective date: **[EFFECTIVE DATE]**

Internet Aquarium is provided by **[PUBLISHER NAME]**. It turns the websites you visit into a personal aquarium using information stored in your browser profile. No account is required.

## Information the extension handles

After you start your aquarium and grant the requested Chrome permissions, the extension uses new browsing-history events to identify website hostnames and record visits. It uses active-tab and browser-window metadata to estimate time spent with a website tab active in a focused window.

It stores the following information locally:

- Website hostnames, including meaningful subdomains, first and last recorded visit timestamps, visit counts and approximate active browsing time.
- Fish identity seeds, generated categories, creation timestamps, pins and any custom fish names you enter.
- Aquarium settings, onboarding status and the last time you opened the aquarium.
- A temporary session timing checkpoint containing a hostname and timestamp.

Full URLs are processed briefly to identify the hostname. URL paths, query strings, fragments and webpage titles are not saved in aquarium records. Existing browsing history is not imported. Incognito browsing is excluded. The extension does not read webpage contents, forms, passwords, cookies, messages or payment information, and it does not collect location through a location service.

Approximate active time measures focused-tab time, not your attention, keystrokes or exact screen time. The extension does not log clicks or typing on websites. Mouse and touch interaction inside the aquarium is used to move fish, not recorded as browsing analytics.

## How information is used

The extension uses hostname summaries to create distinctive fish, count visits, adjust growth and maturity, reflect recent activity, manage the visible population, and show fish details and the species directory. Names, pins and settings personalize your aquarium. Session checkpoints support approximate timing when Chrome suspends the background worker.

## Local storage and sharing

Aquarium records are stored using Chrome's local extension storage. Temporary timing checkpoints use session storage. Internet Aquarium does not use Chrome's storage sync service, operate a cloud backend, or send aquarium data to the publisher or third parties. It contains no advertising, analytics or telemetry service and does not sell browsing data.

Local storage is not an application-encrypted vault. Someone with access to your browser profile or an exported JSON file may be able to read the stored information. The extension's local-only design does not control browser-profile backups or other software on your device.

If you choose Export aquarium data, the extension creates a local JSON download containing your aquarium records, custom names and settings. You control where that file is stored and whether you share it. Import reads a JSON file you choose and replaces aquarium data after confirmation. Capture aquarium saves a PNG of the tank artwork without the interface's website labels or detail panels.

## Your choices and retention

You can pause new visit recording and approximate active-time tracking separately in Settings. Disabling visit recording does not disable the separate active-time setting. You can rename fish, clear custom names, export your records, replace them through import, or use Reset aquarium to remove the extension's saved aquarium data and timing checkpoint.

Records remain locally until reset, replaced through import, or removed through Chrome's extension-data controls or extension removal. Fish resting outside the visible tank still have saved records. Reset pauses recording and returns to onboarding; it does not change Chrome's browsing history or revoke previously granted browser permissions. You can revoke permissions or remove the extension through Chrome. Exported files remain wherever you saved them until you delete them yourself.

## Permissions

- **Storage:** saves aquarium records and settings locally and maintains a temporary timing checkpoint.
- **Alarms:** periodically saves approximate active browsing time.
- **History, requested optionally:** observes new visit events to discover websites and update their fish. The extension does not delete or modify Chrome history.
- **Tabs, requested optionally:** identifies the active website for approximate timing and the current-site fish in the toolbar popup. It does not read webpage contents.

## Limited use

Internet Aquarium uses browsing information only to provide its personal aquarium features, in accordance with the Chrome Web Store User Data Policy's Limited Use restrictions. Aquarium data is not used for advertising, unrelated profiling, creditworthiness or lending decisions, and is not sold or automatically transferred to third parties. The publisher has no remote access to your locally stored aquarium.

## Contact and support

Contact **[SUPPORT EMAIL]** with questions about this policy. If you choose to contact the publisher, your email provider and the publisher's email provider handle the message you send. Avoid including browsing exports or sensitive website details unless needed for your support request. The extension does not automatically attach them. Information you voluntarily provide for support is used to respond to that request.

## Changes

This policy may be updated when the extension's behavior changes. The effective date above identifies the current policy. Material changes to data handling will be described before asking you to enable functionality requiring additional access.
