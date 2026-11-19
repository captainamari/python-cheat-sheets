import asyncio
from unittest.mock import AsyncMock
async def main():
    fetch = AsyncMock(return_value='ok')
    pending = fetch('key')
    print(fetch.call_count, fetch.await_count)
    print(await pending)
    print(fetch.await_count)
asyncio.run(main())
