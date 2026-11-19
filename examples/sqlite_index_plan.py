import sqlite3
db = sqlite3.connect(':memory:')
try:
    db.executescript("CREATE TABLE t(id INTEGER, status TEXT); CREATE INDEX idx_status_id ON t(status, id);")
    db.executemany('INSERT INTO t VALUES (?, ?)', [(1, 'done'), (2, 'new'), (3, 'new')])
    sql = 'SELECT id FROM t INDEXED BY idx_status_id WHERE status=? ORDER BY id'
    plan = db.execute('EXPLAIN QUERY PLAN ' + sql, ('new',)).fetchall()
    print(any('idx_status_id' in row[3] for row in plan))
    print(db.execute(sql, ('new',)).fetchall())
finally:
    db.close()
