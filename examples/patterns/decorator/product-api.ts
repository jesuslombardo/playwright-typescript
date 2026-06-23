import { APIRequestContext } from '@playwright/test'

/*
 * PATTERN — Decorator (structural).  GALLERY (illustrative).
 *
 * Add cross-cutting concerns (logging, timing, retry, counting...) to a client
 * by WRAPPING it, not by subclassing. Each decorator implements the same
 * interface and forwards to the one it wraps, so they STACK in any order without
 * a subclass explosion (LoggingRetryTimingClient, RetryLoggingClient, ...).
 *
 * Gallery-only here: it adds no test coverage, it's an infrastructure technique.
 */

export interface ProductApi {
  list(): Promise<{ status: number; products: { name: string }[] }>
}

/** The real client — talks to the SUT. */
export class HttpProductApi implements ProductApi {
  constructor(private readonly request: APIRequestContext) {}
  async list() {
    const res = await this.request.get('/api/products')
    return { status: res.status(), products: await res.json() }
  }
}

/** Base decorator: forwards everything; subclasses override only what they add. */
abstract class ProductApiDecorator implements ProductApi {
  constructor(protected readonly inner: ProductApi) {}
  list() {
    return this.inner.list()
  }
}

/** Records a request/response line into the provided log buffer. */
export class LoggingProductApi extends ProductApiDecorator {
  constructor(
    inner: ProductApi,
    private readonly log: string[],
  ) {
    super(inner)
  }
  async list() {
    this.log.push('→ GET /api/products')
    const result = await this.inner.list()
    this.log.push(`← ${result.status} (${result.products.length} items)`)
    return result
  }
}

/** Counts how many times the wrapped client was called. */
export class CountingProductApi extends ProductApiDecorator {
  calls = 0
  async list() {
    this.calls++
    return this.inner.list()
  }
}
