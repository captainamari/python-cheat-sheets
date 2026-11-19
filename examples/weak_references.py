import gc
import weakref
class Item:
    pass
item = Item()
cache = weakref.WeakValueDictionary()
cache['x'] = item
print('x' in cache)
del item
gc.collect()
print('x' in cache)
