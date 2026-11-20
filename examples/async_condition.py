import asyncio
async def main():
    condition = asyncio.Condition()
    state = {'ready': False}
    async def produce():
        async with condition:
            state['ready'] = True
            condition.notify_all()
    task = asyncio.create_task(produce())
    async with condition:
        await condition.wait_for(lambda: state['ready'])
        print(state['ready'])
    await task
asyncio.run(main())
