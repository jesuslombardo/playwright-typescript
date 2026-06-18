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
🟡 Phase 3   Hooks ✅ (Husky) + reporting/anti-flaky ⬜
⬜ data/     Structured test data layer
⬜ Phase 5   Tags, sharding, hardening
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

| Item                    | Purpose                                            | Status             |
| ----------------------- | -------------------------------------------------- | ------------------ |
| **Husky + lint-staged** | Lint/format automatically before each commit       | ✅                 |
| **Anti-flaky strategy** | Document waits, retries, `test.describe.configure` | 🔜 next (critical) |
| **Allure / Monocart**   | Richer reports (Monocart = JS-native, no Java)     | 💤 NTH (later)     |
| **Dual reporter**       | HTML locally + something clearer in CI logs        | 💤 NTH (later)     |

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

| Item                           | Purpose                                                |
| ------------------------------ | ------------------------------------------------------ |
| **Playwright Docker image**    | Real fix for slow CI — preinstalled browsers + OS deps |
| Tags (`@smoke`, `@regression`) | Run subsets of tests                                   |
| Sharding                       | Split suite across parallel CI jobs (faster)           |
| Matrix                         | Multiple Node versions                                 |
| `CONTRIBUTING.md`              | Onboarding for anyone who clones the repo              |
| More domains                   | API tests, visual regression, etc.                     |

**Note — CI run time (from Step 16):**

A green run was ~7 min while tests only ran ~24s. The cost is the install step.

- We tried caching `~/.cache/ms-playwright`, measured only ~42s saved, and it introduced a cache-miss→timeout failure mode — so we **reverted it** (see BUILD_LOG Step 16). `ci.yml` is back to a single plain install step.
- **Root cause:** `--with-deps` runs `apt-get` for browser OS libraries (~6.5 min). That is NOT cacheable with `actions/cache` (system packages, not files in a folder).
- **Real fix (do here):** run the job in Playwright's official container so browsers AND OS deps are preinstalled — the install step nearly disappears. Revisit caching here too, together with Docker.

```yaml
test:
  runs-on: ubuntu-latest
  container: mcr.microsoft.com/playwright:v1.XX-jammy # match installed Playwright version
  # then drop --with-deps; browsers + OS libs already present
```

> Lesson: `timeout-minutes` is a fuse, not a speed lever. Container image (now) + sharding (when the suite grows) are what actually control run time. See [BUILD_LOG.md](BUILD_LOG.md) Step 16.

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

| Concept                        | Where                                             |
| ------------------------------ | ------------------------------------------------- |
| Page Object Model              | `pages/`, ADR-001                                 |
| Components vs fixtures         | `components/`, `fixtures/`, ADR-004               |
| Browser strategy (local vs CI) | `playwright.config.ts`, ADR-002                   |
| Code style                     | ESLint/Prettier, ADR-003                          |
| CI pipeline                    | `.github/workflows/ci.yml`                        |
| CD (GitHub Pages)              | job `deploy-report` in `ci.yml`                   |
| Secrets pattern                | `config/environments.ts`, workflow `env:`         |
| Local secrets (`.env`)         | `.env.example`, `playwright.config.ts` (dotenv)   |
| CI run time (Docker fix)       | BUILD_LOG Step 16, Phase 5 (cache tried+reverted) |
| Pre-commit hook (Husky)        | `.husky/pre-commit`, `package.json` lint-staged   |
| Node version pinning           | `.nvmrc`, `package.json` engines                  |
| Build history                  | `docs/BUILD_LOG.md` Steps 1–18                    |
| This plan                      | `docs/ROADMAP.md`                                 |
