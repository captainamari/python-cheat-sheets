import json
from decimal import Decimal
values = json.loads('[0.1, 0.2]', parse_float=Decimal)
total = sum(values)
print(total)
encoded = json.dumps({'total': str(total)}, sort_keys=True)
print(encoded)
print(type(json.loads(encoded)['total']).__name__)
