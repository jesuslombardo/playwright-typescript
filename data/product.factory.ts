import { faker } from '@faker-js/faker'

/** The shape of a product the app accepts on create (POST /api/products). */
export type Product = {
  name: string
  price: number
  description: string
}

/**
 * Factory for a Product.
 *
 * Returns a fully-formed, UNIQUE product by default and lets a test pin any
 * field via `overrides` — `buildProduct({ price: 0 })`.
 *
 * Why a factory and not a static fixture: tests that CREATE data need it to be
 * unique so parallel workers never collide, yet readable so a test only states
 * the field it actually cares about. Faker gives us synthetic, PII-safe data —
 * the industry default over hand-rolled `Date.now()` strings or real records.
 */
export function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    // productName() alone is not unique — the alphanumeric suffix guarantees a
    // collision-free name so card lookups (filter by text) stay unambiguous.
    name: `${faker.commerce.productName()} ${faker.string.alphanumeric(8)}`,
    price: Number(faker.commerce.price({ min: 1, max: 500 })),
    description: faker.commerce.productDescription(),
    ...overrides,
  }
}
