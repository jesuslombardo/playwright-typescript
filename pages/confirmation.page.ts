import { Locator, Page } from '@playwright/test'
import { HeaderComponent } from '../components/header.component'
import { BasePage } from './base.page'

/**
 * The order confirmation / detail page (/confirmation.html?id=…). Reached by
 * redirect after a successful checkout, and reused as the "view past order"
 * target from the order history. It reads ?id and fetches the order from
 * /api/orders/:id (the server only returns orders owned by the signed-in user).
 *
 * `path` is the bare page; tests normally ARRIVE here via the checkout/orders
 * flow, but `gotoOrder(id)` can open a specific order directly. Extends BasePage.
 */
export class ConfirmationPage extends BasePage {
  protected readonly path = '/confirmation.html'
  readonly header: HeaderComponent
  readonly container: Locator
  readonly thankYou: Locator
  readonly orderNumber: Locator
  readonly items: Locator
  readonly total: Locator
  readonly shipping: Locator
  readonly error: Locator

  constructor(page: Page) {
    super(page)
    this.header = new HeaderComponent(page)
    this.container = page.getByTestId('order-confirmation')
    this.thankYou = page.getByTestId('thank-you')
    this.orderNumber = page.getByTestId('order-number')
    this.items = page.getByTestId('order-item')
    this.total = page.getByTestId('order-total')
    this.shipping = page.getByTestId('order-shipping')
    this.error = page.getByTestId('confirmation-error')
  }

  /** Open a specific order's confirmation/detail directly. */
  async gotoOrder(id: number) {
    await this.page.goto(`${this.path}?id=${id}`)
  }
}
