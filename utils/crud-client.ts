import { APIRequestContext, APIResponse } from '@playwright/test'

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * PATTERN — Generics + Encapsulation (+ a touch of DIP).  ORGANIC: reused infra.
 * ─────────────────────────────────────────────────────────────────────────────
 * A typed client for any REST resource at `/api/<resource>`. The type parameter
 * <T> is the create/update payload, so a caller gets compile-time safety on the
 * body it sends — `CrudClient<Product>` won't let you POST a typo'd field.
 *
 * It ENCAPSULATES the two things every spec was repeating by hand: building the
 * URL and attaching the Bearer header. Tests now speak the resource's language
 * (create/get/update/delete) instead of HTTP. And it depends on the
 * `APIRequestContext` ABSTRACTION (DIP), so the same client works with any
 * Playwright request context the test injects.
 *
 * Returns raw `APIResponse` on purpose: lifecycle/edge tests assert on status
 * codes (404/204/...), so the client must not throw or hide them.
 */
export class CrudClient<T extends object> {
  constructor(
    private readonly request: APIRequestContext,
    private readonly resource: string,
    private readonly token?: string,
  ) {}

  /** Bearer header when a token was supplied; nothing otherwise (public reads). */
  private get headers(): Record<string, string> | undefined {
    return this.token ? { Authorization: `Bearer ${this.token}` } : undefined
  }

  list(): Promise<APIResponse> {
    return this.request.get(`/api/${this.resource}`)
  }

  get(id: number): Promise<APIResponse> {
    return this.request.get(`/api/${this.resource}/${id}`)
  }

  create(payload: T): Promise<APIResponse> {
    return this.request.post(`/api/${this.resource}`, { headers: this.headers, data: payload })
  }

  update(id: number, patch: Partial<T>): Promise<APIResponse> {
    return this.request.put(`/api/${this.resource}/${id}`, { headers: this.headers, data: patch })
  }

  delete(id: number): Promise<APIResponse> {
    return this.request.delete(`/api/${this.resource}/${id}`, { headers: this.headers })
  }
}
