import { test, expect } from '@playwright/test'
import { LoginPage } from '../../pages/login.page'
import { ProductsPage } from '../../pages/products.page'
import { testUsers } from '../../config/environments'

/**
 * Mobile mini-suite — a small, deliberate set (mobile isn't the framework's
 * focus, but we cover the basics).
 *
 * NOTE: "mobile" here is Playwright DEVICE EMULATION, not a real phone. These
 * specs run on two projects (see playwright.config.ts): `mobile-safari` (iPhone
 * 13 → WebKit ≈ iOS Safari) and `mobile-chrome` (Pixel 7 → Chromium ≈ Android
 * Chrome) — each sets a narrow viewport, touch and a mobile user-agent. It does
 * NOT test real iOS/Android, native apps, or real hardware — that needs a device
 * cloud / Appium and a separate stack.
 *
 * These specs assert behaviour that only shows up on a narrow, touch screen, so
 * they live in their own *.mobile.spec.ts files and run ONLY on the mobile
 * project (the desktop projects testIgnore them).
 */
test.describe('Mobile — responsive products page', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(testUsers.standard.username, testUsers.standard.password)
    await expect(new ProductsPage(page).title).toBeVisible()
  })

  test('top-bar actions collapse behind a hamburger menu', async ({ page }) => {
    const products = new ProductsPage(page)

    // On a phone the ☰ button shows and Logout is hidden behind it...
    await expect(products.menuToggle).toBeVisible()
    await expect(products.logoutButton).toBeHidden()

    // ...a touch tap on the hamburger reveals it (a real touch interaction).
    await products.openMobileMenu()
    await expect(products.logoutButton).toBeVisible()
  })

  test('the add-product form stacks into a single column', async ({ page }) => {
    const products = new ProductsPage(page)

    const name = await products.newProductName.boundingBox()
    const price = await products.newProductPrice.boundingBox()
    expect(name).not.toBeNull()
    expect(price).not.toBeNull()

    // Stacked (1 column) ⇒ same left edge, and price sits BELOW name.
    expect(Math.abs(name!.x - price!.x)).toBeLessThan(2)
    expect(price!.y).toBeGreaterThan(name!.y)
  })

  test('the product grid stacks into a single column', async ({ page }) => {
    const products = new ProductsPage(page)
    await expect(products.items.first()).toBeVisible()

    const first = await products.items.nth(0).boundingBox()
    const second = await products.items.nth(1).boundingBox()
    expect(first).not.toBeNull()
    expect(second).not.toBeNull()

    // One column ⇒ cards share a left edge and the 2nd is below the 1st
    // (on desktop they'd sit side by side at the same y).
    expect(Math.abs(first!.x - second!.x)).toBeLessThan(2)
    expect(second!.y).toBeGreaterThan(first!.y)
  })
})
