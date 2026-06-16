import { Locator, Page } from '@playwright/test'
import { AuthenticatedPage } from './authenticated.page'

export class CartPage extends AuthenticatedPage {
  readonly title: Locator
  readonly checkoutButton: Locator

  constructor(page: Page) {
    super(page)
    this.title = page.getByTestId('title')
    this.checkoutButton = page.getByTestId('checkout')
  }

  itemByName(productName: string) {
    return this.page.getByTestId('inventory-item-name').filter({ hasText: productName })
  }

  async proceedToCheckout() {
    await this.checkoutButton.click()
  }
}
