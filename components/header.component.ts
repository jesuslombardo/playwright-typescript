import { Page } from '@playwright/test'

export class HeaderComponent {
  constructor(private readonly page: Page) {}

  async openMenu() {
    await this.page.getByRole('button', { name: 'Open Menu' }).click()
  }

  async logout() {
    await this.openMenu()
    await this.page.getByRole('link', { name: 'Logout' }).click()
  }
}
