from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from . import study_bp
from ...extensions import db
from ...models.course import Course
from ...models.task import StudyTask
import uuid

@study_bp.route('/courses', methods=['GET'])
@jwt_required()
def get_courses():
    user_id = get_jwt_identity()
    courses = Course.query.filter_by(user_id=user_id).all()
    return jsonify([{
        'id': str(c.id),
        'name': c.name,
        'code': c.code,
        'color': c.color,
        'semester': c.semester,
        'year': c.year,
        'current_grade': float(c.current_grade) if c.current_grade else 0
    } for c in courses])

@study_bp.route('/courses', methods=['POST'])
@jwt_required()
def create_course():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    course = Course(
        user_id=user_id,
        name=data['name'],
        code=data.get('code'),
        semester=data['semester'],
        year=data['year'],
        color=data.get('color', '#6366f1')
    )
    
    db.session.add(course)
    db.session.commit()
    
    return jsonify({'id': str(course.id)}), 201

@study_bp.route('/tasks', methods=['GET'])
@jwt_required()
def get_tasks():
    user_id = get_jwt_identity()
    tasks = StudyTask.query.filter_by(user_id=user_id).all()
    return jsonify([{
        'id': str(t.id),
        'title': t.title,
        'status': t.status,
        'due_date': t.scheduled_date.isoformat() if t.scheduled_date else None
    } for t in tasks])
