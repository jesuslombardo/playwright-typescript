# `ai/` — AI-assisted testing (opt-in)

Two LLM-assisted testing techniques, kept as a **separate, opt-in module** so they
never touch the deterministic suite. See [ADR-019](../docs/adr/019-ai-assisted-testing-llm-judge-and-self-healing.md)
for the rationale and trade-offs.

| Technique        | Helper                             | What it does                                                      |
| ---------------- | ---------------------------------- | ----------------------------------------------------------------- |
| **LLM-as-judge** | [`judge()`](judge.ts)              | Asserts a SEMANTIC property a `toBe`/`toEqual` can't express.     |
| **Self-healing** | [`healLocator()`](self-healing.ts) | Recovers a broken selector by asking the model for a working one. |

Both go through a single [`gemini.client.ts`](gemini.client.ts) seam — the provider
lives in one file, the tests never import the SDK directly.

## When to use which (and when NOT to)

- **`judge()`** — only for fuzzy, semantic checks: "does this description match this
  product?", "is this error message clear?". **Never** replace a deterministic
  assertion with a judge — a price or an id is `toBe`, not an LLM call.
- **`healLocator()`** — resilient element lookup. The model is consulted **only when
  the primary selector breaks**; a healthy run never calls it.

## Running it

The suite is **doubly gated** and will not run by accident:

1. It lives in its own Playwright project (`ai`), included **only** when `AI_TESTS=1`.
2. Each spec **skips** unless `GEMINI_API_KEY` is set.

```bash
# 1. Get a free key from Google AI Studio, then:
echo 'GEMINI_API_KEY=your-key' >> .env       # .env is gitignored — never commit it

# 2. Run only the AI suite (starts the SUT automatically):
npm run test:ai
```

Without a key, `npm run test:ai` runs and **skips** every test (green, no API calls).
The normal suites (`npm test`, `test:api`, `test:regression`, `test:smoke`) never
include this project at all.

## Cost / free-tier discipline

- Defaults to a **flash** model (`GEMINI_MODEL` overrides it) — fast and cheap.
- `judge()` = **one** call per assertion; `healLocator()` calls the model **only on a
  broken selector**, then caches the heal for the rest of the run.
- The suite is tiny (a couple of cases) and **never runs in CI by default** — there is
  a separate, manually-triggered [workflow](../.github/workflows/ai.yml).

## Security

The API key is read from `process.env.GEMINI_API_KEY` only — it is never hard-coded,
logged, or committed. Locally it lives in `.env` (gitignored); in CI it comes from the
`GEMINI_API_KEY` GitHub Secret.
