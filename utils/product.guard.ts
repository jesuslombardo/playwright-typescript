import { ApiProduct } from '../data/product.factory'

/**
 * Type guard: narrows an `unknown` value to `ApiProduct`.
 *
 * A response's `.json()` is effectively `any` — TypeScript knows nothing about
 * its shape, so every property access on it is unchecked. A type guard (the
 * `value is ApiProduct` return type) is the basic-TS tool that turns that
 * untrusted `unknown` into a value the compiler treats as a real product:
 * any code AFTER a passing guard gets full type-safety and autocompletion on
 * the fields, with no casts.
 */
export function isApiProduct(value: unknown): value is ApiProduct {
  // 1. It must be a non-null object before we can read properties off it.
  //    (`typeof null === 'object'` in JS, so the explicit null check matters.)
  if (typeof value !== 'object' || value === null) return false

  // 2. Treat it as a bag of unknown fields and check each one's runtime type.
  const p = value as Record<string, unknown>
  return (
    typeof p.id === 'number' &&
    typeof p.name === 'string' &&
    typeof p.price === 'number' &&
    typeof p.description === 'string'
  )
}
