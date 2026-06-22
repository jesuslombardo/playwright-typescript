# Build Log

Step-by-step journal of how this framework is being built from scratch.
Each entry documents **what** was done, **why**, and **what was learned**.

> This file is updated after every meaningful step.

---

## Step 0 — Project vision and README

**Status:** Done

**What**

- Defined project goals: scalable SDET automation framework with Playwright + TypeScript.
- Created the main `README.md` with vision, principles, and phased roadmap.

**Why**

- A clear README sets expectations for anyone reviewing the repository.
- The roadmap keeps development incremental and intentional.

**Files**

- `README.md`

**Learnings**

- Start with documentation before code: it forces clarity on goals and scope.

---

## Step 1 — Git repository setup

**Status:** Done

**What**

- Initialized Git locally (`git init`).
- Connected to remote: `https://github.com/jesuslombardo/playwright-typescript`
- First commit pushed to `main`.

**Why**

- Version control from day one is a baseline expectation in professional projects.
- Local-first workflow avoids conflicts when the remote repo already has a README or `.gitignore`.

**Commands**

```bash
git init
git add .
git commit -m "Adding gitignore"
git remote add origin https://github.com/jesuslombardo/playwright-typescript
git push -u origin main
```

**Files**

- `.gitignore` (initial: `.env` only)

**Learnings**

- Create an **empty** remote repo (no README / no `.gitignore` from GitHub UI) when you already have local files.
- Commit early and often with meaningful messages.

---

## Step 2 — Node.js project bootstrap (`package.json`)

**Status:** Done

**What**

- Initialized the Node.js project with `npm init -y`.
- Created `package.json` as the project manifest.

**Why**

- Every Node-based tooling chain (Playwright, TypeScript, ESLint, CI) depends on `package.json`.
- Scripts (`test`, `lint`, etc.) will live here.

**Commands**

```bash
npm init -y
```

**Key fields in `package.json`**
| Field | Purpose |
|-------|---------|
| `name` | Package identifier (URL-friendly, no spaces) |
| `version` | Semver version (`major.minor.patch`) |
| `scripts` | Commands runnable via `npm run <name>` |
| `devDependencies` | Tools used only during development |

**Learnings**

- `npm init` (interactive) and `npm init -y` (defaults) are two different flows — don't mix them.
- Package names must be URL-friendly: `playwright-project` ✅, `playwright project` ❌.
- `npm test` runs the `test` script defined in `package.json`.

**Files**

- `package.json`

---

## Step 3 — TypeScript installation

**Status:** Done

**What**

- Installed TypeScript and Node type definitions as dev dependencies.

**Why**

- TypeScript adds static typing, better IDE support, and safer Page Objects / utilities.
- `@types/node` provides types for Node APIs (`process`, `path`, `fs`, etc.).

**Commands**

```bash
npm install -D typescript @types/node
```

**Files**

- `package.json` (updated `devDependencies`)
- `package-lock.json` (auto-generated)
- `node_modules/` (local, not committed)

**Learnings**

- `-D` (or `--save-dev`) marks packages as **devDependencies** — tools, not runtime code.
- `package.json` declares _what_ you want (`^6.0.3` = flexible).
- `package-lock.json` pins _exact_ versions for reproducible installs across machines and CI.

**Analogy**

> `package.json` = McDonald's menu ("I want a Big Mac").
> `package-lock.json` = the exact recipe (supplier, quantities, process).
> `node_modules/` = the actual burger in each restaurant.
>
> The lock file ensures every "restaurant" (dev machine, CI runner) makes the same burger.

---

## Step 4 — TypeScript configuration (`tsconfig.json`)

**Status:** Done

**What**

- Created `tsconfig.json` with settings aligned to a Playwright test automation project.

**Why**

- TypeScript needs rules: which files to check, how strict to be, target JS version, etc.
- `noEmit: true` means TypeScript only validates types — Playwright runs `.ts` files directly without compiling to `dist/`.

**Key options**
| Option | Value | Why |
|--------|-------|-----|
| `strict` | `true` | Catch more errors at compile time |
| `noEmit` | `true` | No `.js` output — Playwright handles execution |
| `target` | `ES2022` | Modern JS features, compatible with current Node |
| `module` | `commonjs` | Node module system (`require` / `module.exports`) |
| `types` | `["node"]` | Load Node.js type definitions |

**Files**

- `tsconfig.json`

**Learnings**

- Running `npx tsc --noEmit` before any `.ts` files exist shows `No inputs were found` — that's expected.
- `tsconfig.json` powers IDE autocompletion and type checking, not just compilation.

---

## Current progress snapshot

```
✅ Git + remote connected
✅ README.md (project vision)
✅ package.json
✅ package-lock.json
✅ TypeScript + @types/node
✅ tsconfig.json
✅ Playwright setup
✅ First E2E test (example)
✅ .gitignore (Playwright artifacts + .DS_Store)
✅ ESLint + Prettier
✅ Editor workspace settings
✅ Phase 2 — folder structure + ARCHITECTURE.md + ADRs
✅ Environment config (Sauce Demo)
✅ LoginPage + login test
✅ Negative login test (locked out user)
✅ InventoryPage + inventory test
✅ Auth fixture (`loggedInPage`)
✅ HeaderComponent + logout test
✅ CartPage + CheckoutPage + cart/checkout tests
✅ Utils (data-generator) + testProducts config
✅ Fixture typing + POM selector cleanup
✅ Phase 2 complete
⬜ Phase 3 — Quality and Reporting
✅ Phase 4 — CI/CD complete (see ROADMAP.md)
```

**Next sessions (see [ROADMAP.md](ROADMAP.md)):**

1. Phase 3 — Husky + lint-staged, reporting, anti-flaky docs
2. Phase 5 + `data/` — when the suite grows

---

## Step 5 — Playwright setup

**Status:** Done

**What**

- Installed Playwright Test via the official project initializer.
- Downloaded browsers (Chromium, Firefox, WebKit).
- Created `playwright.config.ts` and `tests/example.spec.ts`.
- Added npm scripts for running tests.
- Expanded `.gitignore` for Playwright output folders.

**Why**

- Playwright is the core test runner and browser automation engine.
- The initializer scaffolds a working baseline so we can run tests immediately.
- Config centralizes behavior (browsers, retries, reporters) instead of hardcoding it in each test.

**Commands**

```bash
npm init playwright@latest -- --lang=ts --quiet
npx playwright test --project=chromium   # verify setup
```

**Files created / updated**
| File | Role |
|------|------|
| `playwright.config.ts` | Global Playwright settings (browsers, retries, reporter) |
| `tests/example.spec.ts` | Sample E2E tests against playwright.dev |
| `package.json` | Added `@playwright/test` + npm scripts |
| `.gitignore` | Ignores `test-results/`, `playwright-report/`, etc. |

**`playwright.config.ts` — key settings**
| Setting | Value | Meaning |
|---------|-------|---------|
| `testDir` | `./tests` | Where test files live |
| `fullyParallel` | `true` | Tests in different files run in parallel |
| `retries` | `2` on CI, `0` locally | Re-run flaky tests only in CI |
| `reporter` | `html` | Generates an HTML report after runs |
| `projects` | chromium, firefox, webkit | Runs tests on 3 browser engines |
| `trace` | `on-first-retry` | Captures debug trace when a retry happens |

**`tests/example.spec.ts` — anatomy of a test**

```typescript
test('has title', async ({ page }) => {
  await page.goto('https://playwright.dev/') // 1. Navigate
  await expect(page).toHaveTitle(/Playwright/) // 2. Assert
})
```

- `test()` — defines a test case.
- `{ page }` — Playwright injects a browser page (fixture).
- `page.goto()` — opens a URL.
- `expect()` — assertion (pass/fail).

**npm scripts added**
| Script | Command | Use case |
|--------|---------|----------|
| `npm test` | `playwright test` | Run all tests (all browsers) |
| `npm run test:ui` | `playwright test --ui` | Interactive UI mode |
| `npm run test:headed` | `playwright test --headed` | See the browser while tests run |
| `npm run test:chromium` | `playwright test --project=chromium` | Run only on Chrome |
| `npm run report` | `playwright show-report` | Open last HTML report |

**First test run**

```
2 passed (2.5s)  — chromium only
```

**Learnings**

- Browsers are downloaded to a global cache (`~/Library/Caches/ms-playwright/`), not into `node_modules`.
- By default, `playwright test` runs each test on **3 browsers** (chromium + firefox + webkit) = 6 runs for 2 tests.
- Use `--project=chromium` during development to save time.
- Playwright runs `.ts` files directly — no separate compile step needed.
- The HTML report is generated in `playwright-report/` (gitignored).

**Next**

- Commit bootstrap changes.
- Start structuring folders (pages, fixtures, utils) — Phase 2.

---

## Step 6 — Browser execution strategy

**Status:** Done

**What**

- Configured conditional browser projects in `playwright.config.ts`.
- Local runs use Chromium only; CI runs all browsers.
- Added `test:cross-browser` script for manual full-browser validation.

**Why**

- Running 3 browsers on every local run is slow and rarely needed during development.
- Cross-browser coverage still matters — but belongs in CI or pre-release checks.
- This mirrors how real teams balance speed vs. coverage.

**Strategy**
| Context | Browsers | How |
|---------|----------|-----|
| Local dev (`npm test`) | Chromium only | default |
| CI pipeline (`CI=true`) | Chromium + Firefox + WebKit | automatic |
| Manual check (`npm run test:cross-browser`) | All 3 | on demand |

**Config pattern**

```typescript
projects:
  process.env.CI || process.env.CROSS_BROWSER
    ? crossBrowserProjects
    : [chromiumProject],
```

**Commands**

```bash
npm test                      # 2 tests (chromium only)
npm run test:cross-browser    # 6 tests (2 tests × 3 browsers)
CI=true npm test              # 6 tests (simulates CI behavior)
```

**Verification**

```
npm test              → 2 passed
test:cross-browser    → 6 passed
```

**Learnings**

- `projects` in Playwright = browser + config combinations, not "environments".
- `process.env.CI` is automatically set to `true` in most CI providers (GitHub Actions, etc.).
- `CROSS_BROWSER=true` is a custom flag for local cross-browser runs without faking CI.
- `--project=chromium` still works to force a single browser regardless of config.

**Next**

- Start structuring folders (pages, fixtures, utils) — Phase 2.

---

## Step 7 — ESLint + Prettier

**Status:** Done

**What**

- Installed ESLint and Prettier with TypeScript support.
- Created `eslint.config.mjs`, `.prettierrc`, and `.prettierignore`.
- Added lint/format npm scripts.
- Cleaned up `.gitignore` (added `.DS_Store`, removed duplicates).

**Why**

- ESLint catches code issues and bad patterns before they reach CI.
- Prettier enforces consistent formatting — no more style debates in PRs.
- Together they are a baseline expectation in professional TypeScript projects.

**Packages installed**
| Package | Role |
|---------|------|
| `eslint` | Core linter |
| `prettier` | Code formatter |
| `typescript-eslint` | TypeScript rules for ESLint |
| `eslint-config-prettier` | Disables ESLint rules that conflict with Prettier |
| `@eslint/js` | Base recommended ESLint rules |

**Commands**

```bash
npm run lint          # check for code issues
npm run lint:fix      # auto-fix what ESLint can
npm run format        # format all files with Prettier
npm run format:check  # verify formatting (used in CI)
```

**Files**
| File | Role |
|------|------|
| `eslint.config.mjs` | ESLint rules (flat config format) |
| `.prettierrc` | Prettier style preferences |
| `.prettierignore` | Files Prettier should skip |

**`.gitignore` cleanup**

- Added `.DS_Store` (macOS metadata — should never be in a repo).
- Consolidated duplicate `node_modules/` entries.

**Learnings**

- ESLint = "is this code correct/good?" | Prettier = "does it look consistent?"
- `eslint-config-prettier` prevents the two tools from fighting each other.
- `eslint.config.mjs` uses the modern "flat config" format (ESLint 9+).
- Run `npm run format` before committing to keep the repo clean.

**Optional (global, personal machine)**
To ignore `.DS_Store` in ALL your repos, create `~/.gitignore_global` with `.DS_Store` and point git to it via `core.excludesfile`. Project-level `.gitignore` is enough for this repo.

**Next**

- Phase 2: folder structure (pages, fixtures, utils, config).

---

## Step 8 — Editor setup (format/lint on save)

**Status:** Done

**What**

- Added `.vscode/settings.json` with format on save and ESLint auto-fix on save.
- Added `.vscode/extensions.json` recommending ESLint and Prettier extensions.

**Why**

- Immediate feedback while coding — no need to remember to run format manually.
- Workspace settings are committed to the repo so every contributor gets the same editor experience.
- Complements (does not replace) `npm run lint` and `npm run format:check` in CI.

**Files**
| File | Role |
|------|------|
| `.vscode/settings.json` | Format on save + ESLint fix on save |
| `.vscode/extensions.json` | Suggests required Cursor/VS Code extensions |

**Key settings**

```json
"editor.formatOnSave": true,
"editor.defaultFormatter": "esbenp.prettier-vscode",
"editor.codeActionsOnSave": {
  "source.fixAll.eslint": "explicit"
}
```

**Extensions to install** (Cursor will prompt on open)

- `dbaeumer.vscode-eslint` — ESLint
- `esbenp.prettier-vscode` — Prettier

**Three layers of quality**
| Layer | When | Purpose |
|-------|------|---------|
| On save | Every `Cmd+S` | Fast local feedback |
| npm scripts | Manual / pre-commit | Validate whole project |
| CI | Every PR | Enforce for everyone |

**Next**

- First Page Object against Sauce Demo (Step 2.2).

---

## Step 9 — Phase 2.1: Folder structure and architecture docs

**Status:** Done

**What**

- Created layered folder structure: `pages/`, `components/`, `fixtures/`, `utils/`, `config/`.
- Added `docs/ARCHITECTURE.md` — current design snapshot for devs and tooling.
- Added `docs/adr/` with three Architecture Decision Records.
- Updated `README.md` documentation links and Phase 2 status.

**Why**

- Separation of concerns scales better than flat tests.
- `ARCHITECTURE.md` answers "how is this project organized?"
- ADRs answer "why did we choose this?" without cluttering the architecture doc.
- `.gitkeep` files allow Git to track empty folders until code is added.

**Folders created**
| Folder | Responsibility |
|--------|----------------|
| `pages/` | Page Objects — one class per screen |
| `components/` | Shared UI (header, modals) |
| `fixtures/` | Playwright custom fixtures |
| `utils/` | Non-UI helpers |
| `config/` | Environment URLs and test data |

**Documentation created**
| File | Purpose |
|------|---------|
| `docs/ARCHITECTURE.md` | Living design doc — current state |
| `docs/adr/001-...` | POM and folder structure rationale |
| `docs/adr/002-...` | Browser execution strategy rationale |
| `docs/adr/003-...` | ESLint/Prettier code style rationale |
| `docs/adr/README.md` | ADR index and template |

**Learnings**

- `ARCHITECTURE.md` and ADRs complement each other — not redundant.
- ARCHITECTURE = what/how (updated when design changes).
- ADR = why (immutable history; supersede, don't delete).
- BUILD_LOG = when (chronological journal).

**Next**

- Step 2.2: First Page Object (`LoginPage`) for Sauce Demo.

---

## Step 10 — ADR-004: Components vs Fixtures

**Status:** Done

**What**

- Added `docs/adr/004-components-vs-fixtures.md` with decision guide, anti-patterns, and Sauce Demo examples.
- Cross-referenced ADR-004 from ADR-001 and ARCHITECTURE.md.
- Added "Where does this code go?" quick reference and flow diagram to ARCHITECTURE.md.

**Why**

- Components and fixtures are the most confused layers in test frameworks.
- ADR-001 defines folders; ADR-004 defines **criteria for placing code** — complementary, not redundant.
- Future self (and other devs) can answer "where does this go?" in 30 seconds.

**Learnings**

- One ADR per confused concept > one mega-ADR for everything.
- ARCHITECTURE.md = quick lookup; ADR-004 = deep rationale.
- Anti-patterns table prevents common mistakes early.

**Next**

- InventoryPage, auth fixture, or locked-out user test.

---

## Step 11 — LoginPage and first Sauce Demo test

**Status:** Done

**What**

- Created `config/environments.ts` with base URL and test users.
- Wired `baseURL` and `testIdAttribute: 'data-test'` in `playwright.config.ts`.
- Created `pages/login.page.ts` — first Page Object.
- Created `tests/auth/login.spec.ts` — first real E2E test.

**Why**

- Config centralizes URLs and credentials before they spread across tests.
- LoginPage encapsulates Sauce Demo login selectors and actions.
- Test reads as a user scenario; assertions stay in the spec.

**Commands**

```bash
npm test -- tests/auth/login.spec.ts
```

**Verification**

```
1 passed (2.6s) — user can login with valid credentials
```

**Learnings**

- `baseURL` in config allows `page.goto('/')` instead of full URLs.
- `testIdAttribute: 'data-test'` maps `getByTestId()` to Sauce Demo's attribute.
- Page Object = locators + actions; test = scenario + assertions.

**Next**

- Header component or commit Phase 2 progress.

---

## Step 12 — Negative login test, InventoryPage, auth fixture

**Status:** Done

**What**

- Added locked-out user test using `errorMessage` locator from LoginPage.
- Created `pages/inventory.page.ts` and `tests/inventory/inventory.spec.ts`.
- Created `fixtures/auth.fixture.ts` with `loggedInPage` fixture.
- Refactored inventory test to use fixture instead of duplicated login.

**Why**

- Negative tests validate error handling, not just happy paths.
- InventoryPage demonstrates a second Page Object for a new screen.
- Auth fixture removes repeated login setup — demonstrates ADR-004 in practice.

**Commands**

```bash
npm test -- tests/auth/login.spec.ts tests/inventory/inventory.spec.ts
```

**Verification**

```
3 passed — login happy path, login locked out, add to cart
```

**Next**

- Commit Phase 2 progress.

---

## Step 13 — HeaderComponent (shared UI)

**Status:** Done

**What**

- Created `components/header.component.ts` with `openMenu()` and `logout()`.
- Composed `HeaderComponent` inside `InventoryPage` (`inventoryPage.header`).
- Added `tests/auth/logout.spec.ts` using auth fixture + header component.
- Removed `tests/example.spec.ts` (Playwright demo — replaced by Sauce Demo tests).

**Why**

- Header appears on every post-login screen — classic component object candidate (ADR-004).
- InventoryPage delegates menu/logout to HeaderComponent instead of duplicating selectors.
- Demonstrates composition: page **has-a** component, test uses `inventoryPage.header.logout()`.

**Verification**

```
4 passed — login x2, inventory, logout
```

**Next**

- Commit Phase 2 feature set.

---

## Step 14 — Phase 2 completion: cart, checkout, utils

**Status:** Done

**What**

- Added `CartPage`, `CheckoutPage`, and `HeaderComponent.openCart()`.
- Added `tests/cart/cart.spec.ts` and `tests/checkout/checkout.spec.ts`.
- Added `utils/data-generator.ts` (`generateCheckoutCustomer`).
- Added `testProducts` to config; refactored inventory test to use it.
- Typed `loggedInPage` fixture; moved stray selectors from tests to pages.
- Added "Test writing rules" to ARCHITECTURE.md; marked Phase 2 complete in README.

**Why**

- Cart and checkout complete a representative Sauce Demo purchase flow.
- Utils folder demonstrates non-UI helpers separate from config/fixtures.
- Phase 2 exit criteria: layered structure + real E2E flows + documented conventions.

**Verification**

```
6 passed — login x2, inventory, logout, cart, checkout
```

**Next**

- Phase 3: reporting, anti-flaky strategy, pre-commit hooks.

---

## Step 15 — CI/CD: GitHub Actions pipeline + CD via GitHub Pages

**Status:** Done

**What**

- Created `.github/workflows/ci.yml` with three jobs: `quality`, `test`, `deploy-report`.
- Polished the pipeline: `needs`, `if: failure()`, secrets, failure evidence, GitHub Pages CD.
- Updated `playwright.config.ts` with screenshot/video on failure.
- Updated `config/environments.ts` to read optional `SAUCE_*` env vars (secrets pattern).
- Added CI badge and Pages link to `README.md`.

**Why**

- **CI** validates every push/PR automatically — no "works on my machine."
- **`needs: quality`** saves CI minutes: don't run browsers if lint/format already failed.
- **`if: failure()` on artifacts** uploads debug bundles only when tests fail — saves storage.
- **Secrets** keep real credentials out of git; Sauce Demo defaults still work without secrets.
- **CD (GitHub Pages)** publishes the HTML report after each successful `main` push — portfolio-ready, shareable link.

**Pipeline flow (explain like a child)**

```
push or PR
    │
    ▼
┌──────────┐
│ quality  │  "Is the code tidy?" (ESLint + Prettier)
└────┬─────┘
     │ needs: quality (test waits)
     ▼
┌──────────┐
│   test   │  "Do the tests pass?" (Playwright, 3 browsers in CI)
└────┬─────┘
     │
     ├── if failure() → upload playwright-debug artifact (report + test-results)
     │
     └── if push to main → upload-pages-artifact
              │
              ▼
     ┌─────────────────┐
     │ deploy-report   │  CD: publish report to GitHub Pages
     └─────────────────┘
```

**Key concepts**

| Concept      | What it means                            | Where                               |
| ------------ | ---------------------------------------- | ----------------------------------- |
| **Job**      | One robot on one VM                      | `quality`, `test`, `deploy-report`  |
| **Step**     | One action inside a job                  | checkout, npm ci, npm test          |
| **`needs`**  | Job B waits for Job A                    | `test` needs `quality`              |
| **`if:`**    | Run step/job only when condition is true | `if: failure()`, `if: push to main` |
| **Artifact** | Zip saved by GitHub for download         | `playwright-debug` on failure       |
| **Secret**   | Encrypted value in repo Settings         | `SAUCE_STANDARD_PASSWORD`           |
| **CD**       | Deliver/publish after validation         | GitHub Pages report                 |

**`.github/workflows/ci.yml` — important lines**

```yaml
test:
  needs: quality   # don't run Playwright until lint/format pass

- name: Upload debug bundle on failure
  if: failure()    # only when tests fail

- name: Upload report for GitHub Pages
  if: github.ref == 'refs/heads/main' && github.event_name == 'push'

deploy-report:
  needs: test
  uses: actions/deploy-pages@v4   # CD — publish to the web
```

**Secrets — how to use (without hardcoding)**

1. **Local:** create `.env` (gitignored) with `SAUCE_STANDARD_USER=...` — optional for Sauce Demo.
2. **CI:** GitHub → Settings → Secrets and variables → Actions → New repository secret.
3. **Workflow:** `${{ secrets.SAUCE_STANDARD_PASSWORD }}` — never print or commit the value.
4. **Code:** `process.env.SAUCE_STANDARD_PASSWORD || 'secret_sauce'` — fallback when secret is unset.

Sauce Demo passwords are public demo data; the pattern matters for real projects.

**GitHub Pages — one-time setup**

1. Repo **Settings → Pages**
2. **Source:** GitHub Actions (not "Deploy from branch")
3. Push to `main` — workflow job `deploy-report` publishes the report
4. URL: `https://<user>.github.io/<repo>/`

**Playwright failure evidence**

| Setting      | Value               | When captured              |
| ------------ | ------------------- | -------------------------- |
| `screenshot` | `only-on-failure`   | Test fails                 |
| `video`      | `retain-on-failure` | Test fails                 |
| `trace`      | `on-first-retry`    | CI retry (2 retries on CI) |

**Commands**

```bash
# Watch a CI run from terminal
gh run watch

# List recent workflow runs
gh run list --workflow=ci.yml

# Simulate CI locally (3 browsers + retries)
CI=true npm test
```

**Files**

- `.github/workflows/ci.yml`
- `playwright.config.ts` (screenshot, video)
- `config/environments.ts` (optional env vars)
- `README.md` (badge + Pages link)
- `docs/ROADMAP.md` (Phase 4 marked complete)

**Learnings**

- **CI** = validate on every change. **CD** = publish/deliver after validation. This repo's CD MVP = test report on GitHub Pages.
- `needs` creates a **dependency chain**; failed upstream job skips downstream work.
- Two upload mechanisms: `upload-artifact` (download from Actions UI) vs `upload-pages-artifact` (feed GitHub Pages).
- PRs run CI only (no deploy); CD runs on `main` push only — safe default.
- `concurrency` + `cancel-in-progress` stops old runs when you push again quickly.

**Next**

- Phase 3: Husky + lint-staged, Allure (optional), anti-flaky docs.

---

## Step 16 — CI optimization attempt: cache Playwright browsers (tried, then reverted)

**Status:** Reverted — kept the learning, removed the complexity. Real fix deferred to Phase 5 (Docker).

**What**

- Tried an `actions/cache@v4` step caching `~/.cache/ms-playwright`, with a split install (cache miss = `install --with-deps`, cache hit = `install-deps`).
- **Reverted** to the simple single step `npx playwright install --with-deps`, because the cache saved almost nothing and added real downsides (see below).

**Why (and the surprise)**

- A green run was taking **~7 min**, but the tests themselves only ran for **~24 seconds**. The `npx playwright install --with-deps` step was the bottleneck.
- **Hypothesis:** the slow part was re-downloading Chromium + Firefox + WebKit. Cache `~/.cache/ms-playwright` → expected a drop from ~7 min to ~1 min.
- **What actually happened (measured):**
  - Cache MISS (`install --with-deps`): **7m 26s**
  - Cache HIT (`install-deps` only): **6m 44s**
  - The cache worked correctly but saved **only ~42 seconds**. The hypothesis was wrong.

**Root cause: it's the OS deps, not the browser download**

- The real bottleneck is `--with-deps` / `install-deps` running **`apt-get`** to install browser system libraries (~6.5 min, WebKit needs many). That is **NOT cacheable** with `actions/cache` because apt installs into system dirs, not a single folder.
- Browser binaries (`~/.cache/ms-playwright`) ARE cacheable, but the download is only ~40s — the small part.

```
Assumed:  [download browsers 7min]            <- cached this
Reality:  [download browsers ~40s] + [apt-get OS libs ~6.5min]  <- NOT cacheable
```

**The downside that sealed the revert**

- Adding `dotenv` (Step 17) changed `package-lock.json` → changed the cache key → **cache MISS** → full `--with-deps` again.
- On one unlucky run, `--with-deps` (the apt OS-deps download) was so slow it exceeded `timeout-minutes: 15` **before the tests even ran** → the job was cancelled by the timeout fuse.
- Because cancelled jobs skip the "Post Cache" save step, the cache was never seeded → every retry was another MISS → a vicious cycle.
- Net: ~42s of best-case savings vs. extra YAML + a confusing failure mode. Not worth it now.

**Decision: revert + defer the real fix to Phase 5**

- Reverted to the plain `npx playwright install --with-deps` to keep `ci.yml` simple.
- The real fix is Playwright's official Docker image (`mcr.microsoft.com/playwright:vX-jammy`) via `container:` — browsers AND OS libs preinstalled, so the install step nearly disappears. We'll do caching + Docker together in Phase 5. See [ROADMAP.md](ROADMAP.md).

**Files**

- `.github/workflows/ci.yml` (reverted to a single install step)

**Learnings**

- **Measure, don't assume.** Check per-step timing _inside_ a slow step before optimizing — we cached the wrong (small) part because we didn't measure first.
- In CI, the bottleneck is often **environment setup**, but be specific: here it was **apt OS deps**, not the browser download. The distinction changes the fix.
- `actions/cache` only helps for things that live as **files** in a path. System packages (apt) need a different solution (prebuilt container image).
- A half-measure can be **worse than nothing**: the cache added a flaky cache-miss→timeout failure mode for ~42s of savings. Prefer the real fix (Docker) over a partial one.
- `timeout-minutes` is a safety **fuse**, not a time budget; the real run-duration levers are the **container image** and (later) **sharding**.

---

## Step 17 — Local secrets: `.env` + `.env.example` (dotenv)

**Status:** Done

**What**

- Installed `dotenv` (devDependency).
- Activated env loading in `playwright.config.ts` as the **first import**: `import 'dotenv/config'`.
- Added `.env.example` (committed) — documents which variables the framework reads.
- Local `.env` holds real values and is **gitignored** (already in `.gitignore`).

**Why**

- `.env` is the **local twin of GitHub Secrets**: a place outside the code AND outside git for credentials. Same `process.env.X || default` code reads from `.env` locally and from GitHub Secrets in CI.
- Hardcoding in code is bad because it lands in git history (public). Values in `.env` are fine because git ignores the file — never exposed.
- `.env.example` doubles as **documentation**: it lists the variable names (no real values) so anyone cloning knows what to set. Safe to commit.

**Key detail: load order (a classic dotenv bug)**

- `config/environments.ts` reads `process.env.SAUCE_*` at **import time**.
- If dotenv loads _after_ that import, the values arrive too late and the defaults win.
- Fix: `import 'dotenv/config'` must be the **first import**, before anything that reads `process.env`.

**Verified**

- Put a wrong password in `.env` (no CLI override) → `login` test failed → proves Playwright loads `.env` end-to-end.
- Restored the correct value → `2 passed`.

**Files**

- `.env.example` (committed), `.env` (gitignored), `playwright.config.ts`, `package.json`

**Learnings**

- The thing that makes `.env` safe is the **`.gitignore` entry**, not the file itself.
- Commit `.env.example` (template), never `.env` (real values).
- Test the override **locally** first (`SAUCE_X=... npm test` or a `.env`) — instant vs ~7 min in CI. Only push to test the GitHub Secret itself, which doesn't exist locally.

---

## Step 18 — Phase 3: Husky + lint-staged (pre-commit hook)

**Status:** Done

**What**

- Installed `husky` + `lint-staged` (devDeps); ran `npx husky init`.
- `.husky/pre-commit` runs `npx lint-staged` (replaced the default `npm test`, which would run the whole E2E suite on every commit — too slow).
- `lint-staged` config in `package.json`: `eslint --fix` + `prettier --write` on staged `*.{ts,js}`, `prettier --write` on staged `*.{json,md,yml,yaml}`.
- `"prepare": "husky"` script auto-installs hooks on `npm install` (so the team shares them).
- Required Node bumped to **>=22** (`engines` + `.nvmrc`).

**Why**

- Shift-left: catch lint/format errors **locally before commit**, not 7 min later in CI.
- `lint-staged` only checks **changed** files → fast; uses `--fix`/`--write` so it auto-corrects instead of just complaining.
- Husky is the **local twin** of the CI `quality` job. CI is still the real gate (hooks can be skipped with `--no-verify`); Husky is convenience + speed.

**The Node version snag (a real lesson)**

- First commit attempt crashed: `lint-staged@17` requires Node **>=22.22.1**, but local Node was **20.11.1** (CI already uses 22). Classic "works in CI, breaks locally" environment drift.
- Fix: upgraded local Node to 22 via `nvm install 22 && nvm alias default 22`, and added `.nvmrc` (`22`) + `engines` so the required version is documented and `nvm use` picks it up.

**Verified (both paths)**

- Lint error (unused var) → `eslint --fix` can't fix → lint-staged fails → **commit blocked**.
- Clean/auto-fixable files → `prettier --write` formats + re-stages → **commit succeeds** (the Husky setup commit itself went through the hook).

**Files**

- `.husky/pre-commit`, `package.json` (lint-staged, engines, prepare), `.nvmrc`

**Learnings**

- Replace Husky's default `npm test` pre-commit — running the full suite per commit is too slow; use `lint-staged` for fast, changed-files-only checks.
- Keep **local Node = CI Node**; `.nvmrc` + `engines` document and enforce it, preventing version-drift bugs.
- Husky doesn't replace CI; it's the fast first filter, CI is the authority.

---

## Step 19 — Phase 3: Anti-flaky strategy (audit + ADR-005)

**Status:** Done

**What**

- Audited the suite (grep) for flakiness smells: `waitForTimeout`, `setTimeout`, `waitForSelector`, `networkidle`, `.isVisible()`/`.isHidden()` as waits, non-web-first assertions. **Result: zero occurrences** — the suite was already clean.
- Documented the strategy in [ADR-005](adr/005-anti-flaky-test-strategy.md) and registered it in the ADR index.

**Why**

- A flaky test (passes/fails without code changes) is the **#1 enemy** of a suite: it erodes trust until real red results get ignored. A small reliable suite > a large flaky one.
- Writing down the strategy makes the "why" explicit (for future me and for the planned course based on this repo).

**Strategy (see ADR-005 for detail)**

- Web-first assertions (auto-waiting) instead of manual timing.
- **Ban** hard waits (`waitForTimeout`); **avoid** `networkidle` (indirect signal, Playwright-discouraged).
- Resilient locators (`getByRole`/`getByTestId`); fresh context per test (isolation).
- `retries: 2` on CI = safety net, **not** a cure (Playwright flags retry-passes as "flaky").

**Files**

- `docs/adr/005-anti-flaky-test-strategy.md`, `docs/adr/README.md`

**Learnings**

- "It works" ≠ "it's a good idea": `networkidle` works but is less reliable than asserting the real result. Choose the **predictable** option.
- Discouraged ≠ deprecated ≠ removed — `networkidle` is only _discouraged_ (still works, no warning), softer than the Node 20 _deprecation_ warnings seen in CI.
- The best anti-flaky outcome is a **clean audit**: the framework's design (POM + web-first assertions + isolation) prevents flakiness up front.

---

## Step 20 — Branch protection: turn CI into a gate (PR workflow)

**Status:** Done

**What**

- Enabled branch protection on `main` via the GitHub API:
  - **Require a pull request before merging** (`required_approving_review_count: 0` — PR required, no reviewer needed for a solo repo).
  - **Require status checks to pass**: `Lint and format` + `Playwright`.
  - **`enforce_admins: true`** — the rule applies to the owner too (no direct pushes to `main`).
- Adopted the real loop: branch → push → PR → CI as a **required check** → merge only when green.

**Why**

- Before this, CI was a **notifier**, not a **gate**: code could land on `main` and CI only reported failures _after the fact_. Now CI **blocks** merges — it's the authority.
- Closes the SDLC loop: `branch → PR → CI gate → merge`. This is the standard professional workflow and a common interview topic.

**The key gotcha**

- Required checks must be `Lint and format` and `Playwright` — **NOT** `Publish report (CD)`. On a PR, the `deploy-report` job is **skipped** (its `if` is push-to-`main` only), so requiring it would mean its check never turns green → the PR could **never** merge.

**Commands**

```bash
# enable protection (require PR + the two CI checks, enforce on admins)
gh api --method PUT repos/<owner>/<repo>/branches/main/protection --input - <<'JSON'
{ "required_status_checks": { "strict": false, "contexts": ["Lint and format", "Playwright"] },
  "enforce_admins": true,
  "required_pull_request_reviews": { "required_approving_review_count": 0 },
  "restrictions": null }
JSON

# the PR loop
git checkout -b <branch>
git push -u origin <branch>
gh pr create --fill
gh pr checks --watch     # CI runs as a required check
gh pr merge --squash     # only succeeds when checks are green
```

**Files**

- No repo files — this is a GitHub setting. Documented here + in ROADMAP.

**Learnings**

- A CI that doesn't block is a **notifier**, not a **gate**. Branch protection is what makes CI an authority.
- Don't require a status check that can be **skipped** on PRs (the CD job) — it would deadlock merges forever.
- `enforce_admins: true` makes the gate real even for a solo owner — you genuinely can't bypass it.
- To undo: `gh api --method DELETE .../branches/main/protection`.

---

## Step 21 — Phase 5: run the Playwright job in the official Docker image

**Status:** Done

**What**

- Ran the `test` job inside `mcr.microsoft.com/playwright:v1.61.0-jammy` (`container:` at job level).
- Removed the `npx playwright install --with-deps` step — the image already ships browsers + OS deps.
- Lowered `timeout-minutes` 30 → 15 (the install bottleneck is gone) and removed the temporary comment.
- Added `options: --user 1001` to fix a Firefox launch failure (see below).

**Why**

- A green run was ~10 min, but the tests only ran ~30s. The bottleneck was installing browsers + OS deps on a blank `ubuntu-latest` **every** run (Step 16). The Docker image has them preinstalled, so the install step disappears.
- **Result (measured): the Playwright job dropped from ~10 min to ~1m9s.**

**The bug we hit (and fixed)**

- First Docker run: Chromium + WebKit launched, but **Firefox failed**: _"Firefox is unable to launch if the $HOME folder isn't owned by the current user"_ (`CanCreateUserNamespace() clone() failure: EPERM`).
- Cause: the image runs as **root**, but GitHub Actions sets `HOME=/github/home`, owned by the runner user (uid 1001). Firefox refuses to launch when `$HOME` isn't owned by the current user.
- Fix (from Playwright's official CI docs): run the container as that user via `options: --user 1001`. Then `$HOME` ownership matches and Firefox launches.

```yaml
container:
  image: mcr.microsoft.com/playwright:v1.61.0-jammy
  options: --user 1001
```

**Files**

- `.github/workflows/ci.yml` (test job)

**Learnings**

- **The image tag must match the installed Playwright version exactly** (`v1.61.0`). Verify tags against the registry — autocomplete suggested `v1.61-jammy`, which **doesn't exist** (the abbreviated tag isn't published; the `.0` is required).
- **CI catches environment-specific bugs you can't see locally.** The Firefox/$HOME error only appears in the container — proof that the pipeline earns its keep.
- **Read the error, then the official docs** — the message named the exact problem and the docs had the exact fix. No guessing.
- `--user 1001` = the GitHub runner user; running the container as it makes mounted dirs (`/github/home`) ownership-consistent.
- `if: failure()` did its job again — uploaded `playwright-debug` with the traces of the failing run.

---

## Step 22 — Phase 5: test tags + smoke → regression CI staging

**Status:** Done

**What**

- Tagged the 2 critical-path tests with `{ tag: '@smoke' }` (login with valid credentials, complete a purchase).
- Added npm scripts: `test:smoke` (`playwright test --grep @smoke`) and `test:regression` (`playwright test`, the full suite).
- Split the single `test` job into two chained jobs: **`Smoke`** (`needs: quality`) → **`Regression`** (`needs: smoke`). `deploy-report` now `needs: regression`.
- Updated branch protection required checks: `Playwright` → `Smoke` + `Regression` (kept `Lint and format`).

**Why**

- Demonstrates the **testing-pyramid / staging** pattern in CI: cheap/critical first (smoke), expensive/exhaustive after (regression), fail-fast between them — the same "cheap first" idea as `needs: quality`, one level deeper.
- `@smoke` answers "is the app fundamentally alive?" (can I log in and buy?); the full suite is the regression.

**Honest tradeoff (say this in interviews)**

- With **6 tests (~1 min)**, splitting into 2 jobs is actually **slower**, not faster — each job repeats setup (image pull + `npm ci`). The pattern pays off only when regression is **long** (10–60 min), where a fast smoke gate saves you from spending on the full suite when basics are broken. Here it is **didactic**, done to learn/show the pattern.
- Alternative real-world shape: run `@smoke` on every PR (fast feedback), full regression nightly or post-merge.

**The gotcha (key lesson)**

- Renaming a job that is a **required status check** breaks merges: branch protection still required `Playwright`, which no longer existed → a PR would hang forever waiting for a check that never reports. **Fix: update the required-checks contexts whenever you rename/split CI jobs.**

**Files**

- `tests/auth/login.spec.ts`, `tests/checkout/checkout.spec.ts` (tags)
- `package.json` (scripts), `.github/workflows/ci.yml` (smoke + regression jobs)
- Branch protection contexts (via `gh api`, not in the repo)

**Learnings**

- Tags filter with `--grep @smoke` / `--grep-invert`; `--list` shows the matched set without running.
- Modern Playwright tag syntax: `test('title', { tag: '@smoke' }, async () => {})`.
- Required status checks reference job **names** — rename a job, update the protection, or deadlock PRs.
- The "cheap → expensive" staging pattern is **fractal**: across jobs (quality→test) and within tests (smoke→regression).

---

## Step 23 — Build our own System Under Test: `demo-shop-app`

**Status:** Done

**What**

- Built a **separate repository**, [`demo-shop-app`](https://github.com/jesuslombardo/demo-shop-app), as a minimal full-stack app to test against:
  - **Express 5** API: `/health`, `POST /api/login` (JWT), full `/api/products` CRUD (writes require a Bearer token).
  - **SQLite** (`better-sqlite3`, in-memory) seeded on boot with the six Sauce Demo products.
  - **Swagger UI** at `/api/docs` (+ raw spec at `/api/openapi.json`).
  - **Vanilla HTML/JS UI** (login + product list/create/delete) served statically by Express — no framework, no build step.
- Its **own CI** (`lint → unit tests → build & publish Docker image to GHCR`).
- Glibc-slim `Dockerfile` so `better-sqlite3` uses its **prebuilt binary** (no compiler in the image).

**Why**

- Sauce Demo is **frontend-only (no API)**, which made a _real_ testing pyramid impossible. Owning the app means API and E2E tests hit the **same backend and data model**. See [ADR-006](adr/006-custom-sut-and-testing-pyramid.md).

**Commands**

```bash
npm start          # http://localhost:3000  (Swagger at /api/docs)
npm test           # node --test (health, auth, CRUD over HTTP)
docker build -t demo-shop-app . && docker run --rm -p 3000:3000 demo-shop-app
```

**Files** (in the `demo-shop-app` repo)

- `app.js`, `server.js`, `src/{db,auth,products.router,openapi}.js`
- `public/{index,products}.html`, `public/js/*`, `public/css/styles.css`
- `Dockerfile`, `.github/workflows/ci.yml`, `test/api.test.js`

**Learnings**

- A vanilla UI served by Express starts in ~1 s — perfect for an **ephemeral** SUT in CI.
- `better-sqlite3` ships prebuilt binaries for **glibc** (Debian/Ubuntu), not musl — so use `node:22-bookworm-slim`, not Alpine, to avoid a source build.
- In-memory SQLite reseeded on every boot = **deterministic** test data with zero fixtures to reset.

---

## Step 24 — API tests + testing pyramid against `demo-shop-app`

**Status:** Done

**What**

- **Migrated the suite off Sauce Demo** onto our own SUT.
- Added **API tests** (`tests/api/products.api.spec.ts`) using the Playwright **`request` fixture**, tagged `@api`: health, login/JWT, list/get, 404, auth-required, validation, and a full create→read→update→delete round-trip.
- Rewrote the E2E layer: kept `LoginPage` (same `data-test` convention), added `ProductsPage`; new specs for login, logout, and product create/delete. Removed the Sauce-only cart/checkout/inventory POM + specs (preserved in git history).
- `playwright.config.ts`: a browserless **`api` project** (`testMatch` api specs) + browser projects that `testIgnore` them; a **`webServer`** that starts the app from `./app` (overridable with `BASE_URL`).
- Scripts: `test:api` (`--project=api`), `test:smoke` (`--grep @smoke`), `test:regression` (`--grep-invert @api`), and `app:setup` (clone + install the SUT locally).
- **CI is now the pyramid:** `quality → api → smoke → regression → deploy-report`. Every test job checks out `demo-shop-app` into `./app` and starts it ephemerally. Added **`API tests`** to the branch-protection required checks.

**Why**

- The pyramid runs **cheap/low-level first** (API) and **gates** the slower, more expensive E2E — fail-fast, and now a _genuine_ contract since both layers hit the same app.

**Commands**

```bash
npm run app:setup        # clone + install demo-shop-app into ./app
npm run test:api         # API layer (browserless)
npm run test:smoke       # @smoke E2E
npm run test:regression  # all E2E (excludes @api)
```

**The gotcha (key lesson)**

- The CI pipeline depends on a **second repository**. `actions/checkout` can pull a _public_ repo without extra credentials (`repository: jesuslombardo/demo-shop-app`, `path: app`), but the consuming job must then `npm ci` **in `app/`** before the `webServer` can start it.
- The GHCR image the app publishes is **private** by default; rather than make it public (or wire registry auth) just to use it as a CI `services:` container, we **run the app from source** — fewer moving parts, fully reproducible.
- Branch protection: **added** `API tests` to the required contexts (didn't rename the others) so the gate is explicit and no PR deadlocks — the Step 22 lesson, applied deliberately this time.

**Files**

- `tests/api/products.api.spec.ts`, `tests/products/products.spec.ts`, `tests/auth/*` (rewritten)
- `pages/products.page.ts` (new), `pages/login.page.ts` (reused), `fixtures/auth.fixture.ts`
- `playwright.config.ts`, `config/environments.ts`, `utils/data-generator.ts`, `package.json`
- `.github/workflows/ci.yml` (pyramid), `.env.example`, `.gitignore`, `eslint.config.mjs`, `.prettierignore`

**Learnings**

- Playwright's `request` fixture does API testing with **no browser** — keep those tests in their own project so they run once, not per browser.
- `@`-prefixed tokens in `describe`/test titles become **tags** automatically — `--grep`/`--grep-invert` then carve the pyramid layers out of one suite.
- `webServer` with a `url` health check turns "start the app, wait for it, tear it down" into config, not bash — and `reuseExistingServer: !CI` keeps local runs snappy.

---

## Step 25 — Cross-repo integration check + `CONTRIBUTING.md`

**Status:** Done

**What**

- Added a workflow **in the app repo** (`demo-shop-app/.github/workflows/e2e.yml`, `on: pull_request`) that runs **this** framework's suite against the app's PR version:
  - checks out `playwright-typescript` @ `main` into `tests/`,
  - checks out the **PR's app** into `tests/app` (so `webServer` starts _that_ version),
  - runs `npm run test:api && npm run test:regression` (API gates E2E).
- Made it a **required check** on `demo-shop-app`'s `main` (branch protection: `Lint` + `Unit tests` + `API + E2E suite`, enforce_admins on).
- Bumped the app's `ci.yml` actions to v6 (cleared the Node 20 deprecation warning).
- Wrote **`CONTRIBUTING.md`** documenting the two-repo flow, the "app first" rule, and this check.

**Why**

- A PR in the app previously ran only the app's **own unit tests** — it could pass yet still break the consumer's E2E. This closes that gap: an app change that breaks the tests now **fails the app PR before merge**. Standard cross-repo / integration-gate pattern.

**The gotcha (key lesson)**

- The check **lives in the app repo but runs the test repo's code** — so the gate appears as a status **on the app PR**, using only `GITHUB_TOKEN` (both repos public). No PAT, no `repository_dispatch` callback needed.
- Chosen over `repository_dispatch` (app → test repo) because that needs a PAT _and_ a manual Commit-Status callback to surface red/green on the PR. Running the suite _from_ the app repo is simpler and self-reporting.
- Direction matters: this repo's CI pulls app `@ main` (so "merge app first"); the app's PR check pulls this repo `@ main` (so it tests against the current suite). Together they keep both sides honest.

**Files**

- `demo-shop-app/.github/workflows/e2e.yml` (new), `demo-shop-app/.github/workflows/ci.yml` (v6)
- `CONTRIBUTING.md` (this repo)
- App branch-protection contexts (via `gh api`, not in the repo)

**Learnings**

- A `pull_request` workflow added _on a branch_ runs for **its own PR** (head-ref workflow) — so the PR that adds the check also self-tests it.
- One job can host a mini-pyramid: `test:api && test:regression` — `&&` makes API a hard gate for E2E without extra jobs.
- "Which repo does the checkout, and at which ref" **is** the integration contract between two repos.

---

## Step 26 — Execution cadence: fast PR gate + nightly regression

**Status:** Done

**What**

- Lightened the **app PR check** to **API + `@smoke`** (was API + full regression). Renamed the job `API + E2E suite` → `API + smoke` and updated the app's branch-protection context to match.
- Added **`.github/workflows/nightly.yml`** (this repo): `on: schedule` (06:00 UTC) + `workflow_dispatch`, running **API + full cross-browser regression** against `demo-shop-app @ main`.
- Recorded the policy in **[ADR-007](adr/007-test-execution-cadence.md)** and the cadence table in `CONTRIBUTING.md`.

**Why**

- Two axes that get conflated: **what** runs (`@smoke` vs full regression) and **when** (every PR vs nightly). Industry default: cheap/critical on every PR (fast feedback), heavy cross-browser regression nightly/pre-release. Keeps app PRs fast as the suite grows.

**Commands**

```bash
gh workflow run nightly.yml      # trigger the nightly on demand
gh run watch <run-id>            # watch it
```

**The gotcha (key lesson — again)**

- Renaming the job `API + E2E suite` → `API + smoke` is renaming a **required status check** → had to update the app's branch-protection contexts first, or PRs would deadlock waiting on a check that never reports (same lesson as Steps 22/24, applied on purpose).
- Tradeoff to own in interviews: a regression-only break from an **app** change can slip past the smoke gate and surface only in the **nightly** — accepted latency-for-speed; `@smoke` must stay honest about covering critical paths.

**Files**

- `.github/workflows/nightly.yml` (new), `docs/adr/007-test-execution-cadence.md` (new)
- `demo-shop-app/.github/workflows/e2e.yml` (fast gate), app branch-protection contexts (via `gh api`)
- `CONTRIBUTING.md`

**Learnings**

- A `schedule` workflow only runs from the **default branch** — so you verify it with `workflow_dispatch` (manual), not on the PR that adds it.
- `cron` in Actions is **UTC**; write the local-time equivalent in a comment so future-you isn't surprised.
- Cadence is a **policy** decision (trade-offs, alternatives) → it belongs in an ADR, not just a workflow file.

---

## Step 27 — App test tiers: real unit tests + a mini-pyramid in `demo-shop-app`

**Status:** Done

**What** (in the `demo-shop-app` repo)

- Added genuine **unit tests** (`test/unit/`) for the important pure functions — `authenticate`, `requireAuth`/`issueToken` (JWT, via fake `req`/`res`), and `isValidProduct` — with no HTTP and no DB.
- Reclassified the existing HTTP test as **integration** (`test/integration/api.test.js`): it boots the app and exercises it over HTTP. The CI job was mislabelled "Unit tests" when it was really integration.
- Split the app's CI into a **mini-pyramid**: `Lint → Unit tests → Integration tests → publish-image`. Added `Integration tests` to the app's required checks.
- Scripts: `test:unit` / `test:integration`.

**Why**

- Make the pyramid's **levels** explicit _inside_ the app too: unit = isolate pure logic (fast, pinpoints the broken function); integration = the stack wired together. Same cheap-first / fail-fast idea as the cross-repo pyramid, one layer down.

**Commands**

```bash
npm run test:unit          # pure functions, no I/O
npm run test:integration   # boots the app, hits it over HTTP
```

**The gotchas (two good ones)**

- A unit test caught `isValidProduct(null)` returning **`null`** (from `&&` short-circuit), not `false`. A predicate should return a real boolean → wrapped in `Boolean(...)`. This is exactly the value of unit tests: integration still rejected the input, but the unit level exposed the dirty return type.
- `node --test test/unit/` treats a **bare directory as a file** (`MODULE_NOT_FOUND`) in Node 22.23 → use the glob form `node --test test/unit/*.test.js` (shell-expanded).

**Files** (in `demo-shop-app`)

- `test/unit/auth.test.js`, `test/unit/products.test.js`, `test/integration/api.test.js`
- `src/products.router.js` (export + boolean fix), `package.json`, `.github/workflows/ci.yml`, `README.md`

**Learnings**

- **Unit vs integration** is about _isolation_: no I/O = unit; boots the app / touches HTTP or DB = integration.
- Predicates should return booleans, not "falsy-ish" values — small habit, fewer surprises.
- Pyramids **nest**: the app has unit→integration; the framework has API→smoke→regression; together they cover the system at every level.

---

## Step 28 — Use a real GitHub Secret end-to-end (`JWT_SECRET`)

**Status:** Done

**What**

- Picked an **honestly sensitive** value to demo the secrets pattern: the app's **JWT signing key** (`JWT_SECRET`), which had a hardcoded default.
- Created a `JWT_SECRET` **GitHub Secret** in both repos.
- **App CI** (`demo-shop-app`): injected it into the `integration` job (`env: JWT_SECRET: ${{ secrets.JWT_SECRET }}`) + a masked proof step (`echo "JWT_SECRET provided -> ${JWT_SECRET:+yes}"` → prints `yes`, value stays masked).
- **Testing pipeline**: workflow-level `env: JWT_SECRET` in `ci.yml` + `nightly.yml`, **forwarded to the SUT** through `playwright.config.ts` (`webServer.env.JWT_SECRET = process.env.JWT_SECRET || 'demo-shop-dev-secret'`).
- Documented in `.env.example` + CONTRIBUTING.

**Why**

- The earlier `SAUCE_*` secrets disappeared when we moved to public demo creds — leaving the pattern unused. The JWT key is a value that genuinely _should not_ be hardcoded, so it's a truthful demonstration: **secret in CI, safe default locally**.

**Why it doesn't break anything**

- The app signs and verifies with the _same_ `JWT_SECRET` within a process — whatever value it is. Tests assert the _behaviour_ (login → token → authorized request), not the secret, so any valid key works.

**The key lessons**

- **Two scopes** for `env:` — **job-level** (app: only the `integration` job that runs the app) vs **workflow-level** (testing repo: every job that boots the SUT). Scope to where it's needed.
- **Crossing the repo boundary**: a secret in the test pipeline only reaches the SUT because `webServer.env` _forwards_ it to the spawned app process — env vars don't cross process boundaries by themselves.
- **Proving a secret without leaking it**: `${VAR:+yes}` shows presence; GitHub also masks any secret value that would appear in logs.
- Public value → committed default; sensitive value → Secret + `.env` (gitignored). Same `process.env.X || default` code serves both.

**Files**

- `demo-shop-app/.github/workflows/ci.yml` (integration `env` + proof step)
- `.github/workflows/ci.yml`, `.github/workflows/nightly.yml` (workflow-level `env`)
- `playwright.config.ts` (forward via `webServer.env`), `.env.example`, `CONTRIBUTING.md`
- `JWT_SECRET` GitHub Secrets in both repos (not in the repo)

**Learnings**

- A secret is only useful if something **consumes** it at runtime — trace the path: Secret → workflow `env` → process → (here) `webServer.env` → app.
- Keep a working **default** so local runs and forks (no secret access) still pass.

---

## Step 29 — Schema-based contract tests against the OpenAPI spec

**Status:** Done

**What**

- Added **contract tests** (`tests/api/contract.api.spec.ts`, tagged `@api @contract`) that validate responses against the provider's **published OpenAPI schema** — fetched at runtime from `/api/openapi.json` (the same Swagger spec that powers the docs) and checked with **Ajv**.
- First **tightened the spec** (separate app PR): `Product` got `required: [...]` + `additionalProperties: false`, and a new `LoginResponse` schema. A loose schema validates nothing.
- They run in the `api` project, so they're part of the API layer everywhere `test:api` runs (pyramid, nightly, and the app's cross-repo PR gate).

**Why**

- Functional API tests check **behaviour** (status, auth, CRUD); contract tests check **shape** — exact fields, types, no extras. They catch **drift** (a renamed/retyped/extra field) that a happy-path assertion misses. And they reuse the OpenAPI spec as a **single source of truth** for docs _and_ tests.

**How it works**

```ts
const spec = await (await ctx.get('/api/openapi.json')).json()
const validateProduct = ajv.compile(spec.components.schemas.Product)
// ...
expect(validateProduct(product), JSON.stringify(validateProduct.errors)).toBeTruthy()
```

**The key lessons**

- **A contract is only as strict as the schema.** Without `required` + `additionalProperties: false`, validation passes on almost anything — tightening the spec is what makes the test meaningful (and sharpens Swagger docs too).
- **"Merge app first" — live example:** the contract tests pull the spec from app `@main`, so the app PR (tightened spec + `LoginResponse`) had to merge _before_ this one, or `spec.components.schemas.LoginResponse` would be `undefined`.
- **Ajv `strict: false`** so it ignores OpenAPI-only keywords (`example`); OpenAPI 3.0 schemas ≈ JSON Schema for simple shapes.
- This is **schema-based** contract testing, not **Pact** (consumer-driven). Honest framing for interviews.

**Files**

- `tests/api/contract.api.spec.ts`, `package.json` (ajv devDep)
- `demo-shop-app/src/openapi.js` (tightened — its own PR)

**Learnings**

- The OpenAPI/Swagger spec earns its keep when it's **consumed**: docs (Swagger UI) + machine-checkable contract (Ajv) from the _same_ document.
- Run contract checks in the API layer (cheap, browserless) — they gate E2E just like the functional API tests.

---

## Step 30 — Test sharding (`--shard` + `merge-reports`)

**Status:** Done

**What**

- Sharded the `regression` job into a **2-shard matrix** (`--shard=${{ matrix.shard }}/${{ strategy.job-total }}`, `--reporter=blob`); each shard uploads its blob.
- Added a **`merge-reports`** job: downloads all shard blobs (`download-artifact` + `merge-multiple`) and runs `npx playwright merge-reports --reporter html` → one HTML report → Pages. `deploy-report` now `needs: merge-reports`.
- Updated branch-protection contexts: `Regression` → `Regression (1)` + `Regression (2)`.
- Decision + measured trade-offs in **[ADR-008](adr/008-test-sharding.md)**.

**Why**

- The canonical way to cut a long suite's wall-clock: split across N machines (speed via horizontal scaling), then stitch the per-shard reports back into one.

**The numbers (measured, our repo)**

|            | Unsharded | 2 shards + merge  |
| ---------- | --------- | ----------------- |
| Wall-clock | ~60s      | **~86s** (slower) |
| Compute    | ~60s      | **~137s** (~2.3×) |

- At ~15 fast tests, **setup (~36s) ≫ tests (~21s)** → sharding is net-negative here. **Didactic**: shows the pattern; pays off when tests ≫ setup.

**The gotchas / lessons**

- **A matrix renames the check** — `Regression` became `Regression (1)`/`(2)`; required-status contexts must be updated or PRs deadlock (same lesson, on purpose).
- **`strategy.job-total`** as the shard divisor → change `matrix.shard` and the `/N` follows automatically.
- **Merging reports**: shards emit `blob-report/report-*.zip`; `download-artifact` with `merge-multiple: true` flattens them into one dir for `merge-reports`.
- **Too few tests → uneven shards** (measured 51s vs 74s) — balancing needs volume.
- Verified the whole flow locally first (run shard 1/2 + 2/2, merge) before touching CI.

**Files**

- `.github/workflows/ci.yml` (matrix + merge-reports + deploy needs)
- `docs/adr/008-test-sharding.md`, branch-protection contexts (via `gh api`)

**Learnings**

- Sharding is a **speed** tool, not coverage — orthogonal to cross-browser.
- Always pair shards with a **merge** step, or you get N fragmented reports.
- Measure before adopting: the crossover is **tests ≫ setup**.

---

## Step 31 — Node version matrix (compatibility)

**Status:** Done

**What**

- Turned the cheapest job — **`api`** — into a **compatibility matrix** over `node: [22, 24]`: `strategy.matrix.node` + `node-version: ${{ matrix.node }}`, `fail-fast: false`.
- The full API suite now runs **once per Node version, in parallel** — each job also boots the app under that Node.
- Made the failure artifact name per-version (`api-debug-node${{ matrix.node }}`) so the two jobs don't collide.
- Updated branch-protection contexts: `API tests` → `API tests (22)` + `API tests (24)`.
- Decision + honest trade-offs in **[ADR-009](adr/009-node-version-matrix.md)**.

**Why**

- To show the **classic matrix use case** — running the suite across an environment you don't control — which neither sharding (speed) nor cross-browser (already covered) demonstrates.
- **Node, not browsers**: Playwright already runs all 3 browsers, so a browser matrix would just duplicate coverage; Node is a new axis.

**Sharding vs matrix (the distinction)**

|              | Sharding (Step 30)        | Matrix / compatibility (this step) |
| ------------ | ------------------------- | ---------------------------------- |
| **Goal**     | Speed                     | Coverage                           |
| **Each job** | Runs a **slice** of tests | Runs the **full** suite            |
| **Varies**   | `--shard=i/N`             | the environment (Node version)     |
| **Real for** | suites of many minutes    | code with external consumers       |

**Commands**

```bash
gh pr create ...            # PR runs API tests (22) + API tests (24)
gh api ...required_status_checks  # swap API tests -> API tests (22)/(24)
```

**Files**

- `.github/workflows/ci.yml` (`api` job → matrix)
- `docs/adr/009-node-version-matrix.md`, branch-protection contexts (via `gh api`)

**Learnings**

- A **matrix** = run the same job once per list value; **sharding is just a matrix used for speed**, this is a matrix used for coverage.
- **Didactic here** — the app pins `node >=22` and has no external users, so Node 24 catches nothing real today; it's the pattern that matters.
- Same recurring gotcha: a matrix **renames the required check**, so branch-protection contexts must follow.

---

```markdown
## Step N — [Title]

**Status:** Done | In progress | Pending

**What**

- ...

**Why**

- ...

**Commands**
\`\`\`bash

# ...

\`\`\`

**Files**

- ...

**Learnings**

- ...
```
