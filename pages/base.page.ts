import { Page } from '@playwright/test'

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * PRINCIPLE — Inheritance + DRY (the canonical page-object base).
 * ─────────────────────────────────────────────────────────────────────────────
 * Every page shares two things: a Playwright `page` handle and the ability to
 * navigate to its own URL. BasePage owns that shared behaviour ONCE; each
 * concrete page declares only what differs — its `path` and its own locators.
 *
 * `goto()` is a small Template Method: the algorithm (navigate) lives here, the
 * varying bit (which URL) is the abstract `path` the subclass fills in. Adding a
 * new page is "extend BasePage + set a path", never another copy of goto().
 */
export abstract class BasePage {
  /** Each concrete page declares its own URL. */
  protected abstract readonly path: string

  constructor(readonly page: Page) {}

  /** Navigate to this page's URL — shared by every page (DRY). */
  async goto(): Promise<void> {
    await this.page.goto(this.path)
  }
}
