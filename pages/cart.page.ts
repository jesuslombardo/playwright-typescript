import { Locator, Page } from '@playwright/test'

export class CartPage {
  readonly page: Page
  readonly title: Locator
  readonly checkoutButton: Locator

  constructor(page: Page) {
    this.page = page
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
