import io
import unittest
class Sample(unittest.TestCase):
    def test_sum(self):
        self.assertEqual(1 + 2, 3)
    def helper(self):
        raise AssertionError('not a test')
suite = unittest.defaultTestLoader.loadTestsFromTestCase(Sample)
print(suite.countTestCases())
result = unittest.TextTestRunner(stream=io.StringIO()).run(suite)
print(result.testsRun, result.wasSuccessful())
