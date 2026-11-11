from pathlib import Path


def menu(choices, title="Nel's Menu", prompt="Choose your item: "):
    print(title)
    print(len(title) * "-")

    i = 1
    for c in choices:
        print(i, c)
        i = i + 1

    while True:
        choice = input(prompt)

        allowed_answers = []
        for a in range(1, len(choices) + 1):
            allowed_answers.append(str(a))

        allowed_answers.append("X")
        allowed_answers.append("x")

        if choice in allowed_answers:
            if choice == "X" or choice == "x":
                answer = ''
                break
            else:
                answer = choices[int(choice) - 1]
                break
        else:
            print("Enter number from 1 to ", len(choices))
            answer = ''
    return answer

def read_menu(filename):
    # Locate menu files beside this script, regardless of the working folder.
    file_path = Path(__file__).resolve().parent / filename
    with open(file_path, encoding="utf-8") as f:
        return [line.strip() for line in f if line.strip()]

drinks = read_menu("drinks.txt")
print(drinks)
flavors = read_menu("flavors.txt")
print(flavors)
toppings = read_menu("toppings.txt")
print(toppings)

drink = menu(drinks, "Nel's drinks", "Choose your drink: ")
flavor = menu(flavors, "Nel's flavors", "Choose your flavor: ")
topping = menu(toppings, "Nel's toppings", "Choose your topping: ")

print("Here is your order:")
print("Main product: ", drink)
print("Flavor: ", flavor)
print("Toppings: ", topping)
print("Thanks for your order!")
