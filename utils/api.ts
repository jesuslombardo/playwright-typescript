import { APIRequestContext, expect } from '@playwright/test'
import { testUsers } from '../config/environments'

async function tokenFor(
  request: APIRequestContext,
  user: { username: string; password: string },
): Promise<string> {
  const res = await request.post('/api/login', {
    data: { username: user.username, password: user.password },
  })
  expect(res.ok()).toBeTruthy()
  return (await res.json()).token
}

/**
 * Bearer token for authenticated writes. Catalogue writes (POST/PUT/DELETE
 * /api/products) require the ADMIN role as of demo-shop-app v2.0.0, so this
 * logs in as the admin user. Shared by the API specs and the product lifecycle
 * fixture so the login flow lives in one place.
 */
export async function getToken(request: APIRequestContext): Promise<string> {
  return tokenFor(request, testUsers.admin)
}

/**
 * Bearer token for a non-admin (customer). Used to assert that role-gated
 * catalogue writes are refused with 403.
 */
export async function getCustomerToken(request: APIRequestContext): Promise<string> {
  return tokenFor(request, testUsers.standard)
}
