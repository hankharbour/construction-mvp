# Dead On Pro development demo

Public sample-data workspace. Brand provisional. Product requirements: [PRODUCT_SPEC.md](PRODUCT_SPEC.md). Audit and priorities: [technical backlog](docs/TECHNICAL_BACKLOG.md).

Requires Node 24. Run `npm ci`, then `npm run dev` and open `/construction-mvp/`. For validation use `npm run check` (types, unit tests, production build and desktop/mobile Chromium tests against the production build). On Linux, tests use `/usr/bin/chromium`; set `CHROMIUM_PATH` for another installed browser. CI installs Playwright's browser. Run `npx playwright install --with-deps chromium` for CI-style setup.

`npm run build` creates only public assets under `dist/`, with the `/construction-mvp/` Pages base. Workflows validate PRs and gate the existing main-branch deployment with checks. Do not upload customer plans or financial records. Drawing files are processed locally; estimate items and pricing settings use browser localStorage. Export sessions to preserve drawings' measurement geometry, then reopen the exact original drawing to restore.

UI modules live under `src/`; pure tested calculations live in `src/domain.js`, with TypeScript model contracts in `src/models.ts`. Estimates are unverified material/labor allowances, not approved bids or tax/accounting advice. The 3D preview remains conceptual.
