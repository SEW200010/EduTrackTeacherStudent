import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from dotenv import load_dotenv
from flask_mail import Mail
# Import Blueprints
from routes.auth_routes import auth_bp
from routes.teacher_routes import teacher_bp
from routes.student_routes import student_bp
from routes.parent_routes import parent_bp
from routes import ai_coach 
load_dotenv()

app = Flask(__name__)

# 🔐 App Secret Key
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "super-secret-key-change-in-production")
app.config['SECRET_KEY'] = os.getenv("JWT_SECRET_KEY", "default-secret-key")
app.config['MAIL_SERVER'] = os.getenv("MAIL_SERVER", "smtp.gmail.com")
app.config['MAIL_PORT'] = int(os.getenv("MAIL_PORT", 587))
app.config['MAIL_USE_TLS'] = os.getenv("MAIL_USE_TLS", "True").lower() in ['true', '1', 't']
app.config['MAIL_USERNAME'] = os.getenv("MAIL_USERNAME")
app.config['MAIL_PASSWORD'] = os.getenv("MAIL_PASSWORD")

mail = Mail(app)
# 🌐 Strict Allowed Origins
ALLOWED_ORIGINS = [
    os.getenv("FRONTEND_URL", "http://localhost:5173"),
    "http://127.0.0.1:5173"
]

# 🛡️ 1. Strict CORS Configuration
CORS(
    app,
    resources={r"/api/*": {"origins": ALLOWED_ORIGINS}},
    supports_credentials=True,
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"]
)

# IP address එක අනුව requests ලිමිට් කෙරේ
limiter = Limiter(
    get_remote_address,
    app=app,
    default_limits=["200 per day", "50 per hour"], # Default limit for general routes
    storage_uri="memory://"
)

limiter.limit("20 per minute")(auth_bp) # Auth endpoints වලට විනාඩියට requests 5යි!

# Upload Configuration
UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix="/api")
app.register_blueprint(teacher_bp, url_prefix="/api")
app.register_blueprint(student_bp, url_prefix="/api")
app.register_blueprint(parent_bp, url_prefix="/api")
app.register_blueprint(ai_coach.ai_coach_bp, url_prefix="/api")


@app.after_request
def apply_security_headers(response):
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY" # Prevents Clickjacking
    response.headers["X-XSS-Protection"] = "1; mode=block" # XSS Protection
    return response

# Preflight Options Handler
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        origin = request.headers.get("Origin")
        if origin in ALLOWED_ORIGINS:
            response = jsonify({"status": "OK"})
            response.headers.add("Access-Control-Allow-Origin", origin)
            response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
            response.headers.add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
            response.headers.add("Access-Control-Allow-Credentials", "true")
            return response, 200

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)