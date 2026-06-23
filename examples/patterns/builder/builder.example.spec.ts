import { test, expect } from '@playwright/test'
import { getToken } from '../../../utils/api'
import { ProductBuilder } from './product.builder'

test.describe('Builder — fluent product assembly (gallery)', () => {
  test('build() yields a valid product the API accepts', async ({ request }) => {
    const product = ProductBuilder.aProduct().withPrice(12.5).build()

    const res = await request.post('/api/products', {
      headers: { Authorization: `Bearer ${await getToken(request)}` },
      data: product,
    })

    expect(res.status()).toBe(201)
    expect((await res.json()).price).toBe(12.5)
  })

  test('buildPayload() omits unset fields — readable negative cases', () => {
    const payload = ProductBuilder.aProduct().withName('No Price Widget').buildPayload()
    expect(payload).toEqual({ name: 'No Price Widget' }) // price/description intentionally absent
  })
})
