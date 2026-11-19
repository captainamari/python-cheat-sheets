def expired(deadline, now):
    return now() >= deadline
clock = [9]
print(expired(10, lambda: clock[0]))
clock[0] = 10
print(expired(10, lambda: clock[0]))
