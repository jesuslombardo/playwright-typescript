# ADR-010: Deploy to a live environment + post-deploy smoke

## Status

Accepted

## Context

The pipeline could **test** the app and **publish** artifacts (HTML report → Pages,
Docker image → GHCR), but it never **deployed the app to a live environment**. The
app only ran **ephemerally inside CI** (`webServer` boots it, tests run, it dies).
That leaves the loop open: nothing proves the app actually runs when deployed —
with real env/secrets, a real host, a real network.

Two questions are answered by two different test stages, and conflating them is a
common mistake:

- **"Is the code correct?"** → the pyramid (API + smoke + regression) runs
  **pre-merge against an ephemeral instance**. Fast, isolated, parallel-safe, no
  shared state. This is where the bulk of tests live.
- **"Did the deploy work?"** → a **thin smoke against the live URL**, _after_
  deploying. It is the only thing that catches a green build that still fails in
  the real environment (wrong env var, host down, DNS, build artifact drift).

## Decision

Add a **gated CD stage** to the app's pipeline (the app is what gets deployed),
closing the loop **test → build → deploy → verify**:

1. **Host:** Render, **free** plan, **native Node** runtime (`npm ci` / `npm start`).
   Captured as **Infrastructure as Code** in `render.yaml` (a Render Blueprint),
   with `autoDeploy: false` so **CI** owns deploy timing, not every push.
2. **`deploy` job** (push-to-main only, `needs: [integration, publish-image]`):
   `curl`s a **Render Deploy Hook** (a secret URL). Gated by the full test
   pipeline — a red suite never deploys.
3. **`post-deploy-smoke` job** (`needs: deploy`): waits until the **live** instance
   serves the deployed commit, then runs a **chromium-only `@smoke`** from the
   testing repo against the live URL via `BASE_URL`.
4. **Version-gated verification:** `/health` echoes `RENDER_GIT_COMMIT`. The smoke
   polls `/health` until its `commit` matches `github.sha` **before** testing, so
   it never smoke-tests the old version still being swapped out.

**Config:** repo **secret** `RENDER_DEPLOY_HOOK_URL`, repo **variable**
`RENDER_APP_URL`, plus `JWT_SECRET` set on Render. The deploy hook is a credential
(stored as a secret); the URL is public (a plain variable).

## Consequences

### Positive

- **Closes the SDLC loop** — the single most recognisable CI/CD story in an
  interview: `branch → PR → CI gate → merge → deploy → verify`.
- **Layered correctly**: ephemeral suite tests the _code_ (pre-merge); the live
  smoke tests the _deployment_ (post-merge). Different questions, both covered.
- **Deploy is gated** by tests (`needs:`) — broken code can't reach the live URL.
- **No race**: the version-gated wait guarantees we test the version we shipped.
- **IaC**: `render.yaml` makes the service reproducible, not click-ops only.

### Negative

- **Manual one-time setup** the pipeline can't do itself: a Render account, the
  service, and the `RENDER_*` secret/variable. Documented in CONTRIBUTING.
- **Free tier sleeps** after ~15 min idle → first request ~50s cold start. Fine
  for a demo; the smoke's wait loop (up to ~10 min) absorbs it.
- **Deploy hook gives no status** — we infer "live" by polling `/health` for the
  commit, not by reading Render's deploy state (see alternatives).
- **`@smoke` must stay honest** — the post-deploy check is only as good as what
  the smoke tag covers (the Step 26/ADR-007 caveat, now also against prod).

## Alternatives considered

- **Render auto-deploy (no CI hook)** — simplest, but the deploy would **not be
  gated** by our tests and wouldn't appear as a pipeline stage. Rejected.
- **Render API + `RENDER_API_KEY`** — lets us poll real deploy status instead of
  `/health`. More robust, but more setup (API key, service-id calls). The
  version-gated `/health` poll gets ~90% of the benefit with zero extra secrets.
- **Deploy the GHCR image** instead of building on Render — viable (Render can
  pull a registry image), but the package is **private** (ADR-006); building from
  source on Render is zero-setup. Making the package public would unlock this.
- **Full regression against prod** — rejected: slow and would pollute/abuse the
  live instance. Post-deploy is a **thin** smoke by design.
- **Post-deploy smoke in the testing repo (triggered)** — rejected for cohesion:
  deploy + verify belong together in the app's pipeline; it reuses the cross-repo
  checkout pattern from Step 25.
