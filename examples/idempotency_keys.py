import sqlite3
connection = sqlite3.connect(':memory:')
try:
    connection.execute('CREATE TABLE receipts (key TEXT PRIMARY KEY, amount INTEGER)')
    for _ in range(2):
        connection.execute('INSERT INTO receipts VALUES (?, ?) ON CONFLICT(key) DO NOTHING', ('order-1', 100))
    print(connection.execute('SELECT count(*), sum(amount) FROM receipts').fetchone())
finally:
    connection.close()
