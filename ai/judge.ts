import { generate } from './gemini.client'

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * LLM-as-judge — assert SEMANTIC properties a deterministic check can't express.
 * ─────────────────────────────────────────────────────────────────────────────
 * `expect(total).toBe(150)` is exact and binary. But "does this description
 * actually describe this product?" or "is this error message clear?" are fuzzy:
 * the wording varies and "clear" has no `===`. For those, we hand the model a
 * CRITERION in plain language plus the CONTENT and let it return a pass/fail.
 *
 * Use this ONLY where a deterministic assertion can't reach. Never replace a
 * `toBe`/`toEqual` with a judge — that just adds cost and non-determinism.
 */

/** A semantic verdict: did the content satisfy the natural-language criterion? */
export type Verdict = { pass: boolean; reason: string }

/**
 * Ask the model whether `content` satisfies `criterion`. Returns a structured
 * verdict so a test can assert on `verdict.pass` and surface `verdict.reason`.
 */
export async function judge(criterion: string, content: string): Promise<Verdict> {
  const prompt = [
    'You are a meticulous QA reviewer. Decide whether the CONTENT satisfies the CRITERION.',
    'Judge meaning only — ignore grammar, spelling and marketing style.',
    'Be strict: if the content clearly fails the criterion, answer false.',
    '',
    `CRITERION: ${criterion}`,
    '',
    'CONTENT:',
    content,
    '',
    'Respond with ONLY a JSON object of the form {"pass": boolean, "reason": "<one short sentence>"}.',
  ].join('\n')

  return parseVerdict(await generate(prompt, { json: true }))
}

/** Tolerant parse: the model may still wrap JSON in prose or ```json fences. */
function parseVerdict(raw: string): Verdict {
  const json = extractJsonObject(raw)
  if (!json) throw new Error(`Judge did not return JSON. Raw response:\n${raw}`)

  const value = JSON.parse(json) as Record<string, unknown>
  if (typeof value.pass !== 'boolean') {
    throw new Error(`Judge JSON is missing a boolean "pass". Raw response:\n${raw}`)
  }
  return { pass: value.pass, reason: typeof value.reason === 'string' ? value.reason : '' }
}

/** Pull the first `{...}` object out of a possibly-fenced, possibly-chatty reply. */
function extractJsonObject(raw: string): string | undefined {
  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const body = (fenced ? fenced[1] : raw).trim()
  const start = body.indexOf('{')
  const end = body.lastIndexOf('}')
  if (start === -1 || end === -1 || end < start) return undefined
  return body.slice(start, end + 1)
}
