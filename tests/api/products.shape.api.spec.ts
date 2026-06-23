import { test, expect } from '@playwright/test'
import { isApiProduct } from '../../utils/product.guard'

/*
 * Response-shape & catalogue invariants (@api). As much a TypeScript exercise as
 * a test: GET returns `unknown` data, and a type guard NARROWS each item to a
 * real product before we assert business rules on it.
 *
 * Distinct from the contract test (Ajv vs the OpenAPI schema): that one detects
 * schema DRIFT; this one gives the test code a typed, trustworthy value and
 * checks invariants the schema alone does not (e.g. price strictly positive).
 */
test.describe('Products API — response shape @api', () => {
  test('every product in the catalogue is well-formed', async ({ request }) => {
    const res = await request.get('/api/products')
    expect(res.ok()).toBeTruthy()

    // `.json()` is untyped — treat it as `unknown` and first prove it's an array.
    const body: unknown = await res.json()
    expect(Array.isArray(body)).toBeTruthy()
    const items = body as unknown[]

    // `.filter(isApiProduct)` NARROWS the element type: `products` is typed
    // `ApiProduct[]`, not `unknown[]`. A malformed row would be dropped here, so
    // equal lengths means every row is a well-formed product.
    const products = items.filter(isApiProduct)
    expect(products.length).toBe(items.length)

    for (const product of products) {
      // `product` is fully typed here — no casts, autocompletion on every field.
      expect(product.name.trim().length).toBeGreaterThan(0)
      expect(product.price).toBeGreaterThan(0)
      expect(Number.isInteger(product.id)).toBeTruthy()
    }
  })

  test('a single product fetched by id is well-formed', async ({ request }) => {
    // Grab a real id from the list, then re-fetch that product on its own.
    const list = (await (await request.get('/api/products')).json()) as unknown[]
    const first = list.filter(isApiProduct)[0]

    // `?.` and `??`: read the id only if a product was actually found, else 0.
    const id = first?.id ?? 0
    expect(id).toBeGreaterThan(0)

    const res = await request.get(`/api/products/${id}`)
    expect(res.ok()).toBeTruthy()

    // A plain assertion would happily read `.name` off anything; the guard makes
    // "is this actually a product?" an explicit, checked step.
    const body: unknown = await res.json()
    expect(isApiProduct(body)).toBeTruthy()
  })
})
