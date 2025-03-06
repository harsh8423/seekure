from pymongo import MongoClient
from bson import ObjectId
from config import Config
from dotenv import load_dotenv
import os

load_dotenv()


client = MongoClient("mongodb+srv://harsh8423:8423047004@cluster0.1xbklyu.mongodb.net/seekure")
db = client["seekure"]
users = db["users"]

class User:
    def __init__(self, email, name, picture, google_id, job_titles=None, projects=None, 
                 contact_details=None, skills=None, experience=None, education=None, preferences=None, id=None):
        self.id = id
        self.email = email
        self.name = name
        self.picture = picture
        self.google_id = google_id
        self.job_titles = job_titles or []
        self.projects = projects or []
        self.contact_details = contact_details or {}
        self.skills = skills or []
        self.experience = experience or []
        self.education = education or []
        self.preferences = preferences or {}


    def save(self):
        user_data = {
            'email': self.email,
            'name': self.name,
            'picture': self.picture,
            'google_id': self.google_id,
            'job_titles': self.job_titles,
            'projects': self.projects,
            'contact_details': self.contact_details,
            'skills': self.skills,
            'experience': self.experience,
            'education': self.education,
            'preferences': self.preferences
        }
        
        existing_user = users.find_one({'google_id': self.google_id})
        if existing_user:
            users.update_one(
                {'_id': existing_user['_id']},
                {'$set': user_data}
            )
            self.id = str(existing_user['_id'])
            return self.id
        else:
            result = users.insert_one(user_data)
            self.id = str(result.inserted_id)
            return self.id

    @staticmethod
    def get_by_google_id(google_id):
        user_data = users.find_one({'google_id': google_id})
        if user_data:
            return User(
                id=str(user_data['_id']),
                email=user_data['email'],
                name=user_data['name'],
                picture=user_data['picture'],
                google_id=user_data['google_id'],
                job_titles=user_data.get('job_titles', []),
                projects=user_data.get('projects', []),
                contact_details=user_data.get('contact_details', {}),
                skills=user_data.get('skills', []),
                experience=user_data.get('experience', []),
                education=user_data.get('education', [])
            )
        return None

    @staticmethod
    def get_by_id(user_id):
        user_data = users.find_one({'_id': ObjectId(user_id)})
        if user_data:
            return User(
                id=str(user_data['_id']),
                email=user_data['email'],
                name=user_data['name'],
                picture=user_data['picture'],
                google_id=user_data['google_id'],
                job_titles=user_data.get('job_titles', []),
                projects=user_data.get('projects', []),
                contact_details=user_data.get('contact_details', {}),
                skills=user_data.get('skills', []),
                experience=user_data.get('experience', []),
                education=user_data.get('education', []),
                preferences=user_data.get('preferences',{})
            )
        return None
    
    @staticmethod
    def get_by_email(email):
        user_data = users.find_one({'email': email})
        if user_data:
            return User(
                id=str(user_data['_id']),
                email=user_data['email'],
                name=user_data['name'],
                picture=user_data['picture'],
                google_id=user_data['google_id'],
                job_titles=user_data.get('job_titles', []),
                projects=user_data.get('projects', []),
                contact_details=user_data.get('contact_details', {}),
                skills=user_data.get('skills', []),
                experience=user_data.get('experience', []),
                education=user_data.get('education', []),
                preferences=user_data.get('preferences',{})

            )
        return None