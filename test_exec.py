import json
import sys
import os

# Add backend path
sys.path.append(os.path.abspath("backend/app"))
# But wait, we can just run a simple request to piston directly to see if it works.
import requests

PISTON_API_URL = "https://emkc.org/api/v2/piston/execute"
payload = {
    "language": "python",
    "version": "3.10.0",
    "files": [
        {
            "name": "main",
            "content": "name = input('Enter your name: ')\nprint('Hello,', name)"
        }
    ],
    "stdin": "[1,3,4,2,2]",
    "compile_timeout": 10000,
    "run_timeout": 3000,
    "compile_memory_limit": -1,
    "run_memory_limit": -1
}

res = requests.post(PISTON_API_URL, json=payload)
print(json.dumps(res.json(), indent=2))
