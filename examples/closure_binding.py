late = [lambda: i for i in range(3)]
early = [lambda i=i: i for i in range(3)]
print([fn() for fn in late])
print([fn() for fn in early])

def counter():
    count = 0
    def next_value():
        nonlocal count
        count += 1
        return count
    return next_value

next_value = counter()
print(next_value(), next_value())
