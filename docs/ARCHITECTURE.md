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
data/         → scenario test data (factories + datasets) — see ADR-014
utils/        → non-UI helpers (API helpers, formatters)
config/       → environment URLs and env-backed credentials
examples/     → OOP pattern gallery (opt-in study layer) — see ADR-018
ai/           → AI-assisted testing helpers (opt-in) — see ADR-019
app/          → the System Under Test, cloned in (gitignored) — see SUT below
```

## Folder structure

```
playwright-typescript/
├── tests/                  # Test specs — scenarios only
│   ├── api/                # API layer (request fixture, @api) — pyramid base
│   ├── auth/               # login, logout (E2E)
│   ├── products/           # product list, create/delete (E2E)
│   ├── visual/             # visual regression baseline (E2E, @visual)
│   ├── mobile/             # responsive/touch on an emulated device (*.mobile.spec.ts)
│   ├── a11y/               # accessibility scans (axe-core, *.a11y.spec.ts) — ADR-021
│   └── ai/                 # LLM-as-judge + self-healing (opt-in, *.ai.spec.ts) — ADR-019
├── pages/                  # Page Objects — one class per screen
│   ├── login.page.ts
│   └── products.page.ts
├── components/             # Component Objects — shared UI across pages (header.component.ts)
├── fixtures/               # Custom Playwright fixtures (auth, product lifecycle)
├── data/                   # Test data layer — factories + datasets (ADR-014)
│   ├── product.factory.ts  # faker-based builder for unique products
│   ├── products.dataset.ts # reference seed data + data-driven create cases
│   └── auth.dataset.ts     # data-driven login cases
├── utils/                  # Generic helpers (no DOM) — e.g. API token helper
├── ai/                     # AI-assisted testing (opt-in): judge + self-healing — ADR-019
├── config/                 # Environment + env-backed credentials
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
| `fixtures/`   | Test setup, teardown, injected state   | No (orchestrates)     | `loggedInPage`, `apiProduct` fixtures   |
| `data/`       | Scenario data — factories + datasets   | No                    | `buildProduct({ price: 0 })`            |
| `utils/`      | Pure helpers                           | No                    | `getToken(request)`                     |
| `config/`     | URLs, env vars, env-backed credentials | No                    | `baseURL` per environment               |

## Patterns

### Page Object Model (POM)

- Playwright [recommends POM](https://playwright.dev/docs/pom) for structuring large suites.
- Each screen gets a class in `pages/` with locators and user actions.
- Tests call page methods — never raw selectors in specs.

### Component composition

- UI shared across pages (navbar, modals) lives in `components/`.
- Page objects **compose** components — they do not duplicate selectors.
- Prefer **has-a** over **is-a** for components; use inheritance only for shared page layout (e.g. an authenticated shell).
- demo-shop-app **v2.0.0** introduced shared chrome — a topbar (☰ menu, live cart badge, catalogue/cart/orders links, role badge, Logout) on every signed-in page — so `components/header.component.ts` models it and the page objects **compose** it (`page.header`). (`components/` was empty while the SUT was two flat pages; Sauce Demo's earlier `HeaderComponent`/`AuthenticatedPage` are in git history. See ADR-004.)

### Fixtures

- Playwright fixtures extend the test runner with reusable setup.
- Use for repeated flows: authenticated sessions, API mocks, test data seeding.
- Fixtures orchestrate; they do not contain UI selectors.

See [ADR-004](adr/004-components-vs-fixtures.md) for the full decision guide, anti-patterns, and examples.

### Test data

- **`config/` = environment, `data/` = scenarios.** URLs and env-backed
  credentials stay in `config/`; products, login cases and other scenario data
  live in `data/`.
- **Factory** (`buildProduct`) for unique, synthetic data a test **creates**;
  **datasets** for known, named cases driven through a `for…of` loop
  (data-driven testing — the suite scales by data, not copy-pasted tests).
- **Lifecycle fixture** (`apiProduct`) seeds an entity over the API and deletes
  it after the test, so tests stay isolated. Also enables "set up via API,
  assert via UI".

See [ADR-014](adr/014-test-data-layer.md) and [`data/README.md`](../data/README.md).

### OOP patterns & principles (study layer)

- An **additive** layer that _demonstrates_ OOP without bloating the suite. It
  splits in two: **organic** patterns that close real coverage gaps live in
  `tests/` and run in CI (Template Method, Generics `CrudClient<T>`, Strategy,
  and a `BasePage` the page objects extend); a **gallery** of patterns the app
  doesn't need lives under `examples/patterns/` and runs opt-in via
  `npm run test:patterns`.
- [docs/patterns/README.md](patterns/README.md) — the catalogue.
  [docs/oop-principles/README.md](oop-principles/README.md) — each principle
  mapped to the file that shows it, plus an interview-defense cheat sheet.
- Guiding rule: **a pattern must earn its place** — see
  [ADR-018](adr/018-oop-patterns-and-principles-layer.md).

### Accessibility (axe-core)

- An **always-on** `a11y` Playwright project (`*.a11y.spec.ts`, Chromium-only, like
  `visual`) scans the login and products pages with **`@axe-core/playwright`** over
  WCAG 2.0/2.1 A + AA, via the shared helper `utils/a11y.ts`.
- The gate **fails on `serious`/`critical`** violations only (`minor`/`moderate` are
  a backlog). The first scan found real contrast defects in the SUT, which were
  **fixed in `demo-shop-app` v1.2.0** rather than excluded — so the gate passes
  because the app is compliant. See [ADR-021](adr/021-accessibility-testing-axe-core.md).
- Automated checks are a **floor, not a ceiling**: they don't replace manual /
  assistive-technology testing.

### AI-assisted testing (opt-in study layer)

- An **additive, gated** layer ([`ai/`](../ai/)) demonstrating two AI-assisted
  techniques as an _augmentation_ to the deterministic suite, never inside it:
  **LLM-as-judge** (`ai/judge.ts`, semantic assertions a `toBe` can't express) and
  **self-healing locators** (`ai/self-healing.ts`, recover a broken selector via the
  model — only on the failure path). Both reach the LLM through one seam,
  `ai/gemini.client.ts`.
- Isolated like the other non-E2E layers: a dedicated `ai` Playwright project matched
  by `*.ai.spec.ts`, opt-in via `AI_TESTS=1` (`npm run test:ai`), and each spec skips
  without `GEMINI_API_KEY`. CI runs it only through a separate, manual workflow.
- Guiding rule (as with the OOP layer): it **earns its place** by staying out of the
  gate — the determinism trade-off is handled by gating, not hope. See
  [ADR-019](adr/019-ai-assisted-testing-llm-judge-and-self-healing.md).

## Where does this code go?

Quick reference — use this when unsure:

```
Is it a test scenario or assertion?     → tests/
Is it a full screen (login, products)?  → pages/
Is it UI shared across screens?         → components/
Is it repeated test setup/teardown?     → fixtures/
Is it scenario data (a product, a case)? → data/
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
| Factory     | `*.factory.ts`   | `product.factory.ts`  |
| Dataset     | `*.dataset.ts`   | `products.dataset.ts` |
| Util        | `*.ts`           | `api.ts`              |

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
  Two flavours:
  - **Functional** (`products.api.spec.ts`) — behaviour: status codes, auth, CRUD.
  - **Contract** (`contract.api.spec.ts`, `@contract`) — _shape_: responses are validated with
    Ajv against the provider's **OpenAPI schema** (fetched from `/api/openapi.json`, the same
    Swagger spec used for docs). Catches drift that functional happy-paths miss. Schema-based,
    not Pact. See [BUILD_LOG Step 29](BUILD_LOG.md).
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
- [OOP patterns catalogue](patterns/README.md) · [OOP principles map](oop-principles/README.md) — study layer ([ADR-018](adr/018-oop-patterns-and-principles-layer.md))
- [ADR-019: AI-assisted testing](adr/019-ai-assisted-testing-llm-judge-and-self-healing.md) — LLM-as-judge & self-healing (opt-in)

## Evolution

This document reflects the **current** design and is updated when architecture changes.
When a decision changes, add or supersede an ADR — do not delete history.
