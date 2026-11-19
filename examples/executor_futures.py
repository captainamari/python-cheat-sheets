from concurrent.futures import ThreadPoolExecutor
from threading import Event
release = Event()
started = Event()
def work():
    started.set()
    release.wait()
    return 7
with ThreadPoolExecutor(max_workers=1) as pool:
    future = pool.submit(work)
    started.wait()
    print(future.cancel())
    release.set()
    print(future.result())
