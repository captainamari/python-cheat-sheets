import csv
import io
text = '''name,note
Alice,"a,b"
Bob,"line1
line2"
'''
rows = list(csv.DictReader(io.StringIO(text, newline='')))
print(len(rows))
print(rows[0]['note'])
print(rows[1]['note'].splitlines())
