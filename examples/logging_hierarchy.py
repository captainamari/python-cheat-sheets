import logging
import io
stream = io.StringIO()
logger = logging.getLogger('demo.s2')
logger.handlers.clear()
logger.propagate = False
logger.setLevel(logging.INFO)
handler = logging.StreamHandler(stream)
handler.setFormatter(logging.Formatter('%(levelname)s:%(message)s'))
logger.addHandler(handler)
logger.debug('hidden')
logger.info('count=%s', 2)
print(stream.getvalue().strip())
logger.removeHandler(handler)
handler.close()
