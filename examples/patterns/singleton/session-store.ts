/*
 * PATTERN — Singleton (creational), shown with its PITFALLS.  GALLERY (anti-pattern).
 *
 * A Singleton gives exactly one shared instance. For truly IMMUTABLE config that
 * can be fine. For MUTABLE state in a test suite it's a trap: parallel or
 * out-of-order tests all share it, so one test's writes leak into another →
 * flaky, order-dependent failures. The fix is dependency injection: a fresh
 * instance per test, which is exactly what a Playwright fixture provides
 * (see fixtures/auth.fixture.ts).
 */

export class SessionStore {
  private static _instance: SessionStore | null = null
  private readonly items: string[] = []

  static get instance(): SessionStore {
    return (SessionStore._instance ??= new SessionStore())
  }

  add(item: string): void {
    this.items.push(item)
  }

  get count(): number {
    return this.items.length
  }
}

/** The fix: a fresh, isolated store per caller — what a per-test fixture gives you. */
export function createSession(): { add(item: string): void; readonly count: number } {
  const items: string[] = []
  return {
    add: (item) => void items.push(item),
    get count() {
      return items.length
    },
  }
}
