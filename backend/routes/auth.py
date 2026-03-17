import os
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
import resend
from models import db, User

auth_bp = Blueprint('auth', __name__)

resend.api_key = os.environ.get('RESEND_API_KEY')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing email or password'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'An account with this email already exists'}), 400
        
    hashed_password = generate_password_hash(data['password'])
    new_user = User(
        email=data['email'],
        password_hash=hashed_password,
        display_name=data.get('display_name', data['email'].split('@')[0])
    )
    db.session.add(new_user)
    db.session.commit()
    
    # Send Welcome Email via Resend
    if resend.api_key:
        try:
            resend.Emails.send({
                "from": "PulseFlow AI <onboarding@resend.dev>",
                "to": [data['email']],
                "subject": "Welcome to PulseFlow AI! 🧠",
                "html": "<p>Your AI Study Brain is officially synced. Log in to start generating voice flashcards and tracking your Gamification XP!</p>"
            })
        except Exception as e:
            print(f"Failed to send welcome email: {e}")
    
    return jsonify({'message': 'Account created successfully'}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    import onesignal as onesignal_sdk
    from onesignal.api import default_api
    from onesignal.model.notification import Notification
    
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing email or password'}), 400
        
    user = User.query.filter_by(email=data['email']).first()
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.utcnow() + timedelta(days=7)
    }, os.environ.get('SECRET_KEY', 'dev_super_secret_key'), algorithm="HS256")
    
    # Optional OneSignal device registration ping
    # In a prod environment this is triggered via frontend, but we identify them here
    onesignal_app_id = os.environ.get('ONESIGNAL_APP_ID')
    if onesignal_app_id:
        try:
            # We don't send a notification yet, just preparing the architecture
            pass
        except Exception as e:
            print(f"OneSignal init error: {e}")
    
    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'email': user.email,
            'is_pro': user.is_pro,
            'total_xp': user.total_xp
        }
    }), 200
