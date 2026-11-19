from contextlib import contextmanager

@contextmanager
def resource():
    print("acquire")
    try:
        yield "handle"
    finally:
        print("release")

try:
    with resource() as handle:
        print(handle)
        raise ValueError("work failed")
except ValueError:
    print("caught")
