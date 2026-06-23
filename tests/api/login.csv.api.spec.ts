import { test, expect } from '@playwright/test'
import { csvLoginCases } from '../../data/login.cases'

/*
 * Data-driven login (@api) sourced from an EXTERNAL CSV file — one row in
 * data/login.cases.csv becomes one test. Demonstrates loading cases from a
 * spreadsheet-friendly format (editable by a non-developer); the TS datasets
 * cover the same pattern type-safely. These rows add security-flavoured edge
 * coverage: case-sensitivity, surrounding whitespace, injection-looking input.
 */
test.describe('Login API — data-driven from CSV @api', () => {
  for (const { label, username, password, expectedStatus, expectToken } of csvLoginCases) {
    test(`POST /api/login — ${label} → ${expectedStatus}`, async ({ request }) => {
      const res = await request.post('/api/login', { data: { username, password } })
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
