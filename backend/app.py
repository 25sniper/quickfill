import os
import shutil
import uuid
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from functools import wraps
from datetime import timedelta

import models
import schemas
import auth
from database import engine, SessionLocal

# Create DB tables
models.Base.metadata.create_all(bind=engine)

app = Flask(__name__)
# Setup CORS for the frontend
CORS(app, resources={r"/*": {"origins": "*"}})

# Create a directory for uploads
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Auto-seed default admin user if database has no users
def seed_admin():
    db = SessionLocal()
    try:
        if not db.query(models.User).filter(models.User.username == "superadmin").first():
            hashed = auth.get_password_hash("password123")
            admin = models.User(username="superadmin", hashed_password=hashed)
            db.add(admin)
            db.commit()
            print("Default admin created: superadmin / password123")
    except Exception as e:
        print(f"Admin seed check: {e}")
    finally:
        db.close()

seed_admin()



# --- Authentication Decorator ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"detail": "Missing or invalid token"}), 401
        
        token = auth_header.split(" ")[1]
        try:
            payload = auth.jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
            username = payload.get("sub")
            if not username:
                return jsonify({"detail": "Invalid token"}), 401
        except auth.JWTError:
            return jsonify({"detail": "Could not validate credentials"}), 401
        
        db = SessionLocal()
        user = db.query(models.User).filter(models.User.username == username).first()
        db.close()
        
        if not user:
            return jsonify({"detail": "User not found"}), 401
            
        return f(current_user=user, *args, **kwargs)
    return decorated


# --- Auth Routes ---
@app.route("/token", methods=["POST"])
def login_for_access_token():
    # Flask form data is in request.form, json in request.json
    # OAuth2PasswordRequestForm sends data as x-www-form-urlencoded
    username = request.form.get("username") or (request.json and request.json.get("username"))
    password = request.form.get("password") or (request.json and request.json.get("password"))
    
    db = SessionLocal()
    user = db.query(models.User).filter(models.User.username == username).first()
    
    if not user or not auth.verify_password(password, user.hashed_password):
        db.close()
        return jsonify({"detail": "Incorrect username or password"}), 401
        
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    db.close()
    return jsonify({"access_token": access_token, "token_type": "bearer"})

@app.route("/users/", methods=["POST"])
def create_user():
    data = request.json
    try:
        user_create = schemas.UserCreate(**data)
    except Exception as e:
        return jsonify({"detail": str(e)}), 422
        
    db = SessionLocal()
    db_user = db.query(models.User).filter(models.User.username == user_create.username).first()
    if db_user:
        db.close()
        return jsonify({"detail": "Username already registered"}), 400
    
    hashed_password = auth.get_password_hash(user_create.password)
    new_user = models.User(username=user_create.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Simple manual serialization to avoid setting up Marshmallow right now
    resp = {"id": new_user.id, "username": new_user.username}
    db.close()
    return jsonify(resp)


# --- Order Routes ---
@app.route("/orders/", methods=["POST"])
def create_order():
    data = request.json
    try:
        order_create = schemas.OrderCreate(**data)
    except Exception as e:
        return jsonify({"detail": str(e)}), 422

        
    db = SessionLocal()
    new_order = models.Order(**order_create.model_dump())
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    resp = {
        "id": new_order.id,
        "customer_name": new_order.customer_name,
        "number": new_order.number,
        "price": new_order.price,
        "status": new_order.status,
        "custom_photo": new_order.custom_photo,
        "created_at": new_order.created_at.isoformat() if new_order.created_at else None
    }
    db.close()
    return jsonify(resp)

@app.route("/orders/", methods=["GET"])
@token_required
def read_orders(current_user):
    skip = request.args.get("skip", 0, type=int)
    limit = request.args.get("limit", 100, type=int)
    
    db = SessionLocal()
    orders = db.query(models.Order).offset(skip).limit(limit).all()
    
    resp = []
    for order in orders:
        resp.append({
            "id": order.id,
            "customer_name": order.customer_name,
            "number": order.number,
            "price": order.price,
            "status": order.status,
            "custom_photo": order.custom_photo,
            "created_at": order.created_at.isoformat() if order.created_at else None
        })
    db.close()
    return jsonify(resp)

@app.route("/orders/<int:order_id>", methods=["GET"])
@token_required
def read_order(current_user, order_id):
    db = SessionLocal()
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        db.close()
        return jsonify({"detail": "Order not found"}), 404
        
    resp = {
        "id": order.id,
        "customer_name": order.customer_name,
        "number": order.number,
        "price": order.price,
        "status": order.status,
        "custom_photo": order.custom_photo,
        "created_at": order.created_at.isoformat() if order.created_at else None
    }
    db.close()
    return jsonify(resp)

@app.route("/orders/<int:order_id>", methods=["PUT"])
@token_required
def update_order(current_user, order_id):
    data = request.json
    try:
        order_update = schemas.OrderUpdate(**data)
    except Exception as e:
        return jsonify({"detail": str(e)}), 422
        
    db = SessionLocal()
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        db.close()
        return jsonify({"detail": "Order not found"}), 404
    
    update_data = order_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(order, key, value)
        
    db.commit()
    db.refresh(order)
    
    resp = {
        "id": order.id,
        "customer_name": order.customer_name,
        "number": order.number,
        "price": order.price,
        "status": order.status,
        "custom_photo": order.custom_photo,
        "created_at": order.created_at.isoformat() if order.created_at else None
    }
    db.close()
    return jsonify(resp)


# --- File Upload Route ---
@app.route("/upload/", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"detail": "No file part"}), 400
        
    file = request.files["file"]
    if file.filename == "":
        return jsonify({"detail": "No selected file"}), 400
        
    ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    file_location = os.path.join(UPLOAD_DIR, unique_filename)
    
    file.save(file_location)
    
    return jsonify({"path": f"uploads/{unique_filename}", "info": f"file saved to {file_location}"})

@app.route("/uploads/<path:filename>", methods=["GET"])
def serve_uploads(filename):
    return send_from_directory(UPLOAD_DIR, filename)

# --- Frontend Assets ---
# Memory cache for index.html to prevent constant disk reads
INDEX_HTML_CONTENT = ""
dist_dir = os.path.join(BASE_DIR, "../dist")
index_path = os.path.join(dist_dir, "index.html")
if os.path.exists(index_path):
    with open(index_path, "r", encoding="utf-8") as f:
        INDEX_HTML_CONTENT = f.read()

# Catch-all to serve index.html for React Router
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react_app(path):
    # Ignore API docs and explicit backend paths just in case
    if path.startswith("api/") or path.startswith("uploads/"):
        return jsonify({"detail": "Not found"}), 404
        
    # Serve root files if they exist (like favicon or 3D models in public folder)
    file_path = os.path.join(dist_dir, path)
    if path and os.path.isfile(file_path):
        return send_from_directory(dist_dir, path)
        
    # Otherwise serve the cached index.html
    return INDEX_HTML_CONTENT

if __name__ == "__main__":
    app.run(port=8000, debug=True)

