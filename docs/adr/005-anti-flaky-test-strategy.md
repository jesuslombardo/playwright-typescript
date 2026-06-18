# ADR-005: Anti-flaky test strategy

## Status

Accepted

## Context

A **flaky test** passes sometimes and fails sometimes **without any code change** — it is non-deterministic.

Flakiness is the **#1 enemy** of a test suite. It is worse than a missing test, because it destroys trust:

```
test fails -> "it's just flaky, ignore it" -> red results get ignored
                                                  v
                          one day the red was a REAL bug -> nobody looks anymore
                                                  v
                          the whole suite becomes worthless
```

A small, **reliable** suite is worth far more than a large, flaky one. This ADR records the practices we use to keep tests deterministic, and the patterns we deliberately avoid.

Most flakiness comes from **timing / race conditions**: asserting on something before the app has finished producing it. Playwright is designed to fight this; the decisions below lean on its built-in mechanisms instead of manual timing.

## Decision

### 1. Rely on web-first assertions (auto-waiting)

Use `expect(locator).toBeVisible()`, `toHaveText()`, `toHaveURL()`, etc. These **retry automatically** until the condition is met or the timeout expires — they wait for the **real result**, not for a proxy signal.

```typescript
// ✅ waits for the actual thing we care about, retrying until it's there
await expect(page.getByText('Thank you for your order!')).toBeVisible()
```

### 2. Ban hard waits

Never use fixed-time sleeps. They are flaky by definition (sometimes too short, always too slow) and hide the real signal.

```typescript
// ❌ never
await page.waitForTimeout(3000)

// ✅ wait for the condition, not the clock
await expect(saved).toBeVisible()
```

### 3. Avoid `networkidle`

`waitForLoadState('networkidle')` waits for the **network** to go quiet — an indirect, unreliable signal. Modern apps have constant background requests (analytics, polling, websockets), so the network may never idle, and "network quiet" does not mean "my element is ready". Playwright officially **discourages** it.

- Default: wait for the **UI result** with a web-first assertion.
- If a specific API call genuinely matters: `page.waitForResponse(...)` for **that** request — not the whole network.

### 4. Resilient locators

Prefer user-facing, stable locators (`getByRole`, `getByTestId`) over brittle CSS/XPath. Selectors live in page/component objects (see [ADR-001](001-page-object-model-and-folder-structure.md)); `testIdAttribute` is configured centrally in `playwright.config.ts`.

### 5. Test isolation

Each test runs in a **fresh browser context** (Playwright default) — empty cookies/storage, no leftover state. Tests must not depend on each other or on execution order. Shared preconditions go through fixtures (see [ADR-004](004-components-vs-fixtures.md)), not shared mutable state.

### 6. Retries are a safety net, not a cure

`retries: 2` on CI lets a run survive a transient hiccup (a network blip), but **retries do not fix flakiness — they hide it**. Playwright marks tests that only pass on retry as **flaky** (a distinct status) so they stay visible. A test that needs retries _often_ is a bug to investigate, not to paper over with more retries.

### Anti-patterns

| Anti-pattern                                  | Why it's wrong                                  | Do instead                                 |
| --------------------------------------------- | ----------------------------------------------- | ------------------------------------------ |
| `await page.waitForTimeout(ms)`               | Fixed sleep — flaky and slow                    | Web-first assertion that retries           |
| `waitForLoadState('networkidle')`             | Network ≠ "my element is ready"; may never idle | Assert the UI result, or `waitForResponse` |
| `expect(await el.textContent()).toBe(x)`      | Captures once, no retry                         | `await expect(el).toHaveText(x)`           |
| `if (await el.isVisible()) { ... }` as a wait | Returns a bool once, doesn't wait               | `await expect(el).toBeVisible()`           |
| Test B assumes test A ran first               | Order-dependent → flaky under parallelism       | Make each test self-contained (fixtures)   |
| Bumping `retries` to silence a failing test   | Hides a real defect                             | Investigate and fix the root cause         |

## Consequences

### Positive

- Tests fail only when something is **actually** broken → red stays trustworthy.
- Faster and more stable than manual timing (assertions wait only as long as needed).
- Aligns with Playwright's official guidance and industry practice.

### Negative

- Requires discipline: it's tempting to "just add a wait" when debugging — the anti-patterns table exists to resist that.
- Retries can still mask a slowly-degrading test if nobody reviews the flaky status — needs occasional attention.

## Alternatives considered

| Alternative                               | Why not chosen                                                   |
| ----------------------------------------- | ---------------------------------------------------------------- |
| Fixed `waitForTimeout` sleeps             | The canonical cause of flakiness; slow and unreliable            |
| `networkidle` as the default wait         | Indirect signal; discouraged by Playwright; flaky on modern apps |
| No retries at all                         | A single transient blip would fail CI; 2 retries absorb noise    |
| High retry count (e.g. 5+) to force green | Masks real flakiness; turns the suite into a coin flip           |
| Manual polling loops in test code         | Reinvents what web-first assertions already do, less reliably    |

## What this looks like in this project

| Practice                    | Where                                                                |
| --------------------------- | -------------------------------------------------------------------- |
| Web-first assertions        | All specs in `tests/` (`expect(...).toBeVisible()` etc.)             |
| No hard waits / networkidle | Verified by audit (grep) — zero occurrences                          |
| Resilient locators          | `pages/`, `components/`; `testIdAttribute` in `playwright.config.ts` |
| Test isolation              | Playwright fresh context per test; `fixtures/auth.fixture.ts`        |
| Retries as safety net       | `retries: 2` on CI in `playwright.config.ts`                         |
| Failure evidence            | `trace` / `screenshot` / `video` on failure (debug, not a fix)       |
