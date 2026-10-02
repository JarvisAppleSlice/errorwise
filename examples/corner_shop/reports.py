"""End-of-day reports for the shopkeeper."""


def sales_chart(sales):
    """Draw a bar chart of today's sales."""
    import matplotlb.pyplot as plt

    plt.bar(list(sales.keys()), list(sales.values()))
    plt.show()


def last_year_sales():
    """Read last year's numbers from a file."""
    with open("sales_last_year.csv") as file:
        return file.read()


def number_the_lines(basket):
    """Give every line of the basket a number, starting at 1."""
    numbered = []
    for number in len(basket):
        numbered.append((number + 1, basket[number]))
    return numbered
