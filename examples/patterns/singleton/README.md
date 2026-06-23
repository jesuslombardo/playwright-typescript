# Singleton — and its pitfalls (gallery, anti-pattern)

One shared instance for the whole process. Included **as a cautionary example**.

## When it's acceptable

- Genuinely **immutable**, read-only config or a stateless helper.

## When it bites (the lesson)

- **Mutable** state in a test suite. Parallel or reordered tests share the one
  instance, so one test's writes leak into another → flaky, order-dependent
  failures. The spec demonstrates this leak deterministically with `.serial`.

## The fix

Dependency injection — a fresh instance per test. In Playwright that's a
**fixture** ([fixtures/auth.fixture.ts](../../../fixtures/auth.fixture.ts)):
each test gets its own isolated state, no leakage.

Run: `npm run test:patterns`
