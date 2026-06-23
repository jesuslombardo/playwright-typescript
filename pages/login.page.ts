import { Locator, Page } from '@playwright/test'
import { BasePage } from './base.page'

/** The login screen of demo-shop-app. Extends BasePage for `page` + `goto()`. */
export class LoginPage extends BasePage {
  protected readonly path = '/'
  readonly usernameInput: Locator
  readonly passwordInput: Locator
  readonly loginButton: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    super(page)
    this.usernameInput = page.getByTestId('username')
    this.passwordInput = page.getByTestId('password')
    this.loginButton = page.getByTestId('login-button')
    this.errorMessage = page.getByTestId('error')
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username)
    await this.passwordInput.fill(password)
    await this.loginButton.click()
  }
}
