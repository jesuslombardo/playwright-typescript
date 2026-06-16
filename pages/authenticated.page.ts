import { Page } from '@playwright/test'
import { HeaderComponent } from '../components/header.component'

export class AuthenticatedPage {
  readonly page: Page
  readonly header: HeaderComponent

  constructor(page: Page) {
    this.page = page
    this.header = new HeaderComponent(page)
  }
}
