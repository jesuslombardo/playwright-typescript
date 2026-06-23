import { test, expect } from '@playwright/test'
import { ProductGateway, RestProductGateway, LegacyProductGateway } from './product-gateway'

test.describe('Adapter — one interface over different sources (gallery)', () => {
  test('REST and legacy sources are interchangeable behind ProductGateway', async ({ request }) => {
    const gateways: ProductGateway[] = [
      new RestProductGateway(request), // real SUT
      new LegacyProductGateway(), // synthetic legacy SDK
    ]

    for (const gateway of gateways) {
      const names = await gateway.fetchNames()
      expect(Array.isArray(names)).toBe(true)
      expect(names.length).toBeGreaterThan(0)
      expect(typeof names[0]).toBe('string')
    }
  })
})
