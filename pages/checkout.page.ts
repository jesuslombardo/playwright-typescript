import { Locator, Page } from '@playwright/test'
import { CheckoutCustomer } from '../utils/data-generator'
import { AuthenticatedPage } from './authenticated.page'

export class CheckoutPage extends AuthenticatedPage {
  readonly firstNameInput: Locator
  readonly lastNameInput: Locator
  readonly postalCodeInput: Locator
  readonly continueButton: Locator
  readonly finishButton: Locator
  readonly completeHeader: Locator

  constructor(page: Page) {
    super(page)
    this.firstNameInput = page.getByTestId('firstName')
    this.lastNameInput = page.getByTestId('lastName')
    this.postalCodeInput = page.getByTestId('postalCode')
    this.continueButton = page.getByTestId('continue')
    this.finishButton = page.getByTestId('finish')
    this.completeHeader = page.getByTestId('complete-header')
  }

  async fillShippingInfo(customer: CheckoutCustomer) {
    await this.firstNameInput.fill(customer.firstName)
    await this.lastNameInput.fill(customer.lastName)
    await this.postalCodeInput.fill(customer.postalCode)
  }

  async continueToOverview() {
    await this.continueButton.click()
  }

  async finishOrder() {
    await this.finishButton.click()
  }
}
