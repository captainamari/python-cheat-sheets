from unittest.mock import Mock
operation = Mock(side_effect=[TimeoutError('slow'), 'ok'])
def run():
    for attempt in range(2):
        try:
            return operation()
        except TimeoutError:
            if attempt == 1:
                raise
print(run())
print(operation.call_count)
