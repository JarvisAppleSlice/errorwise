// Web Shop: practice JavaScript mistakes. Every scenario hits one mistake.
//
//   node web_shop/orders.js        lists the scenarios
//   node web_shop/orders.js 2      runs scenario 2 and shows its error
//
// Select the error in the terminal, right-click, and pick
// "Errorwise: Explain this error".

const prices = { apples: 0.5, bread: 2.25, eggs: 0.3 };

const orders = [
  { id: 1, customer: { name: 'Ada' }, items: ['eggs', 'bread'] },
  { id: 2, items: ['apples'] },
];

function orderTotal(order) {
  let total = 0;
  for (const item of order.items) {
    total = total + prices[item];
  }
  return totl;
}

function customerName(order) {
  return order.customer.name;
}

function itemCount(order) {
  return order.items.size();
}

function daysUntilDelivery(days) {
  return 1 + daysUntilDelivery(days - 1);
}

function loadDiscounts() {
  return require('./discounts');
}

function addShipping(order) {
  const total = 10;
  total = total + 4.99;
  return total;
}

const scenarios = [
  ['Add up the first order', () => orderTotal(orders[0])],
  ['Show who placed the second order', () => customerName(orders[1])],
  ['Count the items in the first order', () => itemCount(orders[0])],
  ['Count the days until a delivery', () => daysUntilDelivery(3)],
  ['Load the discount codes', () => loadDiscounts()],
  ['Add shipping to an order', () => addShipping(orders[0])],
];

const choice = process.argv[2];
if (!choice) {
  console.log('Web Shop practice project. Every scenario hits one mistake.\n');
  scenarios.forEach(([title], i) => console.log(`  ${i + 1}. ${title}`));
  console.log('\nRun one with:  node web_shop/orders.js 2');
} else {
  console.log(scenarios[Number(choice) - 1][1]());
}
