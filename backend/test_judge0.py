import requests

url = "https://ce.judge0.com/submissions?base64_encoded=false&wait=true"
payload = {
    "source_code": "print('hello')",
    "language_id": 71  # Python
}
try:
    res = requests.post(url, json=payload, timeout=5)
    print("Judge0 ce:", res.status_code, res.text)
except Exception as e:
    print("Judge0 ce error:", e)
