// Web Shop checkout: more practice TypeScript mistakes.
// Nothing to run here. Open this file and try the squiggles:
// hover, the lightbulb, or Ctrl+Alt+E.

interface Order {
  id: number;
  item: string;
  quantity: number;
}

const taxRate = 0.2;
taxRate = 0.25;

let shipping = 4.99;
let shipping = 2.99;

function discountFor(quantity: number): number {
  if (quantity >= 10) {
    return 0.1;
  }
}

function lineTotal(price, quantity) {
  return price * quantity;
}

const firstOrder: Order = { id: 1, item: 'eggs' };

function orderLabel(order: Order): string {
  return order.item;
  console.log('Label made');
}

function isBigOrder(order: Order): boolean {
  return order.quantity > '10';
}

console.log(taxRate, shipping, discountFor(12), lineTotal(2, 3), firstOrder, orderLabel(firstOrder), isBigOrder(firstOrder));
