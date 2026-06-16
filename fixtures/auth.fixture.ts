import { test as base } from '@playwright/test'
import { LoginPage } from '../pages/login.page'
import { testUsers } from '../config/environments'

export const test = base.extend({
  loggedInPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(testUsers.standard.username, testUsers.standard.password)
    await use(page)
  },
})

export { expect } from '@playwright/test'
