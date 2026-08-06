import requests
import sys

BASE_URL = "http://localhost:8000"

def get_token():
    res = requests.post(f"{BASE_URL}/api/auth/login", data={"username": "test@example.com", "password": "password123"})
    if res.status_code == 200:
        return res.json()["access_token"]
    print("Auth failed", res.text)
    sys.exit(1)

def test_roadmap(token):
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Get latest report to use for roadmap
    res = requests.get(f"{BASE_URL}/api/report/history", headers=headers)
    if res.status_code != 200 or len(res.json()) == 0:
        print("Failed to fetch reports:", res.text)
        return
        
    report_id = res.json()[0]["id"]
    print(f"Using report_id: {report_id}")
    
    # 2. Generate Roadmap
    print("\n--- Testing Roadmap Generation ---")
    payload = {
        "weeks": 4,
        "hours_per_week": 10
    }
    res = requests.post(f"{BASE_URL}/api/roadmap/generate/{report_id}", headers=headers, json=payload)
    print(f"Generate Roadmap Status: {res.status_code}")
    if res.status_code == 200:
        print("Success!")
        data = res.json()
        print(f"Weeks returned: {len(data.get('weeks', []))}")
    else:
        print("Failed:", res.text)
        
    print("\n--- Testing Fetching My Roadmaps ---")
    res = requests.get(f"{BASE_URL}/api/roadmap/my", headers=headers)
    print(f"Status: {res.status_code}")
    if res.status_code == 200:
        data = res.json()
        print(f"Found {len(data)} roadmaps")
        if len(data) > 0:
            print(f"First roadmap weeks: {len(data[0]['weeks'])}")
    else:
        print("Failed:", res.text)

if __name__ == "__main__":
    token = get_token()
    test_roadmap(token)
