import { test, expect } from '@playwright/test'
import path from 'node:path'
import { PactV3, MatchersV3 } from '@pact-foundation/pact'
import { login } from '../../utils/auth-client'

const { like } = MatchersV3

/*
 * CONSUMER-DRIVEN CONTRACT (Pact).
 *
 * The shop web client is the CONSUMER of auth-service's POST /api/login. Here we
 * declare what the consumer NEEDS from that endpoint. Pact spins up a MOCK auth,
 * runs the REAL client (utils/auth-client) against it, and writes
 * pacts/shop-web-auth-service.json. auth-service later VERIFIES it can satisfy
 * this contract (provider side, in the app repo) — so drift breaks the build.
 *
 * Consumer-DRIVEN (the consumer's expectations ARE the contract) — distinct from
 * the schema-based contract tests (Ajv vs OpenAPI, Step 29) which only check the
 * response shape against a spec the provider publishes.
 */
test.describe('@contract auth-service login contract', () => {
  const pact = new PactV3({
    consumer: 'shop-web',
    provider: 'auth-service',
    dir: path.resolve(process.cwd(), 'pacts'),
  })

  test('valid credentials return a token; invalid credentials return 401', async () => {
    pact
      .given('standard_user is a registered user')
      .uponReceiving('a login with valid credentials')
      .withRequest({
        method: 'POST',
        path: '/api/login',
        headers: { 'Content-Type': 'application/json' },
        body: { username: 'standard_user', password: 'secret_sauce' },
      })
      .willRespondWith({
        status: 200,
        body: { token: like('header.payload.signature'), username: like('standard_user') },
      })

    pact
      .uponReceiving('a login with invalid credentials')
      .withRequest({
        method: 'POST',
        path: '/api/login',
        headers: { 'Content-Type': 'application/json' },
        body: { username: 'standard_user', password: 'wrong' },
      })
      .willRespondWith({
        status: 401,
        body: { error: like('Username and password do not match any user in this service') },
      })

    await pact.executeTest(async (mockServer) => {
      const ok = await login(mockServer.url, 'standard_user', 'secret_sauce')
      expect(ok.status).toBe(200)
      expect(ok.username).toBe('standard_user')
      expect(typeof ok.token).toBe('string')

      const bad = await login(mockServer.url, 'standard_user', 'wrong')
      expect(bad.status).toBe(401)
      expect(typeof bad.error).toBe('string')
    })
  })
})
