import math
import importlib
other = importlib.import_module('math')
print(math is other)
from math import pi
old = pi
print(old == math.pi)
