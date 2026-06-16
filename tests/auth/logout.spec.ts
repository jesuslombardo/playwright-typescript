import { test, expect } from '../../fixtures/auth.fixture'
import { LoginPage } from '../../pages/login.page'
import { InventoryPage } from '../../pages/inventory.page'

test.describe('Logout', () => {
  test('user can logout from inventory page', async ({ loggedInPage }) => {
    const inventoryPage = new InventoryPage(loggedInPage)

    await expect(inventoryPage.title).toBeVisible()
    await inventoryPage.header.logout()

    const loginPage = new LoginPage(loggedInPage)
    await expect(loggedInPage).toHaveURL('/')
    await expect(loginPage.loginButton).toBeVisible()
  })
})
