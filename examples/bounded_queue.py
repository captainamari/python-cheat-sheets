import asyncio
async def main():
    queue = asyncio.Queue(maxsize=1)
    await queue.put('job')
    print(queue.full())
    item = await queue.get()
    try:
        print(item)
    finally:
        queue.task_done()
    await queue.join()
    print(queue.empty())
asyncio.run(main())
