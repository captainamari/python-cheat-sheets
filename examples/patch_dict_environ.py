import os
from unittest.mock import patch
with patch.dict(os.environ, {'DEMO_MODE': 'old'}, clear=True):
    with patch.dict(os.environ, {'DEMO_MODE': 'new', 'EXTRA': 'yes'}):
        print(os.environ['DEMO_MODE'], os.environ['EXTRA'])
    print(os.environ['DEMO_MODE'], 'EXTRA' in os.environ)
    with patch.dict(os.environ, {}, clear=True):
        print(os.getenv('DEMO_MODE', 'missing'))
