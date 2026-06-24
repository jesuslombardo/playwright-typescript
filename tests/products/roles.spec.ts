import { test, expect } from '../../fixtures/auth.fixture'
import { ProductsPage } from '../../pages/products.page'

/*
 * Role-based UI. The same catalogue page renders differently per role: a customer
 * gets a read-only STOREFRONT (add-to-cart) plus the shopping nav (cart, orders);
 * an admin gets the MANAGEMENT view (add form + edit/remove) and NO shopping —
 * since v2.1.0 admins can't cart/checkout/order, so those links are hidden and
 * the shopping pages bounce them back to the catalogue.
 */
test.describe('Role-based catalogue view', () => {
  test('customer sees the storefront and shopping nav, not management', async ({ customerPage }) => {
    const products = new ProductsPage(customerPage)

    await expect(products.header.roleBadge).toHaveText('customer')
    await expect(products.shopHint).toBeVisible()
    await expect(products.items.first().getByTestId('add-to-cart')).toBeVisible()
    // Shopping nav is the customer's.
    await expect(products.header.cartLink).toBeVisible()
    await expect(products.header.ordersLink).toBeVisible()

    // No management surface for a customer.
    await expect(products.adminTools).toBeHidden()
    await expect(customerPage.getByTestId('edit-product')).toHaveCount(0)
    await expect(customerPage.getByTestId('delete-product')).toHaveCount(0)
  })

  test('admin sees management, not the storefront or shopping nav', async ({ adminPage }) => {
    const products = new ProductsPage(adminPage)

    await expect(products.header.roleBadge).toHaveText('admin')
    await expect(products.adminTools).toBeVisible()
    await expect(adminPage.getByTestId('edit-product').first()).toBeVisible()
    await expect(adminPage.getByTestId('delete-product').first()).toBeVisible()

    // No storefront controls for an admin…
    await expect(products.shopHint).toBeHidden()
    await expect(adminPage.getByTestId('add-to-cart')).toHaveCount(0)
    // …and no shopping nav — admins don't cart/order.
    await expect(products.header.cartLink).toBeHidden()
    await expect(products.header.ordersLink).toBeHidden()
  })

  test('admin is bounced from the shopping pages to the catalogue', async ({ adminPage }) => {
    for (const path of ['/cart.html', '/checkout.html', '/orders.html']) {
      await adminPage.goto(path)
      await expect(adminPage).toHaveURL(/\/products\.html$/)
    }
  })
})
