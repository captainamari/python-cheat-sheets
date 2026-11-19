from functools import lru_cache
@lru_cache(maxsize=2)
def values(key):
    return [key]
a = values('x')
a.append('changed')
print(values('x'))
print(values.cache_info().hits)
values.cache_clear()
print(values('x'))
