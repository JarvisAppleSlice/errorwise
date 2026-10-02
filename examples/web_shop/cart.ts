// Web Shop: practice TypeScript mistakes.
// Nothing to run here. Open this file and try the red squiggles:
// hover, the lightbulb, or Ctrl+Alt+E.

import { codes } from './discounts';

interface CartItem {
  name: string;
  price: number;
  quantity: number;
}

const cart: CartItem[] = [
  { name: 'apples', price: 0.5, quantity: 6 },
  { name: 'bread', price: 2.25, quantity: 1 },
];

function lineTotal(price: number, quantity: number): number {
  return price * quantity;
}

function cartTotal(items: CartItem[]): number {
  let total = 0;
  for (const item of items) {
    total = total + lineTotal(item.price, item.quantity);
  }
  return totl;
}

function itemCount(items: CartItem[]): number {
  return items.lenght;
}

function priceOf(name: string): number {
  const found = cart.find((item) => item.name === name);
  return found.price;
}

const shipping: number = '4.99';

const applesCost = lineTotal('0.5', 6);

const breadCost = lineTotal(2.25);

console.log(cartTotal(cart), itemCount(cart), priceOf('eggs'), shipping, applesCost, breadCost, codes);
