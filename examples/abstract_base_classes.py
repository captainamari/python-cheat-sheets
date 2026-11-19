from abc import ABC, abstractmethod
class Reader(ABC):
    @abstractmethod
    def read(self): pass
class TextReader(Reader):
    def read(self): return 'ok'
try:
    Reader()
except TypeError:
    print('abstract')
print(TextReader().read())
