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
also runs **this framework's API + E2E suite against that PR's app version**
(workflow: `demo-shop-app/.github/workflows/e2e.yml`, a required check). So an app
change that would break the tests is caught **before** it reaches `main`.

```
demo-shop-app PR ──▶ checks out playwright-typescript @ main
                 ──▶ uses the PR's app as the SUT
                 ──▶ runs API (gate) → E2E   ✅/❌ on the PR
```

This is why "merge the app first" is safe: the app can't merge a change that
breaks the consumer's tests.

## Conventions

- **Actions** live in page/component methods; **assertions** live in tests.
- **Selectors** via `data-test` (`page.getByTestId(...)`), never raw CSS in specs.
- No hard waits / `networkidle` — web-first assertions only (see [ADR-005](docs/adr/005-anti-flaky-test-strategy.md)).
- Prettier + ESLint run on every commit (Husky + lint-staged) and in CI.
- Tag critical-path E2E with `{ tag: '@smoke' }`; API specs are `*.api.spec.ts` (auto `@api`).
