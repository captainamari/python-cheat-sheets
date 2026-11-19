def collect(value, bucket=[]):
    bucket.append(value)
    return bucket

first = collect("a")
second = collect("b")
print(first)
print(first is second)

def isolated(value, bucket=None):
    if bucket is None:
        bucket = []
    bucket.append(value)
    return bucket

print(isolated("a"))
print(isolated("b"))
