# ADR-017: Consumer-driven contract testing with Pact

## Status

Accepted (builds on [ADR-016](016-auth-service-split-microservices-mode.md); complements the schema-based contract tests from Step 29)

## Context

Step 29 added **schema-based** contract tests (Ajv validating responses against
the app's OpenAPI spec). Those check that a response matches the **provider's own
published shape** — useful for drift, but they cannot express _what a particular
consumer actually needs_, and a failure doesn't break the provider's build.

[ADR-016](016-auth-service-split-microservices-mode.md) split **auth-service**
out as its own service. That created a genuine **consumer → provider** relationship
across a network boundary: the shop web client (`shop-web`) consumes
auth-service's `POST /api/login`. This is exactly where **consumer-driven contract
testing** earns its keep — the marquee skill of the microservices-testing module.

We want a contract that:

- is **driven by the consumer's real expectations**, not the provider's spec;
- **breaks the provider's build** when auth drifts from what consumers rely on;
- needs no heavyweight infrastructure (this is a course).

## Decision

- **Use Pact** (`@pact-foundation/pact` v16, Rust core) for consumer-driven contracts.
- **Consumer = `shop-web`** (this repo). `utils/auth-client.ts` is the real login
  client; `tests/contract/auth.consumer.pact.spec.ts` runs it against a Pact mock
  and generates **`pacts/shop-web-auth-service.json`** (interactions: valid login
  → 200 `{ token, username }`; invalid → 401 `{ error }`). It runs in its own
  browserless **`contract`** Playwright project (isolated by `*.pact.spec.ts`,
  like `api`), with **no SUT** (`NO_WEBSERVER` skips the webServer).
- **Provider = `auth-service`** (verified in the `demo-shop-app` repo). It boots
  the auth slice and replays the pact; mismatches **fail the build**. Proven:
  renaming the response field `token` → `accessToken` fails verification with
  _"Actual map is missing the following keys: token"_.
- **File-based "broker."** The pact is **committed in this (consumer) repo** — the
  source of truth. The provider's CI checks this repo out to read it. No Pact
  Broker server, to keep the course infra-free (a hosted broker / PactFlow is the
  production upgrade).
- **Merge ordering reverses.** The consumer publishes the contract first, so a
  consumer change merges **before** the provider verifies against it — the
  opposite of the app-code "merge app first" rule (ADR-013/CONTRIBUTING).
- **Both CI jobs are additive / NOT required** — `Contract (Pact consumer)` here,
  `Contract (Pact provider verification)` in the app — mirroring the
  SUT-as-service-container job ([ADR-006](006-custom-sut-and-testing-pyramid.md)).
  Branch protection is unchanged.

### Schema-based vs consumer-driven

|                     | Schema-based (Step 29, Ajv)         | Consumer-driven (Pact, this ADR)                     |
| ------------------- | ----------------------------------- | ---------------------------------------------------- |
| Source of truth     | Provider's OpenAPI spec             | **Consumer's** expectations                          |
| Question            | "Does the response match the spec?" | "Can the provider satisfy what THIS consumer needs?" |
| On drift            | The consumer's test fails           | The **provider's build** fails                       |
| Needs the boundary? | No (works on a monolith)            | Yes — a real consumer/provider split                 |

## Consequences

### Positive

- A real, **build-breaking** contract — the provider can't silently break a
  consumer; drift is caught at the source.
- Teaches the **marquee** microservices-testing skill, and pairs cleanly with the
  schema-based tests (the two answer different questions).
- **No broker infrastructure** — committed pact + cross-repo checkout is enough
  for the course and fully reproducible.

### Negative

- **Cross-repo coordination**: the pact lives in the consumer repo and the
  provider checks it out, plus the reversed merge order — more moving parts than a
  single-repo test.
- **No broker features** — file-based sharing has no contract versioning or
  `can-i-deploy`; a real Pact Broker / PactFlow would add those.
- Pact ships **native binaries** — a heavy devDep in both repos (devDep only, so
  it never reaches the production image).

## Alternatives considered

| Alternative                 | Why not chosen                                                                                                                     |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Pact Broker / PactFlow**  | Adds a service to run/host; file-based sharing is enough for the course. Noted as the production upgrade.                          |
| **Schema-only (Step 29)**   | Can't express consumer-specific needs and never breaks the provider's build. Kept — it answers a different question.               |
| **Verify only via E2E**     | Slow, and a failure can't pinpoint contract drift vs any other bug; contracts give fast, precise feedback without the full system. |
| **Make both jobs required** | They're new and cross-repo; kept didactic/non-required so they can't deadlock merges (same stance as ADR-006's image job).         |
