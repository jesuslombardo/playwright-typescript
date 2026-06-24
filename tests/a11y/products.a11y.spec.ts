import { test } from '../../fixtures/auth.fixture'
import { expectNoSeriousA11yViolations } from '../../utils/a11y'

/*
 * Accessibility of the catalogue page — both role views (since v2.0.0 it renders
 * differently per role, so each is its own surface worth scanning).
 */
test.describe('Accessibility — products page', () => {
  test(
    'customer storefront has no critical or serious WCAG A/AA violations',
    { tag: '@a11y' },
    async ({ customerPage }) => {
      // The storefront quantity inputs carry an aria-label as of app v2.0.1, so
      // the whole storefront passes with no exclusions.
      await expectNoSeriousA11yViolations(customerPage)
    },
  )

  test(
    'admin management view has no critical or serious WCAG A/AA violations',
    { tag: '@a11y' },
    async ({ adminPage }) => {
      await expectNoSeriousA11yViolations(adminPage)
    },
  )
})
