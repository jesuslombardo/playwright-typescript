import { test, expect } from '../../fixtures/auth.fixture'
import { LoginPage } from '../../pages/login.page'
import { ProductsPage } from '../../pages/products.page'

test.describe('Logout', () => {
  test('user can logout and is returned to the login page', async ({ loggedInPage }) => {
    const productsPage = new ProductsPage(loggedInPage)

    await expect(productsPage.title).toBeVisible()
    await productsPage.logout()

    const loginPage = new LoginPage(loggedInPage)
    await expect(loginPage.loginButton).toBeVisible()
  })
})
