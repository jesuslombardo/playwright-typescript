# OOP principles — seen in this app

A study map of the object-oriented principles an SDET interview asks about,
each pointed at **where it actually lives in this repo** so you can read the
real code, not a textbook snippet. Most are organic to the existing framework;
a few link to the [pattern gallery](../patterns/README.md) where the principle
is shown in isolation.

> How to use this: for each row, open the file, find the symbol, and explain out
> loud _why_ it's that principle. That's the interview answer.

## Interview defense — "where did you apply OOP?"

A 60-second spoken answer; the tables below are the file-by-file backup.

1. **Encapsulation & abstraction** — page objects and a typed `CrudClient<T>`
   hide locators and HTTP behind intent-revealing methods; tests speak the
   domain, never raw selectors or URLs.
2. **Inheritance & polymorphism** — a `BasePage` every page extends; a
   `LoginStrategy` with interchangeable UI/API implementations; a Template-Method
   auth matrix where adding a protected endpoint is one subclass.
3. **SOLID** — the layered folders are SRP; the auth matrix is Open/Closed; the
   login strategies are Liskov-substitutable; one-method interfaces are ISP;
   injected `APIRequestContext` + fixtures are Dependency Inversion.
4. **The senior part — judgment.** I did _not_ force patterns. Twice I started
   one (Builder, State) and moved it to an opt-in gallery once the data showed
   the app didn't need it (see [ADR-018](../adr/018-oop-patterns-and-principles-layer.md)).
   Production stays lean; the patterns that shipped closed _real_ untested
   branches (auth edge cases, resource lifecycle). Knowing when **not** to apply
   a pattern is the answer that separates senior from mid.

## The four pillars

| Pillar            | One-liner                                       | See it here                                                                                                                                                                                                                |
| ----------------- | ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Encapsulation** | Hide internals; expose intent.                  | [pages/login.page.ts](../../pages/login.page.ts) — locators are hidden behind `login()`. [utils/crud-client.ts](../../utils/crud-client.ts) — `private` request/token, `private get headers`.                              |
| **Abstraction**   | Depend on a contract, not a concretion.         | [pages/base.page.ts](../../pages/base.page.ts) (`abstract class`) · [pages/login.strategy.ts](../../pages/login.strategy.ts) (`interface LoginStrategy`).                                                                  |
| **Inheritance**   | Share common behaviour through a base type.     | [pages/base.page.ts](../../pages/base.page.ts) → `LoginPage` / `ProductsPage`. [tests/api/auth-matrix.api.spec.ts](../../tests/api/auth-matrix.api.spec.ts) — `ProtectedWrite` → Create/Update/Delete.                     |
| **Polymorphism**  | One interface, many interchangeable behaviours. | [tests/auth/login-strategy.spec.ts](../../tests/auth/login-strategy.spec.ts) — UI vs API login swap freely. [tests/api/auth-matrix.api.spec.ts](../../tests/api/auth-matrix.api.spec.ts) — one loop drives every endpoint. |

## SOLID

| Principle                     | One-liner                                                        | See it here                                                                                                                                                             |
| ----------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **S** — Single Responsibility | One reason to change, per unit.                                  | The layering: `pages/` (UI), `utils/` (HTTP), `data/` (test data), `fixtures/` (lifecycle/DI), `config/` (env). Each owns one concern.                                  |
| **O** — Open/Closed           | Open to extension, closed to modification.                       | [tests/api/auth-matrix.api.spec.ts](../../tests/api/auth-matrix.api.spec.ts) — a new protected endpoint is one new subclass; the matrix loop never changes.             |
| **L** — Liskov Substitution   | Subtypes work anywhere the base is expected.                     | [pages/login.strategy.ts](../../pages/login.strategy.ts) — any `LoginStrategy` drops into the same call site with identical end state.                                  |
| **I** — Interface Segregation | Small, focused interfaces; clients depend only on what they use. | One-method interfaces: `LoginStrategy`, `ProductGateway` ([adapter](../../examples/patterns/adapter/)), `ProductApi` ([decorator](../../examples/patterns/decorator/)). |
| **D** — Dependency Inversion  | Depend on abstractions; inject the concrete.                     | [utils/crud-client.ts](../../utils/crud-client.ts) takes an injected `APIRequestContext`. [fixtures/](../../fixtures/) inject ready dependencies into tests.            |

## Beyond the canon (also asked)

| Principle                        | One-liner                                           | See it here                                                                                                                                                                                             |
| -------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Composition over Inheritance** | Assemble behaviour from parts, don't over-subclass. | [fixtures/shop.fixture.ts](../../fixtures/shop.fixture.ts) — `mergeTests` composes fixture sets; tests compose page objects.                                                                            |
| **Dependency Injection**         | Hand a unit its collaborators, ready to use.        | [fixtures/auth.fixture.ts](../../fixtures/auth.fixture.ts) (`loggedInPage`), [fixtures/product.fixture.ts](../../fixtures/product.fixture.ts) (`apiProduct`). Playwright fixtures _are_ a DI container. |
| **DRY**                          | One source of truth for each piece of behaviour.    | [pages/base.page.ts](../../pages/base.page.ts) — `goto()` shared. [utils/api.ts](../../utils/api.ts) — `getToken` reused. [data/product.factory.ts](../../data/product.factory.ts).                     |

## Related

- [docs/patterns/README.md](../patterns/README.md) — the design-pattern catalogue
  (Group A organic · Group B gallery), which is where several of these principles
  get a dedicated, isolated demonstration.
- [ADR-018](../adr/018-oop-patterns-and-principles-layer.md) — the decision behind
  the organic-vs-gallery split (the "why").
- [examples/patterns/](../../examples/patterns/) — the runnable Group B gallery
  (`npm run test:patterns`).
