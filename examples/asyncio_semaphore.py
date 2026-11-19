import asyncio
async def main():
    semaphore = asyncio.Semaphore(1)
    print(semaphore.locked())
    async with semaphore:
        print(semaphore.locked())
    print(semaphore.locked())
asyncio.run(main())
