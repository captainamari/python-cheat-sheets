def change(values):
    values.append(2)
    values = [99]
    return values

items = [1]
alias = items
result = change(items)
print(items)
print(result)
print(alias is items)
print(result is items)
