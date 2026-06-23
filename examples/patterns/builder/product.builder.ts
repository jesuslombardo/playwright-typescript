import { faker } from '@faker-js/faker'
import { Product } from '../../../data/product.factory'

/*
 * PATTERN — Builder (creational).  GALLERY (contrast).
 *
 * This repo already builds products with a FACTORY (data/product.factory.ts),
 * which is the right tool here: one call, sensible unique defaults, override the
 * one field you care about. Builder is shown as a contrast — reach for it when
 * an object has many optional fields or when you want a fluent, readable way to
 * assemble awkward/invalid permutations step by step.
 */
export class ProductBuilder {
  private readonly product: Partial<Product> = {}

  static aProduct(): ProductBuilder {
    return new ProductBuilder()
  }

  withName(name: string): this {
    this.product.name = name
    return this
  }

  withPrice(price: number): this {
    this.product.price = price
    return this
  }

  withDescription(description: string): this {
    this.product.description = description
    return this
  }

  /** A complete, valid product — unset fields get unique faker defaults. */
  build(): Product {
    return {
      name: this.product.name ?? `${faker.commerce.productName()} ${faker.string.alphanumeric(8)}`,
      price: this.product.price ?? Number(faker.commerce.price({ min: 1, max: 500 })),
      description: this.product.description ?? faker.commerce.productDescription(),
    }
  }

  /** EXACTLY what was set (no defaults) — handy to express invalid payloads. */
  buildPayload(): Record<string, unknown> {
    return { ...this.product }
  }
}
