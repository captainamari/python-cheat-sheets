import tracemalloc
tracemalloc.start()
before, _ = tracemalloc.get_traced_memory()
blocks = [bytearray(1024) for _ in range(20)]
after, peak = tracemalloc.get_traced_memory()
print(after > before)
print(peak >= after)
tracemalloc.stop()
