class Config:
    value = 3
    def __getattr__(self, name):
        if name == 'legacy': return self.value
        raise AttributeError(name)
config = Config()
print(config.value, config.legacy)
print(hasattr(config, 'missing'))
