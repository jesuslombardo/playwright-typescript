import { test, expect } from '@playwright/test'
import { getToken, getCustomerToken } from '../../utils/api'
import { buildProduct } from '../../data/product.factory'
import { writeOps } from '../../data/write-ops'

/*
 * Authorization matrix (@api). The other data-driven specs check WHAT you send
 * (payload validation); this checks WHO may send it. Every write endpoint must
 * reject a request with no token and with a malformed token — the security
 * invariant of the whole API, asserted in one place.
 *
 * These requests are refused at the auth gate before any row is touched, so the
 * suite is read-only and deterministic: no fixture, no cleanup.
 */
test.describe('Products API — authorization @api', () => {
  for (const op of writeOps) {
    test(`${op.label} — rejected without a token → 401`, async ({ request }) => {
      // `op.method` is 'post' | 'put' | 'delete', so `request[op.method]` is a
      // real write method. Indexing with a plain `string` would not type-check.
      const res = await request[op.method](op.path, { data: op.body })
      expect(res.status()).toBe(401)
    })

    test(`${op.label} — rejected with a malformed token → 401`, async ({ request }) => {
      const res = await request[op.method](op.path, {
        headers: { Authorization: 'Bearer not-a-real-jwt' },
        data: op.body,
      })
      expect(res.status()).toBe(401)
    })

    test(`${op.label} — rejected for a customer (non-admin) token → 403`, async ({ request }) => {
      const res = await request[op.method](op.path, {
        headers: { Authorization: `Bearer ${await getCustomerToken(request)}` },
        data: op.body,
      })
      expect(res.status()).toBe(403)
    })
  }

  // Positive anchor: a VALID token IS accepted on a write, proving the 401s above
  // are about auth, not a dead endpoint. (Full CRUD lives in products.api.spec.ts.)
  // It creates then deletes its product so the suite leaves no residue.
  test('a valid token is accepted on a write → 201', async ({ request }) => {
    const token = await getToken(request)
    const headers = { Authorization: `Bearer ${token}` }

    const res = await request.post('/api/products', { headers, data: buildProduct() })
    expect(res.status()).toBe(201)

    const created = await res.json()
    await request.delete(`/api/products/${created.id}`, { headers })
  })
})
