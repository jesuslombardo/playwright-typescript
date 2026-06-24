export const environments = {
  /*
   * System Under Test = our own demo-shop-app.
   * Local: webServer starts it on :3000 (see playwright.config.ts).
   * CI:    same, started from a checkout of the app repo.
   * BASE_URL overrides both when the app is already running elsewhere.
   */
  demoShop: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
  },
} as const

/*
 * Demo credentials are public values (mirroring Sauce Demo) — safe to commit as
 * defaults. For a private app: set the DEMO_ and ADMIN_ env vars locally (.env)
 * or as GitHub Secrets in CI.
 *
 * Since app v2.0.0 the two demo users carry different ROLES:
 *   - standard (standard_user) → 'customer' — shops: browse, cart, checkout.
 *   - admin    (admin)         → 'admin'    — manages the catalogue (CRUD).
 * standard stays the headline shopper; admin is needed for any catalogue write.
 */
export const testUsers = {
  standard: {
    username: process.env.DEMO_USER || 'standard_user',
    password: process.env.DEMO_PASSWORD || 'secret_sauce',
  },
  admin: {
    username: process.env.ADMIN_USER || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin_sauce',
  },
  invalid: {
    username: 'wrong_user',
    password: 'wrong_password',
  },
} as const

// Scenario data (products, login cases, factories) lives in data/ — see data/README.md.
