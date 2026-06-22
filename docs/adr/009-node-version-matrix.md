# ADR-009: Node version matrix (when, and when not)

## Status

Accepted

## Context

A **matrix** runs the same job once per value in a list, in parallel. We already
use the mechanism twice without naming it:

- **Cross-browser** — Playwright runs every E2E test in chromium, firefox, webkit.
- **Sharding** — the `regression` job is a `shard: [1, 2]` matrix (ADR-008).

What we had _not_ shown is a matrix over an **environment** the code must run on
but does not control — the classic use case. The canonical example is a
published library: its users run it on whatever Node they have (18, 20, 22…), so
CI runs the suite on each to catch "works on my Node, breaks on yours" _before_
release. The two axes are easy to confuse:

- **Sharding** = _speed_ — split one suite across machines; each runs a slice.
- **Matrix (compatibility)** = _coverage_ — each machine runs the **full** suite
  on a different environment.

## Decision

Make the cheapest job — **`api`** (plain ubuntu, no browser) — a compatibility
matrix over **`node: [22, 24]`**:

- `strategy.matrix.node: [22, 24]` + `node-version: ${{ matrix.node }}`.
- `fail-fast: false` so one Node failing does not cancel the other.
- The failure debug artifact is named per version (`api-debug-node${{ matrix.node }}`)
  to avoid a name collision between the two jobs.

**Node, not browsers** — browsers are already covered by Playwright's projects, so
a browser matrix would duplicate existing coverage; Node exercises a _new_ axis.

**Sized minimal (2 versions) and flagged didactic.** Our app pins `engines:
node >=22` and has no external consumers on older runtimes, so the matrix does
not protect a real contract here — it demonstrates the pattern.

## Consequences

### Positive

- Shows the real compatibility-matrix pattern on a meaningful job (API tests +
  the app booting under each Node), separate from the sharding/browser axes.
- **Scales trivially**: add a version to the list and CI covers it.
- Cheap: the `api` job is the fastest in the pipeline, so doubling it is light.

### Negative

- **Didactic at our scale** — one supported Node (22), no external users, so
  Node 24 catches nothing real today; it is portfolio/teaching value.
- **The matrix renames the required check** — `API tests` → `API tests (22)` /
  `API tests (24)`; branch-protection contexts had to be updated via
  `gh api .../required_status_checks` or the PR deadlocks (same lesson as
  Steps 22/24/26/30).
- Slightly more compute (the api suite runs twice) — negligible here.

## Alternatives considered

- **Browser matrix** — rejected: Playwright projects already run all 3 browsers,
  so it adds no new coverage, only duplicates what exists.
- **OS matrix (`ubuntu`/`windows`/`macos`)** — would surface _real_ bugs (our
  scripts assume bash/Linux). Higher value, but more moving parts; deferred.
- **No matrix** — correct until the code has consumers on environments you do not
  control. We add it as a demonstrated capability, labelled honestly.
