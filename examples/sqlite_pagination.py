import sqlite3
db = sqlite3.connect(':memory:')
try:
    db.execute('CREATE TABLE t(id INTEGER PRIMARY KEY, created INTEGER NOT NULL)')
    db.executemany('INSERT INTO t VALUES (?, ?)', [(1, 10), (2, 10), (3, 11)])
    first = db.execute('SELECT created, id FROM t ORDER BY created, id LIMIT 1').fetchone()
    rest = db.execute('SELECT id FROM t WHERE (created, id) > (?, ?) ORDER BY created, id LIMIT 2', first).fetchall()
    print(first)
    print([row[0] for row in rest])
finally:
    db.close()
