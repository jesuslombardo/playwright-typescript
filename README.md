# SDET Automation Framework (Playwright + TypeScript)

A foundational project to incrementally build a modern, maintainable, and scalable test automation framework, following real-world quality engineering practices.

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

- [Architecture](docs/ARCHITECTURE.md) — current framework design, patterns, and conventions
- [Build Log](docs/BUILD_LOG.md) — step-by-step journal of every setup decision, command, and learning along the way
- [Architecture Decision Records](docs/adr/) — rationale behind major technical choices

## Current Status

**Phase 2 — Automation Foundation** (in progress)

- [x] Folder structure (`pages/`, `components/`, `fixtures/`, `utils/`, `config/`)
- [x] Architecture documentation (`ARCHITECTURE.md` + ADRs)
- [x] Environment configuration
- [x] LoginPage + login tests (happy + unhappy path)
- [x] InventoryPage + inventory test
- [x] Auth fixture (`loggedInPage`)
- [x] HeaderComponent + logout test

### Phase 1 — Bootstrap (complete)

- [x] Git repository
- [x] Node.js project (`package.json`)
- [x] TypeScript + `tsconfig.json`
- [x] Playwright setup
- [x] First E2E test (example)
- [x] ESLint + Prettier

---

See [Architecture](docs/ARCHITECTURE.md) and the [Build Log](docs/BUILD_LOG.md) for details.
