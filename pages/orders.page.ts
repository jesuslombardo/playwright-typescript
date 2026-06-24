import { Locator, Page } from '@playwright/test'
import { HeaderComponent } from '../components/header.component'
import { BasePage } from './base.page'

/**
 * The order history page (/orders.html): lists the signed-in user's past orders
 * (newest first) from GET /api/orders. Each row links to the confirmation page.
 * Extends BasePage.
 */
export class OrdersPage extends BasePage {
  protected readonly path = '/orders.html'
  readonly header: HeaderComponent
  readonly title: Locator
  readonly rows: Locator
  readonly empty: Locator

  constructor(page: Page) {
    super(page)
    this.header = new HeaderComponent(page)
    this.title = page.getByTestId('title')
    this.rows = page.getByTestId('order-row')
    this.empty = page.getByTestId('orders-empty')
  }

  /** The row for a given order id (each row links to /confirmation.html?id=…). */
  rowForOrder(id: number): Locator {
    return this.rows.filter({ has: this.page.locator(`text=Order #${id}`) })
  }

  /** The rendered total on a given order's row. */
  totalForOrder(id: number): Locator {
    return this.rowForOrder(id).getByTestId('order-row-total')
  }

  async openOrder(id: number) {
    await this.rowForOrder(id).click()
  }
}
