class A:
    def run(self): return ['A']
class B(A):
    def run(self): return ['B'] + super().run()
class C(A):
    def run(self): return ['C'] + super().run()
class D(B, C):
    pass
print(D().run())
