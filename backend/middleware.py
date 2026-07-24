import os
import re
from functools import wraps
from flask import request, jsonify
from pymongo import MongoClient
import jwt
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "edutrack_secret_key_2026")
MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/student_performance_db")
DB_NAME = os.getenv("DB_NAME", "student_performance_db")

client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
db = client[DB_NAME]
students_col = db["students"]    
teachers_col = db["teachers"]      
users_col = db["users"]            
marks_col = db["marks"]
announcements_col = db["announcements"]


def is_valid_email(email):
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(pattern, email) is not None


def find_user(identifier):
    if not identifier:
        return None
    
    clean_id = str(identifier).strip()
    query = {
        "$or": [
            {"user_id": clean_id.upper()},
            {"email": clean_id.lower()}
        ]
    }
    
    user = students_col.find_one(query)
    if user: 
        return user

    user = teachers_col.find_one(query)
    if user: 
        return user

    user = users_col.find_one(query)
    return user


def token_required(allowed_roles=None):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = None
            auth_header = request.headers.get("Authorization")
            
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

            if not token:
                return jsonify({"message": "Unauthorized access! Token missing."}), 401

            try:
                data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
                user_identifier = data.get("user_id") or data.get("email")
                current_user = find_user(user_identifier)
                
                if not current_user:
                    return jsonify({"message": "Invalid token session! User not found."}), 401
                    
            except jwt.ExpiredSignatureError:
                return jsonify({"message": "Session expired! Please login again."}), 401
            except jwt.InvalidTokenError:
                return jsonify({"message": "Invalid token!"}), 401

            if allowed_roles and current_user.get("role") not in allowed_roles:
                return jsonify({"message": "Forbidden! Unauthorized role access."}), 403

            return f(current_user, *args, **kwargs)
        return decorated
    return decorator