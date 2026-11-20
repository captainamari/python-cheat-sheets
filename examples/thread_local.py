from threading import local
from concurrent.futures import ThreadPoolExecutor
state = local()
def first():
    state.request = 'old'
def second():
    return getattr(state, 'request', 'missing')
with ThreadPoolExecutor(max_workers=1) as pool:
    pool.submit(first).result()
    print(pool.submit(second).result())
