import asyncio
from threading import Event
async def main():
    release = Event()
    started = asyncio.Event()
    done = asyncio.Event()
    loop = asyncio.get_running_loop()
    def work():
        loop.call_soon_threadsafe(started.set)
        release.wait()
        loop.call_soon_threadsafe(done.set)
    task = asyncio.create_task(asyncio.to_thread(work))
    await started.wait()
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        print('await cancelled')
    print(done.is_set())
    release.set()
    await done.wait()
    print('worker finished')
asyncio.run(main())
