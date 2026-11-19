class Upper(str):
    def __new__(cls, text):
        return super().__new__(cls, text.upper())
value = Upper('python')
print(value)
print(isinstance(value, Upper))
