"""What the shop has on its shelves, and what each thing costs."""

stock = {"apples": 12, "bread": 4, "eggs": 30}
prices = {"apples": 0.5, "bread": 2.25, "eggs": 0.3}


def how_many(item):
    """How many of this item are on the shelf."""
    return stock[item]


def restock(item, amount):
    """Add a delivery to the shelf and return the new count."""
    stock[item] = stock[item] + amount
    return stock[item]


def latest_delivery_day():
    """The most recent day a delivery arrived."""
    deliveries = ["Monday", "Thursday"]
    return deliveries[len(deliveries)]


def aisle_letter():
    """The first character of the bread aisle's code."""
    aisle = 3
    return aisle[0]
