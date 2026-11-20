from typing import TypeGuard
def is_texts(value: object) -> TypeGuard[list[str]]:
    return isinstance(value, list) and all(isinstance(item, str) for item in value)
print(is_texts(['a', 'b']))
print(is_texts(['a', 1]))
print(is_texts([]))
