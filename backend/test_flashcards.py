import requests
import json
import uuid

base_url = "http://127.0.0.1:5000"

def test_flashcards():
    try:
        # 1. Health check
        res = requests.get(f"{base_url}/api/health")
        print("Health:", res.status_code, res.text)
        
        # 2. Register
        email = f"test_{uuid.uuid4()}@example.com"
        password = "password123"
        res = requests.post(f"{base_url}/api/auth/register", json={"email": email, "password": password})
        print("Register:", res.status_code, res.text)
        
        # 3. Login
        res = requests.post(f"{base_url}/api/auth/login", json={"email": email, "password": password})
        print("Login:", res.status_code)
        token = res.json().get("token")
        if not token:
            print("No token received")
            return
            
        # 4. Generate
        headers = {"Authorization": f"Bearer {token}"}
        res = requests.post(f"{base_url}/api/flashcards/generate", json={"topic": "Python"}, headers=headers)
        print("Generate:", res.status_code, res.text)
        
    except Exception as e:
        print("Failed to run test:", e)

if __name__ == "__main__":
    test_flashcards()
