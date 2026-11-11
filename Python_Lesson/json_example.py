#JSON(JavaScript Object Notation)

import json

order = {"name": "Nel", "drink": "toffee", "flavor": "caramel", "topping": "chocolate"}

order1 = {
    "name": "Nel",
    "drink": "Toffee",
    "flavor": "Vanilla",
    "topping": "Caramel"
    }

orders = []

orders.append(order)
orders.append(order1)

#file.py
#coffeeshop.py
#json_example.py (avoid naming a script json.py, which hides Python's JSON module)
#3 text file

#
if __name__ == "__main__":
    # Display these practice orders without replacing actual customer orders.
    print(json.dumps(orders, indent=4))
