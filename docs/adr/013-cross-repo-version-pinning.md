# ADR-013: Cross-repo version pinning (test against a fixed app tag)

## Status

Accepted

## Context

This repo's CI tests against the app in the **other** repo (`demo-shop-app`). Until
now every test job checked out the app at **`@main`** — a **moving target**. That
made builds **non-reproducible**: a change merged to the app's `main` could turn
this repo's CI red at a random time, with **no change to the test code**. Your
build breaks because of _someone else's_ commit. (The "merge the app first" rule
was a symptom of this coupling.)

This is the same problem dependency managers solve with a **lockfile / exact
version**: `"app": "latest"` vs `"app": "1.0.0"`.

## Decision

Pin the app version the test suite runs against, with a single source of truth:

- **`.app-version`** (repo root) holds a git tag, e.g. `v1.0.0`. The app is now
  **tagged** on releases.
- **CI** (`api`, `smoke`, `regression`) reads `.app-version` and checks the app out
  at that **`ref`** — not `@main`.
- **`app:setup`** clones the same pinned tag locally → local and CI agree.
- **Bumping is a deliberate PR** that edits `.app-version` (a one-line, reviewable
  diff). Adopting a new app version is an explicit decision, not an accident.

Two asymmetries are **intentional**:

- **Nightly stays `@main`** (a _drift detector_): if nightly goes red while pinned
  CI is green, the app moved ahead of the pin → time to bump. Reproducible PR
  builds **and** early drift warning.
- **The app's cross-repo PR check stays `@main` of this repo** — it should validate
  an app change against the **latest** tests, not a stale pinned suite.

## Consequences

### Positive

- **Reproducible builds**: the suite always runs against a known app version; a
  re-run months later behaves identically.
- **Controlled upgrades**: app changes are adopted on purpose, via a reviewed
  `.app-version` bump — your build can't break from an unrelated app merge.
- **Visible & auditable**: the version is a file in git; `git log .app-version`
  shows exactly when each app version was adopted.
- **Nightly still catches drift early**, so the pin never silently rots.

### Negative

- **App changes are seen later** (only on bump) — the cost of decoupling. Mitigated
  by the nightly drift detector.
- Requires **tagging discipline** on the app (cut a tag per release).
- `app:setup` now re-clones on each run (simplest way to switch tags on a shallow
  clone) — negligible for a small repo.
- The "merge the app first" flow gains a step: merge → **tag** → bump `.app-version`.

## Alternatives considered

- **`@main` everywhere (status quo)** — simplest, but non-reproducible; rejected as
  the default (kept only for the nightly, on purpose).
- **Pin to a commit SHA** instead of a tag — more precise, but opaque; a semantic
  tag (`v1.0.0`) reads better and is the conventional release unit.
- **git submodule** for the app — pins by SHA but brings the classic submodule UX
  pain (detached HEADs, easy to forget to update); heavier than a one-line file.
- **Publish the app as a versioned artifact** (npm package / Docker tag) and depend
  on that — the "right" answer at scale, but more machinery than this demo needs;
  the GHCR image already exists and could back this later.
