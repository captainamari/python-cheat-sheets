import unittest
def parse_count(text):
    count = int(text)
    if count < 0:
        raise ValueError('count must be non-negative')
    return count
case = unittest.TestCase()
with case.assertRaisesRegex(ValueError, 'non-negative') as caught:
    parse_count('-1')
print(type(caught.exception).__name__)
print(parse_count('2'))
