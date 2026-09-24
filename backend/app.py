import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_mail import Mail
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Configure upload folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Configure Flask-Mail
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True').lower() in ['true', '1', 't']
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME')

mail = Mail(app)

# Enable CORS for all /api/* endpoints
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": ["*"]
        }
    },
    supports_credentials=True,
)

# Register Blueprints
from routes.auth_routes import auth_bp
from routes.teacher_routes import teacher_bp
from routes.student_routes import student_bp
from routes.parent_routes import parent_bp

app.register_blueprint(auth_bp, url_prefix="/api")
app.register_blueprint(teacher_bp, url_prefix="/api")
app.register_blueprint(student_bp, url_prefix="/api")
app.register_blueprint(parent_bp, url_prefix="/api")

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "EduTrack API Running Successfully"})

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)