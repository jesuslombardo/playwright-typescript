import rawCases from './product-updates.cases.json'

/** One row of the JSON-driven product-update matrix. */
export type ProductUpdateCase = {
  label: string
  /** Partial body sent to PUT /api/products/:id. */
  patch: Record<string, unknown>
  expectedStatus: number
}

/**
 * Data-driven PUT (update) cases loaded from an EXTERNAL JSON file
 * (`data/product-updates.cases.json`).
 *
 * JSON is the **zero-dependency** sibling of CSV (`resolveJsonModule` is on, so
 * the file imports directly — no parser). It's also the better fit here than
 * CSV: PUT is a PARTIAL update, and JSON expresses partial objects and explicit
 * `null` naturally (the app keeps the existing value when a field is `null`,
 * via `body.x ?? existing.x` — hence "null price keeps the existing value").
 */
export const productUpdateCases = rawCases as ProductUpdateCase[]
