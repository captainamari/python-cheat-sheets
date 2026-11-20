import unittest
case = unittest.TestCase()
a = [1, 2]
b = [1, 2]
case.assertEqual(a, b)
print(a is b)
case.assertCountEqual([1, 2, 1], [2, 1, 1])
print('same multiplicity')
try:
    case.assertCountEqual([1, 1], [1])
except AssertionError:
    print('duplicate detected')
