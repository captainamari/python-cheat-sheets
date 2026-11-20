def accumulator():
    total = 0
    while True:
        value = yield total
        total += value
generator = accumulator()
print(next(generator))
print(generator.send(3))
print(generator.send(2))
generator.close()
