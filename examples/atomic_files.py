import os
from pathlib import Path
from tempfile import TemporaryDirectory
with TemporaryDirectory() as directory:
    target = Path(directory) / 'state.txt'
    staging = Path(directory) / 'state.tmp'
    target.write_text('old', encoding='utf-8')
    staging.write_text('new', encoding='utf-8')
    os.replace(staging, target)
    print(target.read_text(encoding='utf-8'))
    print(staging.exists())
