import requests
import json

base_url = "http://127.0.0.1:8000/api/v1"

print("1. Testing GET /materials/test-id")
try:
    r = requests.get(f"{base_url}/materials/test-id")
    print(f"Status: {r.status_code}")
except Exception as e:
    print(f"GET Error: {e}")

print("\n2. Testing POST /evaluations/history")
payload = {
    "quiz_id": "test-quiz-123",
    "student_id": "test-user-id",
    "score": 85.0,
    "feedback": "Test Feedback"
}
try:
    r = requests.post(
        f"{base_url}/evaluations/history", 
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    print(f"Status: {r.status_code}")
    print(f"Response: {r.text}")
except Exception as e:
    print(f"POST Error: {e}")
