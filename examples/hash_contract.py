from dataclasses import dataclass
@dataclass(frozen=True)
class Key:
    name: str
x, y = Key('task'), Key('task')
print(x == y, hash(x) == hash(y))
print({x: 7}[y])
