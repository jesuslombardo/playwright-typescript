# `data/` — test data layer

The home for **scenario data**: the _what_ of a test (which products, which
login cases), kept separate from `config/`, which holds the _where_ (URLs,
environment, env-backed credentials).

> Rule of thumb: **config = environment, data = scenarios.**

## What lives here

| File                  | Kind                | Simulates (industry situation)                         |
| --------------------- | ------------------- | ------------------------------------------------------ |
| `product.factory.ts`  | **Factory/builder** | Dynamic, unique, synthetic data (faker) with overrides |
| `products.dataset.ts` | **Fixtures**        | Reference seed data + data-driven create cases         |
| `auth.dataset.ts`     | **Fixtures**        | Data-driven login cases (valid / invalid)              |

## Factory vs fixture — when to use which

- **Factory** (`buildProduct({ ...overrides })`) — when a test **creates** data
  and needs it to be **unique** (no collisions under parallel runs). State only
  the field you care about; faker fills the rest with PII-safe synthetic values.
- **Fixture / dataset** — when you need a **known, named** case: a reference fact
  about the seed catalogue, or a row in a data-driven table with its expected
  outcome.

## Data-driven testing

Each dataset row becomes its own test via a `for…of` loop in the spec. Adding a
case is adding a row — **the suite scales by data, not by copy-pasted tests**.
`expectedStatus` always reflects the app's **real** behaviour (e.g. negative
prices are _accepted_ — the app has no guard), so the table doubles as live
documentation of what the API actually does.

## Lifecycle & cleanup

Tests that need a pre-existing entity use the **`apiProduct` fixture**
(`fixtures/product.fixture.ts`): it creates a product over the API before the
test and **deletes it afterwards**, even on failure — so tests stay isolated and
never pollute shared state.
