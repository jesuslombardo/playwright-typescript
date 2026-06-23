import { test, expect } from '@playwright/test'
import { HttpProductApi, LoggingProductApi, CountingProductApi } from './product-api'

test.describe('Decorator — stack concerns without subclass explosion (gallery)', () => {
  test('counting wraps logging wraps the real client', async ({ request }) => {
    const log: string[] = []
    // Compose freely: counting( logging( http ) ).
    const api = new CountingProductApi(new LoggingProductApi(new HttpProductApi(request), log))

    const result = await api.list()

    expect(result.status).toBe(200)
    expect(api.calls).toBe(1) // counting decorator saw the call
    expect(log[0]).toContain('GET /api/products') // logging decorator saw it too
    expect(log[1]).toContain('200')
  })
})
