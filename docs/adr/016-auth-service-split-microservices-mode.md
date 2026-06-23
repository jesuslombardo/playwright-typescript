# ADR-016: Microservices mode — extracting `auth-service` (additive)

## Status

Accepted (relates to [ADR-006](006-custom-sut-and-testing-pyramid.md))

## Context

The SUT [`demo-shop-app`](https://github.com/jesuslombardo/demo-shop-app) is a
small Express **monolith** (one entity, `Product`, + JWT auth). The framework is
becoming a course, and **testing microservices** — consumer-driven contract
testing (Pact), service virtualization, testing across a real network boundary —
is a marketable SDET skill the monolith cannot teach.

We decided to add a microservices **module**, but scoped it deliberately:

- The course sells _how to **test** a system that happens to be microservices_,
  not _how to build microservices_. The services are the **excuse** to unlock the
  testing skills.
- So **one split — extract `auth-service` — is enough** to unlock the marquee
  skill (contract testing). A full system (an `orders-service` owning its own
  data and calling products at runtime) is what would teach distributed data +
  runtime call-chains + tracing/resilience, and is **deferred to a possible
  "Part 2."**
- It must **not raise the barrier to entry**: a beginner still runs `npm start` /
  `npm test` with only Node. Microservices is an **optional, advanced** path.

## Decision

- **Additive, not a migration.** The monolith stays the **default** and is
  behaviourally unchanged. Microservices is a _parallel_ mode you opt into with
  `docker compose up`. Nothing is removed.
- **Same code, two compositions.** `app.js` was refactored into small `mount*()`
  helpers. `createApp()` mounts them all → the monolith. Each entrypoint under
  `services/` mounts only its slice → the split. The business logic (`auth.js`,
  `products.router.js`) is **shared, never forked**. _(This "modular monolith"
  refactor is itself the first lesson.)_
- **Three services from one image:** `auth-service` (3001, `POST /api/login` +
  JWT signing), `products-service` (3002, catalogue + own db + docs + static UI),
  `gateway` (3000, reverse proxy).
- **The gateway is mandatory, not optional.** The vanilla UI calls **same-origin**
  paths (`/api/login`, `/api/products`), so a single front door must route them
  (`/api/login`→auth, everything else→products). It does only that — no auth, no
  rate limiting.
- **Cross-service trust is local (HS256 shared secret).** `auth` signs JWTs with
  `JWT_SECRET`; `products` verifies them with the **same secret**, in-process —
  **no per-request call to auth**. The boundary is at _login + deploy_, not on
  every request. (RS256 + public-key/JWKS is deferred as polish.)
- **The whole suite is topology-agnostic.** It targets one `BASE_URL`. Pointed at
  the gateway (`BASE_URL=http://localhost:3000`), the existing suite runs
  **unchanged** — verified: **38/38 api tests green** against the split.
- **CI is untouched in this step.** The monolith pipeline stays the required gate.
  Wiring microservices jobs (path filters, compose-up, contract gate) is a
  **later step** and will be **additive / non-required** — the same pattern as the
  SUT-as-service-container job ([ADR-006](006-custom-sut-and-testing-pyramid.md),
  Step 37).

## Consequences

### Positive

- **Unlocks the marketable skill cheaply** — one real network boundary is enough
  for contract testing (Pact, the next step), service virtualization and
  independent deploy.
- **Zero risk to the base** — the monolith, every existing test, the CD pipeline
  and the pinned-version flow are unchanged. Beginners never touch Docker.
- **Proves a real principle concretely** — _good API tests don't care about the
  topology behind the URL_; the same suite passing against both monolith and
  microservices demonstrates it.
- **Opt-in complexity** — only students who choose the advanced module pay the
  Docker/compose cost.

### Negative

- **The gateway became a mandatory extra component** (the same-origin UI forced
  it). More than "just split auth," but it's the minimal pure-proxy form.
- **Shared-secret HS256 couples the secret across services** — both `auth` and
  `products` hold `JWT_SECRET`. The cleaner public-key (RS256/JWKS) trust is
  deferred.
- **`http-proxy-middleware` is now a production dependency** (the gateway needs it
  in the `--omit=dev` image), slightly bloating the monolith image with code it
  doesn't use.
- **Deploy/runtime costs are real but unrealized yet** — N services means N cold
  starts on the free tier and compose-startup before system tests. Not wired in
  this step.

## Alternatives considered

| Alternative                                       | Why not chosen                                                                                                                       |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Full microservices now (auth + orders + data)** | Much higher cost/maintenance for a _testing_ course; marginal teaching drops fast after the first boundary. Deferred to a Part 2.    |
| **Replace the monolith (a real migration)**       | Raises the barrier to entry and risks the existing CI/CD arc. The additive "two compositions" keeps the base safe and teaches more.  |
| **Put the module on a separate branch**           | Hides the _coexistence_ lesson (same code, two topologies) and splits maintenance. Additive files in one repo keep it visible.       |
| **No gateway — `products` proxies `/api/login`**  | Couples products to auth's existence and muddies ownership. A thin dedicated gateway is clearer.                                     |
| **Token introspection (call auth per request)**   | Unnecessary for self-contained JWTs; adds a hard runtime dependency + latency on every protected call. Local verification is native. |
