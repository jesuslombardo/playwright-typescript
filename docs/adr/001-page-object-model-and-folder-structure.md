# ADR-001: Page Object Model and folder structure

## Status

Accepted

## Context

The project starts with flat tests (`tests/example.spec.ts`) where selectors and actions live inline.
This works for demos but does not scale: selector changes require edits across many files, and tests become hard to read.

Playwright recommends the [Page Object Model](https://playwright.dev/docs/pom) for large suites.
We also need a place for shared UI (headers, modals), test setup, helpers, and environment config.

## Decision

Adopt a layered folder structure:

- `tests/` — test scenarios and assertions only
- `pages/` — Page Objects (one class per screen)
- `components/` — Component Objects for UI shared across pages
- `fixtures/` — custom Playwright fixtures for setup/teardown
- `utils/` — non-UI helpers
- `config/` — environment URLs and test data

Use **composition**: page objects import and use component objects; fixtures orchestrate setup without containing selectors.

For criteria on what belongs in `components/` vs `fixtures/`, see [ADR-004](004-components-vs-fixtures.md).

Target application for Phase 2: [Sauce Demo](https://www.saucedemo.com).

## Consequences

### Positive

- Clear separation of concerns — easy for new devs to navigate
- Selector changes isolated to one page or component class
- Aligns with industry SDET practice and Playwright POM guidance
- Scales from a few tests to large suites

### Negative

- More files and folders upfront — can feel heavy for very small suites
- Requires discipline to keep selectors out of test specs

## Alternatives considered

| Alternative                   | Why not chosen                                                         |
| ----------------------------- | ---------------------------------------------------------------------- |
| Flat tests (no POM)           | Does not scale; poor maintainability for a portfolio framework         |
| Screenplay pattern            | Higher learning curve; less common in Playwright ecosystems            |
| Flows-only (no pages)         | Good complement later, but pages are the industry baseline             |
| `components/` inside `pages/` | Valid variant; we use sibling folders for clearer top-level navigation |
