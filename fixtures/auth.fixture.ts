import { test as base, Page } from '@playwright/test'
import { LoginPage } from '../pages/login.page'
import { ProductsPage } from '../pages/products.page'
import { testUsers } from '../config/environments'

type AuthFixtures = {
  loggedInPage: Page
}

export const test = base.extend<AuthFixtures>({
  loggedInPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(testUsers.standard.username, testUsers.standard.password)

    // Wait for the post-login redirect so tests start on a ready catalogue.
    const productsPage = new ProductsPage(page)
    await productsPage.title.waitFor({ state: 'visible' })

    await use(page)
  },
})

export { expect } from '@playwright/test'
