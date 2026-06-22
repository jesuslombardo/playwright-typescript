# Architecture

This document describes the current design of the test automation framework.
For the history of how it was built, see [BUILD_LOG.md](BUILD_LOG.md).
For rationale behind major choices, see [Architecture Decision Records](adr/).

## Overview

A layered Playwright + TypeScript framework for E2E web testing, structured for scalability and maintainability.

```
tests/        → what we validate (API + E2E scenarios)
pages/        → how we interact with screens (Page Object Model)
components/   → shared UI pieces (header, modals, toasts)
fixtures/     → test setup and dependency injection (Playwright)
utils/        → non-UI helpers (data generators, formatters)
config/       → environment URLs, credentials, test data
app/          → the System Under Test, cloned in (gitignored) — see SUT below
```

## Folder structure

```
playwright-typescript/
├── tests/                  # Test specs — scenarios only
│   ├── api/                # API layer (request fixture, @api) — pyramid base
│   ├── auth/               # login, logout (E2E)
│   └── products/           # product list, create/delete (E2E)
├── pages/                  # Page Objects — one class per screen
│   ├── login.page.ts
│   └── products.page.ts
├── components/             # Component Objects — shared UI across pages (reserved)
├── fixtures/               # Custom Playwright fixtures
├── utils/                  # Generic helpers (no DOM)
├── config/                 # Environment and test data config
├── docs/
│   ├── ARCHITECTURE.md     # This file — current design
│   ├── BUILD_LOG.md        # Step-by-step build journal
│   └── adr/                # Architecture Decision Records
├── playwright.config.ts    # Global Playwright configuration
├── tsconfig.json
├── eslint.config.mjs
└── .prettierrc
```

## Layer responsibilities

| Layer         | Responsibility                         | Knows about DOM?      | Example                                 |
| ------------- | -------------------------------------- | --------------------- | --------------------------------------- |
| `tests/`      | Scenarios and assertions               | Via page objects only | `user can login with valid credentials` |
| `pages/`      | Screen-specific locators and actions   | Yes                   | `LoginPage.login(user, pass)`           |
| `components/` | Reusable UI blocks on multiple screens | Yes                   | `HeaderComponent.logout()`              |
| `fixtures/`   | Test setup, teardown, injected state   | No (orchestrates)     | `loggedInPage` fixture                  |
| `utils/`      | Pure helpers                           | No                    | `generateRandomEmail()`                 |
| `config/`     | URLs, env vars, static test data       | No                    | `baseURL` per environment               |

## Patterns

### Page Object Model (POM)

- Playwright [recommends POM](https://playwright.dev/docs/pom) for structuring large suites.
- Each screen gets a class in `pages/` with locators and user actions.
- Tests call page methods — never raw selectors in specs.

### Component composition

- UI shared across pages (navbar, modals) lives in `components/`.
- Page objects **compose** components — they do not duplicate selectors.
- Prefer **has-a** over **is-a** for components; use inheritance only for shared page layout (e.g. an authenticated shell).
- The current SUT (demo-shop-app) has a deliberately minimal UI — two flat pages (`LoginPage`, `ProductsPage`) and no shared chrome yet — so `components/` is reserved for when shared UI appears. (Sauce Demo's `HeaderComponent`/`AuthenticatedPage` lived here previously; see git history + ADR-004.)

### Fixtures

- Playwright fixtures extend the test runner with reusable setup.
- Use for repeated flows: authenticated sessions, API mocks, test data seeding.
- Fixtures orchestrate; they do not contain UI selectors.

See [ADR-004](adr/004-components-vs-fixtures.md) for the full decision guide, anti-patterns, and examples.

## Where does this code go?

Quick reference — use this when unsure:

```
Is it a test scenario or assertion?     → tests/
Is it a full screen (login, products)?  → pages/
Is it UI shared across screens?         → components/
Is it repeated test setup/teardown?     → fixtures/
Is it a helper with no browser/DOM?     → utils/
Is it a URL, env var, or credential?   → config/
```

**Rule of thumb:** components model the **app**; fixtures model the **test preconditions**.

```
┌─────────────┐     uses      ┌─────────────┐
│   tests/    │ ────────────► │   pages/    │
└─────────────┘               └──────┬──────┘
       ▲                             │ composes
       │ injected by                 ▼
┌─────────────┐               ┌─────────────┐
│  fixtures/  │ ──uses──────► │ components/ │
└─────────────┘               └─────────────┘
       │ uses pages/components
       ▼
   (never defines locators directly)
```

## Conventions

### File naming

| Type        | Pattern          | Example               |
| ----------- | ---------------- | --------------------- |
| Test spec   | `*.spec.ts`      | `login.spec.ts`       |
| Page Object | `*.page.ts`      | `login.page.ts`       |
| Component   | `*.component.ts` | `header.component.ts` |
| Fixture     | `*.fixture.ts`   | `auth.fixture.ts`     |
| Util        | `*.ts`           | `data-generator.ts`   |

### Test organization

- Group specs by feature/domain: `tests/auth/`, `tests/products/`, and `tests/api/` for the API layer.
- One test file per logical feature area.

### Test writing rules

- **Actions** → page/component methods only (`loginPage.login()`, `productsPage.addProduct()`).
- **Assertions** → in tests with `expect()` — not inside page objects.
- **Selectors** → defined in pages/components; tests reuse their locators.
- **URL checks** → allowed directly in tests (`toHaveURL`).

### Code style

- Prettier enforces formatting (`semi: false`, `singleQuote: true`).
- ESLint enforces code quality rules.
- Format on save enabled via `.vscode/settings.json`.

## Browser execution strategy

| Context              | Browsers                  | Trigger                            |
| -------------------- | ------------------------- | ---------------------------------- |
| Local development    | Chromium only             | `npm test`                         |
| Manual cross-browser | Chromium, Firefox, WebKit | `npm run test:cross-browser`       |
| CI                   | All browsers              | `CI=true` (automatic in pipelines) |

See [ADR-002](adr/002-browser-execution-strategy.md) for rationale.

## System Under Test (SUT)

Tests run against **our own app**, [`demo-shop-app`](https://github.com/jesuslombardo/demo-shop-app)
(Express + SQLite + JWT + Swagger + a minimal vanilla UI), which lives in a separate repo.

- **Locally:** `npm run app:setup` clones it into `./app` (gitignored); Playwright's `webServer` starts it.
- **In CI:** each test job checks out `demo-shop-app` into `./app` and `webServer` starts it ephemerally.
- **Override:** set `BASE_URL` to point the suite at an already-running instance and skip `webServer`.

> Phase 2 originally targeted [Sauce Demo](https://www.saucedemo.com), but it has no public API.
> Owning the SUT lets API and E2E tests share one backend — see [ADR-006](adr/006-custom-sut-and-testing-pyramid.md).

## Testing pyramid

```
quality → api → smoke → regression → deploy-report (CD)
   lint     │      │         │            └ publish HTML report to GitHub Pages
            │      │         └ full E2E suite (--grep-invert @api)
            │      └ @smoke E2E (critical path)
            └ API tests (request fixture, browserless) — cheap base, gates E2E
```

- **API layer** (`tests/api/`, the `api` project): Playwright's `request` fixture, no browser.
  Tagged `@api` so it runs once in its own project and is excluded from the E2E regression run.
- **E2E layer** (browser projects): ignore the `*.api.spec.ts` files; Chromium locally, all three in CI.
- The layers run **cheap-first, fail-fast** via `needs:` in the workflow.

## Related documentation

- [Master Roadmap](ROADMAP.md) — priority order and what to build next
- [Build Log](BUILD_LOG.md) — chronological setup journal
- [ADR index](adr/README.md) — decision records
- [ADR-001: POM and folder structure](adr/001-page-object-model-and-folder-structure.md)
- [ADR-002: Browser strategy](adr/002-browser-execution-strategy.md)
- [ADR-003: Code style](adr/003-code-style-eslint-prettier.md)
- [ADR-004: Components vs fixtures](adr/004-components-vs-fixtures.md)
- [ADR-005: Anti-flaky test strategy](adr/005-anti-flaky-test-strategy.md)
- [ADR-006: Custom SUT + testing pyramid](adr/006-custom-sut-and-testing-pyramid.md)

## Evolution

This document reflects the **current** design and is updated when architecture changes.
When a decision changes, add or supersede an ADR — do not delete history.
