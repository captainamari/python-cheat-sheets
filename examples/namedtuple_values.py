from typing import NamedTuple
class Result(NamedTuple):
    name: str
    count: int
original = Result('job', 1)
updated = original._replace(count=2)
print(original.count, updated.count)
print(updated[0])
