import warnings
with warnings.catch_warnings(record=True) as caught:
    warnings.simplefilter('always')
    warnings.warn('old option', DeprecationWarning)
print(len(caught))
print(caught[0].category.__name__)
