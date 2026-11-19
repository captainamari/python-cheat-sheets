import gc
import weakref
class Node:
    pass
node = Node()
node.link = node
ref = weakref.ref(node)
del node
gc.collect()
print(ref() is None)
