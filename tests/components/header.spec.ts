import { test, expect } from '../../fixtures/auth.fixture'
import { ProductsPage } from '../../pages/products.page'
import { CartPage } from '../../pages/cart.page'
import { OrdersPage } from '../../pages/orders.page'
import { LoginPage } from '../../pages/login.page'
import { seededProducts } from '../../data/products.dataset'

/*
 * The shared HeaderComponent (topbar), composed by every signed-in page object.
 * Verifies the component's behaviour independently of any one page: the role
 * badge, the live cart badge (which persists across navigations because the cart
 * is localStorage-backed), the nav links, and logout — driven through
 * `page.header` no matter which page hosts it.
 */
test.describe('Header component (shared topbar)', () => {
  test('shows the role and a cart badge that persists across pages', async ({ customerPage }) => {
    const products = new ProductsPage(customerPage)
    await expect(products.header.roleBadge).toHaveText('customer')
    await expect(products.header.cartCount).toHaveText('0')

    await products.addToCartByName(seededProducts.backpack.name, 2)
    await expect(products.header.cartCount).toHaveText('2')

    // The same header on a different page reflects the same cart.
    await products.header.goToCart()
    await expect(customerPage).toHaveURL(/cart\.html/)
    await expect(new CartPage(customerPage).header.cartCount).toHaveText('2')
  })

  test('navigates between catalogue, cart and orders from the header', async ({ customerPage }) => {
    const cart = new CartPage(customerPage)
    await cart.goto()

    await cart.header.goToOrders()
    await expect(customerPage).toHaveURL(/orders\.html/)

    await new OrdersPage(customerPage).header.goToCatalogue()
    await expect(customerPage).toHaveURL(/products\.html/)

    await new ProductsPage(customerPage).header.goToCart()
    await expect(customerPage).toHaveURL(/cart\.html/)
  })

  test('logout from the header returns to the login page', async ({ customerPage }) => {
    await new ProductsPage(customerPage).header.logout()
    await expect(new LoginPage(customerPage).loginButton).toBeVisible()
  })
})
