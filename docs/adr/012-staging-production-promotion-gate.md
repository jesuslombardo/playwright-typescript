# ADR-012: Staging → production promotion with a manual approval gate

## Status

Accepted

## Context

[ADR-010](010-deploy-to-environment-and-post-deploy-smoke.md) added a deploy to a
**single** live environment + a post-deploy smoke. That proves a deploy works, but
ships straight to the only environment — there is no **staging** to validate in
first, and no human checkpoint before users are affected.

The industry baseline for CD is **promotion through environments**: deploy the
same artifact to **staging**, verify it, then **promote to production** behind a
**gate** (often a manual approval). Two environments with one approval gate is the
80/20 — enough safety for the vast majority of teams without canary/blue-green
complexity.

## Decision

Implement a **staging → production promotion** on the app pipeline (push-to-main):

```
… → deploy-staging → smoke-staging → ⏸ approval → deploy-production → smoke-production
```

- **Two Render services** (`demo-shop-app-staging` + the existing production),
  both deploying the **same commit** from `main` via their own Deploy Hooks.
- **GitHub Environments**: `staging` (no rule) and `production` with a
  **required reviewer** — this is the **manual approval gate**. The
  `deploy-production` job declares `environment: production`, so it **pauses**
  until a human approves in the Actions UI.
- Each environment is **smoke-tested against its own live URL** (chromium
  `@smoke`); production only deploys a build that passed staging (`needs:`).
- Config: secret `RENDER_STAGING_DEPLOY_HOOK_URL` + variable `RENDER_STAGING_URL`
  (staging); production reuses `RENDER_DEPLOY_HOOK_URL` / `RENDER_APP_URL`.

**Readiness must probe the routes the smoke uses, not just `/health`.** The first
run flaked: right after a Render deploy, `/health` returned 200 (so a
`/health`-only wait declared "ready") while the static UI (`/`) and `/api/login`
were still 404 during the free-tier swap. The wait now requires the deployed
commit **and** `/` **and** `/api/products` to be 200 for **3 consecutive checks**
before smoking.

## Consequences

### Positive

- The **canonical CD shape** — promotion + a manual gate — the most recognisable
  release pattern in an interview. Demonstrates **GitHub Environments** and
  **deployment protection rules**.
- **Blast-radius control**: a bad build is caught in staging; production only gets
  a staging-validated artifact, and only after a human says go.
- **Same artifact promoted** (same commit on both), not a rebuild — no drift.

### Negative

- **Two manual one-time setups** (two Render services + the env config) the
  pipeline can't do itself; documented in CONTRIBUTING.
- **A human is in the loop** for prod — `main` is no longer fully auto-to-prod (by
  design; that is the point of the gate).
- **Free-tier instability** forced the robust readiness check; a paid instance (no
  spin-down) would not need the 3-consecutive guard.
- More secrets/variables and two more jobs to maintain.

## Alternatives considered

- **Single environment (ADR-010 only)** — simpler, but no staging safety net and
  no human checkpoint. Fine as a first step; this ADR supersedes it as the target.
- **Auto-promote with no gate** — faster, but nothing stops a bad (yet green)
  build from reaching prod automatically. Rejected for the demo's teaching goal.
- **`/health`-only readiness** — what we started with; insufficient (see above).
- **Canary / blue-green / multi-region** — the next tier up; real value only at
  scale and cost, over-engineered for a demo app.
- **A single Render service reused for both "envs"** — would make the promotion
  meaningless (same target). Two services keep staging and prod genuinely separate.
