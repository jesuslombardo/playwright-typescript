# ADR-008: Test sharding (when, and when not, to split the suite)

## Status

Accepted

## Context

A single CI runner executes the whole suite sequentially. As a suite grows to
hundreds/thousands of tests (tens of minutes), that wall-clock becomes the
bottleneck for feedback. **Sharding** splits the suite across N machines, each
running `--shard=i/N`, so wall-clock drops ~N× — horizontal scaling for speed.

Two axes are often confused:

- **Sharding** = _speed_ (`--shard=i/N`, browser-agnostic, balances all tests).
- **Cross-browser** = _coverage_ (a matrix over `project`). Big suites combine
  both (browser × shard).

The catch: each shard is a fresh runner that repeats the **setup** (image pull,
checkout, `npm ci`, start the app), and each shard emits its **own** report, so
a final job must `merge-reports` the per-shard blobs into one HTML.

## Decision

Implement the **canonical pattern** on the `regression` job as a demonstrated
capability, sized small and labelled honestly:

- `regression` → 2-shard matrix (`--shard=${{ matrix.shard }}/${{ strategy.job-total }}`) with `--reporter=blob`; each shard uploads its blob.
- New `merge-reports` job downloads all blobs (`download-artifact`, `merge-multiple`) and runs `npx playwright merge-reports --reporter html` → one report → Pages.
- `deploy-report` now `needs: merge-reports`.

**Kept at N=2 on purpose, and flagged as didactic** at the current scale.

## Consequences

### Positive

- Demonstrates the full, real sharding pattern (partition → blob → merge) and the
  report-merging step that trips people up.
- **Scales trivially**: when the suite grows, bump `matrix.shard` (the divisor is
  `strategy.job-total`, so it follows automatically).

### Negative (measured, honest)

At ~15 fast E2E tests, **setup ≫ tests** (≈36s setup vs ≈21s tests per job), so:

|                | Unsharded | 2 shards + merge  |
| -------------- | --------- | ----------------- |
| Wall-clock     | ~60s      | **~86s** (slower) |
| Compute (cost) | ~60s      | **~137s** (~2.3×) |

- It's **slower and ~2× the cost** here — sharding only pays off once tests ≫ setup.
- Too few tests → **uneven shards** (measured 51s vs 74s); balancing needs volume.
- Matrix **renames the required check** (`Regression` → `Regression (1)` / `(2)`)
  → branch-protection contexts had to be updated (the Step 22/24/26 lesson again).

### Mitigations / scaling notes

- The Playwright Docker image already removes the browser-install cost; a
  fully-baked image would shrink setup further so shards rely sooner.
- Right-size N: 4 shards for a 40-min suite is great; 20 shards for a 2-min suite
  is wasted setup. Watch the crossover (tests ≫ setup).

## Alternatives considered

- **No sharding** — simplest and _fastest at this scale_; correct until the suite hurts.
- **Matrix by `project` (per browser)** — parallelizes but caps at 3, uneven (WebKit slower), and conflates speed with coverage.
- **Browser × shard combo** — what large suites use; over-engineered for ~15 tests.
