import { test, expect } from '@playwright/test'
import { faker } from '@faker-js/faker'
import { getToken } from '../../utils/api'
import { isAiEnabled } from '../../ai/gemini.client'
import { judge } from '../../ai/judge'

/*
 * @ai — LLM-AS-JUDGE for semantic coherence (ADR-019). Opt-in (Gemini key + `ai`
 * project), so it never gates CI.
 *
 * We judge a property no `toBe`/`toEqual` can express: does a product's
 * DESCRIPTION actually describe the product named in NAME? Two sides prove the
 * judge DISCRIMINATES (it isn't a rubber stamp):
 *   - a REAL seeded product (coherent)            → expected pass
 *   - a product CREATED with mismatched copy       → expected fail
 *
 * Text only: this SUT has no product images, so image↔text coherence is N/A here.
 * The same `judge()` helper would handle that multimodally on an app that did.
 */
const COHERENCE =
  'The DESCRIPTION plausibly describes the very same product named in NAME (the same kind of item).'

const asContent = (p: { name: string; description: string }): string =>
  `NAME: ${p.name}\nDESCRIPTION: ${p.description}`

test.describe('Product copy coherence @ai', () => {
  test.skip(!isAiEnabled(), 'Set GEMINI_API_KEY to run the AI suite (see .env.example)')

  test('a real catalogue product reads as coherent', async ({ request }) => {
    const res = await request.get('/api/products')
    expect(res.ok()).toBeTruthy()

    const products = (await res.json()) as Array<{ name: string; description: string }>
    // The backpack's copy clearly describes a bag — a strong, stable coherent case.
    const product = products.find((p) => p.name.includes('Backpack')) ?? products[0]

    const verdict = await judge(COHERENCE, asContent(product))

    expect(
      verdict.pass,
      `Judge rejected real catalogue copy as incoherent: ${verdict.reason}`,
    ).toBe(true)
  })

  test('a product created with a mismatched description is flagged', async ({ request }) => {
    const token = await getToken(request)
    const headers = { Authorization: `Bearer ${token}` }

    // Coherent NAME, deliberately UNRELATED description — the kind of bad catalogue
    // copy a deterministic test can't catch but a judge instantly can.
    const incoherent = {
      name: `Leather Wallet ${faker.string.alphanumeric(8)}`,
      price: 19.99,
      description:
        'This lightweight, water-resistant LED bike light straps on in seconds and runs for hours.',
    }

    const createRes = await request.post('/api/products', { headers, data: incoherent })
    expect(createRes.status()).toBe(201)
    const created = (await createRes.json()) as { id: number; name: string; description: string }

    try {
      const verdict = await judge(COHERENCE, asContent(created))
      expect(verdict.pass, `Judge failed to flag mismatched copy: ${verdict.reason}`).toBe(false)
    } finally {
      // Lifecycle: always delete what we created, even if the assertion fails (ADR-014).
      await request.delete(`/api/products/${created.id}`, { headers })
    }
  })
})
