from pathlib import Path
from tempfile import TemporaryDirectory
with TemporaryDirectory() as root:
    base = Path(root).resolve()
    for name in ('docs/readme.txt', '../outside.txt'):
        candidate = (base / name).resolve()
        try:
            relative = candidate.relative_to(base)
        except ValueError:
            print('outside')
        else:
            print(relative.as_posix())
