import sqlite3
db = sqlite3.connect(':memory:')
try:
    db.execute('PRAGMA foreign_keys=ON')
    db.executescript('CREATE TABLE p(id INTEGER PRIMARY KEY); CREATE TABLE c(pid INTEGER REFERENCES p(id), amount INTEGER NOT NULL CHECK(amount > 0));')
    print(db.execute('PRAGMA foreign_keys').fetchone()[0])
    try:
        db.execute('INSERT INTO c VALUES (9, 1)')
    except sqlite3.IntegrityError:
        print('rejected')
    db.execute('INSERT INTO p VALUES (9)')
    db.execute('INSERT INTO c VALUES (9, 1)')
    print(db.execute('SELECT COUNT(*) FROM c').fetchone()[0])
finally:
    db.close()
