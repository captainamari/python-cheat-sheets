text = '中A'
raw = text.encode('utf-8')
print(len(text), len(raw))
print(raw.decode('utf-8') == text)
print(type(raw[0]).__name__)
