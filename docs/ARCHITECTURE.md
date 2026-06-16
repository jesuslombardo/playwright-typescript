# Architecture

This document describes the current design of the test automation framework.
For the history of how it was built, see [BUILD_LOG.md](BUILD_LOG.md).
For rationale behind major choices, see [Architecture Decision Records](adr/).

## Overview

A layered Playwright + TypeScript framework for E2E web testing, structured for scalability and maintainability.

```
tests/        → what we validate (scenarios)
pages/        → how we interact with screens (Page Object Model)
components/   → shared UI pieces (header, modals, toasts)
fixtures/     → test setup and dependency injection (Playwright)
utils/        → non-UI helpers (data generators, formatters)
config/       → environment URLs, credentials, test data
```

## Folder structure

```
playwright-typescript/
├── tests/                  # Test specs — scenarios only
│   └── example.spec.ts
├── pages/                  # Page Objects — one class per screen
├── components/             # Component Objects — shared UI across pages
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
- Prefer **has-a** over **is-a** (composition over inheritance).

### Fixtures

- Playwright fixtures extend the test runner with reusable setup.
- Use for repeated flows: authenticated sessions, API mocks, test data seeding.
- Fixtures orchestrate; they do not contain UI selectors.

See [ADR-004](adr/004-components-vs-fixtures.md) for the full decision guide, anti-patterns, and examples.

## Where does this code go?

Quick reference — use this when unsure:

```
Is it a test scenario or assertion?     → tests/
Is it a full screen (login, checkout)?  → pages/
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

- Group specs by feature/domain: `tests/auth/`, `tests/inventory/`.
- One test file per logical feature area.
- Assertions stay in tests — not inside page objects (default rule).

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

## Target application (Phase 2)

Practice tests run against [Sauce Demo](https://www.saucedemo.com) — a stable public app ideal for login, inventory, and cart flows.

## Related documentation

- [Build Log](BUILD_LOG.md) — chronological setup journal
- [ADR index](adr/README.md) — decision records
- [ADR-001: POM and folder structure](adr/001-page-object-model-and-folder-structure.md)
- [ADR-002: Browser strategy](adr/002-browser-execution-strategy.md)
- [ADR-003: Code style](adr/003-code-style-eslint-prettier.md)
- [ADR-004: Components vs fixtures](adr/004-components-vs-fixtures.md)

## Evolution

This document reflects the **current** design and is updated when architecture changes.
When a decision changes, add or supersede an ADR — do not delete history.
