factor = 2
values = [n * factor for n in range(3)]
later = (n * factor for n in range(3))
factor = 3
print(values)
print(list(later))
