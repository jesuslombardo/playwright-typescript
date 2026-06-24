# ADR-021 — Accessibility testing with axe-core

**Status:** Accepted

## Context

The framework tested function, contracts, visuals, and mobile layout, but never
**accessibility** — a capability that appears on most modern QA job descriptions
and that, unlike a manual audit, can be automated and gated in CI. axe-core is the
de-facto engine (it powers most commercial a11y tools), and `@axe-core/playwright`
drops it straight onto a Playwright `Page`.

A first scan of the SUT surfaced **only `color-contrast`** violations (3 on login,
12 on products), all `serious` — muted text just under 4.5:1, and a product price
rendered in the brand green (`#3ddc91`, 1.8:1 on white). No critical issues.

## Decision

- Add an **`a11y` Playwright project** matched by `*.a11y.spec.ts`, **Chromium-only**
  and **always on** — the same shape as the visual project. One engine is enough
  for WCAG rule evaluation, and axe is deterministic, so it belongs in the normal /
  regression run rather than behind an opt-in flag (contrast with the `ai` project).
- Scans run against `wcag2a + wcag2aa + wcag21a + wcag21aa` and the gate **fails on
  `serious` or `critical`** violations only. `minor` / `moderate` are a documented
  backlog, not a build blocker — a pragmatic, industry-typical threshold.
- The shared helper `utils/a11y.ts#expectNoSeriousA11yViolations` runs the scan and
  produces an **actionable failure message** (rule id, impact, node count, help URL).
- **Fix the SUT, don't lower the bar.** Rather than excluding `color-contrast`, the
  real contrast issues were fixed in `demo-shop-app` (darker `--muted`, accessible
  `--price`, released as **v1.2.0**), and this repo pins to that tag. The gate now
  passes because the app is genuinely compliant.

## Consequences

### Positive

- Real, automated WCAG A/AA coverage of the two primary surfaces, gated in CI.
- Caught and fixed genuine contrast defects — the honest "found a bug, fixed it"
  story, and a worked example of the cross-repo "merge app first" loop (ADR-013).
- `utils/a11y.ts` makes adding a scan to any future page a one-liner.

### Negative

- Automated checks cover ~30–50% of WCAG; they do **not** replace manual/AT testing
  (keyboard traps, focus order, screen-reader semantics). The suite is a floor, not
  a ceiling — documented so it isn't mistaken for full compliance.
- A future axe-core bump (via Dependabot) could surface new rules and turn the gate
  red; that is reviewed like any dependency PR.

## Alternatives considered

- **Gate on `critical` only** — would pass today without touching the app, but ships
  known serious defects. Rejected: weaker, and a worse teaching story than fixing them.
- **Exclude the `color-contrast` rule** — hides a real, user-affecting issue. Rejected.
- **Opt-in project (like `ai`)** — unnecessary: axe is free, fast, and deterministic,
  so it earns a place in the always-on suite.
- **pa11y / Lighthouse a11y category** — Lighthouse's a11y audits also wrap axe;
  Lighthouse CI is added separately for _performance_ budgets (ADR-023). Using
  `@axe-core/playwright` keeps a11y inside the existing Playwright run.
