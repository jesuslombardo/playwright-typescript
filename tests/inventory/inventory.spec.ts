import { test, expect } from '../../fixtures/auth.fixture'
import { InventoryPage } from '../../pages/inventory.page'

test.describe('Inventory', () => {
  test('user can add a product to the cart', async ({ loggedInPage }) => {
    const inventoryPage = new InventoryPage(loggedInPage)

    await expect(inventoryPage.title).toBeVisible()
    await inventoryPage.addProductToCart('sauce-labs-backpack')

    await expect(inventoryPage.cartBadge).toHaveText('1')
  })
})
