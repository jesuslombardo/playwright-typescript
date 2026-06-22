# Architecture Decision Records

An [Architecture Decision Record](https://adr.github.io/) captures an important architectural decision: context, choice, and consequences.

## Index

| ADR                                                       | Title                                            | Status   |
| --------------------------------------------------------- | ------------------------------------------------ | -------- |
| [001](001-page-object-model-and-folder-structure.md)      | Page Object Model and folder structure           | Accepted |
| [002](002-browser-execution-strategy.md)                  | Browser execution strategy                       | Accepted |
| [003](003-code-style-eslint-prettier.md)                  | Code style with ESLint and Prettier              | Accepted |
| [004](004-components-vs-fixtures.md)                      | Component Objects vs custom Fixtures             | Accepted |
| [005](005-anti-flaky-test-strategy.md)                    | Anti-flaky test strategy                         | Accepted |
| [006](006-custom-sut-and-testing-pyramid.md)              | Custom SUT + testing pyramid                     | Accepted |
| [007](007-test-execution-cadence.md)                      | Test execution cadence (PR vs nightly)           | Accepted |
| [008](008-test-sharding.md)                               | Test sharding (when, and when not)               | Accepted |
| [009](009-node-version-matrix.md)                         | Node version matrix (when, and when not)         | Accepted |
| [010](010-deploy-to-environment-and-post-deploy-smoke.md) | Deploy to a live environment + post-deploy smoke | Accepted |

## When to add a new ADR

Create a new ADR when the decision:

- affects how the framework is structured or used,
- might be questioned later ("why did we do it this way?"),
- has meaningful trade-offs or rejected alternatives.

Do **not** create an ADR for every small change — use [BUILD_LOG.md](../BUILD_LOG.md) for chronological notes.

## Template

```markdown
# ADR-NNN: Title

## Status

Accepted | Superseded by ADR-XXX

## Context

What is the issue or problem?

## Decision

What did we decide?

## Consequences

### Positive

- ...

### Negative

- ...

## Alternatives considered

- ...
```
