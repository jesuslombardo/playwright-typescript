import { test, expect } from '../../fixtures/auth.fixture'
import { ProductsPage } from '../../pages/products.page'
import { seededProducts } from '../../data/products.dataset'
import { buildProduct } from '../../data/product.factory'

test.describe('Products', () => {
  // Reads are public, so the catalogue lists for a customer too — this is the
  // storefront view (cards carry "Add to cart", not management controls).
  test('seeded products are listed', { tag: '@smoke' }, async ({ loggedInPage }) => {
    const productsPage = new ProductsPage(loggedInPage)

    await expect(productsPage.title).toBeVisible()
    // At least the six seeded products (could be more if a create test is mid-flight).
    await expect(async () => {
      expect(await productsPage.items.count()).toBeGreaterThanOrEqual(6)
    }).toPass()
    await expect(productsPage.itemByName(seededProducts.backpack.name)).toBeVisible()
  })

  // Catalogue writes are admin-only since v2.0.0, so management runs as admin.
  test('admin can create a new product and then delete it', async ({ adminPage }) => {
    const productsPage = new ProductsPage(adminPage)
    const product = buildProduct()

    await productsPage.addProduct(product)
    await expect(productsPage.itemByName(product.name)).toBeVisible()

    await productsPage.deleteProductByName(product.name)
    await expect(productsPage.itemByName(product.name)).toHaveCount(0)
  })
})
