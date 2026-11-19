import logging
import unittest
case = unittest.TestCase()
logger = logging.getLogger('s2.events')
with case.assertLogs('s2.events', level='WARNING') as captured:
    logger.warning('job=%s failed', 'a1')
print(captured.records[0].levelname)
print(captured.records[0].getMessage())
