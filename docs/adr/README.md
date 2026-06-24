# Architecture Decision Records

An [Architecture Decision Record](https://adr.github.io/) captures an important architectural decision: context, choice, and consequences.

## Index

| ADR                                                          | Title                                                      | Status   |
| ------------------------------------------------------------ | ---------------------------------------------------------- | -------- |
| [001](001-page-object-model-and-folder-structure.md)         | Page Object Model and folder structure                     | Accepted |
| [002](002-browser-execution-strategy.md)                     | Browser execution strategy                                 | Accepted |
| [003](003-code-style-eslint-prettier.md)                     | Code style with ESLint and Prettier                        | Accepted |
| [004](004-components-vs-fixtures.md)                         | Component Objects vs custom Fixtures                       | Accepted |
| [005](005-anti-flaky-test-strategy.md)                       | Anti-flaky test strategy                                   | Accepted |
| [006](006-custom-sut-and-testing-pyramid.md)                 | Custom SUT + testing pyramid                               | Accepted |
| [007](007-test-execution-cadence.md)                         | Test execution cadence (PR vs nightly)                     | Accepted |
| [008](008-test-sharding.md)                                  | Test sharding (when, and when not)                         | Accepted |
| [009](009-node-version-matrix.md)                            | Node version matrix (when, and when not)                   | Accepted |
| [010](010-deploy-to-environment-and-post-deploy-smoke.md)    | Deploy to a live environment + post-deploy smoke           | Accepted |
| [011](011-visual-regression-baseline-strategy.md)            | Visual regression — baseline strategy                      | Accepted |
| [012](012-staging-production-promotion-gate.md)              | Staging → production promotion + approval gate             | Accepted |
| [013](013-cross-repo-version-pinning.md)                     | Cross-repo version pinning (fixed app tag)                 | Accepted |
| [014](014-test-data-layer.md)                                | Test data layer — factories, datasets, lifecycle           | Accepted |
| [015](015-mobile-device-emulation.md)                        | Mobile testing — device emulation strategy                 | Accepted |
| [016](016-auth-service-split-microservices-mode.md)          | Microservices mode — extracting auth-service               | Accepted |
| [017](017-consumer-driven-contract-testing-pact.md)          | Consumer-driven contract testing with Pact                 | Accepted |
| [018](018-oop-patterns-and-principles-layer.md)              | OOP patterns & principles — organic vs gallery             | Accepted |
| [019](019-ai-assisted-testing-llm-judge-and-self-healing.md) | AI-assisted testing — LLM-as-judge & self-healing          | Accepted |
| [020](020-supply-chain-security.md)                          | Supply-chain security — Dependabot/CodeQL/gitleaks/audit   | Accepted |
| [021](021-accessibility-testing-axe-core.md)                 | Accessibility testing with axe-core                        | Accepted |
| [022](022-release-automation-conventional-commits.md)        | Release automation — Conventional Commits + release-please | Accepted |

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
