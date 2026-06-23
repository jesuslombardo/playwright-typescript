import { test, expect } from '@playwright/test'
import { testUsers } from '../../config/environments'
import { getToken } from '../../utils/api'
import { buildProduct } from '../../data/product.factory'
import { seededProducts } from '../../data/products.dataset'

const SEED_COUNT = 6

/*
 * API layer of the testing pyramid (@api). Fast, browserless checks via the
 * `request` fixture — these gate the slower E2E layer in CI.
 */
test.describe('Products API @api', () => {
  test('health endpoint reports ok', async ({ request }) => {
    const res = await request.get('/health')
    expect(res.ok()).toBeTruthy()
    expect(await res.json()).toMatchObject({ status: 'ok' })
  })

  test('login returns a JWT for valid credentials', async ({ request }) => {
    const res = await request.post('/api/login', {
      data: { username: testUsers.standard.username, password: testUsers.standard.password },
    })
    expect(res.status()).toBe(200)
    expect(typeof (await res.json()).token).toBe('string')
  })

  test('login rejects invalid credentials with 401', async ({ request }) => {
    const res = await request.post('/api/login', {
      data: { username: testUsers.invalid.username, password: testUsers.invalid.password },
    })
    expect(res.status()).toBe(401)
  })

  test('GET /api/products returns the seeded catalogue', async ({ request }) => {
    const res = await request.get('/api/products')
    expect(res.ok()).toBeTruthy()

    const products = await res.json()
    expect(Array.isArray(products)).toBeTruthy()
    expect(products.length).toBeGreaterThanOrEqual(SEED_COUNT)
    expect(products.map((p: { name: string }) => p.name)).toContain(seededProducts.backpack.name)
  })

  test('GET /api/products/:id returns 404 for an unknown id', async ({ request }) => {
    const res = await request.get('/api/products/999999')
    expect(res.status()).toBe(404)
  })

  test('POST /api/products requires authentication', async ({ request }) => {
    const res = await request.post('/api/products', { data: { name: 'No Auth', price: 1 } })
    expect(res.status()).toBe(401)
  })

  // Payload validation is covered exhaustively in products.data.api.spec.ts.

  test('authenticated user can create, read, update and delete a product', async ({ request }) => {
    const token = await getToken(request)
    const headers = { Authorization: `Bearer ${token}` }
    const product = buildProduct()

    // create
    const createRes = await request.post('/api/products', { headers, data: product })
    expect(createRes.status()).toBe(201)
    const created = await createRes.json()
    expect(created).toMatchObject({ name: product.name, price: product.price })

    // read
    const getRes = await request.get(`/api/products/${created.id}`)
    expect(getRes.ok()).toBeTruthy()

    // update
    const putRes = await request.put(`/api/products/${created.id}`, {
      headers,
      data: { price: 99.99 },
    })
    expect(putRes.ok()).toBeTruthy()
    expect((await putRes.json()).price).toBe(99.99)

    // delete
    const delRes = await request.delete(`/api/products/${created.id}`, { headers })
    expect(delRes.status()).toBe(204)

    // confirm gone
    const goneRes = await request.get(`/api/products/${created.id}`)
    expect(goneRes.status()).toBe(404)
  })
})
