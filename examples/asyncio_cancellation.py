import asyncio

async def main():
    ready = asyncio.Event()
    async def worker():
        try:
            ready.set()
            await asyncio.Event().wait()
        finally:
            print("cleaned")
    async with asyncio.TaskGroup() as group:
        task = group.create_task(worker())
        await ready.wait()
        task.cancel()
    print("group finished")

asyncio.run(main())
