import { test, expect } from '@playwright/test'
import { SessionStore, createSession } from './session-store'

/*
 * Demonstrates the leak ON PURPOSE. We use `.serial` so the teaching point is
 * deterministic; in a real parallel suite this is precisely the kind of
 * order-dependent flakiness a shared mutable Singleton causes.
 */
test.describe.serial('Singleton pitfall — shared mutable state leaks (gallery)', () => {
  test('A: adds one item to the shared store', () => {
    SessionStore.instance.add('from-A')
    expect(SessionStore.instance.count).toBe(1)
  })

  test('B: unexpectedly sees A’s leftover state (the bug)', () => {
    // A truly isolated store would read 0 here — the Singleton makes it 1.
    expect(SessionStore.instance.count).toBe(1)
  })
})

test('the fix: a fresh instance per test does not leak (DI / fixture style)', () => {
  const a = createSession()
  const b = createSession()
  a.add('x')
  expect(a.count).toBe(1)
  expect(b.count).toBe(0) // independent — no leak
})
