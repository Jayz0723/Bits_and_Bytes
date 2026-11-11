import json
from pathlib import Path


DATA_FOLDER = Path(__file__).resolve().parent
ORDERS_FILE = DATA_FOLDER / "orders.json"


def main_menu(orders):
    while True:
        print("\nNel's Coffee Shop")
        print("1. Place an order")
        print("2. Check saved orders")
        print("3. Exit")
        choice = input("Choose an option: ").strip()

        if choice == "1":
            order = get_order()
            print("\nCheck your order:")
            print_order(order)
            confirm = input("Confirm? Press Y to save, N to cancel: ").strip().lower()
            if confirm == "y":
                try:
                    # Reload the saved list before adding the latest order.
                    saved_orders = load_orders(ORDERS_FILE)
                    saved_orders.append(order)
                    save_orders(saved_orders, ORDERS_FILE)
                except (OSError, ValueError) as error:
                    print(f"Your order could not be saved: {error}")
                else:
                    orders[:] = saved_orders
                    print(f"Order saved to {ORDERS_FILE}")
                    print("Thanks for your order!")
            else:
                print("Order cancelled.")
        elif choice == "2":
            if orders:
                print("\nSaved orders:")
                for number, order in enumerate(orders, start=1):
                    print(f"\nOrder {number}:")
                    print_order(order)
            else:
                print("\nThere are no saved orders yet.")
        elif choice == "3":
            print("Goodbye!")
            break
        else:
            print("Please enter 1, 2, or 3.")

def menu(choices, title="Nel's Menu", prompt="Choose your item: "):
    print(title)
    print(len(title) * "-")

    i = 1
    for c in choices:
        print(i, c)
        i = i + 1

    while True:
        choice = input(prompt).strip()

        allowed_answers = []
        for a in range(1, len(choices) + 1):
            allowed_answers.append(str(a))

        allowed_answers.append("X")
        allowed_answers.append("x")

        if choice in allowed_answers:
            if choice == "X" or choice == "x":
                answer = ""
                break
            else:
                answer = choices[int(choice) - 1]
                break
        else:
            print("Enter number from 1 to ", len(choices))
            answer = ""

    return answer

def read_menu(filename):
    path = DATA_FOLDER / filename
    with path.open(encoding="utf-8") as f:
        return [item.strip() for item in f if item.strip()]

def get_order():
    order = {}
    order["name"] = input("What's your name: ").strip()
    drinks = read_menu("drinks.txt")
    flavors = read_menu("flavors.txt")
    toppings = read_menu("toppings.txt")
    order["drink"] = menu(drinks, "Nel's drinks", "Choose your drink: ")
    order["flavor"] = menu(flavors, "Nel's flavors", "Choose your flavor: ")
    order["topping"] = menu(toppings, "Nel's toppings", "Choose your topping: ")
    return order

def print_order(order):
    print("Here is your order:", order["name"])
    print("Main product: ", order["drink"])
    print("Flavor: ", order["flavor"])
    print("Toppings: ", order["topping"])
    print("Thanks for your order!")
    return

def save_orders(orders, filename):
    path = Path(filename)
    # Finish writing before replacing the saved file, protecting older orders.
    temporary = path.with_suffix(".json.tmp")
    with temporary.open("w", encoding="utf-8") as f:
        json.dump(orders, f, indent=4, ensure_ascii=False)
        f.write("\n")
    temporary.replace(path)

def load_orders(filename):
    path = Path(filename)
    if path.exists():
        with path.open(encoding="utf-8") as f:
            orders = json.load(f)
        # Do not overwrite an invalid file or crash later while displaying it.
        fields = ("name", "drink", "flavor", "topping")
        if not isinstance(orders, list) or any(
            not isinstance(order, dict)
            or any(not isinstance(order.get(field), str) for field in fields)
            for order in orders
        ):
            raise ValueError("orders.json must contain a list of orders with name, drink, flavor, and topping.")
        return orders
    # Start with an empty list only when no saved file exists yet.
    save_orders([], path)
    return []


if __name__ == "__main__":
    try:
        orders = load_orders(ORDERS_FILE)
    except (OSError, ValueError) as error:
        print(f"Could not load {ORDERS_FILE}: {error}")
        print("Please check the file before running the program again.")
    else:
        main_menu(orders)
