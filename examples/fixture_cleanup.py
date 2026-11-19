import unittest
case = unittest.TestCase()
events = []
case.addCleanup(events.append, 'first')
case.addCleanup(events.append, 'second')
case.doCleanups()
print(events)
