/*
 * PATTERN — State (behavioural).  GALLERY (synthetic).
 *
 * The SUT's product CRUD has no rich lifecycle, so plain assertions cover its
 * edges (see tests/api/product-lifecycle.api.spec.ts) — the full State pattern
 * there would be over-engineering. State EARNS its place when an entity's legal
 * operations depend on its current status and transitions have rules.
 *
 * Here: a shop order (pending → paid → shipped). Each state is its own class
 * that knows ONLY its legal moves; adding a state (e.g. "refunded") doesn't
 * touch the others — Open/Closed in action. The Order delegates to its current
 * state instead of branching on a status string everywhere.
 */

export interface OrderState {
  readonly name: string
  pay(order: Order): void
  ship(order: Order): void
}

export class Order {
  private state: OrderState = new PendingState()

  get status(): string {
    return this.state.name
  }

  setState(state: OrderState): void {
    this.state = state
  }

  pay(): void {
    this.state.pay(this)
  }

  ship(): void {
    this.state.ship(this)
  }
}

class PendingState implements OrderState {
  readonly name = 'pending'
  pay(order: Order): void {
    order.setState(new PaidState())
  }
  ship(): void {
    throw new Error('cannot ship an unpaid order')
  }
}

class PaidState implements OrderState {
  readonly name = 'paid'
  pay(): void {
    throw new Error('order already paid')
  }
  ship(order: Order): void {
    order.setState(new ShippedState())
  }
}

class ShippedState implements OrderState {
  readonly name = 'shipped'
  pay(): void {
    throw new Error('order already shipped')
  }
  ship(): void {
    throw new Error('order already shipped')
  }
}
