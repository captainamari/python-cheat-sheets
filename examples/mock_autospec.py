from unittest.mock import create_autospec
def fetch(key, *, timeout): return key
mock = create_autospec(fetch, return_value='ok')
print(mock('x', timeout=2))
try:
    mock('x', 2)
except TypeError:
    print('signature rejected')
