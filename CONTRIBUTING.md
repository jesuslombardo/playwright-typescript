# Contributing

This project is **two repositories** working together:

| Repo                                                                                         | Role                                                            |
| -------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| [`playwright-typescript`](https://github.com/jesuslombardo/playwright-typescript) (this one) | The test framework — API + E2E tests                            |
| [`demo-shop-app`](https://github.com/jesuslombardo/demo-shop-app)                            | The **System Under Test (SUT)** — the app the tests run against |

See [ADR-006](docs/adr/006-custom-sut-and-testing-pyramid.md) for why it's split this way.

## Local setup

```bash
nvm use                 # Node 22 (see .nvmrc)
npm ci                  # framework dependencies
npx playwright install chromium webkit   # chromium (desktop + Pixel), webkit (iPhone mobile)
npm run app:setup       # clone + install the SUT into ./app (gitignored)
```

`app:setup` is idempotent — re-run it any time to pull the latest app.

## Running tests

```bash
npm run test:api         # API layer (request fixture, browserless)
npm run test:smoke       # @smoke E2E (critical path)
npm run test:regression  # full E2E (excludes @api)
npm test                 # everything (api + e2e)
npm run test:cross-browser   # all three browsers locally
```

`npm test` and `npm run test:regression` also run the **mobile** projects —
`mobile-safari` (iPhone 13 / WebKit) and `mobile-chrome` (Pixel 7 / Chromium);
see [ADR-015](docs/adr/015-mobile-device-emulation.md). WebKit must be installed
(see Local setup) for `mobile-safari` to run.

Playwright's `webServer` starts the app from `./app` automatically. To target an
already-running instance instead, set `BASE_URL` (this skips `webServer`):

```bash
BASE_URL=http://localhost:3000 npm run test:regression
```

## Branching & PRs

`main` is protected — all changes go through a **branch → PR → green CI → merge**.
The CI is the testing pyramid:

```
quality → api → smoke → regression → deploy-report (CD, main only)
```

### Changing only this repo (the common case)

Nothing special — your normal flow:

```bash
git checkout -b feat/my-change
# ... edit tests / pages / config ...
npm run test:regression          # validate locally (uses ./app)
git push -u origin feat/my-change
# open a PR; the pyramid runs and gates the merge
```

CI checks out `demo-shop-app` **at the pinned tag** (`.app-version`, not `@main`)
and starts it ephemerally — you don't touch the app. See
[ADR-013](docs/adr/013-cross-repo-version-pinning.md).

### Changing the app too (the cross-repo rule) ⚠️

CI runs against a **pinned app version** (`.app-version`), so a new app change is
adopted **on purpose**:

1. PR in `demo-shop-app` → merge to its `main`.
2. **Tag a release** there: `git tag -a vX.Y.Z -m "…" && git push origin vX.Y.Z`.
3. PR here that **bumps `.app-version` to `vX.Y.Z`** (alongside the new/updated
   test) → CI now runs against the new app version.

To validate an app branch/tag **before** bumping the pin, point your local `./app`
at it (note: `npm run app:setup` re-clones the pinned tag, so do this after):

```bash
cd app && git fetch --tags origin && git checkout <app-branch-or-tag> && cd ..
npm run test:regression
```

> The **nightly** deliberately runs against `demo-shop-app@main` (not the pin) as a
> drift detector: if it fails while pinned CI is green, the pin is behind — bump it.

## Cross-repo integration check

The app repo doesn't only run its own unit tests — every **PR in `demo-shop-app`**
also runs **this framework's API + `@smoke` suite against that PR's app version**
(workflow: `demo-shop-app/.github/workflows/e2e.yml`, a required check). So an app
change that breaks the contract or a critical path is caught **before** `main`.

```
demo-shop-app PR ──▶ checks out playwright-typescript @ main
                 ──▶ uses the PR's app as the SUT
                 ──▶ runs API (gate) → @smoke   ✅/❌ on the PR  (fast)
```

This is why "merge the app first" is safe: the app can't merge a change that
breaks the critical paths.

## Execution cadence (what runs when)

The full cross-browser regression is **not** run on every PR — it's scheduled.
See [ADR-007](docs/adr/007-test-execution-cadence.md).

| Trigger                                | What runs                                                                    |
| -------------------------------------- | ---------------------------------------------------------------------------- |
| **App PR**                             | API + `@smoke` (fast gate)                                                   |
| **This repo's PR**                     | Full pyramid (API → smoke → regression)                                      |
| **Push to `main`** (this repo)         | Full pyramid + CD (report → Pages)                                           |
| **Push to `main`** (app repo)          | App CI → deploy **staging** → smoke → **approval** → deploy **prod** → smoke |
| **Nightly** (`nightly.yml`, 06:00 UTC) | API + full **cross-browser** regression vs. app `@main`                      |

Run the nightly on demand from the Actions tab (**Run workflow**) or:

```bash
gh workflow run nightly.yml
```

## Secrets

Config uses `process.env.X || default`, so the same code works with or without secrets:

- **Public values** (e.g. the demo creds `standard_user` / `secret_sauce`) ship as
  committed defaults — nothing to hide.
- **Sensitive values** come from a **GitHub Secret** in CI and a gitignored `.env`
  locally; never committed. Example: **`JWT_SECRET`** (the SUT's JWT signing key) is
  injected from a Secret in CI and forwarded to the app via `playwright.config.ts`
  (`webServer.env`); locally it falls back to the app's default.

`env:` can be scoped at **job** level (only where needed) or **workflow** level
(shared by all jobs) — see `ci.yml` / `nightly.yml`. To prove a secret is wired
without leaking it: `echo "X provided -> ${X:+yes}"` (GitHub also masks secret values in logs).

## Deployment (CD: staging → production with an approval gate)

On every green `main`, the **app** repo promotes the **same commit** through two
environments with a human checkpoint between them:

```
… → deploy STAGING → smoke staging → ⏸ manual approval → deploy PRODUCTION → smoke prod
```

See [ADR-010](docs/adr/010-deploy-to-environment-and-post-deploy-smoke.md) (deploy +
verify) and [ADR-012](docs/adr/012-staging-production-promotion-gate.md) (promotion +
gate). The pipeline is wired in code (`demo-shop-app/ci.yml`); the hosts + the gate
are a **one-time manual setup**. To reproduce on a fork:

1. Two Render **Web Services** (`…-staging` and production) from the app repo —
   native Node: build `npm ci`, start `npm start`, health `/health`,
   **Auto-Deploy off**, env `JWT_SECRET` + `NODE_VERSION=22` (`render.yaml` is the
   Blueprint for one).
2. Two **GitHub Environments** in the app repo:
   - `staging` — no rule.
   - `production` — **Required reviewers** = you (this is the approval gate; the
     `deploy-production` job pauses until you approve in the Actions tab).
3. Secrets/variables in the **app** repo:
   - staging: secret `RENDER_STAGING_DEPLOY_HOOK_URL`, variable `RENDER_STAGING_URL`.
   - production: secret `RENDER_DEPLOY_HOOK_URL`, variable `RENDER_APP_URL`.

Without these the CD jobs fail on `main` (they're skipped on PRs). The free tier
sleeps after ~15 min idle (~50s cold start), so readiness waits until the deployed
commit **and** `/` **and** `/api/products` are 200 before smoking, not just `/health`.

## Visual regression

`tests/visual/` holds screenshot tests (`toHaveScreenshot`). Baselines are
**environment-specific** (fonts/anti-aliasing), so they are generated in the
**same Playwright Docker image CI uses** — never with a raw `--update-snapshots`
on your machine, which would commit a PNG that fails in CI. See
[ADR-011](docs/adr/011-visual-regression-baseline-strategy.md).

After an intentional UI change, regenerate the baseline:

```bash
docker run --rm -v "$PWD":/work -w /work \
  -e BASE_URL=https://demo-shop-app-mlkv.onrender.com \
  --user "$(id -u):$(id -g)" -e HOME=/tmp \
  mcr.microsoft.com/playwright:v1.61.0-jammy \
  npx playwright test tests/visual --project=chromium --update-snapshots
```

Then run it again **without** `--update-snapshots` (still in the image) to confirm
it's deterministic, and commit the updated PNG.

## Test data

Scenario data lives in **`data/`**, separate from `config/` (environment + env-backed
credentials). See [`data/README.md`](data/README.md) and [ADR-014](docs/adr/014-test-data-layer.md).

- **Need unique data your test creates?** Use the factory:
  `buildProduct({ price: 0 })` — faker fills the rest, uniqueness is guaranteed.
- **Adding a validation/login case?** Add a row to `data/products.dataset.ts` or
  `data/auth.dataset.ts` (with its `expectedStatus`) — it becomes a test automatically.
  Keep `expectedStatus` matching the app's **real** behaviour.
- **Need a pre-existing entity?** Use the `apiProduct` fixture
  (`fixtures/product.fixture.ts`) — it creates via API and cleans up after, even on failure.

## Microservices mode (optional, advanced)

The SUT can run **split into services** instead of as one process — the teaching
vehicle for the microservices-testing module (contract testing, etc.). It is
**purely additive**: the monolith is the default and is unaffected.

```bash
# in the demo-shop-app repo — start the split stack:
docker compose up --build       # gateway:3000 + auth:3001 + products:3002

# in THIS repo — point the suite at the gateway:
npm run test:micro              # BASE_URL=http://localhost:3000, api project
```

- **Same code, two compositions** — `app.js` exposes `mount*()` helpers; the
  monolith mounts all, each service mounts only its slice. Logic is shared, not forked.
- **The gateway is the single front door** the same-origin UI forces
  (`/api/login`→auth, everything else→products).
- **Cross-service trust is local** — auth signs JWTs, products verifies them with
  the shared `JWT_SECRET` (HS256); auth isn't called per request.
- The same `BASE_URL` makes the **whole suite topology-agnostic** — it runs
  unchanged against monolith or microservices. See [ADR-016](docs/adr/016-auth-service-split-microservices-mode.md).

## Conventions

- **Language:** all code, comments, commit messages and docs are written in
  English (consistency over preference) — keep it uniform across both repos.
- **Actions** live in page/component methods; **assertions** live in tests.
- **Selectors** via `data-test` (`page.getByTestId(...)`), never raw CSS in specs.
- No hard waits / `networkidle` — web-first assertions only (see [ADR-005](docs/adr/005-anti-flaky-test-strategy.md)).
- Prettier + ESLint run on every commit (Husky + lint-staged) and in CI.
- Tag critical-path E2E with `{ tag: '@smoke' }`; API specs are `*.api.spec.ts` (auto `@api`).
