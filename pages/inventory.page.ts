import { Locator, Page } from '@playwright/test'
import { AuthenticatedPage } from './authenticated.page'

export class InventoryPage extends AuthenticatedPage {
  readonly title: Locator
  readonly cartBadge: Locator

  constructor(page: Page) {
    super(page)
    this.title = page.getByText('Products')
    this.cartBadge = page.locator('.shopping_cart_badge')
  }

  async addProductToCart(productSlug: string) {
    await this.page.getByTestId(`add-to-cart-${productSlug}`).click()
  }
}
