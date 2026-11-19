class Left:
    def __add__(self, other): return NotImplemented
class Right:
    def __radd__(self, other): return 'handled by right'
print(Left() + Right())
