import { Locator, Page } from '@playwright/test'
import { Product } from '../data/product.factory'
import { BasePage } from './base.page'

/**
 * The authenticated catalogue page of demo-shop-app: lists products and lets a
 * logged-in user create and delete them. Extends BasePage for `page` + `goto()`.
 */
export class ProductsPage extends BasePage {
  protected readonly path = '/products.html'
  readonly title: Locator
  readonly items: Locator
  readonly logoutButton: Locator
  readonly menuToggle: Locator
  readonly topbarNav: Locator
  readonly newProductName: Locator
  readonly newProductPrice: Locator
  readonly newProductDescription: Locator
  readonly addButton: Locator
  readonly addError: Locator

  constructor(page: Page) {
    super(page)
    this.title = page.getByTestId('title')
    this.items = page.getByTestId('inventory-item')
    this.logoutButton = page.getByTestId('logout')
    this.menuToggle = page.getByTestId('menu-toggle')
    this.topbarNav = page.getByTestId('topbar-nav')
    this.newProductName = page.getByTestId('new-product-name')
    this.newProductPrice = page.getByTestId('new-product-price')
    this.newProductDescription = page.getByTestId('new-product-description')
    this.addButton = page.getByTestId('add-product-button')
    this.addError = page.getByTestId('add-error')
  }

  /** A single product card located by its (unique) name. */
  itemByName(name: string): Locator {
    return this.items.filter({ hasText: name })
  }

  async addProduct({ name, price, description }: Product) {
    await this.newProductName.fill(name)
    await this.newProductPrice.fill(String(price))
    await this.newProductDescription.fill(description)
    await this.addButton.click()
  }

  async deleteProductByName(name: string) {
    await this.itemByName(name).getByTestId('delete-product').click()
  }

  async logout() {
    await this.logoutButton.click()
  }

  /**
   * Mobile only: reveal the top-bar actions tucked behind the ☰ button.
   * Uses a touch tap (requires a hasTouch context, e.g. the mobile project).
   */
  async openMobileMenu() {
    await this.menuToggle.tap()
  }
}
