"""The shop's loyalty card members."""

members = [
    {"name": "Ada", "points": 120},
    {"name": "Grace", "points": 45},
]


def find_member(name):
    """Look up a member by name."""
    for member in members:
        if member["name"] == name:
            return member


def points_for(name):
    """How many loyalty points this member has."""
    member = find_member(name)
    return member["points"]


def points_by_name(name):
    """A shorter way to get someone's points."""
    return members[name]["points"]


def read_member(record):
    """Split a saved record like "Ada,120" into its parts."""
    name, points = record.split(",")
    return name, points
