import asyncio
from contextlib import asynccontextmanager
@asynccontextmanager
async def resource():
    print('open')
    try:
        yield 'handle'
    finally:
        print('close')
async def main():
    try:
        async with resource() as handle:
            print(handle)
            raise ValueError('failed')
    except ValueError:
        print('caught')
asyncio.run(main())
