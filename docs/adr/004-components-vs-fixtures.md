# ADR-004: Component Objects vs custom Fixtures

## Status

Accepted

## Context

The framework has two layers that both enable reuse, but at different levels:

- **`components/`** — models shared **UI** (headers, modals, toasts)
- **`fixtures/`** — models shared **test setup** (logged-in session, seeded data)

This is a common source of confusion: both "avoid duplication," but putting UI logic in fixtures or setup logic in components breaks separation of concerns.

Playwright [documents fixtures officially](https://playwright.dev/docs/test-fixtures) as the extension mechanism for the test runner.
Playwright [documents POM](https://playwright.dev/docs/pom) but does **not** prescribe a `components/` folder — that is an industry extension for shared UI via composition.

See also [ADR-001](001-page-object-model-and-folder-structure.md) for the overall folder layout.

## Decision

### Component Objects (`components/`)

Use when a **piece of the application UI** appears on more than one screen.

- Encapsulate locators and actions for that UI block.
- Accept `Page` or a scoped `Locator` (root container) in the constructor.
- Are **composed into** page objects — never duplicated across pages.

```typescript
// components/header.component.ts
export class HeaderComponent {
  constructor(private readonly page: Page) {}

  async logout() {
    await this.page.getByRole('button', { name: 'Open Menu' }).click()
    await this.page.getByRole('link', { name: 'Logout' }).click()
  }
}

// pages/inventory.page.ts
export class InventoryPage {
  readonly header = new HeaderComponent(this.page)
  constructor(private readonly page: Page) {}
}
```

### Custom Fixtures (`fixtures/`)

Use when a **test needs preconditions** that repeat across specs — without rewriting setup in every test.

- Extend Playwright's `test` with `base.extend()`.
- Orchestrate pages, API calls, or navigation to reach a starting state.
- Do **not** define locators or UI selectors — delegate to page/component objects.

```typescript
// fixtures/auth.fixture.ts
export const test = base.extend({
  loggedInPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page)
    await loginPage.login('standard_user', 'secret_sauce')
    await use(page)
  },
})
```

### Decision guide

| Question                                                 | If yes →          | Layer                     |
| -------------------------------------------------------- | ----------------- | ------------------------- |
| Is it a visible UI element users interact with?          | Component or Page | `components/` or `pages/` |
| Does it appear on multiple screens?                      | Component         | `components/`             |
| Is it exclusive to one screen/route?                     | Page Object       | `pages/`                  |
| Is it test setup (login before test, mock API, seed DB)? | Fixture           | `fixtures/`               |
| Is it a pure function with no browser/DOM?               | Util              | `utils/`                  |
| Is it a URL, credential, or env-specific value?          | Config            | `config/`                 |

### Anti-patterns (do not do this)

| Anti-pattern                              | Why it's wrong                             | Do instead                             |
| ----------------------------------------- | ------------------------------------------ | -------------------------------------- |
| Locators inside a fixture                 | Fixtures are infrastructure, not UI models | Use page/component in fixture          |
| Login flow duplicated in 20 tests         | Hard to maintain                           | `loggedInPage` fixture or `auth.flow`  |
| Copy-paste header selectors in every page | Duplication                                | `HeaderComponent` composed in pages    |
| Component that navigates and asserts      | Mixes responsibilities                     | Navigation in page; assertions in test |
| God fixture that does everything          | Unmaintainable                             | Small, focused fixtures per concern    |

## Consequences

### Positive

- Clear mental model: **UI modeling** (pages/components) vs **test wiring** (fixtures)
- New contributors can place code correctly using the decision guide
- Aligns with how mature Playwright frameworks are structured in industry
- Fixtures stay thin — easy to read what each test assumes as preconditions

### Negative

- Two concepts to learn upfront (mitigated by this ADR and ARCHITECTURE.md)
- Early project may not need components or fixtures until duplication appears — empty folders are intentional

## Alternatives considered

| Alternative                                         | Why not chosen                                                                |
| --------------------------------------------------- | ----------------------------------------------------------------------------- |
| No `components/` — duplicate shared UI in each page | Violates DRY; selector changes touch many files                               |
| No fixtures — `@BeforeEach` / helper functions only | Playwright fixtures integrate better with parallel runs, typing, and teardown |
| Put components inside `pages/` subfolder            | Valid; sibling `components/` chosen for clearer top-level navigation          |
| Single "helpers" folder for everything              | Becomes a junk drawer; loses separation of concerns                           |
| Screenplay actors instead of fixtures               | Higher complexity; not the default Playwright pattern                         |

## Examples in this project (planned)

| Layer                            | Sauce Demo example                              |
| -------------------------------- | ----------------------------------------------- |
| `pages/login.page.ts`            | Login form — exclusive to login screen          |
| `components/header.component.ts` | Burger menu + logout — appears after login      |
| `fixtures/auth.fixture.ts`       | `loggedInPage` — skips login in inventory tests |
| `config/environments.ts`         | Base URL and test user credentials              |
