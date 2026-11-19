from copy import copy, deepcopy

source = [{"tags": ["python"]}]
shallow = copy(source)
deep = deepcopy(source)
shallow[0]["tags"].append("testing")
print(source[0]["tags"])
print(deep[0]["tags"])
print(source is shallow)
print(source[0] is shallow[0])
