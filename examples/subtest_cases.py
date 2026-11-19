import unittest
class Cases(unittest.TestCase):
    def test_sizes(self):
        for text, expected in [('', 0), ('ab', 2)]:
            with self.subTest(text=text):
                self.assertEqual(len(text), expected)
result = unittest.TestResult()
Cases('test_sizes').run(result)
print(result.testsRun)
print(result.wasSuccessful())
