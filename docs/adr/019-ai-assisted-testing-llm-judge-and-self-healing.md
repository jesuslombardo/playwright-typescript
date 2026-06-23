# ADR-019: AI-assisted testing — LLM-as-judge & self-healing locators

## Status

Accepted

## Context

"AI-driven testing" — having the test process **interact with an LLM**, not just
having an LLM author test cases — is increasingly used in the industry. It spans a
spectrum: AI-augmented execution (self-healing locators, visual AI), semantic
oracles (LLM-as-judge), failure triage, and full natural-language browser agents
(Stagehand, ZeroStep, Playwright MCP, browser-use).

We want a small, honest slice of this in the repo to **learn the technique and its
trade-offs**, without compromising the deterministic suite. Two techniques are the
sweet spot — they're useful as an _augmentation layer_ and they sit at different
layers, which makes the contrast clear:

- **LLM-as-judge** — assert a **semantic** property that a deterministic assertion
  can't express ("does this description actually describe this product?"). Works on
  any string — UI text or an API payload.
- **Self-healing locators** — recover a **DOM** selector that broke, by asking the
  model for a working one instead of failing.

The central tension is **determinism**. An LLM is non-deterministic, costs money per
call, and adds latency — the opposite of what a regression gate needs. So the design
question is not "is AI useful in testing" (it is, as augmentation) but "how do we add
it **without** putting an LLM in the critical path of CI".

A SUT constraint shaped the judge case: `demo-shop-app` products are
`{ name, price, description }` — **no images**. So image↔text coherence (the most
compelling multimodal use) is not possible here; we judge **title↔description**
coherence in text. The same `judge()` helper would handle the multimodal version
unchanged on an app that had product images.

## Decision

- **Two techniques, one provider seam.** `ai/judge.ts` (LLM-as-judge) and
  `ai/self-healing.ts` (healing), both going through a single `ai/gemini.client.ts`.
  The provider lives in one file; tests never import the SDK directly, so swapping
  Gemini for another model (or a local Ollama) is a one-file change.
- **Gemini via the official `@google/genai` SDK**, used **directly** (not through a
  wrapper library like Stagehand/ZeroStep) — more glue, but it's a learning repo and
  the point is to understand the interaction. Default model is a **flash** tier
  (`GEMINI_MODEL` overrides), which is fast, cheap, and inside Google AI Studio's
  free tier.
- **Doubly gated, never accidental.** The suite is its own Playwright project
  (`ai`), matched by `*.ai.spec.ts` and isolated by filename exactly like `api` /
  `mobile` / `contract`. It is included **only** when `AI_TESTS=1`
  (`npm run test:ai`), and each spec additionally **skips** unless `GEMINI_API_KEY`
  is set. So `npm test`, `test:regression`, and `test:smoke` never touch it, and a
  keyless run skips green with zero API calls.
- **Judge case = text coherence, tied to the real app.** A **real seeded** product
  is the coherent case (expected pass); a product **created via the real API** with
  a deliberately mismatched description is the incoherent case (expected fail) and is
  cleaned up afterwards (ADR-014). Two sides prove the judge _discriminates_ rather
  than rubber-stamps. We judge meaning, not data — price/id stay deterministic
  assertions.
- **Self-healing only pays on failure.** The model is consulted **only when the
  primary selector doesn't match**; a healthy run never calls it. Heals are cached
  in-run. The login spec starts from a deliberately stale selector so a heal is
  actually exercised.
- **Credentials are env-only.** `GEMINI_API_KEY` is read from the environment, never
  hard-coded or committed. Locally it lives in `.env` (gitignored, documented in
  `.env.example`); in CI it comes from a GitHub Secret.
- **CI is separate and manual.** A dedicated `ai.yml` workflow runs only on
  `workflow_dispatch` — it is **not** a required check and does not run on push/PR,
  so it never spends quota or flakes the gate.
- **`@google/genai` is a normal devDependency.** Isolation comes from the gating
  (project + key skip), not from making the dependency optional — which would only
  add dynamic-import complexity for no real benefit here.

## Consequences

### Positive

- A real, runnable example of **two distinct AI-testing techniques**, each where it
  genuinely adds value, with the determinism trade-off handled explicitly.
- **Zero risk to the deterministic suite**: the AI suite can't run by accident
  (project gate) and can't fail a keyless environment (skip gate).
- **Free-tier-safe**: flash model, one call per judge, heals only on breakage, tiny
  suite, never in the default CI.
- Clean **migration path to "AI in the app"**: the judge helpers are the same
  building blocks a create-time AI validation feature would use — only _where_ the
  verdict is consumed changes.

### Negative

- **Non-deterministic assertions.** Even on strong-signal cases an LLM can flip. We
  mitigate with clear-cut inputs and by keeping the suite opt-in and out of the gate,
  but it's a real property of the technique, not a bug.
- **External dependency + cost.** Every run hits a third-party API and consumes free-
  tier quota; offline or rate-limited environments can't run it (they skip).
- **Maintenance surface.** Prompt wording and the model version affect verdicts; this
  code needs occasional re-tuning the deterministic suite doesn't.

## Alternatives considered

| Alternative                                                          | Why not chosen                                                                                                                         |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **A wrapper library** (Stagehand / ZeroStep / auto-playwright)       | Hides the LLM interaction behind `ai("...")`. Faster to adopt, but the goal here is to _learn_ the SDK call and own the seam.          |
| **Local model via Ollama** (zero cost)                               | Great for fully-offline/no-cost runs, but the user already has a Gemini account and a free tier; one provider keeps the example small. |
| **Image↔text coherence (multimodal judge)**                          | Not possible on this SUT — products have no images. Revisit if `demo-shop-app` gains product imagery; `judge()` already supports it.   |
| **AI validation inside the app** (the SUT's create rejects bad copy) | The truest "LLM in the process" form, but it means modifying the SUT — out of scope. Kept as a documented future option ("option B").  |
| **Run the AI suite in the required CI gate**                         | Puts a non-deterministic, paid, network call in the merge path. Rejected — the suite is opt-in and manually triggered.                 |
| **Make `@google/genai` an optional dependency**                      | Adds dynamic-import/try-catch complexity; the project + key gating already isolates it, so a plain devDependency is simpler.           |
