import asyncio
async def rows():
    for value in range(3):
        yield value
async def main():
    result = []
    async for value in rows():
        result.append(value * 2)
    print(result)
asyncio.run(main())
