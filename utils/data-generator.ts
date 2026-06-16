export type CheckoutCustomer = {
  firstName: string
  lastName: string
  postalCode: string
}

export function generateCheckoutCustomer(): CheckoutCustomer {
  const id = Date.now().toString().slice(-6)

  return {
    firstName: `Test${id}`,
    lastName: 'User',
    postalCode: '12345',
  }
}
