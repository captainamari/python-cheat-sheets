rows = [('a', 2), ('b', 1), ('c', 2)]
result = sorted(rows, key=lambda row: row[1])
print([name for name, _ in result])
print(rows.sort(key=lambda row: row[1]))
print([name for name, _ in rows])
