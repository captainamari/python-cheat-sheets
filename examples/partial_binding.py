from functools import partial
def label(value, *, prefix='item'):
    return f'{prefix}:{value}'
format_id = partial(label, prefix='job')
print(format_id(3))
print(format_id(3, prefix='task'))
