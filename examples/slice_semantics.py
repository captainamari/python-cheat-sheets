values = [0, 1, 2, 3]
alias = values
part = values[1:3]
values[1:3] = [9]
print(alias)
print(part)
print(values is alias)
