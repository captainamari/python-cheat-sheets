def limit(value=None):
    return 20 if value is None else value
print(0 or 20)
print(limit(0), limit())
print([] or ['fallback'])
