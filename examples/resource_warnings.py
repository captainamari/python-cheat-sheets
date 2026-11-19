from pathlib import Path
from tempfile import TemporaryDirectory
import warnings
with TemporaryDirectory() as root:
    try:
        with (Path(root) / 'out.txt').open('w', encoding='utf-8') as handle:
            raise ValueError('planned')
    except ValueError:
        pass
    print(handle.closed)
with warnings.catch_warnings(record=True) as caught:
    warnings.simplefilter('always', ResourceWarning)
    warnings.warn('explicit diagnostic example', ResourceWarning)
print(len(caught), caught[0].category.__name__)
