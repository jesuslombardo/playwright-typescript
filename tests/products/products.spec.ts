import { test, expect } from '../../fixtures/auth.fixture'
import { ProductsPage } from '../../pages/products.page'
import { testProducts } from '../../config/environments'
import { generateProduct } from '../../utils/data-generator'

test.describe('Products', () => {
  test('seeded products are listed', { tag: '@smoke' }, async ({ loggedInPage }) => {
    const productsPage = new ProductsPage(loggedInPage)

    await expect(productsPage.title).toBeVisible()
    // At least the six seeded products (could be more if a create test is mid-flight).
    await expect(async () => {
      expect(await productsPage.items.count()).toBeGreaterThanOrEqual(6)
    }).toPass()
    await expect(productsPage.itemByName(testProducts.backpack.name)).toBeVisible()
  })

  test('user can create a new product and then delete it', async ({ loggedInPage }) => {
    const productsPage = new ProductsPage(loggedInPage)
    const product = generateProduct()

    await productsPage.addProduct(product)
    await expect(productsPage.itemByName(product.name)).toBeVisible()

    await productsPage.deleteProductByName(product.name)
    await expect(productsPage.itemByName(product.name)).toHaveCount(0)
  })
})
