import asyncio
async def fail():
    raise ValueError('bad input')
async def main():
    try:
        async with asyncio.TaskGroup() as group:
            group.create_task(fail())
    except* ValueError as errors:
        print(len(errors.exceptions))
asyncio.run(main())
