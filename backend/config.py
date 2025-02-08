# backend/config.py
import os
from datetime import timedelta
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY')
    MONGODB_URI = os.environ.get('MONGODB_URI')
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'your-jwt-secret'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=5)
    GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')