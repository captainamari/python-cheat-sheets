from pathlib import Path
from tempfile import TemporaryDirectory
import sqlite3
with TemporaryDirectory() as root:
    path = Path(root) / 'sample.db'
    writer = sqlite3.connect(path, autocommit=True)
    reader = sqlite3.connect(path, autocommit=True)
    try:
        print(writer.execute('PRAGMA journal_mode=WAL').fetchone()[0])
        writer.execute('CREATE TABLE t(v INTEGER)')
        writer.execute('INSERT INTO t VALUES (1)')
        reader.execute('BEGIN')
        print(reader.execute('SELECT COUNT(*) FROM t').fetchone()[0])
        writer.execute('INSERT INTO t VALUES (2)')
        print(reader.execute('SELECT COUNT(*) FROM t').fetchone()[0])
        reader.execute('COMMIT')
        print(reader.execute('SELECT COUNT(*) FROM t').fetchone()[0])
    finally:
        reader.close()
        writer.close()
