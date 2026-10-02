"""The customer's basket: a list of (item, quantity) pairs."""

items_sold = 0


def add_item(basket, item, quantity):
    """Put some of one item in the basket."""
    basket.append((item, quantity))
    return basket


def add_one_of_each(basket, items):
    """Put one of every item in the basket."""
    for item in items:
        basket = basket.append((item, 1))
    return basket


def add_free_gift(basket):
    """Every customer gets a small gift."""
    gifts = ["sticker", "balloon"]
    gifts.push("lollipop")
    basket.append((gifts[0], 1))
    return basket


def record_sale(quantity):
    """Keep a running count of everything sold today."""
    items_sold = items_sold + quantity
    return items_sold
