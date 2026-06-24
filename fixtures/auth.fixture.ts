import { test as base, Page } from '@playwright/test'
import { LoginPage } from '../pages/login.page'
import { ProductsPage } from '../pages/products.page'
import { testUsers } from '../config/environments'

type Credentials = { username: string; password: string }

type AuthFixtures = {
  /** A browser logged in as the standard CUSTOMER (the headline shopper). */
  loggedInPage: Page
  /** Alias of loggedInPage, named for specs that care it's a customer. */
  customerPage: Page
  /** A browser logged in as the ADMIN (needed for catalogue management). */
  adminPage: Page
}

/** Log `page` in through the real form and wait until the catalogue is ready. */
async function loginAs(page: Page, creds: Credentials) {
  const loginPage = new LoginPage(page)
  await loginPage.goto()
  await loginPage.login(creds.username, creds.password)
  // Wait for the post-login redirect so tests start on a ready catalogue.
  await new ProductsPage(page).title.waitFor({ state: 'visible' })
  return page
}

export const test = base.extend<AuthFixtures>({
  loggedInPage: async ({ page }, use) => {
    await use(await loginAs(page, testUsers.standard))
  },
  customerPage: async ({ page }, use) => {
    await use(await loginAs(page, testUsers.standard))
  },
  adminPage: async ({ page }, use) => {
    await use(await loginAs(page, testUsers.admin))
  },
})

export { expect } from '@playwright/test'
