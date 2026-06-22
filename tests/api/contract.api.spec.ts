import { test, expect, request as apiRequest, type APIRequestContext } from '@playwright/test'
import Ajv, { type ValidateFunction } from 'ajv'
import { environments, testUsers } from '../../config/environments'

/*
 * Contract layer (@api @contract). Instead of checking behaviour, these tests
 * validate that responses match the provider's PUBLISHED OpenAPI schema — the
 * same Swagger spec served at /api/openapi.json that powers the docs. One
 * source of truth for docs and contract. Catches drift (renamed/retyped/extra
 * fields) that the functional API tests would miss.
 */
const ajv = new Ajv({ strict: false, allErrors: true })

let validateProduct: ValidateFunction
let validateLogin: ValidateFunction

test.beforeAll(async () => {
  const ctx: APIRequestContext = await apiRequest.newContext({
    baseURL: environments.demoShop.baseURL,
  })
  const spec = await (await ctx.get('/api/openapi.json')).json()
  await ctx.dispose()

  validateProduct = ajv.compile(spec.components.schemas.Product)
  validateLogin = ajv.compile(spec.components.schemas.LoginResponse)
})

function assertMatchesSchema(validate: ValidateFunction, payload: unknown) {
  const ok = validate(payload)
  expect(ok, JSON.stringify(validate.errors, null, 2)).toBeTruthy()
}

test.describe('Products contract @api @contract', () => {
  test('every product in the catalogue matches the Product schema', async ({ request }) => {
    const products = await (await request.get('/api/products')).json()
    for (const product of products) assertMatchesSchema(validateProduct, product)
  })

  test('GET /api/products/:id matches the Product schema', async ({ request }) => {
    assertMatchesSchema(validateProduct, await (await request.get('/api/products/1')).json())
  })

  test('the login response matches the LoginResponse schema', async ({ request }) => {
    const res = await request.post('/api/login', {
      data: { username: testUsers.standard.username, password: testUsers.standard.password },
    })
    assertMatchesSchema(validateLogin, await res.json())
  })

  test('a created product matches the Product schema', async ({ request }) => {
    const login = await request.post('/api/login', {
      data: { username: testUsers.standard.username, password: testUsers.standard.password },
    })
    const headers = { Authorization: `Bearer ${(await login.json()).token}` }

    const created = await request.post('/api/products', {
      headers,
      data: { name: 'Contract Widget', price: 1.23, description: 'shape check' },
    })
    const body = await created.json()
    assertMatchesSchema(validateProduct, body)

    await request.delete(`/api/products/${body.id}`, { headers }) // cleanup
  })
})
