from flask import Blueprint, request, jsonify
from functools import wraps
import jwt
import os
from models import db, User, StudySession

study_bp = Blueprint('study', __name__)

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
            
        try:
            data = jwt.decode(token, os.environ.get('SECRET_KEY', 'dev_super_secret_key'), algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
            if not current_user:
                return jsonify({'message': 'User not found!'}), 401
        except Exception as e:
            return jsonify({'message': 'Token is invalid!'}), 401
            
        return f(current_user, *args, **kwargs)
    return decorated

@study_bp.route('/sessions', methods=['POST'])
@token_required
def save_session(current_user):
    data = request.get_json()
    duration = data.get('duration_seconds')
    
    if not duration or not isinstance(duration, int):
        return jsonify({'error': 'Invalid duration_seconds'}), 400
        
    new_session = StudySession(user_id=current_user.id, duration_seconds=duration)
    db.session.add(new_session)
    db.session.commit()
    
    return jsonify({'message': 'Study session logged successfully', 'session_id': new_session.id}), 201

@study_bp.route('/analytics/summary', methods=['GET'])
@token_required
def get_analytics(current_user):
    from sqlalchemy import func
    from datetime import datetime, timedelta
    
    sessions = StudySession.query.filter_by(user_id=current_user.id).all()
    total_seconds = sum(s.duration_seconds for s in sessions)
    
    now = datetime.utcnow()
    
    # helper for aggregating by a strftime format
    def aggregate_by_format(sessions, fmt):
        agg = {}
        for s in sessions:
            key = s.date.strftime(fmt)
            agg[key] = agg.get(key, 0) + s.duration_seconds
        
        # Sort and take last 14 entries for whatever interval this is
        sorted_keys = sorted(agg.keys())[-14:]
        return [{'label': k, 'duration_seconds': agg[k]} for k in sorted_keys]

    daily = aggregate_by_format(sessions, '%Y-%m-%d')
    weekly = aggregate_by_format(sessions, '%Y-W%W')
    monthly = aggregate_by_format(sessions, '%Y-%m')
        
    return jsonify({
        'total_time_seconds': total_seconds,
        'total_sessions': len(sessions),
        'history': {
            'daily': daily,
            'weekly': weekly,
            'monthly': monthly
        },
        'is_pro': current_user.is_pro
    }), 200
