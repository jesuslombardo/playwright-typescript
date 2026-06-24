import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'

/** Impacts we refuse to ship. minor/moderate are a backlog, not a build gate. */
const BLOCKING_IMPACTS = new Set(['critical', 'serious'])

/** WCAG 2.0 + 2.1, levels A and AA — the standard automated-check baseline. */
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']

/**
 * Scan the current page with axe-core and assert it has no critical/serious
 * WCAG A/AA violations. The assertion message lists any offenders (id, impact,
 * node count, help URL) so a failure is actionable from the CI log alone.
 */
export async function expectNoSeriousA11yViolations(page: Page): Promise<void> {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()

  const blocking = violations.filter((v) => v.impact != null && BLOCKING_IMPACTS.has(v.impact))
  const summary = blocking
    .map((v) => `- ${v.id} [${v.impact}] ×${v.nodes.length} — ${v.help} (${v.helpUrl})`)
    .join('\n')

  expect(blocking, `Accessibility violations found:\n${summary}`).toEqual([])
}
