# Decorator (gallery)

Add behaviour to an object by wrapping it in another object of the same
interface, instead of subclassing.

## When to reach for it

- You need **cross-cutting concerns** on a client — logging, timing, retry,
  caching, counting — and want to **combine them freely** (any order, any subset).
- Subclassing would explode into `LoggingRetryTimingClient`, `RetryTimingClient`…

## When NOT to (the honest note for this repo)

This is pure infrastructure — it adds no test coverage, so it lives in the
gallery. If the suite ever needed, say, automatic retry on flaky network calls,
this is exactly the technique to reach for.

Run: `npm run test:patterns`
