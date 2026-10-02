"""Corner Shop: a small practice project where every scenario hits one mistake.

The mistakes are in the other files in this folder, so each error message
points through more than one file, like in a real project.

    python corner_shop/run.py        lists the scenarios
    python corner_shop/run.py 4      runs scenario 4 and shows its error

Select the error in the terminal, right-click, and pick
"Errorwise: Explain this error".
"""
import sys

import cart
import customers
import inventory
import pricing
import receipts
import reports

BASKET = [("apples", 6), ("bread", 1)]


def receipt_total():
    """Add up the receipt, with tax"""
    print(receipts.total(BASKET))


def receipt_header():
    """Print the first line of the receipt"""
    print(receipts.header(BASKET))


def take_a_delivery():
    """Restock bread with the amount the shopkeeper typed in"""
    typed = "6"
    print(inventory.restock("bread", typed))


def look_up_points():
    """Look up loyalty points for a customer called Linus"""
    print(customers.points_for("Linus"))


def fill_the_basket():
    """Put one of each item in an empty basket"""
    print(cart.add_one_of_each([], ["apples", "eggs", "bread"]))


def cheapest_and_dearest():
    """Find the cheapest and most expensive item"""
    print(pricing.price_range(["apples", "bread", "eggs"]))


def print_the_receipt():
    """Print every line of the receipt"""
    receipts.print_receipt(BASKET)


def member_price():
    """Work out the price for a loyalty card member"""
    print(receipts.member_total(BASKET))


def latest_delivery():
    """Show the day of the most recent delivery"""
    print(inventory.latest_delivery_day())


def check_the_shelf():
    """Check how much milk is on the shelf"""
    print(inventory.how_many("milk"))


def free_gift():
    """Add a free gift to the basket"""
    print(cart.add_free_gift(list(BASKET)))


def draw_a_chart():
    """Draw a chart of today's sales"""
    reports.sales_chart({"apples": 6, "bread": 1})


def average_of_nothing():
    """Work out the average price for a customer who bought nothing"""
    print(pricing.average_price([]))


def typed_quantity():
    """Read a quantity the customer typed as a word"""
    print(pricing.read_quantity("three"))


def price_label():
    """Read a price label written with a comma"""
    print(pricing.read_price("4,50"))


def bulk_order():
    """Work out the bulk discount for 25 items"""
    print(pricing.bulk_discount(25))


def count_the_sale():
    """Add this sale to today's running count"""
    print(cart.record_sale(7))


def last_year():
    """Open last year's sales file"""
    print(reports.last_year_sales())


def numbered_basket():
    """Number each line of the basket"""
    print(reports.number_the_lines(BASKET))


def quick_points():
    """Look up Ada's points the quick way"""
    print(customers.points_by_name("Ada"))


def saved_member():
    """Read a member record that has an extra field"""
    print(customers.read_member("Ada,120,gold"))


SCENARIOS = [
    receipt_total,
    receipt_header,
    take_a_delivery,
    look_up_points,
    fill_the_basket,
    cheapest_and_dearest,
    print_the_receipt,
    member_price,
    latest_delivery,
    check_the_shelf,
    free_gift,
    draw_a_chart,
    average_of_nothing,
    typed_quantity,
    price_label,
    bulk_order,
    count_the_sale,
    last_year,
    numbered_basket,
    quick_points,
    saved_member,
]


def main():
    if len(sys.argv) < 2:
        print("Corner Shop practice project. Every scenario hits one mistake.\n")
        for number, scenario in enumerate(SCENARIOS, start=1):
            print(f"  {number:>2}. {scenario.__doc__}")
        print("\nRun one with:  python corner_shop/run.py 4")
        return
    choice = int(sys.argv[1])
    SCENARIOS[choice - 1]()


main()
