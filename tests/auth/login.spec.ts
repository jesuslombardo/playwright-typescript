import { test, expect } from '@playwright/test'
import { LoginPage } from '../../pages/login.page'
import { InventoryPage } from '../../pages/inventory.page'
import { testUsers } from '../../config/environments'

test.describe('Login', () => {
  test('user can login with valid credentials', { tag: '@smoke' }, async ({ page }) => {
    const loginPage = new LoginPage(page)

    await loginPage.goto()
    await loginPage.login(testUsers.standard.username, testUsers.standard.password)

    const inventoryPage = new InventoryPage(page)
    await expect(page).toHaveURL(/inventory/)
    await expect(inventoryPage.title).toBeVisible()
  })

  test('locked out user sees an error message', async ({ page }) => {
    const loginPage = new LoginPage(page)

    await loginPage.goto()
    await loginPage.login(testUsers.lockedOut.username, testUsers.lockedOut.password)

    await expect(page).toHaveURL('/')
    await expect(loginPage.errorMessage).toBeVisible()
    await expect(loginPage.errorMessage).toContainText('locked out')
  })
})
