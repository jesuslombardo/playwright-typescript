import { test } from '@playwright/test'
import { expectNoSeriousA11yViolations } from '../../utils/a11y'

test.describe('Accessibility — login page', () => {
  test('has no critical or serious WCAG A/AA violations', { tag: '@a11y' }, async ({ page }) => {
    await page.goto('/')
    await expectNoSeriousA11yViolations(page)
  })
})
