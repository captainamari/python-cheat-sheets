import asyncio
async def main():
    try:
        async with asyncio.timeout(0):
            await asyncio.sleep(0)
    except TimeoutError:
        print('timed out')
asyncio.run(main())
