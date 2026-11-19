from dataclasses import dataclass, field
@dataclass(frozen=True)
class Batch:
    items: list[int] = field(default_factory=list)
a, b = Batch(), Batch()
a.items.append(1)
print(a.items, b.items)
print(a.items is b.items)
