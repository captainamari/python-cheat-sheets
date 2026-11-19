"""Run maintained examples in isolation and compare their published output."""
from pathlib import Path
import subprocess
import sys
import unittest

ROOT = Path(__file__).resolve().parents[1]

class ExampleTests(unittest.TestCase):
    def test_published_outputs(self):
        examples = sorted((ROOT / 'examples').glob('*.py'))
        self.assertGreaterEqual(len(examples), 12)
        for example in examples:
            with self.subTest(example=example.name):
                result = subprocess.run([sys.executable, '-I', str(example)], capture_output=True, text=True, timeout=8)
                self.assertEqual(result.returncode, 0, result.stderr)
                self.assertEqual(result.stdout.strip(), example.with_suffix('.out').read_text().strip())
                self.assertEqual(result.stderr, '')

if __name__ == '__main__':
    unittest.main()
