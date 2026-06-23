/**
 * The Product API's write operations, expressed as data. Each row is an endpoint
 * that MUST require authentication; the authz suite drives these rows to prove
 * the app rejects unauthenticated and bad-token writes.
 */

/*
 * The HTTP methods that mutate state, as a `const` array. Declaring it `as const`
 * lets us BOTH iterate the values at runtime AND derive the literal union type
 * from it (below) — the idiomatic modern alternative to a TypeScript `enum`.
 */
export const WRITE_METHODS = ['post', 'put', 'delete'] as const

/**
 * `'post' | 'put' | 'delete'`, derived from the array via indexed access
 * (`[number]`). One source of truth: add a method to the array and the type
 * widens automatically — they can never drift apart.
 */
export type WriteMethod = (typeof WRITE_METHODS)[number]

/** A single authenticated write endpoint, described as data. */
export type WriteOp = {
  label: string
  /*
   * A union of string LITERALS: `method` can only ever be one of WRITE_METHODS —
   * not any string. This is what lets `request[op.method](...)` type-check in the
   * spec: TypeScript knows it indexes a real write method on the request context.
   * Widen this to `string` and that line stops compiling.
   */
  method: WriteMethod
  path: string
  /*
   * Optional (`?`): DELETE carries no body, POST/PUT do. Reading `op.body` gives
   * `Record<string, unknown> | undefined`, so a consumer must treat it as maybe
   * absent — the type encodes that for us.
   */
  body?: Record<string, unknown>
}

/*
 * The id `1` exists in the seed, but it never matters here: every request below
 * is refused at the auth gate BEFORE the id is looked at, so nothing is mutated.
 */
export const writeOps: WriteOp[] = [
  {
    label: 'create (POST /api/products)',
    method: 'post',
    path: '/api/products',
    body: { name: 'x', price: 1 },
  },
  {
    label: 'update (PUT /api/products/:id)',
    method: 'put',
    path: '/api/products/1',
    body: { price: 1 },
  },
  {
    label: 'delete (DELETE /api/products/:id)',
    method: 'delete',
    path: '/api/products/1',
  },
]
