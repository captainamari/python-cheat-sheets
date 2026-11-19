class Point:
    __slots__ = ('x',)
p = Point()
p.x = 1
p.x = 2
print(p.x)
print(hasattr(p, '__dict__'))
try:
    p.y = 3
except AttributeError:
    print('no y')
