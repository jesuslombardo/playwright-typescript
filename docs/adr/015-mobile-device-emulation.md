# ADR-015: Mobile testing — device emulation strategy

## Status

Accepted (extends [ADR-002](002-browser-execution-strategy.md))

## Context

Playwright can **emulate** mobile devices via `devices[...]` — it sets the
viewport, a mobile user-agent, the device-scale factor and **touch**. It runs
the emulation on a desktop engine: an "iPhone" device uses **WebKit** (≈ iOS
Safari), an "Android" device uses **Chromium**. This is **not** a real phone,
real iOS Safari, or a native app.

The framework's focus is API + **desktop** E2E; mobile is not a priority. But
the SUT now ships a genuinely **responsive** layout (hamburger menu + stacked
form — `demo-shop-app` **v1.1.0**), so basic responsive/touch coverage is cheap
and worth having. Two questions follow: **same repo or a separate one?** and
**how do we keep mobile-only assertions off desktop runs** (and vice versa)?

## Decision

- **Stay in this repo.** Mobile is just **one more Playwright project**, not a
  new stack — it reuses the same SUT, Page Objects, fixtures and CI. A separate
  repo is only justified for **real-device / native** testing, which we are not
  doing.
- **Emulation only, both engines.** `mobile-safari` = `devices['iPhone 13']`
  (WebKit ≈ iOS Safari) and `mobile-chrome` = `devices['Pixel 7']` (Chromium ≈
  Android Chrome). Real-device and native testing (Appium, a device cloud) are
  explicitly **out of scope**.
- **Isolate by filename**, mirroring the existing `api` split. Mobile specs are
  `*.mobile.spec.ts` under `tests/mobile/`. The mobile project uses
  `testMatch: MOBILE_SPECS`; the desktop projects add `MOBILE_SPECS` to
  `testIgnore`. So a mobile-only assertion (e.g. "the grid is one column")
  **never runs at desktop width**, and desktop specs never run on the phone.

  ```typescript
  const MOBILE_SPECS = /.*\.mobile\.spec\.ts$/
  const browserProject = (name, device) => ({
    name,
    use: { ...devices[device] },
    testIgnore: [API_SPECS, MOBILE_SPECS],
  })
  const mobileProject = (name, device) => ({
    name,
    use: { ...devices[device] },
    testMatch: MOBILE_SPECS,
  })
  const mobileProjects = [
    mobileProject('mobile-safari', 'iPhone 13'), // WebKit ≈ iOS Safari
    mobileProject('mobile-chrome', 'Pixel 7'), //  Chromium ≈ Android Chrome
  ]
  projects: [apiProject, ...browserProjects, ...mobileProjects]
  ```

- **Two devices (both mobile engines), always-on.** `iPhone 13` (WebKit) +
  `Pixel 7` (Chromium) → iOS Safari and Android Chrome are both covered. Unlike
  the desktop browsers (gated behind `CI`/`CROSS_BROWSER` per ADR-002) the mobile
  projects always run — the suite is tiny and the point is to _see_ it locally.
- **Assert what only mobile shows:** the hamburger is visible and Logout is
  hidden until a real `tap()` reveals it; the add-form and product grid each
  collapse to a single column (checked via bounding-box geometry).

## Consequences

### Positive

- Basic mobile coverage at ~zero infra cost — reuses SUT, POM, fixtures, CI.
- Isolation reuses the **same pattern as `api`**, so it's easy to teach and to
  extend with more devices or specs.
- Runs inside the existing CI **regression** job with no workflow change — its
  Playwright container already ships both WebKit and Chromium.
- Keeps the SUT honestly responsive: the coverage was produced by a real
  cross-repo feature loop (app change → `v1.1.0` → bump `.app-version`).

### Negative

- **Emulation ≠ real iOS Safari**: real rendering, gesture and performance bugs
  won't be caught. Out of scope by design (see Alternatives).
- `mobile-safari` is **WebKit**, so a _local_ run needs WebKit installed
  (`npx playwright install webkit`) on top of the Chromium desktop-local already
  uses (ADR-002); `mobile-chrome` reuses that Chromium. Accepted: the suite is
  small and mobile is opt-in.
- Geometry assertions (bounding-box `x`/`y`) are a pragmatic proxy for "stacked"
  — slightly more brittle than a semantic check, but fast and adequate here.

## Alternatives considered

| Alternative                                                | Why not chosen                                                                                                                               |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Separate mobile repo**                                   | Duplicates SUT/POM/CI for what is a config-level concern (emulation). Only worth it for real devices.                                        |
| **Real-device cloud (BrowserStack/Sauce) / Appium**        | The right tool when real iOS/Android or native apps matter — heavy and off-focus here.                                                       |
| **Gate mobile behind `CI`/`CROSS_BROWSER`** (like desktop) | The goal is to run mobile locally; the suite is tiny, so always-on is simpler.                                                               |
| **Only one mobile device**                                 | We run BOTH iPhone 13 (WebKit / iOS Safari) and Pixel 7 (Chromium / Android Chrome) — the two real mobile engines — since the suite is tiny. |
| **Tag mobile tests `@smoke`**                              | They aren't smoke-critical; they run in the regression suite.                                                                                |
