import { mergeTests } from '@playwright/test'
import { test as authTest } from './auth.fixture'
import { test as productTest } from './product.fixture'

/**
 * Combined fixtures for E2E flows that need BOTH a logged-in browser page
 * (`loggedInPage`) and a product already created over the API (`apiProduct`).
 * `mergeTests` composes the two fixture sets into one `test`.
 */
export const test = mergeTests(authTest, productTest)

export { expect } from '@playwright/test'
