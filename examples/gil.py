from concurrent.futures import ThreadPoolExecutor

def normalize(name):
    return name.strip().upper()

with ThreadPoolExecutor(max_workers=2) as pool:
    results = list(pool.map(normalize, [" py ", " test "]))
print(results)
print("pool closed")
