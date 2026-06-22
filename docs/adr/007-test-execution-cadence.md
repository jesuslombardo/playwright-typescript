# ADR-007: Test execution cadence — fast PR gate + nightly regression

## Status

Accepted

## Context

We have a real testing pyramid (API → smoke → regression) and a cross-repo
integration check (app PRs run the suite). The open question is **what runs
when**: running the full cross-browser regression on _every_ PR gives maximum
pre-merge confidence but gets **slow and flaky as the suite grows** — exactly
where it hurts most (developers waiting on the app's PRs).

The pyramid has two axes that are easy to conflate:

- **What** runs: `@smoke` (a tiny critical-path subset) vs. full regression.
- **When** it runs: every PR vs. nightly / post-merge / pre-release.

## Decision

Split execution by cadence:

| Trigger                                | What runs                                           | Why                                                                                                   |
| -------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| **App PR** (cross-repo check)          | API + `@smoke`                                      | Fast gate — "did this app change break the contract or a critical path?"                              |
| **Testing-repo PR**                    | Full pyramid (API → smoke → regression)             | This repo _owns_ the suite; a change here can affect any test, so validate all of it (and it's small) |
| **Push to `main`** (testing repo)      | Full pyramid + CD (report → Pages)                  | Confirm the merged state and publish the report                                                       |
| **Nightly** (testing repo, `schedule`) | API + full cross-browser regression vs. app `@main` | Heartbeat: catches deeper regressions, flakiness, and app/dependency drift between PRs                |

`@smoke` is the critical path (can I log in, is the catalogue there); the API
layer guards the contract. Together they're a cheap, high-signal gate. The full
cross-browser regression is the expensive, exhaustive layer — run nightly (and on
testing-repo merges), not on every product PR.

## Consequences

### Positive

- **Fast app PRs** — contributors get API + smoke feedback in under a minute,
  and it stays fast as regression grows.
- **Coverage is not lost**, only **rescheduled**: the nightly runs the full
  cross-browser regression against the integrated system every day.
- Mirrors the common industry shape (fast pre-merge signal, heavy regression
  nightly / pre-release).

### Negative

- A regression that is **not** covered by `@smoke` and is introduced by an _app_
  change can slip past the app PR and only surface in the **nightly** (or the
  next testing-repo `main` run) — a deliberate latency-for-speed trade.
- A nightly failure is detached from the PR that caused it, so triage needs the
  uploaded artifact + a glance at what merged since the last green run.

### Mitigations

- Keep `@smoke` honest: it must cover the genuinely critical paths.
- The nightly uploads a debug bundle on failure and can be re-run on demand
  (`workflow_dispatch`).

## Alternatives considered

- **Full regression on every PR** — rejected: doesn't scale; slow, flaky app PRs.
- **Staged smoke→regression on every app PR** — rejected: still runs full
  regression per PR, and re-runs smoke inside regression (redundant).
- **No nightly, rely only on per-PR + merge runs** — rejected: misses time-based
  drift (flaky tests, transitive dependency changes, app `main` moving).
