import { test } from '../../fixtures/auth.fixture'
import { expectNoSeriousA11yViolations } from '../../utils/a11y'

test.describe('Accessibility — products page', () => {
  test(
    'has no critical or serious WCAG A/AA violations',
    { tag: '@a11y' },
    async ({ loggedInPage }) => {
      // The auth fixture leaves us on a ready /products.html.
      await expectNoSeriousA11yViolations(loggedInPage)
    },
  )
})
