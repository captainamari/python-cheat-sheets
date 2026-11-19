import asyncio
async def main():
    ready = asyncio.Event()
    ready.set()
    ready.set()
    print(await ready.wait())
    ready.clear()
    print(ready.is_set())
asyncio.run(main())
