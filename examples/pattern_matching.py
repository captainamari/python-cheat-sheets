def route(value):
    match value:
        case {'kind': 'job', 'id': item_id} if item_id > 0:
            return f'job:{item_id}'
        case _:
            return 'unknown'
print(route({'kind': 'job', 'id': 2, 'extra': True}))
print(route({'kind': 'job', 'id': 0}))
