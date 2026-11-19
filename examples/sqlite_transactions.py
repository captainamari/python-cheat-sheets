import sqlite3

connection = sqlite3.connect(
    ":memory:", isolation_level="DEFERRED",
    autocommit=sqlite3.LEGACY_TRANSACTION_CONTROL,
)
try:
    connection.execute("CREATE TABLE account (id INTEGER PRIMARY KEY, cents INTEGER CHECK(cents >= 0))")
    connection.executemany("INSERT INTO account VALUES (?, ?)", [(1, 1000), (2, 500)])
    connection.commit()
    try:
        with connection:
            connection.execute("UPDATE account SET cents = cents - ? WHERE id = ?", (100, 1))
            raise RuntimeError("simulated failure")
            connection.execute("UPDATE account SET cents = cents + ? WHERE id = ?", (100, 2))
    except RuntimeError:
        print("rolled back")
    print(connection.execute("SELECT cents FROM account ORDER BY id").fetchall())
finally:
    connection.close()
