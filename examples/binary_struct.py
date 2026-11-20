import struct
layout = struct.Struct('>Ih')
blob = layout.pack(258, -2)
print(layout.size)
print(blob.hex())
print(layout.unpack(blob))
