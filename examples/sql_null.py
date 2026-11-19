import sqlite3
with sqlite3.connect(':memory:') as db:
    db.execute('CREATE TABLE t (v TEXT)')
    db.executemany('INSERT INTO t VALUES (?)', [('a',), (None,), ('',)])
    print(db.execute('SELECT COUNT(*), COUNT(v) FROM t').fetchone())
    print(db.execute('SELECT COUNT(*) FROM t WHERE v = NULL').fetchone()[0])
    print(db.execute('SELECT COUNT(*) FROM t WHERE v IS NULL').fetchone()[0])
db.close()
