import { Locator, Page } from '@playwright/test'
import { BasePage } from './base.page'

/**
 * The cart page (/cart.html). The cart itself is client-side (localStorage), so
 * everything here is local until checkout — this page reviews lines, edits
 * quantities, removes items, and heads to checkout. Extends BasePage.
 */
export class CartPage extends BasePage {
  protected readonly path = '/cart.html'
  readonly title: Locator
  readonly items: Locator
  readonly empty: Locator
  readonly summary: Locator
  readonly subtotal: Locator
  readonly checkoutButton: Locator

  constructor(page: Page) {
    super(page)
    this.title = page.getByTestId('title')
    this.items = page.getByTestId('cart-line')
    this.empty = page.getByTestId('cart-empty')
    this.summary = page.getByTestId('cart-summary')
    this.subtotal = page.getByTestId('cart-subtotal')
    this.checkoutButton = page.getByTestId('checkout-button')
  }

  /** A single cart line located by its (unique) product name. */
  lineByName(name: string): Locator {
    return this.items.filter({ hasText: name })
  }

  /** Set an exact quantity on a line (0 removes it; the page re-renders). */
  async setQtyByName(name: string, qty: number) {
    await this.lineByName(name).getByTestId('cart-line-qty').fill(String(qty))
    // The qty input commits on `change`; blur to fire it deterministically.
    await this.lineByName(name).getByTestId('cart-line-qty').blur()
  }

  async removeByName(name: string) {
    await this.lineByName(name).getByTestId('cart-line-remove').click()
  }

  async checkout() {
    await this.checkoutButton.click()
  }
}
