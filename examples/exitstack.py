from contextlib import ExitStack
events = []
with ExitStack() as stack:
    stack.callback(events.append, 'first')
    stack.callback(events.append, 'second')
    print(events)
print(events)
