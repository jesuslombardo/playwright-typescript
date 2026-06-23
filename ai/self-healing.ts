import { Locator, Page } from '@playwright/test'
import { generate } from './gemini.client'

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * Self-healing locators — recover a broken selector instead of failing.
 * ─────────────────────────────────────────────────────────────────────────────
 * When the app renames an attribute, the test's selector stops matching. Rather
 * than fail, we show the live DOM to the model and ask for a working selector.
 *
 * Cost discipline: the model is consulted ONLY on the failure path. A healthy
 * run — where the primary selector still matches — never calls the LLM. Within a
 * run, a heal is cached so repeated uses of the same element don't re-query.
 */

/**
 * In-run cache of healed selectors (cacheKey → selector). A production setup
 * would PERSIST this to disk so heals survive across runs and feed a "your
 * selectors drifted" report; in-memory is enough to demonstrate the saving. See
 * ADR-019.
 */
const healed = new Map<string, string>()

type HealOptions = {
  /** The selector the test would normally use. */
  primary: string
  /** Plain-language description of the element, shown to the model. */
  intent: string
  /** Stable key under which a heal is cached for this run. */
  cacheKey: string
}

/**
 * Return a Locator for `intent`, self-healing when `primary` no longer matches:
 *   1. `primary` still resolves → return it (no model call).
 *   2. Already healed this key this run → reuse the cached selector.
 *   3. Otherwise → show the DOM to Gemini, ask for a selector, cache it.
 */
export async function healLocator(page: Page, opts: HealOptions): Promise<Locator> {
  const primary = page.locator(opts.primary)
  if ((await primary.count()) > 0) return primary

  const cached = healed.get(opts.cacheKey)
  if (cached) {
    const reuse = page.locator(cached)
    if ((await reuse.count()) > 0) return reuse
  }

  const selector = await suggestSelector(opts.intent, await domSnapshot(page))
  healed.set(opts.cacheKey, selector)

  const recovered = page.locator(selector)
  if ((await recovered.count()) === 0) {
    throw new Error(
      `Self-healing failed for "${opts.intent}": model suggested \`${selector}\`, which matched nothing.`,
    )
  }
  return recovered
}

/** Trimmed DOM — enough for the model to pick a selector, capped to stay frugal. */
async function domSnapshot(page: Page): Promise<string> {
  const html = await page.locator('body').innerHTML()
  return html.length > 6000 ? html.slice(0, 6000) : html
}

async function suggestSelector(intent: string, dom: string): Promise<string> {
  const prompt = [
    'You are a Playwright locator expert. Given an HTML fragment, return a single',
    'CSS selector that uniquely matches the described element. Prefer stable',
    'attributes (data-test, id, name, aria-label, role) over brittle classes.',
    '',
    `ELEMENT: ${intent}`,
    '',
    'HTML:',
    dom,
    '',
    'Respond with ONLY a JSON object of the form {"selector": "<css selector>"}.',
  ].join('\n')

  return parseSelector(await generate(prompt, { json: true }))
}

function parseSelector(raw: string): string {
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) throw new Error(`Self-healing model did not return JSON:\n${raw}`)

  const value = JSON.parse(match[0]) as Record<string, unknown>
  if (typeof value.selector !== 'string' || value.selector.trim() === '') {
    throw new Error(`Self-healing JSON is missing a non-empty "selector":\n${raw}`)
  }
  return value.selector.trim()
}
