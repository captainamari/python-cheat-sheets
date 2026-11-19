from decimal import Decimal, ROUND_HALF_UP
value = Decimal('2.675')
print(value.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP))
print(Decimal('0.1') + Decimal('0.2') == Decimal('0.3'))
print(Decimal(0.1) == Decimal('0.1'))
