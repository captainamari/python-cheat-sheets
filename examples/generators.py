def squares(limit):
    for value in range(limit):
        yield value * value

stream = squares(3)
print(iter(stream) is stream)
print(list(stream))
print(list(stream))
print(list(squares(3)))
