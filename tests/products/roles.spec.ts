import { test, expect } from '../../fixtures/auth.fixture'
import { ProductsPage } from '../../pages/products.page'

/*
 * Role-based UI (since v2.0.0). The same catalogue page renders differently per
 * role: a customer gets a read-only STOREFRONT (add-to-cart), an admin gets the
 * MANAGEMENT view (add form + edit/remove). This proves each role sees its own
 * controls and NOT the other's.
 */
test.describe('Role-based catalogue view', () => {
  test('customer sees the storefront, not management', async ({ customerPage }) => {
    const products = new ProductsPage(customerPage)

    await expect(products.roleBadge).toHaveText('customer')
    await expect(products.shopHint).toBeVisible()
    await expect(products.cartLink).toBeVisible()
    await expect(products.items.first().getByTestId('add-to-cart')).toBeVisible()

    // No management surface for a customer.
    await expect(products.adminTools).toBeHidden()
    await expect(customerPage.getByTestId('edit-product')).toHaveCount(0)
    await expect(customerPage.getByTestId('delete-product')).toHaveCount(0)
  })

  test('admin sees management, not the storefront', async ({ adminPage }) => {
    const products = new ProductsPage(adminPage)

    await expect(products.roleBadge).toHaveText('admin')
    await expect(products.adminTools).toBeVisible()
    await expect(adminPage.getByTestId('edit-product').first()).toBeVisible()
    await expect(adminPage.getByTestId('delete-product').first()).toBeVisible()

    // No storefront controls for an admin.
    await expect(products.shopHint).toBeHidden()
    await expect(adminPage.getByTestId('add-to-cart')).toHaveCount(0)
  })
})
