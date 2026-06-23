import { test, expect } from '@playwright/test'
import { Order } from './order.state'

test.describe('State — order workflow (gallery, synthetic)', () => {
  test('legal transitions advance the order', () => {
    const order = new Order()
    expect(order.status).toBe('pending')

    order.pay()
    expect(order.status).toBe('paid')

    order.ship()
    expect(order.status).toBe('shipped')
  })

  test('each state rejects its own illegal moves', () => {
    const order = new Order()
    expect(() => order.ship()).toThrow(/unpaid/) // can't ship before paying

    order.pay()
    expect(() => order.pay()).toThrow(/already paid/) // can't pay twice
  })
})
