import { test, expect } from '../../fixtures/shop.fixture'
import { ProductsPage } from '../../pages/products.page'
import { buildProduct } from '../../data/product.factory'

/*
 * E2E coverage for INLINE PRODUCT EDITING — the per-card "Edit" button that
 * turns a product card into a form and PUTs the changes to /api/products/:id.
 *
 * Pattern: "set up via API, assert via UI". `apiProduct` seeds a unique product
 * over the API (and deletes it afterwards); we reload so it renders, then drive
 * the edit entirely through the browser. The exhaustive PUT status matrix lives
 * at the API layer (tests/api/products.update.api.spec.ts) — these specs only
 * prove the UI is correctly wired to that endpoint.
 */
// Editing the catalogue is an ADMIN capability since v2.0.0, so these run on
// the adminPage (a customer sees a read-only storefront with no edit controls).
test.describe('Products — inline edit (E2E)', () => {
  test('admin can edit a product and the card re-renders', async ({ adminPage, apiProduct }) => {
    const productsPage = new ProductsPage(adminPage)
    // Reload so the API-seeded product is listed regardless of fixture order.
    await productsPage.goto()
    await expect(productsPage.itemByName(apiProduct.name)).toBeVisible()

    const updated = buildProduct()
    await productsPage.editProductByName(apiProduct.name, updated)

    // The card now shows the new name + formatted price; the old name is gone.
    await expect(productsPage.itemByName(updated.name)).toBeVisible()
    await expect(productsPage.priceOf(updated.name)).toHaveText(`$${updated.price.toFixed(2)}`)
    await expect(productsPage.itemByName(apiProduct.name)).toHaveCount(0)
  })

  test('canceling an edit discards the changes', async ({ adminPage, apiProduct }) => {
    const productsPage = new ProductsPage(adminPage)
    await productsPage.goto()

    await productsPage.startEditByName(apiProduct.name)
    await productsPage.editName.fill('Discarded Name')
    await productsPage.cancelButton.click()

    // The original card is back; the discarded name never persisted.
    await expect(productsPage.itemByName(apiProduct.name)).toBeVisible()
    await expect(productsPage.itemByName('Discarded Name')).toHaveCount(0)
  })

  test('an empty name is rejected with an inline error and no change', async ({
    adminPage,
    apiProduct,
  }) => {
    const productsPage = new ProductsPage(adminPage)
    await productsPage.goto()

    await productsPage.startEditByName(apiProduct.name)
    await productsPage.editName.fill('')
    await productsPage.saveButton.click()

    // The server rejects the blank name (400); the UI surfaces it inline.
    await expect(productsPage.editError).toBeVisible()

    // Nothing changed: after a reload the original product is still listed.
    await productsPage.goto()
    await expect(productsPage.itemByName(apiProduct.name)).toBeVisible()
  })
})
