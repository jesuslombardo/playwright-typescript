import { test, expect } from '@playwright/test'

/**
 * Visual regression — a single, stable baseline of the (static) login page.
 *
 * - Chromium only → one baseline to maintain; the page has no dynamic content,
 *   so the render is deterministic.
 * - The baseline PNG is generated inside the Playwright Docker image (the same
 *   one CI uses), so fonts/anti-aliasing match — otherwise it would be flaky.
 * - `maxDiffPixelRatio` gives a tiny tolerance for sub-pixel noise without
 *   hiding a real layout change. Regenerate with `--update-snapshots`.
 *
 * Tagged @visual; it is NOT @api and NOT @smoke, so it runs as part of
 * `test:regression` (chromium), and is skipped on firefox/webkit below.
 */
test.describe('Login page @visual', () => {
  test('matches the visual baseline', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'one chromium baseline is enough here')

    await page.goto('/')
    await expect(page.getByTestId('login-button')).toBeVisible()

    await expect(page).toHaveScreenshot('login.png', { maxDiffPixelRatio: 0.02 })
  })
})
