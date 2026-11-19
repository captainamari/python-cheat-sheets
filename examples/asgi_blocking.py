import asyncio

def blocking_library(value):
    # Represents a synchronous library boundary; no network is required.
    return value.strip().upper()

async def main():
    result = await asyncio.to_thread(blocking_library, " python ")
    print(result)
    print("awaited")

asyncio.run(main())
