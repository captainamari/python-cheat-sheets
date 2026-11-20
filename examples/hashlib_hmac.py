import hashlib
import hmac
key = b'demo-only-key'
message = b'amount=10'
tag = hmac.digest(key, message, 'sha256')
print(hmac.compare_digest(tag, hmac.digest(key, message, 'sha256')))
print(hmac.compare_digest(tag, hmac.digest(key, b'amount=11', 'sha256')))
print(len(hashlib.sha256(message).digest()))
