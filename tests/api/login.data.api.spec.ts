import { test, expect } from '@playwright/test'
import { loginCases } from '../../data/auth.dataset'

/*
 * Data-driven login (@api): valid and invalid credential cases driven from a
 * single table. Adding a case is adding a row in data/auth.dataset.ts.
 */
test.describe('Login API — data-driven @api', () => {
  for (const { label, credentials, expectedStatus, expectToken } of loginCases) {
    test(`POST /api/login — ${label} → ${expectedStatus}`, async ({ request }) => {
      const res = await request.post('/api/login', { data: credentials })
      expect(res.status()).toBe(expectedStatus)

      const body = await res.json()
      if (expectToken) {
        expect(typeof body.token).toBe('string')
      } else {
        expect(body.token).toBeUndefined()
      }
    })
  }
})
