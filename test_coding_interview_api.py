import requests
import sys
import time

BASE_URL = "http://localhost:8000"

def get_token():
    print("Testing auth...")
    res = requests.post(f"{BASE_URL}/api/auth/login", data={"username": "test@example.com", "password": "password123"})
    if res.status_code == 200:
        return res.json()["access_token"]
    print("Auth failed", res.text)
    sys.exit(1)

def test_coding(token):
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Get latest resume
    res = requests.get(f"{BASE_URL}/api/resume/latest", headers=headers)
    if res.status_code != 200:
        print("Failed to fetch resume:", res.text)
        return
    resume_id = res.json()["id"]
    
    # 2. Start Coding Round
    print("\n--- Testing Coding Round ---")
    payload = {
        "resume_id": resume_id,
        "target_role": "Backend Developer",
        "difficulty": "Medium"
    }
    res = requests.post(f"{BASE_URL}/api/coding/start", headers=headers, json=payload)
    print(f"Start Coding Status: {res.status_code}")
    if res.status_code == 200:
        print("Success!")
        print(f"Questions returned: {len(res.json().get('questions', []))}")
    else:
        print("Failed:", res.text)


def test_interview(token):
    headers = {"Authorization": f"Bearer {token}"}
    
    # 1. Get latest resume
    res = requests.get(f"{BASE_URL}/api/resume/latest", headers=headers)
    if res.status_code != 200:
        print("Failed to fetch resume:", res.text)
        return
    resume_id = res.json()["id"]
    
    # 2. Start Interview
    print("\n--- Testing Interview ---")
    payload = {
        "resume_id": resume_id,
        "target_role": "Backend Developer"
    }
    res = requests.post(f"{BASE_URL}/api/interview/start", headers=headers, json=payload)
    print(f"Start Interview Status: {res.status_code}")
    if res.status_code == 200:
        print("Success!")
        print(f"Questions returned: {len(res.json().get('questions', []))}")
    else:
        print("Failed:", res.text)


if __name__ == "__main__":
    token = get_token()
    test_coding(token)
    test_interview(token)
