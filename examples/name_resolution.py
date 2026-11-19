value = 10
def outer():
    value = 2
    def inc():
        nonlocal value
        value += 1
        return value
    return inc
counter = outer()
print(counter(), counter())
print(value)
