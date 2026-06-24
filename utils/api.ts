import { APIRequestContext, expect } from '@playwright/test'
import { testUsers } from '../config/environments'

type Credentials = { username: string; password: string }

/**
 * Logs in over the API and returns a Bearer token. Shared by the API specs and
 * the product fixture so the login flow lives in one place.
 *
 * Defaults to the ADMIN user because that's what its callers need: every
 * catalogue write (POST/PUT/DELETE /api/products) requires the admin role since
 * app v2.0.0. Pass a different user to get, say, a customer token for a negative
 * authorization check — `getToken(request, testUsers.standard)`.
 */
export async function getToken(
  request: APIRequestContext,
  user: Credentials = testUsers.admin,
): Promise<string> {
  const res = await request.post('/api/login', {
    data: { username: user.username, password: user.password },
  })
  expect(res.ok()).toBeTruthy()
  return (await res.json()).token
}
