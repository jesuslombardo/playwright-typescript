import { test, expect } from '@playwright/test'
import { getToken } from '../../utils/api'
import { buildProduct, buildMany } from '../../data/product.factory'

/*
 * Bulk create (@api). Exercises the `buildMany<T>` generic from the factory: one
 * call produces N unique products, which we create over the API and then confirm
 * all landed in the catalogue. `try/finally` guarantees cleanup even if an
 * assertion fails, so the suite never pollutes shared state.
 */
test.describe('Products API — bulk create @api', () => {
  test('buildMany creates N unique products that all reach the catalogue', async ({ request }) => {
    const token = await getToken(request)
    const headers = { Authorization: `Bearer ${token}` }

    // One generic call → N unique, fully-formed products (faker keeps them unique).
    const batch = buildMany(buildProduct, 3)
    const createdIds: number[] = []

    try {
      for (const product of batch) {
        const res = await request.post('/api/products', { headers, data: product })
        expect(res.status()).toBe(201)
        createdIds.push((await res.json()).id)
      }
      expect(createdIds).toHaveLength(batch.length)

      const catalogue = await (await request.get('/api/products')).json()
      const names = catalogue.map((p: { name: string }) => p.name)
      for (const product of batch) {
        expect(names).toContain(product.name)
      }
    } finally {
      for (const id of createdIds) {
        await request.delete(`/api/products/${id}`, { headers })
      }
    }
  })
})
