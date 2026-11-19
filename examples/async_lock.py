import asyncio
async def main():
    lock = asyncio.Lock()
    state = {'count': 0}
    async def increment():
        async with lock:
            old = state['count']
            await asyncio.sleep(0)
            state['count'] = old + 1
    await asyncio.gather(increment(), increment())
    print(state['count'])
asyncio.run(main())
