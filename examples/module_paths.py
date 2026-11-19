import importlib.util
spec = importlib.util.find_spec('json')
print(spec.name)
print(spec.origin is not None)
print(spec.submodule_search_locations is not None)
