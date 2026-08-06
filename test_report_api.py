import requests
import time
import sys

BASE_URL = "http://localhost:8000"

def get_token():
    print("Testing auth...")
    res = requests.post(f"{BASE_URL}/api/auth/login", data={"username": "test@example.com", "password": "password123"})
    if res.status_code == 200:
        return res.json()["access_token"]
    print("Auth failed", res.text)
    sys.exit(1)

def test_report_generation(token):
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Get latest resume
    print("Fetching latest resume...")
    res = requests.get(f"{BASE_URL}/api/resume/latest", headers=headers)
    if res.status_code != 200:
        print("Failed to fetch resume:", res.text)
        sys.exit(1)
        
    resume_id = res.json()["id"]
    print(f"Got resume_id: {resume_id}")
    
    # 2. Generate Report
    print("Generating Report...")
    payload = {
        "title": "Software Engineer",
        "raw_text": "We are looking for a Software Engineer with Python and React experience. Must know how to build APIs."
    }
    
    start_time = time.time()
    res = requests.post(f"{BASE_URL}/api/report/generate?resume_id={resume_id}", headers=headers, json=payload)
    end_time = time.time()
    
    print(f"Status Code: {res.status_code} in {end_time - start_time:.2f}s")
    if res.status_code == 200:
        data = res.json()
        print("Success!")
        print(f"Overall Score: {data.get('overall_score')}")
    else:
        print("Failed:", res.text)

if __name__ == "__main__":
    try:
        token = get_token()
        print(f"Got token: {token[:20]}...")
        test_report_generation(token)
    except Exception as e:
        print(f"Error: {e}")
