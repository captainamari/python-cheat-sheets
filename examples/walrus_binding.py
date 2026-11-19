values = [0, 2, 4]
if (count := len(values)) > 0:
    print(count)
if flag := len(values) > 0:
    print(type(flag).__name__)
print(count, flag)
