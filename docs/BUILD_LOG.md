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
- `package.json` declares *what* you want (`^6.0.3` = flexible).
- `package-lock.json` pins *exact* versions for reproducible installs across machines and CI.

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
✅ .gitignore (Playwright artifacts)
⬜ Commit bootstrap changes
```

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
  await page.goto('https://playwright.dev/');       // 1. Navigate
  await expect(page).toHaveTitle(/Playwright/);      // 2. Assert
});
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
- Commit bootstrap changes.
- Start structuring folders (pages, fixtures, utils) — Phase 2.

---

## Template for future entries

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
