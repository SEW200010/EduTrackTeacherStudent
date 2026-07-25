import os
import datetime
import jwt
from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash, check_password_hash
from middleware import students_col, teachers_col, users_col, SECRET_KEY, is_valid_email, find_user
from flask_mail import Message
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadTimeSignature

auth_bp = Blueprint("auth", __name__)

def get_target_collection(role):
    role = role.lower()
    if role == "student":
        return students_col
    elif role == "teacher":
        return teachers_col
    else: 
        return users_col

def get_serializer():
    return URLSafeTimedSerializer(SECRET_KEY)


@auth_bp.route("/register", methods=["POST"])
def register():
    try:
        data = request.get_json() or {}

        name = str(data.get("name", "")).strip()
        email = str(data.get("email", "")).strip().lower()
        password = str(data.get("password", "")).strip()
        role = str(data.get("role", "")).strip().lower()
        user_id = str(data.get("user_id", "")).strip().upper()
        student_id = str(data.get("student_id", "")).strip().upper()  

        if not name or not email or not password or not role or not user_id:
            return jsonify({"message": "Please fill all required fields (User ID, Name, Email, Password, Role)!"}), 400

        if role == "parent" and not student_id:
            return jsonify({"message": "Student ID (Child's ID) is required for Parent registration!"}), 400

        if not is_valid_email(email):
            return jsonify({"message": "Invalid email format!"}), 400

        existing_user = find_user(user_id) or find_user(email)

        if existing_user:
            if existing_user.get("user_id") == user_id:
                return jsonify({"message": "This User ID is already registered!"}), 400
            if existing_user.get("email") == email:
                return jsonify({"message": "This Email is already registered!"}), 400

        hashed_password = generate_password_hash(password)

        user_doc = {
            "user_id": user_id,
            "name": name,
            "email": email,
            "password": hashed_password,
            "role": role,
            "date_created": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M")
        }

        if role == "parent":
            user_doc["student_id"] = student_id

        target_col = get_target_collection(role)
        target_col.insert_one(user_doc)

        return jsonify({"message": f"{role.capitalize()} registered successfully! Please login."}), 201

    except Exception as e:
        return jsonify({"message": f"Server Error during registration: {str(e)}"}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    try:
        data = request.get_json() or {}

        user_id = str(data.get("user_id", "")).strip().upper()
        password = str(data.get("password", "")).strip()
        student_id = str(data.get("student_id", "")).strip().upper()  

        if not user_id or not password:
            return jsonify({"message": "Please enter User ID and Password!"}), 400

        user = find_user(user_id)

        if not user or not check_password_hash(user["password"], password):
            return jsonify({"message": "Invalid User ID or Password!"}), 401

        if user.get("role") == "parent":
            if not student_id:
                return jsonify({"message": "Student ID is required for Parent Login!"}), 400
            
            if user.get("student_id", "").upper() != student_id:
                return jsonify({"message": "Invalid Student ID associated with this Parent account!"}), 401

        token_payload = {
            "user_id": user["user_id"],
            "email": user["email"],
            "role": user["role"],
            "name": user["name"],
            "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24)
        }

        if user.get("role") == "parent":
            token_payload["student_id"] = user.get("student_id")

        token = jwt.encode(token_payload, SECRET_KEY, algorithm="HS256")

        user_data = {
            "user_id": user["user_id"],
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "student_id": user.get("student_id", user["user_id"])
        }

        return jsonify({
            "message": "Login successful!",
            "token": token,
            "user": user_data
        }), 200

    except Exception as e:
        return jsonify({"message": f"Server Error during login: {str(e)}"}), 500

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json() or {}
    email = data.get('email')

    if not email:
        return jsonify({'message': 'Email address is required!'}), 400

    mail_user = current_app.config.get('MAIL_USERNAME')
    if not mail_user:
        return jsonify({'message': 'Server email is not configured in .env!'}), 500

    try:
        serializer = get_serializer()
        token = serializer.dumps(email, salt='password-reset-salt')
        
        FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
        reset_url = f"{FRONTEND_URL}/reset-password?token={token}",

        msg = Message(
            subject="EduTrack - System Password Reset Request",
            sender=mail_user,
            recipients=[email]
        )
        msg.body = f"Hello,\n\nYou requested to reset your EduTrack Password.\nClick the link below:\n\n{reset_url}\n\nThis link expires in 15 minutes."

        mail = current_app.extensions.get('mail')
        if mail:
            mail.send(msg)

        return jsonify({'message': 'Password reset link sent successfully!'}), 200

    except Exception as e:
        return jsonify({'message': f'Email sending failed: {str(e)}'}), 500


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json() or {}
    token = data.get('token')
    new_password = data.get('new_password')

    if not token or not new_password:
        return jsonify({'message': 'Token and new password are required!'}), 400

    try:
        serializer = get_serializer()
        email = serializer.loads(token, salt='password-reset-salt', max_age=900)
        
        hashed_password = generate_password_hash(new_password)

        user = find_user(email)
        if not user:
            return jsonify({'message': 'User account not found!'}), 404

        role = user.get('role', '').lower()
        target_col = get_target_collection(role)

        target_col.update_one(
            {"email": email},
            {"$set": {"password": hashed_password}}
        )

        return jsonify({'message': 'Password updated successfully! You can now log in.'}), 200

    except SignatureExpired:
        return jsonify({'message': 'The reset link has expired. Request a new one.'}), 400
    except BadTimeSignature:
        return jsonify({'message': 'Invalid reset token.'}), 400
    except Exception as e:
        return jsonify({'message': f'Error resetting password: {str(e)}'}), 500