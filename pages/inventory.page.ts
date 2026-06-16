import { Locator, Page } from '@playwright/test'
import { HeaderComponent } from '../components/header.component'

export class InventoryPage {
  readonly page: Page
  readonly header: HeaderComponent
  readonly title: Locator
  readonly cartBadge: Locator

  constructor(page: Page) {
    this.page = page
    this.header = new HeaderComponent(page)
    this.title = page.getByText('Products')
    this.cartBadge = page.locator('.shopping_cart_badge')
  }

  async addProductToCart(productSlug: string) {
    await this.page.getByTestId(`add-to-cart-${productSlug}`).click()
  }
}
