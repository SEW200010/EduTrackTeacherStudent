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

load_dotenv()

app = Flask(__name__)


# -----------------------------
# Basic Route
# -----------------------------
@app.route("/")
def home():
    return jsonify({
        "message": "API Running Successfully"
    })


# -----------------------------
# Secret Keys
# -----------------------------
app.config["SECRET_KEY"] = os.getenv(
    "JWT_SECRET_KEY",
    "default-secret-key"
)


# -----------------------------
# Email Configuration
# -----------------------------
app.config["MAIL_SERVER"] = os.getenv(
    "MAIL_SERVER",
    "smtp.gmail.com"
)

app.config["MAIL_PORT"] = int(
    os.getenv("MAIL_PORT", 587)
)

app.config["MAIL_USE_TLS"] = True

app.config["MAIL_USERNAME"] = os.getenv(
    "MAIL_USERNAME"
)

app.config["MAIL_PASSWORD"] = os.getenv(
    "MAIL_PASSWORD"
)


mail = Mail(app)


# -----------------------------
# CORS Configuration
# -----------------------------
ALLOWED_ORIGINS = [
    os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173"
    ),
    "http://127.0.0.1:5173"
]


# -----------------------------
# CORS Configuration
# -----------------------------

FRONTEND_URL = os.getenv("FRONTEND_URL")

ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

if FRONTEND_URL:
    ALLOWED_ORIGINS.append(FRONTEND_URL)


CORS(
    app,
    resources={
        r"/api/*": {
            "origins": ALLOWED_ORIGINS
        }
    },
    supports_credentials=True,
    allow_headers=[
        "Content-Type",
        "Authorization"
    ],
    methods=[
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "OPTIONS"
    ]
)


# -----------------------------
# Rate Limiter
# -----------------------------
limiter = Limiter(
    key_func=get_remote_address,
    app=app,
    default_limits=[
        "200 per day",
        "50 per hour"
    ],
    storage_uri="memory://"
)



UPLOAD_FOLDER = "/tmp/uploads"

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER



app.register_blueprint(
    auth_bp,
    url_prefix="/api"
)

app.register_blueprint(
    teacher_bp,
    url_prefix="/api"
)

app.register_blueprint(
    student_bp,
    url_prefix="/api"
)

app.register_blueprint(
    parent_bp,
    url_prefix="/api"
)




# -----------------------------
# Security Headers
# -----------------------------
@app.after_request
def security_headers(response):

    response.headers["X-Content-Type-Options"] = "nosniff"

    response.headers["X-Frame-Options"] = "DENY"

    response.headers["X-XSS-Protection"] = "1; mode=block"

    return response



# -----------------------------
# OPTIONS Request Handler
# -----------------------------
@app.before_request
def handle_preflight():

    if request.method == "OPTIONS":

        response = jsonify(
            {
                "status": "OK"
            }
        )

        return response, 200



# IMPORTANT:
# No app.run() for Vercel