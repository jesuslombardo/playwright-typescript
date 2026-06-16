import { test, expect } from '../../fixtures/auth.fixture'
import { InventoryPage } from '../../pages/inventory.page'
import { testProducts } from '../../config/environments'

test.describe('Inventory', () => {
  test('user can add a product to the cart', async ({ loggedInPage }) => {
    const inventoryPage = new InventoryPage(loggedInPage)

    await expect(inventoryPage.title).toBeVisible()
    await inventoryPage.addProductToCart(testProducts.backpack.slug)

    await expect(inventoryPage.cartBadge).toHaveText('1')
  })
})
