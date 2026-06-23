import { test, expect } from '@playwright/test'
import { LoginPage } from '../../pages/login.page'
import { testUsers } from '../../config/environments'
import { isAiEnabled } from '../../ai/gemini.client'
import { healLocator } from '../../ai/self-healing'

/*
 * @ai — LLM-assisted SELF-HEALING locators (ADR-019). Opt-in: gated by a Gemini
 * key (skips without one) and run only in the `ai` project (AI_TESTS=1), so it
 * never touches the deterministic CI suite.
 *
 * Technique: when a selector breaks, show the live DOM to an LLM and ask for a
 * working one — instead of failing. The model is called ONLY on the failure path.
 * To *see* a heal we deliberately start from a stale selector.
 */
test.describe('Self-healing locators @ai', () => {
  test.skip(!isAiEnabled(), 'Set GEMINI_API_KEY to run the AI suite (see .env.example)')

  test('recovers from a renamed username selector and logs in', async ({ page }) => {
    const login = new LoginPage(page)
    await login.goto()

    // STALE ON PURPOSE: the app exposes data-test="username", but this test asks
    // for the old Sauce-Demo name "user-name". The primary match fails → heal.
    const username = await healLocator(page, {
      primary: '[data-test="user-name"]',
      intent: 'the username / login text input on the sign-in form',
      cacheKey: 'login.username',
    })

    await username.fill(testUsers.standard.username)
    await login.passwordInput.fill(testUsers.standard.password)
    await login.loginButton.click()

    // Proof it healed: login only succeeds if the recovered field was the right one.
    await expect(page).toHaveURL(/products/)
  })
})
