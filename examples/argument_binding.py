import inspect
def send(payload, /, *, timeout=3):
    return payload, timeout
bound = inspect.signature(send).bind('ok', timeout=5)
print(bound.arguments)
print(send('ok', timeout=5))
