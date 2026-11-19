import json
value = {1: ('a', 'b')}
restored = json.loads(json.dumps(value))
print(restored)
print(type(restored['1']).__name__)
try:
    json.dumps(float('nan'), allow_nan=False)
except ValueError:
    print('rejected')
