import { APIRequestContext, expect } from '@playwright/test'
import { testUsers } from '../config/environments'

/**
 * Logs in over the API and returns a Bearer token for authenticated writes.
 * Shared by the API specs and the product lifecycle fixture so the login flow
 * lives in one place.
 */
export async function getToken(request: APIRequestContext): Promise<string> {
  const res = await request.post('/api/login', {
    data: { username: testUsers.standard.username, password: testUsers.standard.password },
  })
  expect(res.ok()).toBeTruthy()
  return (await res.json()).token
}
