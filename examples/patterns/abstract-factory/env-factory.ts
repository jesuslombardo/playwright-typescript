/*
 * PATTERN — Abstract Factory (creational).  GALLERY (synthetic).
 *
 * Produce a FAMILY of related objects that must stay consistent with each other,
 * without the caller knowing the concrete classes. Here, per environment: a
 * config and a matching user. You pick the factory once and the whole family is
 * guaranteed to belong together — no risk of staging URL + local credentials.
 *
 * Synthetic here: the real repo has a single environment shape
 * (config/environments.ts), so a plain object suffices. Abstract Factory pays
 * off once you have several environments each needing a coherent set of objects.
 */

export type EnvConfig = { baseURL: string; timeoutMs: number }
export type EnvUser = { username: string; password: string }

export interface EnvFactory {
  readonly env: string
  config(): EnvConfig
  user(): EnvUser
}

export class LocalEnvFactory implements EnvFactory {
  readonly env = 'local'
  config(): EnvConfig {
    return { baseURL: 'http://localhost:3000', timeoutMs: 5_000 }
  }
  user(): EnvUser {
    return { username: 'standard_user', password: 'secret_sauce' }
  }
}

export class StagingEnvFactory implements EnvFactory {
  readonly env = 'staging'
  config(): EnvConfig {
    return { baseURL: 'https://staging.demo-shop.example', timeoutMs: 15_000 }
  }
  user(): EnvUser {
    return { username: 'staging_user', password: 'staging_pass' }
  }
}

export function factoryFor(env: string): EnvFactory {
  return env === 'staging' ? new StagingEnvFactory() : new LocalEnvFactory()
}
