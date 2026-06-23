import { GoogleGenAI } from '@google/genai'

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * Gemini client — the ONE place that talks to the LLM. See ADR-019.
 * ─────────────────────────────────────────────────────────────────────────────
 * Everything AI-related in this repo (LLM-as-judge, self-healing) goes through
 * here, so the provider lives behind a single seam: swap Gemini for another model
 * by editing this file alone, never the tests.
 *
 * Two cost/safety rules are baked in:
 *   - The API key is read from the environment (GEMINI_API_KEY), NEVER hard-coded.
 *   - A *flash* model is the default: judging a short string or suggesting a
 *     selector needs speed and low cost, not the top reasoning tier — which keeps
 *     us comfortably inside Google AI Studio's free tier.
 */

/** Free-tier-friendly default; override with GEMINI_MODEL if your tier differs. */
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash'

/**
 * True only when a Gemini key is present. The whole `@ai` suite gates on this so
 * it SKIPS cleanly (never fails) when no key is configured — see the specs.
 */
export function isAiEnabled(): boolean {
  return Boolean(process.env.GEMINI_API_KEY)
}

let client: GoogleGenAI | undefined

/** Lazy singleton — the key is read here, at call time, never at import time. */
function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set — AI helpers must be gated on isAiEnabled().')
  }
  return (client ??= new GoogleGenAI({ apiKey }))
}

/**
 * One round-trip to Gemini. `json: true` asks the model for an
 * `application/json` body so callers can parse a structured result instead of
 * scraping prose.
 */
export async function generate(prompt: string, opts: { json?: boolean } = {}): Promise<string> {
  const ai = getClient()
  const res = await ai.models.generateContent({
    model: DEFAULT_MODEL,
    contents: prompt,
    config: opts.json ? { responseMimeType: 'application/json' } : undefined,
  })
  return res.text ?? ''
}

/** Exposed for logging/docs — which model the suite is actually using. */
export const geminiModel = DEFAULT_MODEL
