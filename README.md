# HiredSignal Browser Extension

One-click apply with the **right** CV — the tailored one HiredSignal already generated for the job you're looking at.

## What it does

When you land on a job application page on a supported ATS, the extension:

1. Detects the job from the page URL and metadata.
2. Looks up the matching tailored CV in your HiredSignal account.
3. Fills the application form — name, contact, work history, attachments, custom questions — using the answers HiredSignal stored for that specific role.
4. Leaves the final submit click to you.

You never paste the same name, email, or "why this company" answer twice.

## Supported ATS

The extension activates on:

- Workday (`*.myworkdayjobs.com`, `*.myworkdaysite.com`)
- Greenhouse (`boards.greenhouse.io`, `boards.eu.greenhouse.io`, `job-boards.greenhouse.io`)
- Lever (`jobs.lever.co`)
- Ashby (`jobs.ashbyhq.com`)
- SmartRecruiters (`jobs.smartrecruiters.com`)
- Workable (`apply.workable.com`, `jobs.workable.com`)

Lever, Ashby, SmartRecruiters, and Workable adapters are landing across follow-up PRs — the host matchers and registry slots are reserved.

## Requirements

- A HiredSignal account at [hiredsignal.com](https://hiredsignal.com).
- A Personal Access Token (PAT) — generate one at `https://hiredsignal.com/account/api-tokens`.
- Chrome, Edge, Brave, or another Chromium browser that supports Manifest V3 unpacked extensions.

## Install (load unpacked)

```bash
git clone https://github.com/michaeltabet/hs-extension.git
cd hs-extension
npm install
npm run build
```

This produces a `dist/` directory.

Then in your browser:

1. Open `chrome://extensions`.
2. Toggle **Developer mode** on (top-right).
3. Click **Load unpacked**.
4. Pick the `dist/` folder.

The HiredSignal icon will appear in your toolbar.

## Auth flow

1. Click the extension icon and open settings.
2. Paste your HiredSignal PAT.
3. The extension exchanges the PAT for a scoped session and stores it in `chrome.storage.local`.
4. On any supported application page, the extension calls the HiredSignal API to fetch the tailored CV + per-question answers for the matched job and fills the form.

The PAT never leaves your machine except to talk to `hiredsignal.com`. No analytics, no third-party telemetry.

## Development

```bash
npm start          # webpack --watch, rebuilds dist/ on save
npm run start:local # watch build with feedback posted to localhost:4002
npm run build      # one-shot production build
npm run build:local # production build with feedback posted to localhost:4002
```

After `npm start`, reload the unpacked extension in `chrome://extensions` to pick up changes.

For local feedback testing, run the feedback API on `http://localhost:4002`
and load the extension from `dist/` after `npm run build:local`.

### Project layout

```
src/
  background/                  service worker (auth, API calls, storage)
  contentScript/               bridge between page and extension context
  inject/                      injected into the page; owns form-fill logic
    inject.ts                  per-host adapter registry
    app/
      services/formFields/     one subdir per ATS adapter
      FieldWidget/             per-field React UI
      MoreInfoPopup/           settings & inspect UI
  popup/                       toolbar popup React app
  shared/                      cross-context helpers
  static/                      manifest.json + icons
```

### Adding an ATS adapter

1. Create `src/inject/app/services/formFields/<ats>/index.ts` exporting `RegisterInputs: (node: Node) => Promise<void>`.
2. Add an entry to `inputRegistrars` in `src/inject/inject.ts` keyed by hostname.
3. Add the host pattern to `content_scripts[0].matches` and `web_accessible_resources[0].matches` in `src/static/manifest.json`.
4. Implement field discovery + filling using the patterns in the existing `greenhouse/` or `workday/` adapters.

## Credits

Built on top of [`berellevy/job_app_filler`](https://github.com/berellevy/job_app_filler) (BSD-3-Clause). The original project provided the injected-script architecture, field discovery loop, and Workday + Greenhouse adapters. This fork rebrands the surface, wires it to the HiredSignal API, and extends ATS coverage.

## License

BSD-3-Clause — see [LICENSE.md](LICENSE.md).
