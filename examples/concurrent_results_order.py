from concurrent.futures import ThreadPoolExecutor, as_completed
from threading import Event
release = Event()
def slow():
    release.wait()
    return 'slow'
with ThreadPoolExecutor(max_workers=2) as pool:
    first = pool.submit(slow)
    second = pool.submit(str, 'fast')
    second.result()
    ready = as_completed([first, second])
    print(next(ready).result())
    release.set()
    print(next(ready).result())
