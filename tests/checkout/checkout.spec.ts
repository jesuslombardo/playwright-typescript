import { test, expect } from '../../fixtures/auth.fixture'
import { InventoryPage } from '../../pages/inventory.page'
import { CartPage } from '../../pages/cart.page'
import { CheckoutPage } from '../../pages/checkout.page'
import { testProducts } from '../../config/environments'
import { generateCheckoutCustomer } from '../../utils/data-generator'

test.describe('Checkout', () => {
  test('user can complete a purchase', { tag: '@smoke' }, async ({ loggedInPage }) => {
    const inventoryPage = new InventoryPage(loggedInPage)

    await inventoryPage.addProductToCart(testProducts.backpack.slug)
    await inventoryPage.header.openCart()

    const cartPage = new CartPage(loggedInPage)
    await cartPage.proceedToCheckout()

    const checkoutPage = new CheckoutPage(loggedInPage)
    await checkoutPage.fillShippingInfo(generateCheckoutCustomer())
    await checkoutPage.continueToOverview()
    await checkoutPage.finishOrder()

    await expect(checkoutPage.completeHeader).toHaveText('Thank you for your order!')
  })
})
