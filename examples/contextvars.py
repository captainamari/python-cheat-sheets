import asyncio
from contextvars import ContextVar
request = ContextVar('request', default='none')
async def read(): return request.get()
async def main():
    token = request.set('first')
    try:
        task = asyncio.create_task(read())
        request.set('second')
        print(await task)
        print(request.get())
    finally:
        request.reset(token)
    print(request.get())
asyncio.run(main())
