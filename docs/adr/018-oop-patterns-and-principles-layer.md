# ADR-018: OOP patterns & principles — organic vs a gallery

## Status

Accepted

## Context

The framework should not only _work_ but visibly **demonstrate** object-oriented
design — both for learning and to answer the recurring interview question
_"where did you apply OOP, and why there?"_ with code, not theory.

The naive way to do this is to retrofit every Gang-of-Four pattern onto the
suite. That backfires: most patterns would be **forced**, the production tests
would bloat, and forcing a pattern where it isn't needed is exactly the
over-engineering smell a senior is expected to _avoid_. We needed a way to build
a complete, studyable repertoire **without** degrading the real suite.

A second problem: a pattern that re-tests already-covered behaviour adds no
regression signal, runs slower (cross-browser × retries in CI), and — for
deliberately-bad teaching cases (e.g. a Singleton's pitfalls) — would inject
flakiness into the very suite meant to be trustworthy.

## Decision

Split the OOP material into **two tracks**, governed by one rule: **a pattern
must earn its place.**

- **Group A — organic.** Patterns that close a _real coverage gap_ or remove
  real duplication live in the **main suite** (`tests/`) and run in CI, because
  they add genuine signal:
  - **Template Method** → [tests/api/auth-matrix.api.spec.ts](../../tests/api/auth-matrix.api.spec.ts):
    closes the untested `requireAuth` branches (malformed header, invalid/expired
    token) and `PUT`/`DELETE`-without-auth.
  - **Generics + Encapsulation** → [utils/crud-client.ts](../../utils/crud-client.ts) with
    [tests/api/product-lifecycle.api.spec.ts](../../tests/api/product-lifecycle.api.spec.ts):
    a typed `CrudClient<T>` that closes lifecycle edges (delete-twice, update- or
    delete-after-delete, any verb on an unknown id → 404).
  - **Strategy** → [pages/login.strategy.ts](../../pages/login.strategy.ts):
    interchangeable UI/API login; the API path doubles as fast setup infra.
  - **Inheritance + DRY** → [pages/base.page.ts](../../pages/base.page.ts): a
    `BasePage` the real page objects extend (shared `page` + `goto()`).

- **Group B — gallery.** Patterns the app genuinely doesn't need (only one REST
  transport, one environment, plain CRUD, or an outright anti-pattern) live
  **isolated** under `examples/patterns/`, are **opt-in** via a dedicated config
  ([playwright.patterns.config.ts](../../playwright.patterns.config.ts),
  `npm run test:patterns`), and are honestly labelled _"shown here for the day
  you need it."_ Builder, State, Decorator, Adapter, Abstract Factory, Singleton
  (with its pitfalls). The default `npm test` never runs them.

A companion **OOP principles map** ([docs/oop-principles/README.md](../oop-principles/README.md))
points each principle (four pillars, SOLID, plus composition/DI/DRY) at the real
file and symbol that demonstrates it. The catalogue index lives in
[docs/patterns/README.md](../patterns/README.md).

## Consequences

### Positive

- **The production suite stays lean** and trustworthy; patterns that ship add
  real regression signal (auth matrix + lifecycle edges closed genuine gaps).
- **A complete OOP repertoire** exists for study and for interview defence,
  every entry runnable and green — `npm run test:patterns` (10) + the Group A
  additions inside `npm test` (59 total at time of writing).
- **The judgment is documented, not just the code:** twice we started a pattern
  (Builder for validation, State for CRUD) and moved it to the gallery once the
  existing data layer / CRUD proved it redundant. _Knowing when not to apply_ is
  the point.
- **Additive, low-risk:** no rewrite of the baseline; `BasePage` kept the page
  constructors unchanged, so all existing call sites and tests pass untouched.

### Negative

- A second Playwright config to maintain (it reuses the base via spread, so the
  drift surface is small).
- The gallery can rot if patterns aren't revisited; mitigated by a README per
  example stating intent and the "why gallery" reason.
- Two doc homes (`patterns/` and `oop-principles/`) to keep in sync with code.

## Alternatives considered

- **Force every pattern into the main suite** — maximal "coverage" of patterns,
  but bloats the suite, adds redundant/no-signal tests, and would put an
  intentional anti-pattern (Singleton pitfalls) into CI. Rejected; it's the
  over-engineering this ADR exists to avoid.
- **Docs only, no code** — cheaper, but unverifiable and unconvincing; a pattern
  you can't run is a claim, not a demonstration. Rejected.
- **A separate repo for the examples** — clean isolation, but breaks the "anchor
  to the real SUT" goal and splits the study material from the framework it
  describes. Rejected in favour of an in-repo, opt-in gallery.
