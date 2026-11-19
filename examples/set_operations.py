values = ['b', 'a', 'b']
print(sorted(set(values)))
print(list(dict.fromkeys(values)))
print(sorted({1, 2} ^ {2, 3}))
