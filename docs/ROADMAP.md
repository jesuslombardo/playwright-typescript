# Master Roadmap

Living plan for this integrative learning + portfolio project.
Updated when priorities or status change.

For chronological history, see [BUILD_LOG.md](BUILD_LOG.md).
For design details, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## Priority order (what to build next)

| Order | Phase / topic                           | Why this order                                 |
| ----- | --------------------------------------- | ---------------------------------------------- |
| **1** | ~~**Phase 4 — CI/CD**~~                 | ✅ Complete — CI + CD MVP (GitHub Pages)       |
| **2** | **Phase 3 — Hooks + reporting**         | Local quality + richer reports; complements CI |
| **3** | **Data layer (`data/`)**                | When test data volume becomes painful          |
| **4** | **Phase 5 — Tags, sharding, hardening** | Optimization once the suite grows              |

> **Learning rule:** one concept per session — explain → implement → document in BUILD_LOG.

---

## Status overview

```
✅ Phase 1   Bootstrap
✅ Phase 2   Automation (6 E2E, POM, fixtures, 4 ADRs)
✅ Phase 4   CI/CD (GitHub Actions + GitHub Pages CD)
🟡 Phase 3   Hooks ✅ (Husky) + anti-flaky ✅ (ADR-005) · reporting 💤 NTH
⬜ data/     Structured test data layer
🟡 Phase 5   Docker ✅ · tags ✅ · API tests + pyramid ✅ · sharding/matrix ⬜
```

---

## What's done

### Phase 1 — Bootstrap ✅

| Item                                | Status |
| ----------------------------------- | ------ |
| Git + remote                        | ✅     |
| Node + TypeScript + `tsconfig.json` | ✅     |
| Playwright setup                    | ✅     |
| ESLint + Prettier                   | ✅     |
| Format/lint on save (`.vscode/`)    | ✅     |

### Phase 2 — Automation Foundation ✅

| Item                                                                        | Status |
| --------------------------------------------------------------------------- | ------ |
| Layered folders (`pages/`, `components/`, `fixtures/`, `utils/`, `config/`) | ✅     |
| Sauce Demo E2E flows (6 tests)                                              | ✅     |
| POM + components + auth fixture                                             | ✅     |
| `ARCHITECTURE.md` + 4 ADRs                                                  | ✅     |

### Phase 4 — CI/CD ✅

| Item                                                   | Status |
| ------------------------------------------------------ | ------ |
| GitHub Actions workflow (`.github/workflows/ci.yml`)   | ✅     |
| Job `quality`: ESLint + Prettier check                 | ✅     |
| Job `test`: Playwright on push + PR                    | ✅     |
| `needs: quality` — test waits for lint/format          | ✅     |
| 3 browsers in CI (`CI=true` in `playwright.config.ts`) | ✅     |
| Debug artifact on failure only (`if: failure()`)       | ✅     |
| Screenshot + video on failure in CI                    | ✅     |
| Secrets pattern (`SAUCE_*` env vars)                   | ✅     |
| **CD MVP:** report published to GitHub Pages on `main` | ✅     |
| CI badge in README                                     | ✅     |
| BUILD_LOG Step 15                                      | ✅     |
| Node 22                                                | ✅     |

**Concepts learned (Phase 4):**

- `jobs` vs `steps`
- VMs running in parallel vs `needs` (sequential dependency)
- Artifacts (`upload-artifact` on failure)
- GitHub Pages CD (`upload-pages-artifact` + `deploy-pages`)
- `if:` conditions (`failure()`, branch, event)
- Secrets vs hardcoded credentials
- GitHub Actions pricing (free tier for public repos)
- `gh run watch`

**CI vs CD in this repo**

|              | CI                         | CD (MVP)                           |
| ------------ | -------------------------- | ---------------------------------- |
| **Question** | Does the code pass checks? | Where can others see the result?   |
| **When**     | Every push + PR            | Push to `main` only                |
| **How**      | lint → test                | `deploy-report` → GitHub Pages     |
| **Link**     | Actions tab                | `https://<user>.github.io/<repo>/` |

---

## Phase 3 — Quality & Reporting (~2–3 sessions)

Next **large** phase.

| Item                    | Purpose                                        | Status         |
| ----------------------- | ---------------------------------------------- | -------------- |
| **Husky + lint-staged** | Lint/format automatically before each commit   | ✅             |
| **Anti-flaky strategy** | Web-first assertions, no hard waits, ADR-005   | ✅             |
| **Allure / Monocart**   | Richer reports (Monocart = JS-native, no Java) | 💤 NTH (later) |
| **Dual reporter**       | HTML locally + something clearer in CI logs    | 💤 NTH (later) |

**Already in place (formalize + document):**

- `retries: 2` on CI
- `forbidOnly` on CI
- `trace: on-first-retry`
- `screenshot` / `video` on failure

---

## Data layer — `data/` (when it hurts)

Introduce when static config in `config/` is not enough.

| Item                      | Purpose                                             |
| ------------------------- | --------------------------------------------------- |
| `data/` folder            | JSON/CSV/fixtures for complex or many test datasets |
| Separation from `config/` | Config = env/URLs; data = scenarios                 |

---

## Phase 5 — Hardening (when the framework grows)

| Item                             | Purpose                                                                        | Status       |
| -------------------------------- | ------------------------------------------------------------------------------ | ------------ |
| **Playwright Docker image**      | Fixed slow CI — preinstalled browsers + OS deps (Step 21)                      | ✅           |
| **Tags (`@smoke`)**              | Smoke → regression staging in CI (Step 22)                                     | ✅           |
| **API tests + testing pyramid**  | API tests gate E2E in CI (pyramid: API → smoke → regression)                   | ✅ (Step 24) |
| **Cross-repo integration check** | App PRs run API + smoke vs the PR app — required gate (Step 25)                | ✅           |
| **Execution cadence**            | Fast PR gate (API+smoke) + nightly cross-browser regression (Step 26, ADR-007) | ✅           |
| Sharding                         | Split suite across parallel CI jobs (faster)                                   | ⬜           |
| Matrix                           | Multiple Node versions                                                         | ⬜           |
| `CONTRIBUTING.md`                | Two-repo flow + onboarding (Step 25)                                           | ✅           |
| More domains                     | Visual regression, more E2E flows, etc.                                        | ⬜           |

**Note — API tests + testing pyramid (DONE, Step 24):**

`quality → api → smoke → regression → deploy-report` (pyramid: cheap/low-level first, fail-fast).

- **Sauce Demo has no public API**, which made a _real_ pyramid impossible. Decision: **build our own SUT**, [`demo-shop-app`](https://github.com/jesuslombardo/demo-shop-app) (Express + SQLite + JWT + Swagger + vanilla UI), in a separate repo. See [ADR-006](adr/006-custom-sut-and-testing-pyramid.md).
- Now API and E2E hit the **same app** — a genuine contract, not just a capability demo.
- Playwright API testing uses the `request` fixture (no browser): `await request.get(url)` + `expect(res.ok())`. The `api` project runs these once (browserless); browser projects ignore them.
- Each CI job checks out `demo-shop-app` into `./app` and starts it ephemerally via `webServer`.

**Note — CI run time (SOLVED in Step 21):**

A green run was ~10 min while the tests only ran ~30s — the cost was the install step.

- **Root cause:** `--with-deps` runs `apt-get` for browser OS libraries (~7 min) on a blank runner, every run. NOT cacheable with `actions/cache` (system packages, not files). Caching the browsers alone saved only ~42s and was reverted (Step 16).
- **Fix (done):** run the `test` job in Playwright's official container — browsers + OS deps are preinstalled, so the install step is gone. **Result: ~10 min → ~1m9s.**
- **Gotcha hit + fixed:** Firefox wouldn't launch as root (`$HOME` ownership). Solved with `options: --user 1001`. See BUILD_LOG Step 21.

```yaml
test:
  runs-on: ubuntu-latest
  container:
    image: mcr.microsoft.com/playwright:v1.61.0-jammy # MUST match installed Playwright version
    options: --user 1001 # run as the runner user so $HOME ownership is consistent
  # no `playwright install` step needed — image already has browsers + OS deps
```

> Lesson: `timeout-minutes` is a fuse, not a speed lever. The container image (done) + sharding (when the suite grows) are what actually control run time. See [BUILD_LOG.md](BUILD_LOG.md) Steps 16 & 21.

---

## Session picker

| Option                    | Duration | Outcome                                         |
| ------------------------- | -------- | ----------------------------------------------- |
| ~~**A — Close Phase 4**~~ | ✅ Done  | CI + CD MVP + BUILD_LOG Step 15                 |
| **B — Start Phase 3**     | ~45 min  | Husky + lint-staged — save → commit → hook → CI |

**Recommendation:** Option B — Husky next.

---

## Portfolio pitch (updated)

> Playwright + TypeScript framework with POM, fixtures, cross-browser CI, GitHub Actions (lint / format / tests), failure debug artifacts, secrets-ready config, and **live HTML reports on GitHub Pages (CD)**.

Phase 3 and Phase 5 move this from **"solid learning repo"** to **"production-ready patterns"**.

---

## Map: where to find each concept in the repo

| Concept                        | Where                                              |
| ------------------------------ | -------------------------------------------------- |
| Page Object Model              | `pages/`, ADR-001                                  |
| Components vs fixtures         | `components/`, `fixtures/`, ADR-004                |
| Browser strategy (local vs CI) | `playwright.config.ts`, ADR-002                    |
| Code style                     | ESLint/Prettier, ADR-003                           |
| CI pipeline                    | `.github/workflows/ci.yml`                         |
| CD (GitHub Pages)              | job `deploy-report` in `ci.yml`                    |
| Secrets pattern                | `config/environments.ts`, workflow `env:`          |
| Local secrets (`.env`)         | `.env.example`, `playwright.config.ts` (dotenv)    |
| CI run time (Docker fix)       | BUILD_LOG Step 16, Phase 5 (cache tried+reverted)  |
| Pre-commit hook (Husky)        | `.husky/pre-commit`, `package.json` lint-staged    |
| Node version pinning           | `.nvmrc`, `package.json` engines                   |
| Anti-flaky strategy            | ADR-005, `playwright.config.ts` (retries/traces)   |
| API tests (`request` fixture)  | `tests/api/`, `api` project, BUILD_LOG Step 24     |
| Testing pyramid (API → E2E)    | `.github/workflows/ci.yml`, ADR-006                |
| System Under Test (own app)    | `demo-shop-app` repo, ADR-006, BUILD_LOG Step 23   |
| Ephemeral SUT (`webServer`)    | `playwright.config.ts`, `app:setup` script         |
| Cross-repo integration gate    | `demo-shop-app/.github/workflows/e2e.yml`, Step 25 |
| Execution cadence (PR/nightly) | ADR-007, `.github/workflows/nightly.yml`, Step 26  |
| Two-repo contributor flow      | `CONTRIBUTING.md`                                  |
| Branch protection / PR gate    | GitHub branch rules, BUILD_LOG Steps 20, 25        |
| Build history                  | `docs/BUILD_LOG.md` Steps 1–26                     |
| This plan                      | `docs/ROADMAP.md`                                  |
