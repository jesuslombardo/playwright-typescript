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

CI checks out `demo-shop-app` **@ main** on its own and starts it ephemerally —
you don't touch the app.

### Changing the app too (the cross-repo rule) ⚠️

If a test depends on an app change, **merge the app first**, because this repo's
CI always runs against `demo-shop-app` **@ main**:

1. PR in `demo-shop-app` → merge to its `main`.
2. PR here with the new/updated test → its CI now sees the app change.

To validate an app branch **before** merging it, point your local `./app` at it:

```bash
cd app && git fetch origin && git checkout <app-branch> && cd ..
npm run test:regression
```

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

## Conventions

- **Language:** all code, comments, commit messages and docs are written in
  English (consistency over preference) — keep it uniform across both repos.
- **Actions** live in page/component methods; **assertions** live in tests.
- **Selectors** via `data-test` (`page.getByTestId(...)`), never raw CSS in specs.
- No hard waits / `networkidle` — web-first assertions only (see [ADR-005](docs/adr/005-anti-flaky-test-strategy.md)).
- Prettier + ESLint run on every commit (Husky + lint-staged) and in CI.
- Tag critical-path E2E with `{ tag: '@smoke' }`; API specs are `*.api.spec.ts` (auto `@api`).
