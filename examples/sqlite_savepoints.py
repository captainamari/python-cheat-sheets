import sqlite3
connection = sqlite3.connect(':memory:', autocommit=True)
try:
    connection.execute('CREATE TABLE items (value INTEGER)')
    connection.execute('BEGIN')
    connection.execute('INSERT INTO items VALUES (1)')
    connection.execute('SAVEPOINT part')
    connection.execute('INSERT INTO items VALUES (2)')
    connection.execute('ROLLBACK TO part')
    connection.execute('RELEASE part')
    connection.execute('COMMIT')
    print(connection.execute('SELECT value FROM items ORDER BY value').fetchall())
finally:
    connection.close()
