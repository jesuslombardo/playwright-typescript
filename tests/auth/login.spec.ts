import { test, expect } from '@playwright/test'
import { LoginPage } from '../../pages/login.page'
import { ProductsPage } from '../../pages/products.page'
import { testUsers } from '../../config/environments'

test.describe('Login', () => {
  test('user can login with valid credentials', { tag: '@smoke' }, async ({ page }) => {
    const loginPage = new LoginPage(page)

    await loginPage.goto()
    await loginPage.login(testUsers.standard.username, testUsers.standard.password)

    const productsPage = new ProductsPage(page)
    await expect(page).toHaveURL(/products/)
    await expect(productsPage.title).toBeVisible()
  })

  test('invalid credentials show an error message', async ({ page }) => {
    const loginPage = new LoginPage(page)

    await loginPage.goto()
    await loginPage.login(testUsers.invalid.username, testUsers.invalid.password)

    await expect(loginPage.errorMessage).toBeVisible()
    await expect(loginPage.errorMessage).toContainText('do not match')
  })
})
