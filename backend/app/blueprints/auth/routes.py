from flask import request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from . import auth_bp
from ...extensions import db
from ...models.user import User
from ...utils.auth import hash_password, check_password

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password') or not data.get('full_name'):
        return jsonify({'error': 'Missing required fields'}), 400
        
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already registered'}), 400
        
    user = User(
        email=data['email'],
        hashed_password=hash_password(data['password']),
        full_name=data['full_name'],
        timezone=data.get('timezone', 'UTC')
    )
    
    db.session.add(user)
    db.session.commit()
    
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': {
            'id': str(user.id),
            'email': user.email,
            'full_name': user.full_name,
            'subscription_tier': user.subscription_tier,
            'xp_total': user.xp_total,
            'ai_credits_remaining': user.ai_credits_limit - user.ai_credits_used
        }
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing email or password'}), 400
        
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not check_password(data['password'], user.hashed_password):
        return jsonify({'error': 'Invalid email or password'}), 401
        
    access_token = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    
    return jsonify({
        'access_token': access_token,
        'refresh_token': refresh_token,
        'user': {
            'id': str(user.id),
            'email': user.email,
            'full_name': user.full_name,
            'subscription_tier': user.subscription_tier,
            'xp_total': user.xp_total,
            'ai_credits_remaining': user.ai_credits_limit - user.ai_credits_used
        }
    }), 200

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    return jsonify({
        'id': str(user.id),
        'email': user.email,
        'full_name': user.full_name,
        'subscription_tier': user.subscription_tier,
        'xp_total': user.xp_total,
        'ai_credits_remaining': user.ai_credits_limit - user.ai_credits_used
    }), 200
