data = {'b': 1, 'a': 2}
data['b'] = 3
print(list(data))
del data['b']
data['b'] = 4
print(list(data))
print(sorted(data))
