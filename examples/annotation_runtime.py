from __future__ import annotations
import inspect
def count(value: int) -> int:
    return value
raw = inspect.get_annotations(count, eval_str=False)
resolved = inspect.get_annotations(count, eval_str=True)
print(raw['value'])
print(resolved['value'] is int)
