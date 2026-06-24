# Master Roadmap

Living plan for this integrative learning + portfolio project.
Updated when priorities or status change.

For chronological history, see [BUILD_LOG.md](BUILD_LOG.md).
For design details, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## Priority order (what to build next)

| Order     | Phase / topic                           | Why this order                                                    |
| --------- | --------------------------------------- | ----------------------------------------------------------------- |
| **1**     | ~~**Phase 4 — CI/CD**~~                 | ✅ Complete — CI + CD MVP (GitHub Pages)                          |
| **2**     | **Phase 3 — Hooks + reporting**         | Local quality + richer reports; complements CI                    |
| ~~**3**~~ | ~~**Data layer (`data/`)**~~            | ✅ Complete — factories + datasets + lifecycle (Step 36, ADR-014) |
| **4**     | **Phase 5 — Tags, sharding, hardening** | Optimization once the suite grows                                 |

> **Learning rule:** one concept per session — explain → implement → document in BUILD_LOG.

---

## Status overview

```
✅ Phase 1   Bootstrap
✅ Phase 2   Automation (6 E2E, POM, fixtures, 4 ADRs)
✅ Phase 4   CI/CD (GitHub Actions + GitHub Pages CD)
🟡 Phase 3   Hooks ✅ (Husky) + anti-flaky ✅ (ADR-005) · reporting 💤 NTH
✅ data/     Test data layer (factories + datasets + lifecycle, ADR-014)
🟡 Phase 5   Docker ✅ · tags ✅ · pyramid ✅ · sharding ✅ · matrix ✅ · CD ✅ · visual ✅ · staging→prod gate ✅ · app pin ✅
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

## Data layer — `data/` ✅ (Step 36, ADR-014)

Built out the `data/` layer once inline literals + `config/` were no longer enough.

| Item                         | Purpose                                            | Status |
| ---------------------------- | -------------------------------------------------- | ------ |
| `data/` folder               | Home for scenario data, separate from `config/`    | ✅     |
| Separation from `config/`    | Config = env/URLs; data = scenarios                | ✅     |
| Factory (`buildProduct`)     | Unique, faker-based synthetic data with overrides  | ✅     |
| Datasets (data-driven)       | Create + login cases — one row = one test          | ✅     |
| Lifecycle fixture            | `apiProduct` seeds via API + auto-cleans up        | ✅     |
| External-file dataset (CSV)  | CSV-sourced login matrix via `csv-parse` (Step 38) | ✅     |
| External-file dataset (JSON) | JSON-sourced PUT/update matrix, zero-dep (Step 40) | ✅     |

**Possible next (NTH):** more entities/factories, a faker seed for reproducible
random data, or larger-volume data generation for perf tests.

---

## Phase 5 — Hardening (when the framework grows)

| Item                                | Purpose                                                                                                                      | Status        |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------- |
| **Playwright Docker image**         | Fixed slow CI — preinstalled browsers + OS deps (Step 21)                                                                    | ✅            |
| **Tags (`@smoke`)**                 | Smoke → regression staging in CI (Step 22)                                                                                   | ✅            |
| **API tests + testing pyramid**     | API tests gate E2E in CI (pyramid: API → smoke → regression)                                                                 | ✅ (Step 24)  |
| **Cross-repo integration check**    | App PRs run API + smoke vs the PR app — required gate (Step 25)                                                              | ✅            |
| **Execution cadence**               | Fast PR gate (API+smoke) + nightly cross-browser regression (Step 26, ADR-007)                                               | ✅            |
| **App test tiers**                  | demo-shop-app unit → integration mini-pyramid in its own CI (Step 27)                                                        | ✅            |
| Sharding                            | Split regression across parallel shards + merge-reports (Step 30, ADR-008)                                                   | ✅ (didactic) |
| Matrix                              | `api` job over Node `[22, 24]` — compatibility matrix (Step 31, ADR-009)                                                     | ✅ (didactic) |
| **CD: deploy to environment**       | App deployed to Render + post-deploy smoke vs live URL (Step 32, ADR-010)                                                    | ✅            |
| **CD: staging → prod + gate**       | Promote same commit through staging → prod, manual approval gate (Step 34, ADR-012)                                          | ✅            |
| **Cross-repo version pinning**      | Test against a fixed app tag via `.app-version`, not `@main` (Step 35, ADR-013)                                              | ✅            |
| **SUT as a service container**      | Published GHCR image (now public) run as a CI `services:` container (Step 37, ADR-006)                                       | ✅ (didactic) |
| `CONTRIBUTING.md`                   | Two-repo flow + onboarding (Step 25)                                                                                         | ✅            |
| **Visual regression**               | One stable baseline of the login page, generated in CI's image (Step 33, ADR-011)                                            | ✅            |
| **Mobile mini-suite**               | iPhone 13 (WebKit) + Pixel 7 (Chromium) emulation — hamburger + 1-column layout, isolated like `api` (Step 39 + 41, ADR-015) | ✅            |
| **Microservices mode (auth split)** | Optional/additive: extract `auth-service` + gateway; same suite runs against both topologies (Step 42, ADR-016)              | ✅ (didactic) |
| **Contract testing (Pact)**         | Consumer-driven: `shop-web`→auth, build-breaking on drift — the marquee microservices skill (Step 43, ADR-017)               | ✅ (didactic) |
| **AI-assisted testing (opt-in)**    | LLM-as-judge (semantic coherence) + self-healing locators via Gemini; gated module, never in the CI gate (Step 45, ADR-019)  | ✅ (didactic) |
| More domains                        | More E2E flows, more visual coverage, etc.                                                                                   | ⬜            |

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

## Phase 6 — Production hardening: DevSecOps & governance (in progress)

The testing + CI/CD + architecture arc is complete. This phase closes the gap to a
**mature industry repo** by adding the adjacent disciplines the project had not yet
touched: supply-chain security, repo governance, observability, and a few marketable
test layers. Built one coherent theme per PR (1 PR = 1 ADR), additive / non-required
in CI so the protected `main` gate never deadlocks. Scope covers **both** repos
(this one and the SUT `demo-shop-app`).

| #   | Theme                          | What                                                                            | Status |
| --- | ------------------------------ | ------------------------------------------------------------------------------- | ------ |
| 1   | **Repo hygiene / governance**  | LICENSE (proprietary), CODEOWNERS, SECURITY.md, CoC, issue/PR templates         | ✅     |
| 2   | **Supply-chain security**      | Dependabot + CodeQL (SAST) + Gitleaks (secret scan) + `npm audit` gate          | ✅     |
| 3   | **Accessibility (a11y)**       | `@axe-core/playwright` scans on login + products (own project, gated)           | ⬜     |
| 4   | **Release automation**         | commitlint + Conventional Commits + semantic-release (auto version + CHANGELOG) | ⬜     |
| 5   | **Performance**                | Lighthouse CI budget on the static UI (perf/a11y/best-practices scores)         | ⬜     |
| 6   | **Notifications**              | GitHub-native: nightly failure auto-opens / updates a tracking issue            | ⬜     |
| 7   | **SUT: code coverage**         | `c8` coverage + threshold gate on `demo-shop-app` unit/integration              | ⬜     |
| 8   | **SUT: supply-chain security** | Mirror Dependabot + CodeQL + Gitleaks + audit into the SUT repo                 | ⬜     |
| 9   | **SUT: hygiene / governance**  | Mirror LICENSE (MIT — the app is meant to be reusable by students) + templates  | ⬜     |

> **Why MIT for the SUT but proprietary here:** the teaching repo (BUILD*LOG + ADRs)
> \_is* the course product → All Rights Reserved. The demo app is a throwaway SUT that
> students should be free to clone and run → permissive MIT, consistent with its
> already-public GHCR image.

**Deliberately out of scope:** BDD / Cucumber (over-engineering for this SUT; more a
course module than a technical gap), TestRail/Xray integration (enterprise-specific),
Slack/Teams alerting (chose GitHub-native to stay setup-free).

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

| Concept                            | Where                                                                      |
| ---------------------------------- | -------------------------------------------------------------------------- |
| Page Object Model                  | `pages/`, ADR-001                                                          |
| Components vs fixtures             | `components/`, `fixtures/`, ADR-004                                        |
| Browser strategy (local vs CI)     | `playwright.config.ts`, ADR-002                                            |
| Code style                         | ESLint/Prettier, ADR-003                                                   |
| CI pipeline                        | `.github/workflows/ci.yml`                                                 |
| CD (GitHub Pages)                  | job `deploy-report` in `ci.yml`                                            |
| Secrets pattern                    | `config/environments.ts`, workflow `env:`                                  |
| Local secrets (`.env`)             | `.env.example`, `playwright.config.ts` (dotenv)                            |
| CI run time (Docker fix)           | BUILD_LOG Step 16, Phase 5 (cache tried+reverted)                          |
| Pre-commit hook (Husky)            | `.husky/pre-commit`, `package.json` lint-staged                            |
| Node version pinning               | `.nvmrc`, `package.json` engines                                           |
| Anti-flaky strategy                | ADR-005, `playwright.config.ts` (retries/traces)                           |
| API tests (`request` fixture)      | `tests/api/`, `api` project, BUILD_LOG Step 24                             |
| Contract testing (schema)          | `tests/api/contract.api.spec.ts` + OpenAPI, Step 29                        |
| Authorization matrix (API)         | `tests/api/products.authz.api.spec.ts` + `data/write-ops.ts`, Step 44      |
| TS practice (guard, generic)       | `utils/product.guard.ts`, `data/product.factory.ts` (`buildMany`), Step 44 |
| Sharding + merge-reports           | `.github/workflows/ci.yml` matrix, ADR-008, Step 30                        |
| Compatibility matrix (Node)        | `api` job `matrix.node`, ADR-009, Step 31                                  |
| CD deploy + post-deploy smoke      | `demo-shop-app` `render.yaml` + `ci.yml`, ADR-010, Step 32                 |
| Staging→prod + approval gate       | `demo-shop-app` `ci.yml` + GitHub Environments, ADR-012, Step 34           |
| Cross-repo version pin             | `.app-version` + `ci.yml`/`app:setup`, ADR-013, Step 35                    |
| Visual regression                  | `tests/visual/`, ADR-011, Step 33                                          |
| Testing pyramid (API → E2E)        | `.github/workflows/ci.yml`, ADR-006                                        |
| System Under Test (own app)        | `demo-shop-app` repo, ADR-006, BUILD_LOG Step 23                           |
| Ephemeral SUT (`webServer`)        | `playwright.config.ts`, `app:setup` script                                 |
| Cross-repo integration gate        | `demo-shop-app/.github/workflows/e2e.yml`, Step 25                         |
| Execution cadence (PR/nightly)     | ADR-007, `.github/workflows/nightly.yml`, Step 26                          |
| App test tiers (unit/integ.)       | `demo-shop-app` test/unit + test/integration, Step 27                      |
| Two-repo contributor flow          | `CONTRIBUTING.md`                                                          |
| Branch protection / PR gate        | GitHub branch rules, BUILD_LOG Steps 20, 25                                |
| AI-assisted testing (judge + heal) | `ai/`, `tests/ai/`, ADR-019, Step 45                                       |
| Build history                      | `docs/BUILD_LOG.md` Steps 1–45                                             |
| This plan                          | `docs/ROADMAP.md`                                                          |
