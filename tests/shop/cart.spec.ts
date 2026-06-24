import { test, expect } from '../../fixtures/auth.fixture'
import { ProductsPage } from '../../pages/products.page'
import { CartPage } from '../../pages/cart.page'
import { seededProducts } from '../../data/products.dataset'

/*
 * Customer shopping — the CART (client-side, localStorage). Covers the storefront
 * "Add to cart" path, the live topbar badge, and editing the cart (quantity +
 * remove). The cart is per-browser-context, so each test starts empty.
 */
const { backpack, bikeLight } = seededProducts

test.describe('Cart (customer)', () => {
  test('an empty cart shows the empty state', async ({ customerPage }) => {
    const cart = new CartPage(customerPage)
    await cart.goto()
    await expect(cart.empty).toBeVisible()
    await expect(cart.items).toHaveCount(0)
  })

  test('adding products updates the live badge', { tag: '@smoke' }, async ({ customerPage }) => {
    const products = new ProductsPage(customerPage)
    await expect(products.header.cartCount).toHaveText('0')

    await products.addToCartByName(backpack.name, 2)
    await expect(products.header.cartCount).toHaveText('2')

    await products.addToCartByName(bikeLight.name, 1)
    await expect(products.header.cartCount).toHaveText('3')
  })

  test('the cart lists lines with correct line totals and subtotal', async ({ customerPage }) => {
    const products = new ProductsPage(customerPage)
    const cart = new CartPage(customerPage)

    await products.addToCartByName(backpack.name, 2)
    await products.addToCartByName(bikeLight.name, 1)

    await cart.goto()
    await expect(cart.items).toHaveCount(2)
    await expect(cart.lineByName(backpack.name).getByTestId('cart-line-total')).toHaveText('$59.98')
    await expect(cart.lineByName(bikeLight.name).getByTestId('cart-line-total')).toHaveText('$9.99')
    // 2 × 29.99 + 1 × 9.99
    await expect(cart.subtotal).toHaveText('$69.97')
  })

  test('changing a quantity and removing a line update the subtotal', async ({ customerPage }) => {
    const products = new ProductsPage(customerPage)
    const cart = new CartPage(customerPage)

    await products.addToCartByName(backpack.name, 2)
    await products.addToCartByName(bikeLight.name, 1)
    await cart.goto()

    await cart.setQtyByName(backpack.name, 1)
    await expect(cart.subtotal).toHaveText('$39.98') // 29.99 + 9.99

    await cart.removeByName(bikeLight.name)
    await expect(cart.items).toHaveCount(1)
    await expect(cart.subtotal).toHaveText('$29.99')
  })
})
