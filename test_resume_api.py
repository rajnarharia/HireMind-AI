import requests
import json
import time
import sys

BASE_URL = "http://localhost:8000"

def get_token():
    # Login as a test user
    # Try logging in with default admin or create one
    print("Testing auth...")
    res = requests.post(f"{BASE_URL}/api/auth/login", data={"username": "test@example.com", "password": "password123"})
    if res.status_code == 200:
        return res.json()["access_token"]
    
    print("Test user not found, registering...")
    res = requests.post(f"{BASE_URL}/api/auth/register", json={
        "name": "Test User",
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123",
        "role": "candidate"
    })
    
    if res.status_code in (200, 201):
        return res.json()["access_token"]
        
    print("Auth failed", res.text)
    sys.exit(1)

def test_resume_upload(token):
    print("Testing Resume Upload...")
    headers = {"Authorization": f"Bearer {token}"}
    files = {"file": ("dummy_resume.pdf", open("dummy_resume.pdf", "rb"), "application/pdf")}
    
    start_time = time.time()
    res = requests.post(f"{BASE_URL}/api/resume/upload", headers=headers, files=files)
    end_time = time.time()
    
    print(f"Status Code: {res.status_code} in {end_time - start_time:.2f}s")
    if res.status_code == 200:
        data = res.json()
        print("Success!")
        print(f"ATS Score: {data['analysis'].get('ats_score')}")
        print(f"Skills: {data['analysis'].get('skills')}")
    else:
        print("Failed:", res.text)

if __name__ == "__main__":
    try:
        token = get_token()
        print(f"Got token: {token[:20]}...")
        test_resume_upload(token)
    except Exception as e:
        print(f"Error: {e}")
