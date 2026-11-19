from unittest.mock import Mock
mock = Mock(return_value=7)
print(mock())
mock.reset_mock()
print(mock.call_count, mock.return_value)
mock.side_effect = ValueError('planned')
mock.reset_mock(side_effect=True)
print(mock(), mock.call_count)
