# SDET Automation Framework (Playwright + TypeScript)

[![CI/CD](https://github.com/jesuslombardo/playwright-typescript/actions/workflows/ci.yml/badge.svg)](https://github.com/jesuslombardo/playwright-typescript/actions/workflows/ci.yml)

A foundational project to incrementally build a modern, maintainable, and scalable test automation framework, following real-world quality engineering practices.

**Live test report (CD):** after each push to `main`, the latest Playwright HTML report is published to [GitHub Pages](https://jesuslombardo.github.io/playwright-typescript/) _(enable Pages → Source: GitHub Actions in repo settings if the link is 404)_.

## Vision

This repository evolves from scratch into a complete testing solution for web applications, with a focus on:

- code quality and clean architecture,
- functional and non-functional test coverage,
- observability and actionable reporting for teams,
- continuous integration and continuous delivery (CI/CD),
- a consistent, professional developer experience.

## Technical Goals

- Design a solid, extensible foundation with `Playwright + TypeScript`.
- Apply SDET best practices: patterns, reuse, and separation of concerns.
- Incorporate automated quality checks (lint, format, tests, validations).
- Run pipelines in CI from early stages.
- Document technical decisions to support maintenance and collaboration.

## Project Principles

- **Scalability:** structure designed to grow by modules and domains.
- **Maintainability:** readable, reusable code with clear conventions.
- **Reliability:** stable suites with a focus on reducing flakiness.
- **Traceability:** accessible test results and evidence.
- **Continuous iteration:** small, frequent, and measurable improvements.

## Roadmap (Incremental)

> This roadmap will be updated on each iteration.

### Phase 1 - Bootstrap

- Initialize the Node + TypeScript project.
- Set up Playwright.
- Establish base conventions (linting, formatting, npm scripts).

### Phase 2 - Automation Foundation

- Layered folder structure (tests, pages, fixtures, utils, config).
- First representative E2E tests.
- Data handling and environment-based configuration.

### Phase 3 - Quality and Reporting

- Reporting (HTML and/or Allure).
- Retries and anti-flaky strategy.
- Local quality hooks (pre-commit/pre-push).

### Phase 4 - CI/CD

- GitHub Actions pipeline:
  - install
  - lint
  - test
  - publish artifacts/reports
- Execution on branches and pull requests.

### Phase 5 - Hardening and Advanced Practices

- Parallelism, sharding, and runtime optimization.
- Tagging strategy and test selection.
- Technical documentation and contribution guidelines.

## Definition of Done

This project is considered successful when the repository enables:

- bootstrapping the framework with minimal setup,
- running tests reliably in local and CI environments,
- quickly understanding architecture and design decisions,
- extending the solution without friction.

## Documentation

- [Master Roadmap](docs/ROADMAP.md) — priority order, status, and what to build next
- [Architecture](docs/ARCHITECTURE.md) — current framework design, patterns, and conventions
- [Build Log](docs/BUILD_LOG.md) — step-by-step journal of every setup decision, command, and learning along the way
- [Architecture Decision Records](docs/adr/) — rationale behind major technical choices

## Current Status

```
✅ Phase 1   Bootstrap
✅ Phase 2   Automation (6 E2E, POM, fixtures, 4 ADRs)
✅ Phase 4   CI/CD (pipeline + CD via GitHub Pages)
⬜ Phase 3   Hooks + reporting + anti-flaky
⬜ Phase 5   Tags, sharding, hardening
```

**Phase 4 — CI/CD** (complete)

- [x] GitHub Actions: lint + format + Playwright on push/PR
- [x] `needs: quality` — tests run only after lint/format pass
- [x] Cross-browser in CI (Chromium, Firefox, WebKit)
- [x] Debug artifact on failure (`if: failure()` — report + traces + videos)
- [x] Secrets pattern for credentials (`SAUCE_*` env vars)
- [x] CD MVP: Playwright report published to GitHub Pages on `main`
- [x] BUILD_LOG Step 15 — CI/CD documented
- [x] BUILD_LOG Step 16 — measured CI run time; browser cache tried + reverted (real fix = Docker image, see Phase 5)
- [x] BUILD_LOG Step 17 — local secrets via `.env` + `.env.example` (dotenv)

**Phase 2 — Automation Foundation** (complete)

- [x] Folder structure, POM, components, fixtures, utils, config
- [x] Sauce Demo flows: login, inventory, cart, checkout, logout
- [x] Architecture docs + 4 ADRs

**Phase 1 — Bootstrap** (complete)

- [x] Git, Node, TypeScript, Playwright, ESLint, Prettier, editor settings

See [Roadmap](docs/ROADMAP.md), [Architecture](docs/ARCHITECTURE.md), and [Build Log](docs/BUILD_LOG.md) for details.
