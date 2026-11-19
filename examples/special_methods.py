class Box:
    def __len__(self): return 3
b = Box()
b.__len__ = lambda: 9
print(b.__len__())
print(len(b))
