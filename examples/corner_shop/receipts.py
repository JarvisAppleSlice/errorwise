"""Printing what the customer owes."""
import pricing


def line(item, quantity):
    """One line of the receipt."""
    cost = pricing.price_of(item) * quantity
    return f"{quantity} x {item}: {cost:.2f}"


def shop_name():
    """The shop's name, with a capital letter at the start."""
    name = "corner shop"
    name[0] = "C"
    return name


def header(basket):
    """The first line of the receipt."""
    count = len(basket)
    return "Items in your basket: " + count


def total(basket):
    """Everything in the basket, plus tax."""
    subtotal = 0
    for item, quantity in basket:
        subtotal = subtotal + pricing.price_of(item) * quantity
    tax = subtotl * 0.2
    return subtotal + tax


def member_total(basket):
    """Members get ten percent off."""
    subtotal = 0
    for item, quantity in basket:
        subtotal = subtotal + pricing.price_of(item) * quantity
    return pricing.apply_discount(subtotal)


def print_receipt(basket):
    """Print every line of the receipt."""
    for item, quantity in basket:
        print(line(item, quantity, pricing.price_of(item)))
