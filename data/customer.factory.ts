import { faker } from '@faker-js/faker'

/** Shipping details a customer enters at checkout (city/zip optional in the app). */
export type Customer = {
  name: string
  address: string
  city: string
  zip: string
}

/**
 * Factory for a checkout Customer — synthetic, PII-safe shipping details, with
 * any field pinnable via `overrides`. Mirrors product.factory: unique by default
 * (faker) so parallel workers never collide, readable so a test states only the
 * field it cares about.
 */
export function buildCustomer(overrides: Partial<Customer> = {}): Customer {
  return {
    name: faker.person.fullName(),
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    zip: faker.location.zipCode(),
    ...overrides,
  }
}
