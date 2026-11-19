from enum import Enum
class State(Enum):
    READY = 'ready'
    WAITING = 'ready'
    DONE = 'done'
print(State.READY is State.WAITING)
print([item.name for item in State])
print(State('done').name)
