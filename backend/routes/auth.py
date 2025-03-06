# backend/routes/auth.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from google.oauth2 import id_token
from google.auth.transport import requests
from models.user import User
from config import Config
from flask_cors import CORS
from bson import ObjectId
from telegram.fetchChannel import fetch_channel_metadata, save_channel_metadata_to_mongodb
import asyncio
from dotenv import load_dotenv
import os

load_dotenv()   

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/google', methods=['POST'])
def google_signin():
    token = request.json.get('token')
    
    try:
        # Verify Google token
        idinfo = id_token.verify_oauth2_token(
            token, requests.Request(), Config.GOOGLE_CLIENT_ID)

        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Invalid issuer')

        # Check if user exists
        existing_user = User.get_by_email(idinfo['email'])
        
        if existing_user:
            # Check if user has resume and preferences
            has_resume = bool(existing_user.job_titles or existing_user.skills or existing_user.experience)
            access_token = create_access_token(identity=str(existing_user.id))
            
            return jsonify({
                'token': access_token,
                'hasResume': has_resume,
                'isNewUser': False,
                'userId': str(existing_user.id)
            }), 200
        
        # Create new user
        user = User(
            email=idinfo['email'],
            name=idinfo['name'],
            picture=idinfo['picture'],
            google_id=idinfo['sub'],
            job_titles=[],
            projects=[],
            contact_details={},
            skills=[],
            experience=[],
            education=[],
            preferences=[]
        )
        user_id = user.save()
        
        # Create JWT token
        access_token = create_access_token(identity=str(user_id))
        
        return jsonify({
            'token': access_token,
            'hasResume': False,
            'isNewUser': True,
            'userId': str(user_id)
        }), 200

    except ValueError as e:
        return jsonify({'error': 'Invalid token'}), 401

@auth_bp.route('/user', methods=['GET'])
@jwt_required()
def get_user():
    current_user_id = get_jwt_identity()
    user = User.get_by_id(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'name': user.name,
        'email': user.email,
        'picture': user.picture,
        'job_titles': user.job_titles,
        'projects': user.projects,
        'contact_details': user.contact_details,
        'skills': user.skills,
        'experience': user.experience,
        'education': user.education,
        'preferences': user.preferences
    }), 200

@auth_bp.route('/verify', methods=['GET'])
@jwt_required()
def verify_token():
    current_user_id = get_jwt_identity()
    return jsonify({'id': current_user_id}), 200

@auth_bp.route('/update-profile', methods=['POST'])
@jwt_required()
def update_profile():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()

        # Convert skills string to list if it's a comma-separated string
        if isinstance(data.get('skills'), str):
            skills = [skill.strip() for skill in data['skills'].split(',') if skill.strip()]
        else:
            skills = data.get('skills', [])

        # Prepare the update data
        update_data = {
            'name': data.get('name'),
            'contact_details': {
                'name': data.get('name'),
                'email': data.get('email'),
                'phone': data.get('phone')
            },
            'skills': skills,
            'job_titles': data.get('job_titles', []),
            'projects': data.get('projects', []),
            'experience': data.get('experience',[]),
            'education': data.get('education',[])
        }

        # Update user in database
        user = User.get_by_id(current_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Update user object with new data
        for key, value in update_data.items():
            setattr(user, key, value)
        
        # Save updated user
        user.save()

        return jsonify({
            'message': 'Profile updated successfully',
            'userId': current_user_id
        }), 200

    except Exception as e:
        print(f"Error updating profile: {e}")
        return jsonify({'error': 'Failed to update profile'}), 500

@auth_bp.route('/search-telegram-channel', methods=['POST'])
@jwt_required()
def search_telegram_channel():
    try:
        channel_username = request.json.get('username')
        if not channel_username:
            return jsonify({'error': 'Channel username is required'}), 400

        # Remove @ if present
        channel_username = channel_username.replace('@', '')

        try:
            # Fetch channel metadata
            metadata = asyncio.run(fetch_channel_metadata(channel_username))
            
            if metadata:
                # Format response
                channel_data = {
                    'channelId': str(metadata['channel_id']),
                    'name': metadata['channel_name'],
                    'username': metadata['channel_username'],
                    'icon': metadata['channel_icon'],
                    'url': metadata['channel_url']
                }
                return jsonify({'channel': channel_data}), 200
            else:
                return jsonify({'error': 'Channel not found'}), 404

        except Exception as e:
            print(f"Error fetching channel metadata: {e}")
            return jsonify({'error': 'Invalid channel or channel not found'}), 404

    except Exception as e:
        print(f"Error in search-telegram-channel: {e}")
        return jsonify({'error': 'Failed to search channel'}), 500

@auth_bp.route('/preferences', methods=['PUT'])
@jwt_required()
def update_preferences():
    try:
        current_user_id = get_jwt_identity()
        preferences_data = request.get_json()
        
        if not preferences_data:
            return jsonify({'error': 'No preferences data provided'}), 400

        # Get user from database
        user = User.get_by_id(current_user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Process telegram channels if included
        if preferences_data.get('includeTelegram') and preferences_data.get('telegramChannels'):
            for channel in preferences_data['telegramChannels']:
                try:
                    # Fetch and save channel metadata if not already in database
                    channel_username = channel['username'].replace('@', '')
                    metadata = asyncio.run(fetch_channel_metadata(channel_username))
                    if metadata:
                        save_channel_metadata_to_mongodb(metadata)
                except Exception as e:
                    print(f"Error processing channel {channel['username']}: {e}")
                    # Continue with other channels if one fails

        # Update user's preferences
        user.preferences = preferences_data
        user.save()

        return jsonify({
            'message': 'Preferences updated successfully',
            'preferences': preferences_data
        }), 200

    except Exception as e:
        print(f"Error updating preferences: {e}")
        return jsonify({'error': 'Failed to update preferences'}), 500
