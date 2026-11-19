class Item:
    def __init__(self, value): self.value = value
    @classmethod
    def parse(cls, text): return cls(int(text))
    @staticmethod
    def valid(text): return text.isdigit()
class Special(Item):
    pass
item = Special.parse('7')
print(type(item).__name__, item.value)
print(Item.valid('7'))
