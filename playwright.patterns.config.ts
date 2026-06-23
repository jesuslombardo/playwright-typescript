import { defineConfig, devices } from '@playwright/test'
import base from './playwright.config'

/*
 * Opt-in config for the Group B "gallery" pattern examples in examples/patterns/.
 *
 * These examples are intentionally OUTSIDE the default suite (whose testDir is
 * ./tests), so `npm test` never runs them — they are study artefacts, some
 * deliberately synthetic or anti-patterns. They run only via:
 *     npm run test:patterns
 *
 * We spread the base config to reuse its webServer + `use` (baseURL, etc.), so
 * the API-backed examples talk to the same SUT; we only override what differs.
 */
export default defineConfig({
  ...base,
  testDir: './examples/patterns',
  projects: [{ name: 'patterns', use: { ...devices['Desktop Chrome'] } }],
})
