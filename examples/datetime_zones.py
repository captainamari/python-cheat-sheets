from datetime import datetime, timezone, timedelta
utc = datetime(2025, 1, 1, 0, 0, tzinfo=timezone.utc)
local = utc.astimezone(timezone(timedelta(hours=8)))
print(local.isoformat())
print(local == utc)
