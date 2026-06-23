# ADR-014: Test data layer (`data/`) — factories, datasets, lifecycle

## Status

Accepted

## Context

Until now test data lived in **three scattered places**, with no home of its own:

1. **Hardcoded inline in specs** — e.g. `{ name: 'API Test Widget', price: 12.5 }`
   repeated across tests.
2. **Mixed into `config/`** — `testUsers` / `testProducts` sat next to URLs, even
   though "which product" is **scenario** data, not **environment** config.
3. **A lone generator** — `utils/data-generator.ts` built a unique product by hand
   with `Date.now()` + `Math.random()`.

That is fine for six tests. As the suite grows it hurts: duplication, name
collisions under parallel runs, and no structure for negative / boundary cases.
The industry handles a handful of recurring **data situations** that we want to
model: reference/seed data, unique synthetic data, data-driven cases, and test
data lifecycle (isolation + cleanup).

## Decision

Introduce a dedicated **`data/` layer** and split responsibilities cleanly.

- **`config/` = environment, `data/` = scenarios.** URLs and **env-backed**
  credentials stay in `config/` (they are environment/secret concerns); products
  and login cases move to `data/`. `testProducts` → `data/products.dataset.ts`;
  `testUsers` **stays** in `config/` because it is env-driven (`DEMO_USER`/`DEMO_PASSWORD`).
- **Factory** (`data/product.factory.ts`, `buildProduct(overrides)`) for data a
  test **creates**: unique by default (collision-free in parallel), readable via
  overrides, filled with **faker** synthetic values (PII-safe — never real data).
  Replaces `utils/data-generator.ts`.
- **Datasets** (`products.dataset.ts`, `auth.dataset.ts`) for **known, named**
  cases. Each row carries its **expected outcome** and is driven through a
  `for…of` loop in the spec → **data-driven testing**: adding a case is adding a
  row, not copy-pasting a test.
- **Lifecycle fixture** (`fixtures/product.fixture.ts`, `apiProduct`) creates a
  product over the API before a test and **deletes it after — even on failure**.
  Gives isolation and enables "**set up via API, assert via UI**". Composed with
  the auth fixture via `mergeTests` in `fixtures/shop.fixture.ts`.

**Expected status reflects real behaviour.** The dataset asserts what the app
_actually_ does: e.g. a **negative price is accepted (201)** because the app
validates "finite number", not ">= 0". The table doubles as live documentation —
and surfaced that latent gap.

## Consequences

### Positive

- **One home for scenario data**; specs read cleanly and stop duplicating literals.
- **Scales by data**: the create/login matrices grow by appending rows (the suite
  went from ~17 to 31 tests with no new test bodies).
- **Parallel-safe**: factory data is unique, so create/delete tests never collide.
- **Isolated**: the lifecycle fixture guarantees cleanup, even when a test fails.
- **PII-safe** synthetic data via faker — the industry default over real records.
- **config/data separation** is now an explicit, teachable rule.

### Negative

- A new dependency (`@faker-js/faker`, devDependency). Pure JS, no native build —
  negligible install cost next to the Playwright browser image.
- The dataset must be **kept honest**: `expectedStatus` mirrors the app, so an
  intentional app change (e.g. adding a non-negative-price guard) means updating
  the affected rows. That coupling is the point — drift becomes a red test.
- One more layer to learn; mitigated by `data/README.md` and the decision table.

## Alternatives considered

- **Keep data inline / in `config/`** — status quo; rejected as it does not scale
  and conflates environment with scenarios.
- **JSON/CSV fixture files** instead of typed `.ts` datasets — language-agnostic
  and non-coder friendly, but loses type-safety and the ability to call the
  factory inline. TS datasets fit a TS suite better; JSON remains an easy future
  add (`resolveJsonModule` is already on).
- **Hand-rolled randomness** (the old `Date.now()` generator) — works, but faker
  is the conventional, richer, self-documenting choice.
- **Per-test manual create/delete** instead of a fixture — what some specs did;
  the fixture removes the boilerplate and the risk of forgetting teardown.
- **A separate seeding script / DB fixtures** — heavier; the app already reseeds
  in-memory on boot, so per-test API seeding is enough at this scale.
