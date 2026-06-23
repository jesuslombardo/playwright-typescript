# ADR-006: Custom System Under Test (demo-shop-app) and the testing pyramid

## Status

Accepted

## Context

The suite was built against **Sauce Demo**, which is a great E2E target but is a
**frontend-only SPA with no public API**. That blocked a core goal: demonstrating a
**real testing pyramid** — API tests that run _before_ and _gate_ the slower E2E
tests, with both layers exercising the **same application**.

We explored testing a third-party demo API (JSONPlaceholder, ReqRes, the GitHub
API, Restful Booker, Toolshop, Platzi…). Each had a fatal flaw for our purpose:
either no UI (so no shared E2E target), no writes, no Swagger, a heavy framework,
or no control over availability/seed data. Pointing API tests at an unrelated
service would only demonstrate the _capability_, not a genuine contract shared
with the E2E backend.

## Decision

**Build our own minimal full-stack application as a purpose-made System Under
Test (SUT), in its own repository: [`demo-shop-app`](https://github.com/jesuslombardo/demo-shop-app).**

- **App:** Express 5 API + SQLite (`better-sqlite3`, in-memory) + JWT auth +
  Swagger UI, with a vanilla HTML/JS UI served statically (no framework, no build
  step → starts in ~1 s). Entity = **Product**, full CRUD (writes require a token).
  Catalogue seeded with the six Sauce Demo products for continuity.
- **Two repos, not a monorepo:** the app and the test framework are separate, so
  the framework reads like a real QA project that tests a _separate_ deliverable —
  and it forces us to learn **cross-repo CI orchestration**.
- **Testing pyramid in CI:** `quality → api → smoke → regression → deploy-report`.
  API tests (Playwright `request` fixture, tagged `@api`) are the cheap base and
  **gate** the E2E layer via `needs:`.
- **Ephemeral SUT:** every test job checks out `demo-shop-app` into `./app` and
  Playwright's `webServer` starts it from source. `BASE_URL` overrides this to
  target an already-running instance. The app also publishes a Docker image to
  **GHCR** from its own CI.
- **Two SUT strategies, kept on purpose (Step 37):** the pyramid jobs build
  **from source** (zero infra, max reproducibility); a parallel `api-via-image`
  job pulls the **published GHCR image** and runs it as a CI `services:`
  container ("test the artifact you ship"). The image is pinned to the same
  commit as `.app-version` (resolve the tag → its SHA, since the app tags images
  by commit SHA), so it stays reproducible (ADR-013). The image job is didactic
  and **not a required check**.

## Consequences

### Positive

- A **genuine pyramid**: API and E2E hit the same app and the same data model.
- We own the contract — we can add endpoints, error cases, and seed data at will.
- Teaches **cross-repo CI** (checking out and running another repo's app) and
  **container publishing** (GHCR) — richer than a single-repo setup.
- Fast and deterministic: in-memory SQLite reseeds on every boot, so each
  ephemeral run starts from a known catalogue.

### Negative

- **Two repos to maintain** and keep in sync (versioning the SUT vs. the tests).
- The pipeline now depends on a second repository being checked out and installed,
  adding a step (and coupling the framework to the app repo's location).
- A second SUT strategy (service container) means **two ways the app can be wrong
  in CI** to reason about (source build vs published image). Accepted: the
  contrast is the teaching point, and only build-from-source is a required gate.
- The published GHCR image used to be **private** (needing the package made public
  or registry auth). It was made **public** (Step 37), which is why the
  `services:` container now pulls anonymously — no `credentials:` block.

## Alternatives considered

- **Keep Sauce Demo + point API tests at a public demo API** — rejected: the API
  wouldn't be Sauce Demo's backend, so it shows capability, not a real pyramid.
- **Use a hosted demo app with an API (Toolshop, Restful Booker Platform)** —
  rejected: heavy frameworks (Angular/React/Java), no control over uptime or data.
- **Monorepo (app + tests together)** — rejected: less realistic for a QA
  portfolio and skips the cross-repo CI lessons; reconsider if sync cost hurts.
- **Pull the GHCR image as a CI `services:` container** — **adopted (Step 37)**
  as a _parallel_ strategy now that the package is public, not a replacement:
  build-from-source stays the required gate (more reproducible, zero infra),
  while the image job demonstrates "test what you ship". Earlier deferred while
  the package was private.
