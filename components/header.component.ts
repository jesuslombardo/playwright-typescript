import { Locator, Page } from '@playwright/test'

/*
 * ─────────────────────────────────────────────────────────────────────────────
 * COMPONENT OBJECT — the shared top bar (since demo-shop-app v2.0.0).
 * ─────────────────────────────────────────────────────────────────────────────
 * Every signed-in page (products, cart, checkout, orders, confirmation) renders
 * the same topbar: a ☰ menu, a live cart badge, links to the catalogue / cart /
 * orders, the role badge, and Logout. That is "UI shared across pages", so per
 * ADR-004 it lives here as a Component Object and the page objects COMPOSE it
 * (has-a) instead of each re-declaring the topbar selectors.
 *
 * Not every link exists on every page (e.g. the role badge is products-only,
 * the catalogue link isn't on products) — a locator for an absent element just
 * doesn't resolve, so call only the methods relevant to the page under test.
 */
export class HeaderComponent {
  readonly menuToggle: Locator
  readonly nav: Locator
  readonly roleBadge: Locator // products page only
  readonly catalogueLink: Locator // cart / orders / confirmation
  readonly cartLink: Locator
  readonly cartCount: Locator // the count span inside cart-link (an id, not a test id)
  readonly ordersLink: Locator
  readonly logoutButton: Locator

  constructor(readonly page: Page) {
    this.menuToggle = page.getByTestId('menu-toggle')
    this.nav = page.getByTestId('topbar-nav')
    this.roleBadge = page.getByTestId('role-badge')
    this.catalogueLink = page.getByTestId('catalog-link')
    this.cartLink = page.getByTestId('cart-link')
    this.cartCount = page.locator('#cart-count')
    this.ordersLink = page.getByTestId('orders-link')
    this.logoutButton = page.getByTestId('logout')
  }

  async logout() {
    await this.logoutButton.click()
  }

  async goToCart() {
    await this.cartLink.click()
  }

  async goToOrders() {
    await this.ordersLink.click()
  }

  async goToCatalogue() {
    await this.catalogueLink.click()
  }

  /** Units shown in the live cart badge. */
  async cartCountValue(): Promise<number> {
    return Number((await this.cartCount.textContent())?.trim() || '0')
  }

  /**
   * Mobile only: reveal the actions tucked behind the ☰ button. Uses a touch
   * tap (requires a hasTouch context, e.g. the mobile project).
   */
  async openMobileMenu() {
    await this.menuToggle.tap()
  }
}
