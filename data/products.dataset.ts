import { buildProduct } from './product.factory'

/**
 * Reference data: known facts about the app's static seed catalogue. Tests
 * assert against these instead of hardcoding magic strings. (Was `testProducts`
 * in config/ — moved here because a seeded product is SCENARIO data, not env
 * config.)
 */
export const seededProducts = {
  backpack: { name: 'Sauce Labs Backpack', price: 29.99 },
  bikeLight: { name: 'Sauce Labs Bike Light', price: 9.99 },
} as const

/** One row of a data-driven create test: a payload plus its expected outcome. */
export type ProductCreateCase = {
  label: string
  payload: Record<string, unknown>
  expectedStatus: number
}

/**
 * Data-driven cases for POST /api/products — one row becomes one test.
 *
 * `expectedStatus` reflects the app's ACTUAL validation (`isValidProduct`):
 * name must be a non-empty string and price a finite number. The dataset
 * documents real behaviour, not what we wish it were — see the negative/zero
 * rows, which the app ACCEPTS because it has no non-negative-price guard.
 */
export const productCreateCases: ProductCreateCase[] = [
  { label: 'valid product', payload: buildProduct(), expectedStatus: 201 },
  { label: 'empty name', payload: buildProduct({ name: '' }), expectedStatus: 400 },
  { label: 'whitespace-only name', payload: buildProduct({ name: '   ' }), expectedStatus: 400 },
  {
    label: 'missing price',
    payload: { name: 'No Price Widget', description: 'x' },
    expectedStatus: 400,
  },
  {
    label: 'price as a string',
    payload: { name: 'Stringy Price', price: 'free', description: 'x' },
    expectedStatus: 400,
  },
  {
    label: 'price is null',
    payload: { name: 'Null Price', price: null, description: 'x' },
    expectedStatus: 400,
  },
  // Boundary cases that expose a GAP: the app validates "finite number", not
  // ">= 0", so these are accepted (201). A data-driven suite surfaces exactly
  // this kind of latent business-rule hole.
  {
    label: 'zero price (boundary, accepted)',
    payload: buildProduct({ price: 0 }),
    expectedStatus: 201,
  },
  {
    label: 'negative price (no guard, accepted)',
    payload: buildProduct({ price: -1 }),
    expectedStatus: 201,
  },
]
