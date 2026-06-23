import { APIRequestContext } from '@playwright/test'

/*
 * PATTERN — Adapter (structural).  GALLERY (synthetic).
 *
 * Make two incompatible interfaces speak the same language. Tests depend on ONE
 * target interface (ProductGateway); each adapter wraps a different underlying
 * source and translates it to that interface, so callers never branch on which
 * source they're talking to.
 *
 * Synthetic here: the SUT exposes only a REST API, so there's no second
 * transport to adapt for real. The "legacy SDK" below stands in for the day a
 * second source appears (a GraphQL endpoint, a vendor SDK, a CSV feed...).
 */

/** The single interface the rest of the code depends on. */
export interface ProductGateway {
  fetchNames(): Promise<string[]>
}

/** Adapter A: the real REST API (objects with a `name`). */
export class RestProductGateway implements ProductGateway {
  constructor(private readonly request: APIRequestContext) {}
  async fetchNames(): Promise<string[]> {
    const res = await this.request.get('/api/products')
    const products = (await res.json()) as { name: string }[]
    return products.map((p) => p.name)
  }
}

/** Adaptee with an incompatible shape (returns XML, different method name). */
class LegacyCatalogSdk {
  getCatalogXml(): string {
    return '<catalog><item title="Legacy Bolt"/><item title="Legacy Nut"/></catalog>'
  }
}

/** Adapter B: makes the legacy SDK satisfy the same ProductGateway interface. */
export class LegacyProductGateway implements ProductGateway {
  constructor(private readonly sdk = new LegacyCatalogSdk()) {}
  async fetchNames(): Promise<string[]> {
    const xml = this.sdk.getCatalogXml()
    return [...xml.matchAll(/title="([^"]+)"/g)].map((match) => match[1])
  }
}
