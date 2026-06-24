import { APIRequestContext } from '@playwright/test'
import { testUsers } from '../config/environments'

type Credentials = { username: string; password: string }

/**
 * Logs in over the API and returns a Bearer token. Shared by the API specs and
 * the product fixture so the login flow lives in one place.
 *
 * With no `user`, it returns a WRITE-capable token: catalogue writes are
 * role-gated as of demo-shop-app v2.0.0, so it prefers the admin user and falls
 * back to the standard user on older app versions that predate roles (where the
 * admin account does not exist and any authenticated user may write) — keeping
 * the suite green across the pinned `.app-version` during the cross-repo
 * rollout. Pass an explicit `user` to get that user's token instead, e.g. a
 * customer token for a negative authorization check —
 * `getToken(request, testUsers.standard)`.
 */
export async function getToken(request: APIRequestContext, user?: Credentials): Promise<string> {
  const candidates = user ? [user] : [testUsers.admin, testUsers.standard]
  for (const u of candidates) {
    const res = await request.post('/api/login', {
      data: { username: u.username, password: u.password },
    })
    if (res.ok()) return (await res.json()).token
  }
  throw new Error(`Login failed for ${user ? user.username : 'the admin and standard users'}`)
}
