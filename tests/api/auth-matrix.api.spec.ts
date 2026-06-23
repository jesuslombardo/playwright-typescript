import { APIRequestContext, APIResponse, test, expect } from '@playwright/test'
import { buildProduct } from '../../data/product.factory'

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * PATTERN — Template Method (behavioural).  ORGANIC: fills a real coverage gap.
 * ─────────────────────────────────────────────────────────────────────────────
 * Every write endpoint (POST/PUT/DELETE /api/products) is guarded by the same
 * `requireAuth` middleware, so they share ONE security contract: a request
 * without a valid Bearer token must be rejected with 401 — regardless of verb.
 * That invariant is the "template": a fixed algorithm.
 *
 * What VARIES between endpoints is only HOW you call them (verb + URL + body).
 * Template Method captures exactly that split: the base class owns the
 * invariant algorithm (`verifyRejectsBadAuth`) and defers the single varying
 * step (`send`) to subclasses. The matrix is written ONCE; adding a new
 * protected endpoint is one subclass, not another copy of the loop.
 *
 * Why ORGANIC (and not a teaching toy): products.api.spec.ts only checks
 * POST-without-token. The genuinely UNcovered branches of `requireAuth` — a
 * malformed header, and an invalid/expired token (the `catch`) — plus
 * PUT/DELETE-without-auth, all live here. Real regression signal → main suite.
 */

/** The varying step: each subclass knows how to hit ONE protected endpoint. */
abstract class ProtectedWrite {
  /** Human label for the test title and assertion messages. */
  abstract readonly label: string

  /**
   * PRIMITIVE OPERATION — overridden per verb. `auth` is intentionally optional
   * and/or invalid: the matrix drives it with the bad-auth variants below.
   */
  abstract send(request: APIRequestContext, auth?: Record<string, string>): Promise<APIResponse>

  /**
   * TEMPLATE METHOD — the invariant every protected write must satisfy. Written
   * once in the base, inherited by all endpoints: each bad-auth variant → 401.
   */
  async verifyRejectsBadAuth(request: APIRequestContext): Promise<void> {
    for (const { label, header } of BAD_AUTH_CASES) {
      const res = await this.send(request, header)
      expect(res.status(), `${this.label} with ${label}`).toBe(401)
    }
  }
}

class CreateProduct extends ProtectedWrite {
  readonly label = 'POST /api/products'
  send(request: APIRequestContext, auth?: Record<string, string>) {
    return request.post('/api/products', { headers: auth, data: buildProduct() })
  }
}

class UpdateProduct extends ProtectedWrite {
  readonly label = 'PUT /api/products/:id'
  send(request: APIRequestContext, auth?: Record<string, string>) {
    // Any id works: requireAuth runs BEFORE the handler ever looks one up.
    return request.put('/api/products/1', { headers: auth, data: { price: 1 } })
  }
}

class DeleteProduct extends ProtectedWrite {
  readonly label = 'DELETE /api/products/:id'
  send(request: APIRequestContext, auth?: Record<string, string>) {
    return request.delete('/api/products/1', { headers: auth })
  }
}

/**
 * The bad-auth variants — each maps to a distinct branch of `requireAuth`:
 *   no header / empty / wrong scheme / "Bearer" w/o token → "Missing or malformed"
 *   "Bearer <garbage>" → jwt.verify throws → the `catch` → "Invalid or expired token"
 * An EXPIRED token hits the same `catch`, so a malformed token exercises that
 * branch without us having to sign one.
 */
const BAD_AUTH_CASES: { label: string; header?: Record<string, string> }[] = [
  { label: 'no Authorization header', header: undefined },
  { label: 'empty Authorization header', header: { Authorization: '' } },
  { label: 'wrong scheme (Token …)', header: { Authorization: 'Token abc.def.ghi' } },
  { label: '"Bearer" with no token', header: { Authorization: 'Bearer' } },
  { label: 'invalid/garbage token', header: { Authorization: 'Bearer not-a-real-jwt' } },
]

const PROTECTED_WRITES: ProtectedWrite[] = [
  new CreateProduct(),
  new UpdateProduct(),
  new DeleteProduct(),
]

test.describe('Auth matrix — protected writes reject bad auth @api', () => {
  for (const endpoint of PROTECTED_WRITES) {
    test(`${endpoint.label} rejects every bad-auth variant with 401`, async ({ request }) => {
      await endpoint.verifyRejectsBadAuth(request)
    })
  }
})
