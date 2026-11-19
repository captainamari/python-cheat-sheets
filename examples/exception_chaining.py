try:
    try:
        int('bad')
    except ValueError as exc:
        raise RuntimeError('invalid setting') from exc
except RuntimeError as exc:
    print(type(exc.__cause__).__name__)
    print(str(exc))
