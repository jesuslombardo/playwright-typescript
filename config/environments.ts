export const environments = {
  sauceDemo: {
    baseURL: 'https://www.saucedemo.com',
  },
} as const

/*
 * Sauce Demo credentials are public demo values — safe to commit as defaults.
 * For real apps: set SAUCE_* env vars locally (.env) or as GitHub Secrets in CI.
 * Empty secret in CI falls back to the default (see || below).
 */
export const testUsers = {
  standard: {
    username: process.env.SAUCE_STANDARD_USER || 'standard_user',
    password: process.env.SAUCE_STANDARD_PASSWORD || 'secret_sauce',
  },
  lockedOut: {
    username: 'locked_out_user',
    password: 'secret_sauce',
  },
} as const

export const testProducts = {
  backpack: {
    slug: 'sauce-labs-backpack',
    name: 'Sauce Labs Backpack',
  },
} as const
