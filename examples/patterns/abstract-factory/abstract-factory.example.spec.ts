import { test, expect } from '@playwright/test'
import { factoryFor } from './env-factory'

test.describe('Abstract Factory — consistent env families (gallery, synthetic)', () => {
  test('each factory produces a self-consistent config + user', () => {
    const local = factoryFor('local')
    expect(local.config().baseURL).toContain('localhost')
    expect(local.user().username).toBe('standard_user')

    const staging = factoryFor('staging')
    expect(staging.config().baseURL).toContain('staging')
    expect(staging.user().username).toBe('staging_user')

    // The point: you can't accidentally mix a staging URL with a local user —
    // the family comes as a coherent set from one factory.
    expect(staging.config().timeoutMs).toBeGreaterThan(local.config().timeoutMs)
  })
})
