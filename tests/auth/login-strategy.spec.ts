import { test, expect } from '@playwright/test'
import { ProductsPage } from '../../pages/products.page'
import { ApiLoginStrategy, UiLoginStrategy } from '../../pages/login.strategy'

/*
 * Two interchangeable login strategies, same end state (see pages/login.strategy.ts).
 * The UI one exercises the form; the API one is the fast setup path and also
 * covers the previously-untested "seed token → land authenticated" route.
 */
test.describe('Login strategies — same goal, swappable means', () => {
  test('UI strategy logs in through the form', async ({ page }) => {
    await new UiLoginStrategy().login(page)
    await expect(new ProductsPage(page).title).toBeVisible()
  })

  test('API strategy seeds the token and lands authenticated (fast path)', async ({
    page,
    request,
  }) => {
    await new ApiLoginStrategy(request).login(page)
    await expect(new ProductsPage(page).title).toBeVisible()
  })
})
