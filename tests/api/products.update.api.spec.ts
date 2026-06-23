import { test, expect } from '../../fixtures/product.fixture'
import { getToken } from '../../utils/api'
import { productUpdateCases } from '../../data/product-updates.cases'

/*
 * Data-driven PUT (update) matrix sourced from an EXTERNAL JSON file — one row
 * in data/product-updates.cases.json becomes one test (@api). NEW coverage:
 * the other data-driven specs exercise POST (create); this covers PUT (partial
 * update), which JSON expresses naturally (partial patches + explicit null).
 *
 * Each case mutates its OWN fresh product (the apiProduct fixture creates one
 * per test and deletes it after), so the cases stay isolated.
 */
test.describe('Products API — data-driven update from JSON @api', () => {
  for (const { label, patch, expectedStatus } of productUpdateCases) {
    test(`PUT /api/products/:id — ${label} → ${expectedStatus}`, async ({
      request,
      apiProduct,
    }) => {
      const token = await getToken(request)

      const res = await request.put(`/api/products/${apiProduct.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: patch,
      })
      expect(res.status()).toBe(expectedStatus)
    })
  }
})
