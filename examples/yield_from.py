def child():
    yield 'item'
    return 7
def parent():
    total = yield from child()
    yield f'total:{total}'
print(list(parent()))
