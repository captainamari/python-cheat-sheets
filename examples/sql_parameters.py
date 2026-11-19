import sqlite3
connection = sqlite3.connect(':memory:')
try:
    connection.execute('CREATE TABLE users (name TEXT)')
    connection.executemany('INSERT INTO users VALUES (?)', [('alice',), ('bob',)])
    value = "x' OR 1=1 --"
    print(connection.execute('SELECT count(*) FROM users WHERE name=?', (value,)).fetchone()[0])
    print(connection.execute('SELECT count(*) FROM users').fetchone()[0])
finally:
    connection.close()
