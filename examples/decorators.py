from functools import wraps

def traced(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        print("begin")
        try:
            return fn(*args, **kwargs)
        finally:
            print("end")
    return wrapper

@traced
def add(a, *, b=0):
    """Add two numbers."""
    return a + b

print(add(2, b=3))
print(add.__name__)
print(add.__wrapped__(4, b=1))
