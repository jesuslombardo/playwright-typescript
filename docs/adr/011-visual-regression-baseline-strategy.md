# ADR-011: Visual regression — baseline strategy

## Status

Accepted

## Context

Visual regression compares a screenshot against a committed **baseline** PNG and
fails on pixel drift (`toHaveScreenshot`). The well-known trap: **screenshots are
environment-specific**. Fonts, anti-aliasing and sub-pixel rendering differ
between machines, so a baseline generated on a dev laptop almost always fails in
CI — the test flakes for reasons unrelated to the UI. Playwright already encodes
this by suffixing snapshots with the platform (`-chromium-linux.png`), but that
only protects against running on a _different OS_, not a different font stack on
the same OS.

We want **one** small visual test as a demonstrated capability, and it must pass
reliably in CI — not become a maintenance/flake liability.

## Decision

Add a single visual test on the **static login page** (no dynamic content →
deterministic), with three deliberate constraints:

1. **Chromium only** (`test.skip(browserName !== 'chromium')`) — one baseline to
   maintain. It runs inside `test:regression` (it's neither `@api` nor `@smoke`).
2. **Baseline generated in the Playwright Docker image** (`mcr.microsoft.com/
playwright:v1.61.0-jammy`) — the _same_ image CI runs in — so fonts and
   anti-aliasing match by construction:

   ```bash
   docker run --rm -v "$PWD":/work -w /work -e BASE_URL=<live-url> \
     --user "$(id -u):$(id -g)" -e HOME=/tmp \
     mcr.microsoft.com/playwright:v1.61.0-jammy \
     npx playwright test tests/visual --project=chromium --update-snapshots
   ```

3. **Small tolerance** (`maxDiffPixelRatio: 0.02`) — absorbs unavoidable sub-pixel
   noise without hiding a real layout change.

## Consequences

### Positive

- The baseline is byte-comparable to what CI produces (same image, same browser,
  same static HTML), so the test is **stable**, not flaky.
- Demonstrates the full visual-regression mechanic (baseline → diff → tolerance →
  regenerate) at minimal cost and maintenance.
- Regenerating is one documented command; no per-developer baselines.

### Negative

- **Baselines must be regenerated in the container**, never from a raw
  `--update-snapshots` on a laptop — that would commit a mismatching PNG.
- A real CSS/layout change requires regenerating the baseline (expected, but a
  step contributors must know — documented in CONTRIBUTING).
- One browser only → no firefox/webkit visual coverage (acceptable; this is a
  capability demo, and cross-browser pixel parity is rarely worth the upkeep).

## Alternatives considered

- **Generate the baseline locally (native), no container** — simplest, but the
  laptop's fonts ≠ CI's → near-guaranteed CI failure. Rejected.
- **Update snapshots in CI and commit back** — robust but needs a write-back
  workflow (bot commit/PR); over-engineered for one test.
- **Large tolerance instead of a matched baseline** — masks the very drift the
  test exists to catch. Rejected; a matched baseline + tiny tolerance is better.
- **A third-party visual service (Percy/Applitools)** — great at scale (smart
  diffing, review UI), but external SaaS + setup; out of scope for one demo test.
