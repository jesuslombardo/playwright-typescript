import { testUsers } from '../config/environments'

/** One row of a data-driven login test. */
export type LoginCase = {
  label: string
  credentials: { username: string; password: string }
  expectedStatus: number
  expectToken: boolean
}

/**
 * Data-driven cases for POST /api/login — one row becomes one test.
 *
 * The valid row reuses `testUsers.standard` (env-backed config) so credentials
 * live in ONE place; the invalid rows are scenario data and stay here. The app
 * answers 401 for any mismatch — it never 400s on missing fields.
 */
export const loginCases: LoginCase[] = [
  {
    label: 'valid credentials',
    credentials: testUsers.standard,
    expectedStatus: 200,
    expectToken: true,
  },
  {
    label: 'wrong password',
    credentials: { username: testUsers.standard.username, password: 'wrong_password' },
    expectedStatus: 401,
    expectToken: false,
  },
  {
    label: 'unknown user',
    credentials: { username: 'ghost_user', password: testUsers.standard.password },
    expectedStatus: 401,
    expectToken: false,
  },
  {
    label: 'empty credentials',
    credentials: { username: '', password: '' },
    expectedStatus: 401,
    expectToken: false,
  },
]
