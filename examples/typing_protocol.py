from typing import Protocol, runtime_checkable
@runtime_checkable
class Reader(Protocol):
    def read(self) -> str: ...
class TextReader:
    def read(self): return 'ok'
reader = TextReader()
print(isinstance(reader, Reader))
print(reader.read())
