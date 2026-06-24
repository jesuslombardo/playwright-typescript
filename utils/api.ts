import { APIRequestContext } from '@playwright/test'
import { testUsers } from '../config/environments'

/**
 * Logs in over the API and returns a Bearer token for authenticated writes.
 * Shared by the API specs and the product lifecycle fixture so the login flow
 * lives in one place.
 *
 * Catalogue writes are role-gated as of demo-shop-app v2.0.0, so this prefers
 * the admin user and falls back to the standard user on older app versions that
 * predate roles (where the admin account does not exist and any authenticated
 * user may write) — keeping the suite green across the pinned `.app-version`
 * during the cross-repo rollout.
 */
export async function getToken(request: APIRequestContext): Promise<string> {
  for (const user of [testUsers.admin, testUsers.standard]) {
    const res = await request.post('/api/login', {
      data: { username: user.username, password: user.password },
    })
    if (res.ok()) return (await res.json()).token
  }
  throw new Error('Login failed for both the admin and standard users')
}
