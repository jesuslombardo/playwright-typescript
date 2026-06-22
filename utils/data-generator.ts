export type NewProduct = {
  name: string
  price: number
  description: string
}

/**
 * Builds a unique product so create/delete tests never collide with the seed
 * catalogue or with each other — important under parallel execution.
 */
export function generateProduct(): NewProduct {
  const id = `${Date.now()}-${Math.floor(Math.random() * 1e4)}`

  return {
    name: `QA Widget ${id}`,
    price: 13.37,
    description: 'Created by an automated test',
  }
}
