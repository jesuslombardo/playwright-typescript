import { test, expect } from '../../fixtures/auth.fixture'
import { ProductsPage } from '../../pages/products.page'
import { CartPage } from '../../pages/cart.page'
import { CheckoutPage } from '../../pages/checkout.page'
import { ConfirmationPage } from '../../pages/confirmation.page'
import { buildCustomer } from '../../data/customer.factory'
import { seededProducts } from '../../data/products.dataset'

/*
 * Customer checkout — the headline purchase flow end-to-end:
 *   storefront → cart → checkout → place order → confirmation.
 * The server reprices every line at checkout, so we assert the confirmation's
 * authoritative total matches what the checkout summary displayed.
 */
const { backpack, bikeLight } = seededProducts

test.describe('Checkout (customer)', () => {
  test(
    'placing an order lands on the confirmation',
    { tag: '@smoke' },
    async ({ customerPage }) => {
      const products = new ProductsPage(customerPage)
      const cart = new CartPage(customerPage)
      const checkout = new CheckoutPage(customerPage)
      const confirmation = new ConfirmationPage(customerPage)

      await products.addToCartByName(backpack.name, 2)
      await products.addToCartByName(bikeLight.name, 1)

      await cart.goto()
      await cart.checkout()

      // The summary mirrors the cart; the total is the value the server will agree on.
      await expect(checkout.summaryLines).toHaveCount(2)
      await expect(checkout.summaryTotal).toHaveText('$69.97')
      const summaryTotal = (await checkout.summaryTotal.textContent())!.trim()

      const customer = buildCustomer()
      await checkout.submit(customer)

      await expect(customerPage).toHaveURL(/confirmation\.html\?id=\d+/)
      await expect(confirmation.thankYou).toBeVisible()
      await expect(confirmation.orderNumber).toHaveText(/Order #\d+/)
      await expect(confirmation.items).toHaveCount(2)
      // Server-computed total equals what checkout displayed (lines repriced
      // server-side). The total row reads "Total$69.97", so match on the amount.
      await expect(confirmation.total).toContainText(summaryTotal)
      await expect(confirmation.shipping).toContainText(customer.name)
      await expect(confirmation.shipping).toContainText(customer.address)
    },
  )

  test('placing an order clears the cart', async ({ customerPage }) => {
    const products = new ProductsPage(customerPage)
    const checkout = new CheckoutPage(customerPage)

    await products.addToCartByName(backpack.name, 1)
    await checkout.goto()
    await checkout.submit(buildCustomer())

    // Back on the catalogue the badge is empty again.
    await products.goto()
    await expect(products.cartCount).toHaveText('0')
  })

  test('checkout with an empty cart shows the empty state', async ({ customerPage }) => {
    const checkout = new CheckoutPage(customerPage)
    await checkout.goto()
    await expect(checkout.empty).toBeVisible()

    // KNOWN GAP (app v2.0.0): the shipping form stays visible on an empty cart.
    // checkout.js sets the grid's `hidden` attribute, but `.checkout-grid {
    // display: grid }` (an author rule) overrides the UA `[hidden] { display:none }`,
    // so the form — and "Place order" — render anyway. Documented as actual
    // behaviour (cf. the price-guard gap in products.dataset.ts), not wished away;
    // fix is a one-liner in the app's CSS (`.checkout-grid[hidden]{display:none}`).
    await expect(checkout.placeOrderButton).toBeVisible()
  })
})
