import { Locator, Page } from '@playwright/test'
import { Product } from '../data/product.factory'
import { HeaderComponent } from '../components/header.component'
import { BasePage } from './base.page'

/**
 * The catalogue page of demo-shop-app. Since app v2.0.0 it adapts to the
 * signed-in user's ROLE:
 *   - customer → STOREFRONT: each card has a quantity + "Add to cart".
 *   - admin    → MANAGEMENT: an "Add product" form + Edit/Remove per card.
 * Reads are public, so the product cards (`inventory-item`) render for both;
 * only the actions differ. This page object exposes both sets — a spec uses the
 * slice that matches the role it logged in as. Extends BasePage for `page` +
 * `goto()`; composes HeaderComponent for the shared topbar (`page.header`).
 */
export class ProductsPage extends BasePage {
  protected readonly path = '/products.html'
  readonly header: HeaderComponent
  readonly title: Locator
  readonly items: Locator
  // Customer storefront.
  readonly shopHint: Locator
  // Admin management: create form.
  readonly adminTools: Locator
  readonly newProductName: Locator
  readonly newProductPrice: Locator
  readonly newProductDescription: Locator
  readonly addButton: Locator
  readonly addError: Locator
  // Admin management: inline-edit controls. Only one card is ever in edit mode at
  // a time, so these page-level test ids resolve to that single open editor — no
  // per-card scoping needed (and the card loses its name as TEXT once its fields
  // become inputs, which is why we don't try to re-find it by name mid-edit).
  readonly editName: Locator
  readonly editPrice: Locator
  readonly editDescription: Locator
  readonly saveButton: Locator
  readonly cancelButton: Locator
  readonly editError: Locator

  constructor(page: Page) {
    super(page)
    this.header = new HeaderComponent(page)
    this.title = page.getByTestId('title')
    this.items = page.getByTestId('inventory-item')
    this.shopHint = page.getByTestId('shop-hint')
    this.adminTools = page.getByTestId('admin-tools')
    this.newProductName = page.getByTestId('new-product-name')
    this.newProductPrice = page.getByTestId('new-product-price')
    this.newProductDescription = page.getByTestId('new-product-description')
    this.addButton = page.getByTestId('add-product-button')
    this.addError = page.getByTestId('add-error')
    this.editName = page.getByTestId('edit-product-name')
    this.editPrice = page.getByTestId('edit-product-price')
    this.editDescription = page.getByTestId('edit-product-description')
    this.saveButton = page.getByTestId('save-product')
    this.cancelButton = page.getByTestId('cancel-edit')
    this.editError = page.getByTestId('edit-error')
  }

  /** A single product card located by its (unique) name. */
  itemByName(name: string): Locator {
    return this.items.filter({ hasText: name })
  }

  /** The price label of a card, for asserting the rendered (formatted) value. */
  priceOf(name: string): Locator {
    return this.itemByName(name).getByTestId('inventory-item-price')
  }

  /* ----- customer storefront ----- */

  /** Add `qty` of the named product to the cart from its storefront card. */
  async addToCartByName(name: string, qty = 1) {
    const card = this.itemByName(name)
    if (qty !== 1) await card.getByTestId('add-quantity').fill(String(qty))
    await card.getByTestId('add-to-cart').click()
  }

  /* ----- admin management ----- */

  async addProduct({ name, price, description }: Product) {
    await this.newProductName.fill(name)
    await this.newProductPrice.fill(String(price))
    await this.newProductDescription.fill(description)
    await this.addButton.click()
  }

  async deleteProductByName(name: string) {
    await this.itemByName(name).getByTestId('delete-product').click()
  }

  /** Open the inline editor on the card with this (unique) name. */
  async startEditByName(name: string) {
    await this.itemByName(name).getByTestId('edit-product').click()
  }

  /**
   * Edit a product inline: open its editor, overwrite only the supplied fields
   * (the form is pre-filled, so passing a partial mirrors PUT's partial body),
   * and save. On success the card re-renders with the new values.
   */
  async editProductByName(name: string, updates: Partial<Product>) {
    await this.startEditByName(name)
    if (updates.name !== undefined) await this.editName.fill(updates.name)
    if (updates.price !== undefined) await this.editPrice.fill(String(updates.price))
    if (updates.description !== undefined) await this.editDescription.fill(updates.description)
    await this.saveButton.click()
  }
}
