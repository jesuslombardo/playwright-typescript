# State (gallery, synthetic)

Let an object change its behaviour when its internal state changes — each state
is a class that knows only its own legal transitions.

## When to reach for it

- An entity has a **lifecycle with rules**: some operations are only valid in
  certain states (an order can't ship before it's paid).
- You'd otherwise scatter `if (status === ...)` branches across the codebase.

## When NOT to (the honest note for this repo)

The SUT's product is plain CRUD with no real workflow, so its lifecycle edges
are covered with straightforward assertions in
[tests/api/product-lifecycle.api.spec.ts](../../../tests/api/product-lifecycle.api.spec.ts).
A polymorphic State machine there would be over-engineering — hence this example
uses a **synthetic** order workflow where the pattern actually pays off.

Run: `npm run test:patterns`
