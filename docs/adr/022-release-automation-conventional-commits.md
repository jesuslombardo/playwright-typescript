# ADR-022 — Release automation: Conventional Commits + release-please

**Status:** Accepted

## Context

Versioning and the CHANGELOG were manual. An industry repo derives both from the
commit history: enforce **Conventional Commits**, then let a tool compute the next
semantic version, generate release notes, tag, and publish a GitHub Release.

Two constraints shape the choice of tool here:

1. **`main` is protected** (required checks, `enforce_admins: true`). A tool that
   pushes version/CHANGELOG **commits straight to `main`** fights branch protection.
2. The repo is **`private` + `UNLICENSED`** and never published to npm.

## Decision

- **Enforce Conventional Commits.**
  - `commitlint` (`@commitlint/config-conventional`) via a Husky **`commit-msg`** hook
    for local commits.
  - Because the repo **squash-merges**, the subject that lands on `main` is the
    **PR title** — so a `Commit lint` CI job validates the **PR title** (not the
    individual branch commits).
  - Line-length caps on body/footer are relaxed (URLs + `Co-Authored-By` trailers);
    the meaningful rules (type, subject) stay enforced.
- **Automate releases with `release-please`** (manifest-driven:
  `release-please-config.json` + `.release-please-manifest.json`, baseline `1.0.0`),
  run from `.github/workflows/release.yml` on push to `main`. It maintains a
  **release PR** that bumps `package.json` + `CHANGELOG.md`; merging it tags the
  version and publishes a GitHub Release.

### Why release-please instead of semantic-release

semantic-release was the first choice (and is named in many tutorials), but it was
**rejected for two concrete reasons** discovered while wiring it:

1. **It drags in a vulnerable dependency that can't be overridden.** `semantic-release`
   depends on `@semantic-release/npm`, which depends on the full **`npm` CLI**, which
   **bundles** a `undici` with a **high-severity** advisory. Because it is bundled,
   an `overrides` entry can't reach it — so it would fail this repo's own
   `npm audit --audit-level=high` gate (ADR-020).
2. **It pushes commits back to `main`.** Its changelog/version flow commits to the
   release branch — friction against a protected `main` with `enforce_admins`.

`release-please` avoids both: it is a **GitHub Action with zero npm devDependencies**
(no vuln surface added), and its **release-PR model is a natural fit for protected
branches** — the release goes through the same required checks as any other PR.

## Consequences

### Positive

- Version + CHANGELOG + GitHub Releases are derived from commit history, not by hand.
- Conventional Commits are enforced at two layers (local hook + PR-title CI).
- No dependency bloat and no `npm audit` regression (contrast: semantic-release added
  a high-severity transitive vuln).
- Works with the protected-`main` workflow already in place.

### Negative

- A release PR opened with the default `GITHUB_TOKEN` **does not trigger** other
  workflows (an anti-recursion safeguard), so its required checks never run — and on
  this protected `main` (`enforce_admins: true`) a PR with no checks is **unmergeable**.
  This actually happened on the first run (`release-please failed: GitHub Actions is
not permitted to create or approve pull requests`). **Resolved by opening the release
  PR as a GitHub App** (`actions/create-github-app-token` mints a short-lived token;
  `release.yml` passes it to release-please). The App is a non-`GITHUB_TOKEN` identity,
  so the release PR runs the normal required checks and can be merged. Chosen over a
  PAT because an App token **has nothing to renew** (PATs expire); the trade-off is a
  one-time App setup (create + install on the repo, store `RELEASE_PLEASE_APP_ID` +
  `RELEASE_PLEASE_APP_PRIVATE_KEY` secrets). See BUILD_LOG Step 50.
- Conventional-Commit discipline is now mandatory — intentional, but a small tax.

## Alternatives considered

- **semantic-release** — rejected (vulnerable bundled `undici` + pushes to protected
  `main`); see above.
- **Manual versioning / changelog** — the status quo; doesn't scale and is error-prone.
- **Changesets** — great for multi-package monorepos; heavier than needed for a single
  package, and its model is author-written change notes rather than commit-derived.
