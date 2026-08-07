import requests
try:
    res = requests.get("https://ce.judge0.com/languages")
    print(res.json())
except Exception as e:
    print(e)
