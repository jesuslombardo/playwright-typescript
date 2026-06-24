import { test, expect } from '../../fixtures/auth.fixture'
import { OrdersPage } from '../../pages/orders.page'
import { ConfirmationPage } from '../../pages/confirmation.page'
import { getToken } from '../../utils/api'
import { testUsers } from '../../config/environments'
import { buildCustomer } from '../../data/customer.factory'

/*
 * Customer order history. "Set up via API, assert via UI": place an order with
 * one fast customer-authenticated API call, then verify it shows in My orders
 * and opens its detail. Keyed by the returned order id, so it stays correct even
 * as other specs place their own orders against the shared in-memory DB.
 */
test.describe('Orders (customer)', () => {
  test('a placed order appears in My orders and opens its detail', async ({
    customerPage,
    request,
  }) => {
    // productId 1 is the seeded backpack; the server computes the authoritative total.
    const token = await getToken(request, testUsers.standard)
    const res = await request.post('/api/orders', {
      headers: { Authorization: `Bearer ${token}` },
      data: { items: [{ productId: 1, quantity: 2 }], customer: buildCustomer() },
    })
    expect(res.status()).toBe(201)
    const order = await res.json()

    const orders = new OrdersPage(customerPage)
    await orders.goto()

    await expect(orders.rowForOrder(order.id)).toBeVisible()
    await expect(orders.totalForOrder(order.id)).toHaveText(`$${order.total.toFixed(2)}`)

    await orders.openOrder(order.id)

    const confirmation = new ConfirmationPage(customerPage)
    await expect(confirmation.orderNumber).toHaveText(`Order #${order.id}`)
    // The total row reads "Total$59.98", so match on the amount.
    await expect(confirmation.total).toContainText(`$${order.total.toFixed(2)}`)
  })
})
