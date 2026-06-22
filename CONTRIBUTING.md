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

| Trigger                                | What runs                                               |
| -------------------------------------- | ------------------------------------------------------- |
| **App PR**                             | API + `@smoke` (fast gate)                              |
| **This repo's PR**                     | Full pyramid (API → smoke → regression)                 |
| **Push to `main`** (this repo)         | Full pyramid + CD (report → Pages)                      |
| **Nightly** (`nightly.yml`, 06:00 UTC) | API + full **cross-browser** regression vs. app `@main` |

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

## Conventions

- **Language:** all code, comments, commit messages and docs are written in
  English (consistency over preference) — keep it uniform across both repos.
- **Actions** live in page/component methods; **assertions** live in tests.
- **Selectors** via `data-test` (`page.getByTestId(...)`), never raw CSS in specs.
- No hard waits / `networkidle` — web-first assertions only (see [ADR-005](docs/adr/005-anti-flaky-test-strategy.md)).
- Prettier + ESLint run on every commit (Husky + lint-staged) and in CI.
- Tag critical-path E2E with `{ tag: '@smoke' }`; API specs are `*.api.spec.ts` (auto `@api`).
