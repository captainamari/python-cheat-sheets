base = {'db': {'host': 'local', 'timeout': 3}, 'debug': False}
custom = {'db': {'timeout': 5}}
merged = base | custom
print(merged['db'])
print(base['db']['host'])
print(merged['db'] is custom['db'])
