import pickle
original = {'items': [1, 2], 'enabled': True}
# Only deserialize bytes created here, within the same trusted process.
blob = pickle.dumps(original, protocol=4)
restored = pickle.loads(blob)
restored['items'].append(3)
print(original['items'])
print(restored['items'])
print(restored is original)
