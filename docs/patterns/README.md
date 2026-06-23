# OOP patterns for testing — a worked catalogue

A study repertoire of object-oriented design patterns applied to test
automation, anchored to the real System Under Test (`demo-shop-app`). The goal
is to **understand each pattern by seeing it solve a real problem** here — not
to cram every pattern into the suite. See [ADR-018](../adr/018-oop-patterns-and-principles-layer.md)
for the decision, and [docs/oop-principles/](../oop-principles/README.md) for the
principles each pattern exercises.

## The guiding rule: a pattern must earn its place

A pattern is a _means_, not an end. Knowing **when not** to apply one is as
senior as knowing how. So the catalogue splits in two:

- **Group A — organic.** The pattern fills a _real coverage gap_ or removes real
  duplication. It earns a spot in the **main test suite** (`tests/`) and runs on
  every CI build, because it adds genuine regression signal.
- **Group B — gallery.** The app doesn't actually need the pattern (only one
  transport, one environment, plain CRUD, etc.). It lives isolated under
  `examples/patterns/`, runs opt-in, and is honestly labelled _"shown here
  because this is where you'd reach for it the day the app needs it."_

> Forcing all patterns into the suite is the over-engineering smell to avoid.
> The split below is itself the lesson — twice we _started_ down a pattern
> (Builder for validation, State for CRUD) and moved it to the gallery once the
> data showed the app didn't need it.

## Group A — organic (in `tests/`, runs in CI)

| Pattern                        | Where                                                                                                                                         | Real gap it closes                                                                                                    |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Template Method**            | [tests/api/auth-matrix.api.spec.ts](../../tests/api/auth-matrix.api.spec.ts)                                                                  | `requireAuth` branches: malformed header + invalid/expired token, and PUT/DELETE-without-auth (only POST was covered) |
| **Generics + Encapsulation**   | [utils/crud-client.ts](../../utils/crud-client.ts) · [tests/api/product-lifecycle.api.spec.ts](../../tests/api/product-lifecycle.api.spec.ts) | lifecycle edges: update-after-delete → 404, delete-twice → 404, and any verb on a never-created id → 404              |
| **Strategy** (UI vs API login) | [pages/login.strategy.ts](../../pages/login.strategy.ts) · [tests/auth/login-strategy.spec.ts](../../tests/auth/login-strategy.spec.ts)       | reusable fast-login infra + the previously-untested "seed token → land authenticated" path                            |

## Group B — gallery (in `examples/patterns/`, opt-in)

| Pattern                    | Where                                                                            | Why it's gallery-only here                                                                             |
| -------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| **Builder**                | [examples/patterns/builder/](../../examples/patterns/builder/)                   | the **Factory** already covers data + the validation matrix → shown as a _Factory vs Builder_ contrast |
| **State**                  | [examples/patterns/state/](../../examples/patterns/state/)                       | product CRUD has no rich lifecycle → shown on a synthetic order workflow where transition rules matter |
| **Decorator**              | [examples/patterns/decorator/](../../examples/patterns/decorator/)               | a logging/counting client adds no coverage; pure infrastructure technique                              |
| **Adapter**                | [examples/patterns/adapter/](../../examples/patterns/adapter/)                   | the SUT exposes only REST — no second transport to adapt (a legacy SDK stands in)                      |
| **Abstract Factory**       | [examples/patterns/abstract-factory/](../../examples/patterns/abstract-factory/) | a single environment shape; no family to vary                                                          |
| **Singleton (+ pitfalls)** | [examples/patterns/singleton/](../../examples/patterns/singleton/)               | intentionally demonstrates an anti-pattern (shared mutable state leaks); never belongs in regression   |

## How to run

```bash
npm test                # baseline + Group A (organic) — the normal suite
npm run test:patterns   # Group B gallery (opt-in, isolated config)
```
