from unittest.mock import Mock

def display_name(user_id, fetcher):
    return fetcher(user_id)["name"].strip()

fetcher = Mock(return_value={"name": " Jesse "})
print(display_name(7, fetcher))
fetcher.assert_called_once_with(7)
print(fetcher.call_count)
fetcher.side_effect = TimeoutError("upstream")
try:
    display_name(8, fetcher)
except TimeoutError:
    print("timeout propagated")
