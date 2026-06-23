import { test, expect } from '@playwright/test'
import { getToken } from '../../utils/api'
import { CrudClient } from '../../utils/crud-client'
import { buildProduct, Product } from '../../data/product.factory'

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * Product lifecycle — state-transition EDGES.  ORGANIC: closes a real gap.
 * ─────────────────────────────────────────────────────────────────────────────
 * products.api.spec.ts walks the happy path (create→read→update→delete→404).
 * What was UNcovered are the edges AROUND that path — operating on an id that is
 * gone or never existed:
 *   - update after delete   → 404   (no "zombie" writes)
 *   - delete twice          → 404
 *   - get/update/delete on a never-created id → 404
 *
 * It also showcases the generic `CrudClient<Product>`: the spec reads in the
 * resource's language, not HTTP. (The full polymorphic *State pattern* would be
 * over-engineering for plain CRUD — it's shown in examples/patterns/state/ on a
 * richer workflow where transition rules actually justify it.)
 */

const UNKNOWN_ID = 999_999

test.describe('Product lifecycle — state edges @api', () => {
  test('a deleted product is gone for every verb (no zombie state)', async ({ request }) => {
    const products = new CrudClient<Product>(request, 'products', await getToken(request))

    // NonExistent → Active
    const created = await (await products.create(buildProduct())).json()

    // Active → Deleted
    expect((await products.delete(created.id)).status()).toBe(204)

    // Deleted: nothing should succeed anymore.
    expect((await products.get(created.id)).status()).toBe(404)
    expect((await products.delete(created.id)).status()).toBe(404) // delete-twice
    expect((await products.update(created.id, { price: 1 })).status()).toBe(404)
  })

  test('operations on a never-created id all 404', async ({ request }) => {
    const products = new CrudClient<Product>(request, 'products', await getToken(request))

    expect((await products.get(UNKNOWN_ID)).status()).toBe(404)
    expect((await products.update(UNKNOWN_ID, { price: 1 })).status()).toBe(404)
    expect((await products.delete(UNKNOWN_ID)).status()).toBe(404)
  })
})
