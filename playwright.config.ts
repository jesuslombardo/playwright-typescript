// Load .env FIRST, before any module reads process.env (e.g. config/environments.ts)
import 'dotenv/config'
import { defineConfig, devices } from '@playwright/test'
import { environments } from './config/environments'

/** API specs are browserless (`request` fixture) — kept in their own project. */
const API_SPECS = /.*\.api\.spec\.ts$/

/** Mobile specs run ONLY on the emulated-device project(s), never on desktop. */
const MOBILE_SPECS = /.*\.mobile\.spec\.ts$/

/** Pact consumer contract specs — browserless, run in their own `contract` project. */
const CONTRACT_SPECS = /.*\.pact\.spec\.ts$/

/** AI suite (LLM-as-judge + self-healing) — own project, opt-in via AI_TESTS. */
const AI_SPECS = /.*\.ai\.spec\.ts$/

/** Accessibility (axe-core) specs — own Chromium-only project, like visual. */
const A11Y_SPECS = /.*\.a11y\.spec\.ts$/

const apiProject = {
  name: 'api',
  testMatch: API_SPECS,
}

/* Consumer-driven contract tests (Pact). Browserless; they use a Pact mock, not
 * the SUT, so they need no baseURL — isolated by filename like the `api` project. */
const contractProject = {
  name: 'contract',
  testMatch: CONTRACT_SPECS,
}

const browserProject = (name: string, device: string) => ({
  name,
  use: { ...devices[device] },
  testIgnore: [API_SPECS, MOBILE_SPECS, CONTRACT_SPECS, AI_SPECS, A11Y_SPECS],
})

/*
 * Mobile = device emulation (viewport + touch + user-agent), not a real phone.
 * An "iPhone" device runs on WebKit (≈ iOS Safari); an "Android" one on Chromium.
 * This project runs ONLY the *.mobile.spec.ts suite — small on purpose: mobile
 * isn't the focus, but we cover the responsive/touch basics desktop can't.
 */
const mobileProject = (name: string, device: string) => ({
  name,
  use: { ...devices[device] },
  testMatch: MOBILE_SPECS,
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

/* Always on (it's tiny). Both mobile engines: iOS Safari + Android Chrome. */
const mobileProjects = [
  mobileProject('mobile-safari', 'iPhone 13'), // WebKit ≈ iOS Safari
  mobileProject('mobile-chrome', 'Pixel 7'), // Chromium ≈ Android Chrome
]

/*
 * AI suite (opt-in) — LLM-as-judge + self-healing locators. A browser project
 * (the self-healing spec drives the login UI), matched by *.ai.spec.ts. It is
 * OFF by default and only included when AI_TESTS is set, so it never runs in the
 * normal / regression / smoke runs. The specs additionally SKIP without a Gemini
 * key. Run it with `npm run test:ai`. See ADR-019.
 */
const aiProject = {
  name: 'ai',
  testMatch: AI_SPECS,
  use: { ...devices['Desktop Chrome'] },
}
const aiProjects = process.env.AI_TESTS ? [aiProject] : []

/*
 * Accessibility suite (axe-core). Deterministic, so it is ALWAYS ON and runs in
 * the normal/regression run — but Chromium-only (like visual regression): one
 * engine is enough for WCAG rule checks and keeps it fast. Matched by
 * *.a11y.spec.ts; every other project ignores those files. See ADR-021.
 */
const a11yProject = {
  name: 'a11y',
  testMatch: A11Y_SPECS,
  use: { ...devices['Desktop Chrome'] },
}

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
   * api      → browserless request-fixture tests (the pyramid's base).
   * browsers → desktop E2E. Local: Chromium only (fast). CI / CROSS_BROWSER: all three.
   * mobile   → emulated-device E2E (iPhone/WebKit + Pixel/Chromium). Runs only *.mobile.spec.ts.
   */
  projects: [
    apiProject,
    contractProject,
    ...browserProjects,
    ...mobileProjects,
    a11yProject,
    ...aiProjects,
  ],

  /*
   * Start the System Under Test before tests run.
   * The app lives in its own repo (jesuslombardo/demo-shop-app); both locally
   * and in CI it is placed in ./app and started from source here.
   * Set BASE_URL to skip this and point at an already-running instance.
   */
  webServer:
    process.env.BASE_URL || process.env.NO_WEBSERVER
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
