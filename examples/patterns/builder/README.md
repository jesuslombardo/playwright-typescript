# Builder (gallery)

Assemble an object step by step through a fluent, chainable API.

## When to reach for it

- The object has **many optional fields** and constructors/overrides get unwieldy.
- You want **readable, intention-revealing** assembly, especially for awkward or
  invalid permutations in negative tests.

## When NOT to (the honest note for this repo)

This repo uses a **Factory** ([data/product.factory.ts](../../../data/product.factory.ts))
and that is the correct choice for a 3-field product: one call gives a valid,
unique object and you override only what matters. A Builder here would be
gold-plating.

## Factory vs Builder

|          | Factory                            | Builder                                          |
| -------- | ---------------------------------- | ------------------------------------------------ |
| Shape    | `buildProduct({ price: 0 })`       | `aProduct().withPrice(0).build()`                |
| Best for | "give me a valid X, defaults fine" | many optional fields / staged assembly           |
| Cost     | minimal                            | more code; pays off only when complexity is real |

Run: `npm run test:patterns`
