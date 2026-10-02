"""Stock report: every function here has one mistake that gets a squiggle.

Nothing to run. Open this file and try the squiggles:
hover, the lightbulb, or Ctrl+Alt+E.
"""


def count_boxes():
    boxes = 5
    for box in boxes:
        print(box)


def first_digit():
    price = 250
    return price[0]


def read_member():
    name, points = ("Ada", 120, "gold")
    return name, points


def is_adult():
    age = input("How old are you? ")
    return age >= 18


def change_due():
    paid = input("How much did you pay? ")
    return paid - 4


def points_for_ada():
    members = [{"name": "Ada", "points": 120}]
    return members["Ada"]


def shelf_label():
    label = "Bread"
    label[0] = "b"
    return label


def restock_message(amount):
    return "Restocked"
    print("Added", amount)
