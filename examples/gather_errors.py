import asyncio
async def value(): return 3
async def fail(): raise ValueError('bad')
async def main():
    results = await asyncio.gather(value(), fail(), return_exceptions=True)
    print(results[0])
    print(type(results[1]).__name__)
asyncio.run(main())
