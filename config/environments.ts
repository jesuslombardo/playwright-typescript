export const environments = {
  sauceDemo: {
    baseURL: 'https://www.saucedemo.com',
  },
} as const

export const testUsers = {
  standard: {
    username: 'standard_user',
    password: 'secret_sauce',
  },
  lockedOut: {
    username: 'locked_out_user',
    password: 'secret_sauce',
  },
} as const
