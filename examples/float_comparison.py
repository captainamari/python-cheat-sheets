import math
print(0.1 + 0.2 == 0.3)
print(math.isclose(0.1 + 0.2, 0.3))
print(math.isclose(0.0, 1e-10))
print(math.isclose(0.0, 1e-10, abs_tol=1e-9))
