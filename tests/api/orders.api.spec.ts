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

  test('orders are private to their owner', async ({ request }) => {
    const customer = await customerHeaders(request)
    const admin = { Authorization: `Bearer ${await getToken(request)}` } // admin token

    const created = await request.post('/api/orders', {
      headers: customer,
      data: { items: [{ productId: BACKPACK_ID, quantity: 1 }], customer: buildCustomer() },
    })
    const order = await created.json()

    // The owner can read their order back…
    const mine = await request.get(`/api/orders/${order.id}`, { headers: customer })
    expect(mine.status()).toBe(200)

    // …but another user cannot — it's scoped to the owner's username → 404.
    const theirs = await request.get(`/api/orders/${order.id}`, { headers: admin })
    expect(theirs.status()).toBe(404)
  })
})
