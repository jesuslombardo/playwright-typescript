import { test, expect } from '@playwright/test'
import { getToken } from '../../utils/api'
import { testUsers } from '../../config/environments'
import { buildCustomer } from '../../data/customer.factory'
import { seededProducts } from '../../data/products.dataset'

/*
 * Orders API (@api) — the checkout endpoint and order history. Browserless.
 * Orders are placed by CUSTOMERS (any valid token), priced server-side from the
 * live catalogue, and scoped to the owner. productId 1 is the seeded backpack.
 */
const BACKPACK_ID = 1

async function customerHeaders(request: Parameters<typeof getToken>[0]) {
  return { Authorization: `Bearer ${await getToken(request, testUsers.standard)}` }
}

test.describe('Orders API @api', () => {
  test('a customer places an order; the server computes the total', async ({ request }) => {
    const res = await request.post('/api/orders', {
      headers: await customerHeaders(request),
      data: { items: [{ productId: BACKPACK_ID, quantity: 2 }], customer: buildCustomer() },
    })
    expect(res.status()).toBe(201)

    const order = await res.json()
    expect(order.username).toBe(testUsers.standard.username)
    expect(order.items).toHaveLength(1)
    // Name/price are snapshotted from the catalogue, not trusted from the client.
    expect(order.items[0].name).toBe(seededProducts.backpack.name)
    expect(order.items[0].price).toBe(seededProducts.backpack.price)
    expect(order.total).toBe(Number((seededProducts.backpack.price * 2).toFixed(2)))
  })

  test('placing an order requires a token → 401', async ({ request }) => {
    const res = await request.post('/api/orders', {
      data: { items: [{ productId: BACKPACK_ID, quantity: 1 }], customer: buildCustomer() },
    })
    expect(res.status()).toBe(401)
  })

  test('an invalid payload is rejected → 400', async ({ request }) => {
    const headers = await customerHeaders(request)

    const emptyItems = await request.post('/api/orders', {
      headers,
      data: { items: [], customer: buildCustomer() },
    })
    expect(emptyItems.status()).toBe(400)

    const noCustomer = await request.post('/api/orders', {
      headers,
      data: {
        items: [{ productId: BACKPACK_ID, quantity: 1 }],
        customer: { name: '', address: '' },
      },
    })
    expect(noCustomer.status()).toBe(400)
  })

  test('an unknown product id is rejected → 400', async ({ request }) => {
    const res = await request.post('/api/orders', {
      headers: await customerHeaders(request),
      data: { items: [{ productId: 999_999, quantity: 1 }], customer: buildCustomer() },
    })
    expect(res.status()).toBe(400)
  })

  test('orders are scoped to their owner', async ({ request }) => {
    const customer = await customerHeaders(request)

    const created = await request.post('/api/orders', {
      headers: customer,
      data: { items: [{ productId: BACKPACK_ID, quantity: 1 }], customer: buildCustomer() },
    })
    const order = await created.json()

    // The owner can read their order back…
    const mine = await request.get(`/api/orders/${order.id}`, { headers: customer })
    expect(mine.status()).toBe(200)

    // …but the lookup is scoped by username, so an id that isn't theirs is
    // invisible → 404 (the same path that hides one customer's orders from
    // another). Probed with the owner's own token so this holds whether or not
    // the orders API is role-gated to customers.
    const notMine = await request.get(`/api/orders/${order.id + 100_000}`, { headers: customer })
    expect(notMine.status()).toBe(404)
  })
})
