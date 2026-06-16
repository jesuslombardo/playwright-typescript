import { test, expect } from '../../fixtures/auth.fixture'
import { InventoryPage } from '../../pages/inventory.page'

test.describe('Logout', () => {
  test('user can logout from inventory page', async ({ loggedInPage }) => {
    const inventoryPage = new InventoryPage(loggedInPage)

    await expect(inventoryPage.title).toBeVisible()
    await inventoryPage.header.logout()

    await expect(loggedInPage).toHaveURL('/')
    await expect(loggedInPage.getByTestId('login-button')).toBeVisible()
  })
})
