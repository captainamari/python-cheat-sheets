from functools import singledispatch
@singledispatch
def describe(value): return 'other'
@describe.register(int)
def _(value): return 'integer'
@describe.register(str)
def _(value): return 'text'
print(describe(3))
print(describe('3'))
print(describe([]))
