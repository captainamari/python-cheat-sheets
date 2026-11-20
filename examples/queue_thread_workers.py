from queue import Queue
from threading import Thread
queue = Queue(maxsize=2)
stop = object()
results = []
def worker():
    while True:
        item = queue.get()
        try:
            if item is stop: return
            results.append(item * 2)
        finally:
            queue.task_done()
thread = Thread(target=worker)
thread.start()
for item in [1, 2, stop]: queue.put(item)
queue.join()
thread.join()
print(results)
