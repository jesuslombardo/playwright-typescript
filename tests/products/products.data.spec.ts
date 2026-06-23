import { test, expect } from '../../fixtures/shop.fixture'
import { ProductsPage } from '../../pages/products.page'

/*
 * Data layer end-to-end: the industry "set up via API, assert via UI" pattern.
 * `apiProduct` seeds a unique product over the API (fast, no clicking through
 * the form) and removes it afterwards; the test only verifies it renders.
 */
test.describe('Products — data layer (E2E)', () => {
  test('a product seeded via the API appears in the catalogue', async ({
    loggedInPage,
    apiProduct,
  }) => {
    const productsPage = new ProductsPage(loggedInPage)

    // Re-load so the API-created product is listed regardless of the order in
    // which the loggedInPage / apiProduct fixtures were set up.
    await productsPage.goto()

    await expect(productsPage.itemByName(apiProduct.name)).toBeVisible()
  })
})
