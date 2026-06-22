// Load .env FIRST, before any module reads process.env (e.g. config/environments.ts)
import 'dotenv/config'
import { defineConfig, devices } from '@playwright/test'
import { environments } from './config/environments'

/** API specs are browserless (`request` fixture) — kept in their own project. */
const API_SPECS = /.*\.api\.spec\.ts$/

const apiProject = {
  name: 'api',
  testMatch: API_SPECS,
}

const browserProject = (name: string, device: string) => ({
  name,
  use: { ...devices[device] },
  testIgnore: API_SPECS,
})

const crossBrowserProjects = [
  browserProject('chromium', 'Desktop Chrome'),
  browserProject('firefox', 'Desktop Firefox'),
  browserProject('webkit', 'Desktop Safari'),
]

const browserProjects =
  process.env.CI || process.env.CROSS_BROWSER
    ? crossBrowserProjects
    : [browserProject('chromium', 'Desktop Chrome')]

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* SUT = our own demo-shop-app (see config/environments.ts + webServer below) */
    baseURL: environments.demoShop.baseURL,

    /* The app exposes data-test attributes (same convention as Sauce Demo) */
    testIdAttribute: 'data-test',

    /* Debug evidence on failure — especially useful when downloading CI artifacts */
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  /*
   * api    → browserless request-fixture tests (the pyramid's base).
   * browsers → E2E. Local: Chromium only (fast). CI / CROSS_BROWSER: all three.
   */
  projects: [apiProject, ...browserProjects],

  /*
   * Start the System Under Test before tests run.
   * The app lives in its own repo (jesuslombardo/demo-shop-app); both locally
   * and in CI it is placed in ./app and started from source here.
   * Set BASE_URL to skip this and point at an already-running instance.
   */
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'node app/server.js',
        url: 'http://localhost:3000/health',
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
        env: {
          PORT: '3000',
          DB_PATH: ':memory:',
          // Forward the JWT signing key to the SUT. In CI it comes from a
          // GitHub Secret (job env); locally it falls back to the app's default.
          JWT_SECRET: process.env.JWT_SECRET || 'demo-shop-dev-secret',
        },
      },
})
