from collections import Counter
from itertools import product
checked = 0
for size in range(4):
    for values in product(range(3), repeat=size):
        result = sorted(values)
        if Counter(result) != Counter(values):
            raise AssertionError('lost items')
        if any(a > b for a, b in zip(result, result[1:])):
            raise AssertionError('not ordered')
        if sorted(result) != result:
            raise AssertionError('not idempotent')
        checked += 1
print(checked)
print('properties hold')
