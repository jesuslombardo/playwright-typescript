# Adapter (gallery, synthetic)

Wrap an object with an incompatible interface so it satisfies the interface your
code expects.

## When to reach for it

- You have **two (or more) sources** of the same data with **different shapes**
  (REST vs GraphQL, a vendor SDK, a legacy feed) and want callers to depend on
  one stable interface.

## When NOT to (the honest note for this repo)

The SUT exposes **only REST**, so there's no real second transport to adapt —
the "legacy SDK" here is a stand-in. Shown so the technique is ready the day a
second source appears.

Run: `npm run test:patterns`
