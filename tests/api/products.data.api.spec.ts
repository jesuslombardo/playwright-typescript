import { test, expect } from '../../fixtures/product.fixture'
import { getToken } from '../../utils/api'
import { productCreateCases } from '../../data/products.dataset'

/*
 * Data-driven layer of the API tests (@api). Each row in `productCreateCases`
 * becomes its own test — the suite grows by adding DATA, not copy-pasted tests.
 */
test.describe('Products API — data-driven create @api', () => {
  for (const { label, payload, expectedStatus } of productCreateCases) {
    test(`POST /api/products — ${label} → ${expectedStatus}`, async ({ request }) => {
      const token = await getToken(request)
      const headers = { Authorization: `Bearer ${token}` }

      const res = await request.post('/api/products', { headers, data: payload })
      expect(res.status()).toBe(expectedStatus)

      // Self-clean: rows that legitimately create a product must not leak state.
      if (res.status() === 201) {
        const { id } = await res.json()
        await request.delete(`/api/products/${id}`, { headers })
      }
    })
  }
})

/*
 * Lifecycle fixture in action: `apiProduct` creates a factory-built product
 * before the test and deletes it after, so the test gets pre-existing data
 * without manual setup/teardown.
 */
test.describe('Products API — lifecycle fixture @api', () => {
  test('a factory-built product exists for the test and is cleaned up after', async ({
    request,
    apiProduct,
  }) => {
    const res = await request.get(`/api/products/${apiProduct.id}`)
    expect(res.ok()).toBeTruthy()
    expect(await res.json()).toMatchObject({ name: apiProduct.name, price: apiProduct.price })
  })
})
