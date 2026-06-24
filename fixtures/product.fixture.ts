import { test as base, expect } from '@playwright/test'
import { buildProduct, ApiProduct } from '../data/product.factory'
import { getToken } from '../utils/api'

type ProductFixtures = {
  apiProduct: ApiProduct
}

/**
 * `apiProduct` — test data lifecycle fixture.
 *
 * Creates a fresh, unique product over the API BEFORE the test and DELETES it
 * afterwards (the code after `use` is teardown — it runs even if the test
 * fails). This is the industry pattern for isolation: each test owns its data
 * and leaves no residue, so a create/delete elsewhere can never make it flaky.
 *
 * It also enables "set up via API, assert via UI": seed state with one fast API
 * call instead of clicking through the creation form when that is not what you
 * are testing.
 */
export const test = base.extend<ProductFixtures>({
  apiProduct: async ({ request }, use) => {
    const token = await getToken(request)
    const headers = { Authorization: `Bearer ${token}` }

    const res = await request.post('/api/products', { headers, data: buildProduct() })
    expect(res.status()).toBe(201)
    const product: ApiProduct = await res.json()

    await use(product)

    await request.delete(`/api/products/${product.id}`, { headers })
  },
})

export { expect }
