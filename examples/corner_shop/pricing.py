"""Working out what things cost."""
import inventory


def price_of(item):
    """The price of one of this item."""
    return inventory.prices[item]


def apply_discount(price, percent):
    """Take a percentage off a price."""
    return price - price * percent / 100


def average_price(basket):
    """The average cost of the things in the basket."""
    total = 0
    for item, quantity in basket:
        total = total + price_of(item) * quantity
    return total / len(basket)


def read_quantity(text):
    """Turn what the customer typed into a whole number."""
    return int(text)


def read_price(text):
    """Turn a price label into a number."""
    return float(text)


def price_range(items):
    """The cheapest and the most expensive price among these items."""
    max = 100
    values = [price_of(item) for item in items]
    return min(values), max(values)


def change_due(paid, cost):
    """How much money to hand back to the customer."""
    return paid - cost


def bulk_discount(quantity):
    """One percent off for every ten items bought."""
    if quantity == 0:
        return 0
    return 1 + bulk_discount(quantity - 10)
