import random
left = random.Random(7)
right = random.Random(7)
print([left.randrange(100) for _ in range(4)] == [right.randrange(100) for _ in range(4)])
state = left.getstate()
value = left.random()
left.setstate(state)
print(left.random() == value)
print(0 <= value < 1)
