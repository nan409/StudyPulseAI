from flask import Blueprint, request, jsonify
import json
from models import db, User, Course
from routes.study import token_required

user_bp = Blueprint('user', __name__)

@user_bp.route('/settings', methods=['GET'])
@token_required
def get_user_settings(current_user):
    return jsonify({
        'display_name': current_user.display_name,
        'avatar_url': current_user.avatar_url,
        'weekly_goal_hours': current_user.weekly_goal_hours,
        'cgpa_scale': json.loads(current_user.cgpa_scale) if current_user.cgpa_scale else None,
        'email_notifications': current_user.email_notifications,
        'push_notifications': current_user.push_notifications,
        'is_pro': current_user.is_pro
    }), 200

@user_bp.route('/settings', methods=['PUT'])
@token_required
def update_user_settings(current_user):
    data = request.get_json()
    
    if 'display_name' in data:
        current_user.display_name = data['display_name']
    if 'avatar_url' in data:
        current_user.avatar_url = data['avatar_url']
    if 'weekly_goal_hours' in data:
        current_user.weekly_goal_hours = data['weekly_goal_hours']
    if 'cgpa_scale' in data:
        current_user.cgpa_scale = json.dumps(data['cgpa_scale'])
    if 'email_notifications' in data:
        current_user.email_notifications = data['email_notifications']
    if 'push_notifications' in data:
        current_user.push_notifications = data['push_notifications']
        
    db.session.commit()
    
    return jsonify({'message': 'Settings updated successfully'}), 200

@user_bp.route('/export', methods=['GET'])
@token_required
def export_user_data(current_user):
    from models import StudySession, FlashcardDeck, Task
    sessions = StudySession.query.filter_by(user_id=current_user.id).all()
    decks = FlashcardDeck.query.filter_by(user_id=current_user.id).all()
    tasks = Task.query.filter_by(user_id=current_user.id).all()
    
    data = {
        'user': {
            'email': current_user.email,
            'display_name': current_user.display_name,
            'weekly_goal_hours': current_user.weekly_goal_hours
        },
        'study_sessions': [{
            'duration_seconds': s.duration_seconds,
            'date': s.timestamp.isoformat()
        } for s in sessions],
        'flashcard_decks': [{
            'title': d.title,
            'card_count': len(d.cards)
        } for d in decks],
        'tasks': [{
            'title': t.title,
            'type': t.task_type,
            'completed': t.is_completed,
            'due_date': t.due_date.isoformat() if t.due_date else None
        } for t in tasks]
    }
    
    return jsonify(data), 200

@user_bp.route('/password', methods=['PUT'])
@token_required
def change_password(current_user):
    from werkzeug.security import generate_password_hash, check_password_hash
    data = request.get_json()
    
    if not all(k in data for k in ("old_password", "new_password")):
        return jsonify({'error': 'Missing required fields'}), 400
        
    if not check_password_hash(current_user.password, data['old_password']):
        return jsonify({'error': 'Incorrect current password'}), 401
        
    current_user.password = generate_password_hash(data['new_password'])
    db.session.commit()
    
    return jsonify({'message': 'Password changed successfully'}), 200

@user_bp.route('/delete', methods=['DELETE'])
@token_required
def delete_account(current_user):
    db.session.delete(current_user)
    db.session.commit()
    return jsonify({'message': 'Account deleted successfully'}), 200

@user_bp.route('/courses', methods=['GET'])
@token_required
def get_courses(current_user):
    courses = Course.query.filter_by(user_id=current_user.id).all()
    return jsonify([{
        'id': c.id,
        'course_name': c.course_name,
        'credit_hours': c.credit_hours,
        'grade': c.grade
    } for c in courses]), 200

@user_bp.route('/courses', methods=['POST'])
@token_required
def add_course(current_user):
    data = request.get_json()
    
    if not all(k in data for k in ("course_name", "credit_hours", "grade")):
        return jsonify({'error': 'Missing required fields'}), 400
        
    if not current_user.is_pro and len(current_user.courses) >= 5:
        return jsonify({'error': 'Free users are limited to 5 courses. Please upgrade to Pro.'}), 403
        
    new_course = Course(
        user_id=current_user.id,
        course_name=data['course_name'],
        credit_hours=float(data['credit_hours']),
        grade=data['grade']
    )
    
    db.session.add(new_course)
    db.session.commit()
    
    return jsonify({'message': 'Course added', 'id': new_course.id}), 201

@user_bp.route('/courses/<int:course_id>', methods=['DELETE'])
@token_required
def delete_course(current_user, course_id):
    course = Course.query.filter_by(id=course_id, user_id=current_user.id).first()
    if not course:
        return jsonify({'error': 'Course not found'}), 404
        
    db.session.delete(course)
    db.session.commit()
    
    return jsonify({'message': 'Course deleted'}), 200
