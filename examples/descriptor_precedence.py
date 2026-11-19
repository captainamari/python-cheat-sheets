class Model:
    @property
    def value(self):
        return 7
m = Model()
m.__dict__['value'] = 99
print(m.value)
print(m.__dict__['value'])
