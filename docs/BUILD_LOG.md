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
⬜ First Page Object (Sauce Demo)
⬜ First real E2E test
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

- Step 2.2: First Page Object (`LoginPage`) for Sauce Demo.

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
