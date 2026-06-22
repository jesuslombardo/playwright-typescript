import { Locator, Page } from '@playwright/test'
import { NewProduct } from '../utils/data-generator'

/**
 * The authenticated catalogue page of demo-shop-app: lists products and lets a
 * logged-in user create and delete them.
 */
export class ProductsPage {
  readonly page: Page
  readonly title: Locator
  readonly items: Locator
  readonly logoutButton: Locator
  readonly newProductName: Locator
  readonly newProductPrice: Locator
  readonly newProductDescription: Locator
  readonly addButton: Locator
  readonly addError: Locator

  constructor(page: Page) {
    this.page = page
    this.title = page.getByTestId('title')
    this.items = page.getByTestId('inventory-item')
    this.logoutButton = page.getByTestId('logout')
    this.newProductName = page.getByTestId('new-product-name')
    this.newProductPrice = page.getByTestId('new-product-price')
    this.newProductDescription = page.getByTestId('new-product-description')
    this.addButton = page.getByTestId('add-product-button')
    this.addError = page.getByTestId('add-error')
  }

  async goto() {
    await this.page.goto('/products.html')
  }

  /** A single product card located by its (unique) name. */
  itemByName(name: string): Locator {
    return this.items.filter({ hasText: name })
  }

  async addProduct({ name, price, description }: NewProduct) {
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
}
