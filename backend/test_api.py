import requests

BASE_URL = "http://localhost:8000"

def run_tests():
    print("1. Creating a user...")
    res = requests.post(f"{BASE_URL}/users/", json={
        "username": "admin",
        "password": "secretpassword"
    })
    print(res.status_code, res.json())

    print("\n2. Logging in to get token...")
    res = requests.post(f"{BASE_URL}/token", data={
        "username": "admin",
        "password": "secretpassword"
    })
    print(res.status_code, res.json())
    if res.status_code != 200:
        return
    token = res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    print("\n3. Creating an order...")
    res = requests.post(f"{BASE_URL}/orders/", json={
        "customer_name": "John Doe",
        "number": "555-1234",
        "price": 150.00
    }, headers=headers)
    print(res.status_code, res.json())

    print("\n4. Getting orders...")
    res = requests.get(f"{BASE_URL}/orders/", headers=headers)
    print(res.status_code, res.json())

if __name__ == "__main__":
    run_tests()
