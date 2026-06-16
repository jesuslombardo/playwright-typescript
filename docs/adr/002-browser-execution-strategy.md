# ADR-002: Browser execution strategy

## Status

Accepted

## Context

Playwright's default scaffold configures three browser projects: Chromium, Firefox, and WebKit.
Running every test on all three browsers locally triples execution time (e.g. 2 tests → 6 runs).
During development, fast feedback matters more than cross-browser coverage.

## Decision

Use conditional browser projects in `playwright.config.ts`:

- **Local (default):** Chromium only — `npm test`
- **Manual cross-browser:** all three browsers — `npm run test:cross-browser` (`CROSS_BROWSER=true`)
- **CI:** all browsers — `CI=true` (set automatically by most CI providers)

```typescript
projects: process.env.CI || process.env.CROSS_BROWSER ? crossBrowserProjects : [chromiumProject]
```

## Consequences

### Positive

- Fast local feedback during development
- Full cross-browser coverage in CI without extra config
- On-demand cross-browser runs before releases
- Mirrors how many production teams operate

### Negative

- Developers might forget to run cross-browser locally before a major release
- Firefox/WebKit-specific bugs may only surface in CI (mitigated by CI running all browsers)

## Alternatives considered

| Alternative                                      | Why not chosen                                                      |
| ------------------------------------------------ | ------------------------------------------------------------------- |
| Always run 3 browsers                            | Too slow for daily development                                      |
| Chromium only everywhere                         | Misses cross-browser regressions in CI                              |
| Separate CI job for cross-browser only on `main` | Valid future enhancement; current approach is simpler for Phase 1–2 |
