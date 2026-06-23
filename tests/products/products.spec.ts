import { test, expect } from '../../fixtures/auth.fixture'
import { ProductsPage } from '../../pages/products.page'
import { seededProducts } from '../../data/products.dataset'
import { buildProduct } from '../../data/product.factory'

test.describe('Products', () => {
  test('seeded products are listed', { tag: '@smoke' }, async ({ loggedInPage }) => {
    const productsPage = new ProductsPage(loggedInPage)

    await expect(productsPage.title).toBeVisible()
    // At least the six seeded products (could be more if a create test is mid-flight).
    await expect(async () => {
      expect(await productsPage.items.count()).toBeGreaterThanOrEqual(6)
    }).toPass()
    await expect(productsPage.itemByName(seededProducts.backpack.name)).toBeVisible()
  })

  test('user can create a new product and then delete it', async ({ loggedInPage }) => {
    const productsPage = new ProductsPage(loggedInPage)
    const product = buildProduct()

    await productsPage.addProduct(product)
    await expect(productsPage.itemByName(product.name)).toBeVisible()

    await productsPage.deleteProductByName(product.name)
    await expect(productsPage.itemByName(product.name)).toHaveCount(0)
  })
})
