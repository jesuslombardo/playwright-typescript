import { Locator, Page } from '@playwright/test'
import { HeaderComponent } from '../components/header.component'
import { BasePage } from './base.page'

/** Shipping details collected at checkout. City/zip are optional in the app. */
export type ShippingDetails = {
  name: string
  address: string
  city?: string
  zip?: string
}

/**
 * The checkout page (/checkout.html): shows the order summary, collects shipping
 * details, and POSTs the order to /api/orders. The server reprices every line,
 * so the summary here is display-only. On success it lands on the confirmation
 * page. Extends BasePage.
 */
export class CheckoutPage extends BasePage {
  protected readonly path = '/checkout.html'
  readonly header: HeaderComponent
  readonly grid: Locator
  readonly empty: Locator
  readonly summaryLines: Locator
  readonly summaryTotal: Locator
  readonly name: Locator
  readonly address: Locator
  readonly city: Locator
  readonly zip: Locator
  readonly placeOrderButton: Locator
  readonly error: Locator

  constructor(page: Page) {
    super(page)
    this.header = new HeaderComponent(page)
    this.grid = page.getByTestId('summary-lines')
    this.empty = page.getByTestId('cart-empty')
    this.summaryLines = page.getByTestId('summary-line')
    this.summaryTotal = page.getByTestId('summary-total')
    this.name = page.getByTestId('checkout-name')
    this.address = page.getByTestId('checkout-address')
    this.city = page.getByTestId('checkout-city')
    this.zip = page.getByTestId('checkout-zip')
    this.placeOrderButton = page.getByTestId('place-order-button')
    this.error = page.getByTestId('checkout-error')
  }

  async fillShipping({ name, address, city, zip }: ShippingDetails) {
    await this.name.fill(name)
    await this.address.fill(address)
    if (city !== undefined) await this.city.fill(city)
    if (zip !== undefined) await this.zip.fill(zip)
  }

  async placeOrder() {
    await this.placeOrderButton.click()
  }

  /** Fill shipping and place the order in one step. */
  async submit(details: ShippingDetails) {
    await this.fillShipping(details)
    await this.placeOrder()
  }
}
