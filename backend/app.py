# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config import Config
from routes.auth import auth_bp
from pymongo import MongoClient
from werkzeug.utils import secure_filename
import os
import tempfile
from routes.jobs import jobs_bp
from dotenv import load_dotenv

load_dotenv()

# Import the parse_resume function
from utils.resumeParser import parse_resume

app = Flask(__name__)
app.config.from_object(Config)

# Update CORS configuration
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

jwt = JWTManager(app)

# Initialize MongoDB
client = MongoClient(os.getenv("MONGO_URI"))
db = client["seekure"]

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(jobs_bp, url_prefix='/api/jobs')


# Allowed file extensions
ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/api/upload_resume', methods=['POST'])
def upload_resume():
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request."}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No file selected for uploading."}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        try:
            # Save the file to a temporary location
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
                file.save(temp_file.name)
                temp_file_path = temp_file.name

            # Parse the resume
            parsed_data = parse_resume(temp_file_path)

            # Optionally, you can store the parsed data in MongoDB here

            # Remove the temporary file
            os.remove(temp_file_path)

            if "error" in parsed_data:
                return jsonify(parsed_data), 500

            return jsonify(parsed_data), 200

        except Exception as e:
            print(f"Error processing the file: {e}")
            return jsonify({"error": "An error occurred while processing the file."}), 500
    else:
        return jsonify({"error": "Allowed file types are PDF."}), 400


if __name__ == '__main__':
    app.run(debug=True)
