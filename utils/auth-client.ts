/**
 * Minimal auth client — how a CONSUMER talks to auth-service's POST /api/login.
 * Mirrors the vanilla UI's login.js: POST JSON credentials, read back the token.
 *
 * Used both by the Pact consumer test (against a Pact mock) and as the shape the
 * real consumer relies on — so the contract describes genuine client behaviour,
 * not a throwaway fetch.
 */
export interface LoginResponse {
  status: number
  token?: string
  username?: string
  error?: string
}

export async function login(
  baseUrl: string,
  username: string,
  password: string,
): Promise<LoginResponse> {
  const res = await fetch(`${baseUrl}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  const data = (await res.json().catch(() => ({}))) as Omit<LoginResponse, 'status'>
  return { status: res.status, ...data }
}
