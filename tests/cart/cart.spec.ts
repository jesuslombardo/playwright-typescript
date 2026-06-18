import { test, expect } from '../../fixtures/auth.fixture'
import { InventoryPage } from '../../pages/inventory.page'
import { CartPage } from '../../pages/cart.page'
import { testProducts } from '../../config/environments'

// Cart tests
test.describe('Cart', () => {
  test('user can view added product in the cart', async ({ loggedInPage }) => {
    const inventoryPage = new InventoryPage(loggedInPage)

    await inventoryPage.addProductToCart(testProducts.backpack.slug)
    await inventoryPage.header.openCart()

    const cartPage = new CartPage(loggedInPage)
    await expect(cartPage.title).toHaveText('Your Cart')
    await expect(cartPage.itemByName(testProducts.backpack.name)).toBeVisible()
  })
})
