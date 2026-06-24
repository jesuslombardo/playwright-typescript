import { test, expect } from '@playwright/test'
import { getToken } from '../../utils/api'
import { testUsers } from '../../config/environments'
import { buildProduct } from '../../data/product.factory'
import { writeOps } from '../../data/write-ops'

/*
 * Authorization matrix (@api). The other data-driven specs check WHAT you send
 * (payload validation); this checks WHO may send it. Every write endpoint must
 * reject:
 *   - no token / malformed token              → 401 (authentication)
 *   - a valid but non-admin (customer) token  → 403 (authorization / role gate)
 * Catalogue writes are admin-only since v2.0.0, so the role gate is asserted
 * here alongside the authentication invariant.
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

    test(`${op.label} — rejected for a non-admin customer → 403`, async ({ request }) => {
      // A valid token, but the wrong role: authenticated yet not authorized.
      const token = await getToken(request, testUsers.standard)
      const res = await request[op.method](op.path, {
        headers: { Authorization: `Bearer ${token}` },
        data: op.body,
      })
      expect(res.status()).toBe(403)
    })
  }

  // Positive anchor: a valid ADMIN token IS accepted on a write, proving the
  // 401s/403s above are about auth, not a dead endpoint. (Full CRUD lives in
  // products.api.spec.ts.) It creates then deletes its product, leaving no residue.
  test('a valid admin token is accepted on a write → 201', async ({ request }) => {
    const token = await getToken(request)
    const headers = { Authorization: `Bearer ${token}` }

    const res = await request.post('/api/products', { headers, data: buildProduct() })
    expect(res.status()).toBe(201)

    const created = await res.json()
    await request.delete(`/api/products/${created.id}`, { headers })
  })
})
