import os
import io
import json
from app import app, SessionLocal, models, auth

def test_backend():
    client = app.test_client()
    print("--- Running Flask Backend Compatibility Tests ---")

    # 1. Test Admin Login (superadmin / password123)
    print("\n1. Testing Login...")
    res = client.post("/token", data={"username": "superadmin", "password": "password123"})
    assert res.status_code == 200, f"Login failed: {res.status_code} {res.data}"
    token = res.json["access_token"]
    print("SUCCESS: Login returned JWT token!")

    # 2. Test File Upload
    print("\n2. Testing File Upload (Checkout custom photo)...")
    data = {
        'file': (io.BytesIO(b"fake image bytes"), 'test_tap.jpg')
    }
    res = client.post("/upload/", data=data, content_type='multipart/form-data')
    assert res.status_code == 200, f"Upload failed: {res.status_code} {res.data}"
    photo_path = res.json["path"]
    print(f"SUCCESS: Upload saved file to {photo_path}")

    # 3. Test Static File Serving
    print("\n3. Testing Static Upload Serving...")
    filename = os.path.basename(photo_path)
    res = client.get(f"/uploads/{filename}")
    assert res.status_code == 200, f"Static serve failed: {res.status_code}"
    assert res.data == b"fake image bytes", "File content mismatch!"
    print("SUCCESS: Static upload served correctly!")

    # 4. Test Public Order Creation (WITHOUT token)
    print("\n4. Testing Public Order Creation (No Admin Token Required)...")
    order_payload = {
        "customer_name": "Jane Smith",
        "number": "+1 555-987-6543",
        "price": 19.99,
        "custom_photo": photo_path
    }
    res = client.post("/orders/", json=order_payload)
    assert res.status_code == 200, f"Public order creation failed: {res.status_code} {res.data}"
    created_order = res.json
    order_id = created_order["id"]
    print(f"SUCCESS: Order #{order_id} created publicly by customer!")

    # 5. Test Admin Fetch Orders (WITH token)
    print("\n5. Testing Admin Get Orders (With Bearer Token)...")
    headers = {"Authorization": f"Bearer {token}"}
    res = client.get("/orders/", headers=headers)
    assert res.status_code == 200, f"Fetch orders failed: {res.status_code} {res.data}"
    orders = res.json
    assert len(orders) > 0, "No orders found!"
    print(f"SUCCESS: Admin fetched {len(orders)} order(s) successfully!")

    # 6. Test Admin Update Order Status
    print("\n6. Testing Admin Update Order Status...")
    res = client.put(f"/orders/{order_id}", json={"status": "Shipped"}, headers=headers)
    assert res.status_code == 200, f"Update status failed: {res.status_code} {res.data}"
    updated_order = res.json
    assert updated_order["status"] == "Shipped", "Status was not updated!"
    print(f"SUCCESS: Order #{order_id} status updated to Shipped!")

    print("\n==========================================")
    print("ALL BACKEND ENDPOINTS ARE 100% COMPATIBLE AND VERIFIED!")
    print("==========================================")

if __name__ == "__main__":
    test_backend()
