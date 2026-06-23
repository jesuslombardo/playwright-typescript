import { faker } from '@faker-js/faker'

/** The shape of a product the app accepts on create (POST /api/products). */
export type Product = {
  name: string
  price: number
  description: string
}

/**
 * The shape the API RETURNS for a product: the create payload plus the id the
 * server assigns. `Product` is this same type without the id — i.e. it equals
 * `Omit<ApiProduct, 'id'>` — which is exactly why we build on `Product` here.
 */
export type ApiProduct = Product & { id: number }

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

/**
 * Build an array of `count` items from any factory — a tiny GENERIC helper.
 *
 * The `<T>` makes it reusable: it builds Products today (`buildMany(buildProduct,
 * 3)`) and anything else tomorrow, with the return type `T[]` inferred from
 * whatever the factory returns — no casts. `buildProduct` fits the `() => T`
 * slot because its `overrides` parameter is optional.
 */
export function buildMany<T>(factory: () => T, count: number): T[] {
  return Array.from({ length: count }, () => factory())
}
