import { APIRequestContext, Page } from '@playwright/test'
import { LoginPage } from './login.page'
import { ProductsPage } from './products.page'
import { testUsers } from '../config/environments'

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * PATTERN — Strategy (behavioural) + Polymorphism.  ORGANIC: reusable infra.
 * ─────────────────────────────────────────────────────────────────────────────
 * "Get the browser into the logged-in state" has more than one valid way to do
 * it, and tests shouldn't care which. Strategy makes the *how* swappable behind
 * one interface: drive the real form (when login IS what you're testing) or skip
 * it via the API (the fast path for tests that just need to BE logged in).
 *
 * The API strategy seeds the exact token the front-end expects
 * (`localStorage.token`, see app/public/js/login.js) — a storageState-style
 * shortcut. This token-seed path wasn't covered before.
 */

type Credentials = { username: string; password: string }

export interface LoginStrategy {
  readonly name: string
  /** Leaves `page` on the authenticated catalogue. */
  login(page: Page, creds?: Credentials): Promise<void>
}

/** Logs in through the real UI form — use when the login flow itself is the SUT. */
export class UiLoginStrategy implements LoginStrategy {
  readonly name = 'ui'

  async login(page: Page, creds: Credentials = testUsers.standard): Promise<void> {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(creds.username, creds.password)
    await new ProductsPage(page).title.waitFor({ state: 'visible' })
  }
}

/** Authenticates over the API and seeds the token — the fast setup path. */
export class ApiLoginStrategy implements LoginStrategy {
  readonly name = 'api'

  constructor(private readonly request: APIRequestContext) {}

  async login(page: Page, creds: Credentials = testUsers.standard): Promise<void> {
    const res = await this.request.post('/api/login', { data: creds })
    const { token } = await res.json()
    // Runs before the page's own scripts, so products.js sees the token on load.
    await page.addInitScript((t) => localStorage.setItem('token', t), token)
    await page.goto('/products.html')
  }
}
