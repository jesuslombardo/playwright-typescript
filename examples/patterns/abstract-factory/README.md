# Abstract Factory (gallery, synthetic)

Create families of related objects through one interface, so the members always
belong together and the caller never names a concrete class.

## When to reach for it

- You have **several variants** (environments, themes, drivers) and each needs a
  **coherent set** of objects that must not be mixed across variants.

## When NOT to (the honest note for this repo)

The real repo has a **single environment shape**
([config/environments.ts](../../../config/environments.ts)) — a plain object is
enough, and Abstract Factory would be ceremony. Shown for the multi-environment
case where consistency across a family actually matters.

Run: `npm run test:patterns`
