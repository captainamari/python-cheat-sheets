from concurrent.futures import ThreadPoolExecutor
from threading import Lock
lock = Lock()
state = {'count': 0}
def increment(_):
    with lock:
        state['count'] += 1
with ThreadPoolExecutor(max_workers=4) as pool:
    list(pool.map(increment, range(100)))
print(state['count'])
