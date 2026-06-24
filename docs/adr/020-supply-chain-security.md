# ADR-020 — Supply-chain security: Dependabot, CodeQL, gitleaks, npm audit

**Status:** Accepted

## Context

The framework had a complete testing + CI/CD arc but **no DevSecOps layer** — the
category most visibly missing versus a mature industry repo. Concretely, nothing
in the repo:

- kept dependencies patched (a stale `@playwright/test` or transitive dep could
  carry a known CVE indefinitely),
- ran **static analysis** for insecure code patterns,
- guarded against a **secret being committed** by accident,
- failed the build on a **known-vulnerable dependency**.

These are table stakes for "professionally maintained," and each is cheap to add
because GitHub provides the machinery.

## Decision

Add four controls, all wired in this repo (and mirrored into the SUT separately):

| Control          | Tool                               | Trigger             |
| ---------------- | ---------------------------------- | ------------------- |
| Dependency bumps | **Dependabot** (`dependabot.yml`)  | weekly, grouped PRs |
| SAST             | **CodeQL** (`codeql.yml`)          | push / PR / weekly  |
| Secret scanning  | **gitleaks** (`security.yml`)      | push / PR / weekly  |
| Dependency audit | **`npm audit --audit-level=high`** | push / PR / weekly  |

Key choices:

- **Non-required / additive.** None is a required status check, so the protected
  `main` gate is untouched and contributors are never blocked by a noisy scanner —
  consistent with how every other optional layer (AI, Pact, sharding) was added.
  CodeQL and gitleaks _report_; only `npm audit` fails its own job, and only on
  **high+** severity.
- **Dependabot groups updates** into one npm PR + one actions PR per week, instead
  of one PR per package — the single biggest lever against update fatigue.
- **gitleaks gets a `.gitleaks.toml` allowlist.** The repo deliberately commits
  the SUT's _public_ demo credentials (`standard_user` / `secret_sauce`) and a
  non-production JWT default as test fixtures. Allowlisting them keeps the scan
  green and signal-rich rather than crying wolf — and demonstrates the real-world
  skill of tuning a scanner instead of disabling it.
- **`npm audit` thresholds at `high`.** Moderate/low advisories in devDependencies
  are noise for a test framework with no runtime users; high+ is the line worth
  breaking a build over.

## Consequences

### Positive

- Dependencies stay current automatically; CVEs surface as PRs, not surprises.
- A committed secret is caught in CI before it reaches `main`.
- CodeQL findings land in the **Security → Code scanning** tab with no extra setup.
- The repo now reads as DevSecOps-aware to a reviewer scanning `.github/`.

### Negative

- More workflow runs per push (CodeQL is the slowest, ~minutes). Acceptable: they
  run in parallel with the pyramid and never block the merge.
- Dependabot will open PRs that still need a human to review and merge.
- An allowlist can hide a _real_ secret if it overlaps a fixture pattern — mitigated
  by keeping the allowlist narrow (specific literals + fixture paths only).

## Alternatives considered

- **Snyk / Trivy instead of CodeQL + npm audit** — richer, but adds an external
  account/token. GitHub-native tools need zero third-party setup and are free for
  this public repo.
- **Making the scans required checks** — rejected: a flaky or false-positive scan
  would block unrelated work, and these are advisory by nature. Promote to required
  later if the signal proves stable.
- **TruffleHog instead of gitleaks** — comparable; gitleaks' single-binary +
  simple TOML allowlist fit the "teachable, low-ceremony" goal better.
