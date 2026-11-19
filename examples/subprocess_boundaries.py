import subprocess
import sys
result = subprocess.run([sys.executable, '-c', 'import sys; print(sys.argv[1])', 'a b; c'], check=True, capture_output=True, text=True, timeout=3)
print(result.stdout.strip())
print(result.returncode)
