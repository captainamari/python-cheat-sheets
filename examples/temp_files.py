from pathlib import Path
from tempfile import TemporaryDirectory
with TemporaryDirectory() as root:
    folder = Path(root)
    target = folder / 'result.txt'
    with target.open('w', encoding='utf-8') as file:
        file.write('hello\n')
    print(target.read_text(encoding='utf-8').strip())
    print(target.exists())
print(folder.exists())
