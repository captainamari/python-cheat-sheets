import asyncio
async def main():
    release = asyncio.Event()
    started = asyncio.Event()
    async def work():
        started.set()
        await release.wait()
        return 'done'
    task = asyncio.create_task(work())
    protected = asyncio.shield(task)
    await started.wait()
    protected.cancel()
    try:
        await protected
    except asyncio.CancelledError:
        print('outer cancelled')
    print(task.cancelled())
    release.set()
    print(await task)
asyncio.run(main())
