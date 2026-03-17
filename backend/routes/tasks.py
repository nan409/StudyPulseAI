from flask import Blueprint, request, jsonify
from datetime import datetime
from models import db, TaskItem
from routes.study import token_required

tasks_bp = Blueprint('tasks', __name__)

@tasks_bp.route('/', methods=['GET'])
@token_required
def get_tasks(current_user):
    tasks = TaskItem.query.filter_by(user_id=current_user.id, archived=False).order_by(TaskItem.due_date.asc()).all()
    tasks_list = [{
        'id': t.id,
        'title': t.title,
        'description': t.description,
        'task_type': t.task_type,
        'due_date': t.due_date.isoformat() if t.due_date else None,
        'is_completed': t.is_completed,
        'status': t.status
    } for t in tasks]
    return jsonify({
        'tasks': tasks_list,
        'total_xp': current_user.total_xp,
        'level': current_user.total_xp // 100
    }), 200

@tasks_bp.route('/', methods=['POST'])
@token_required
def create_task(current_user):
    data = request.get_json()
    if not data or not data.get('title') or not data.get('task_type'):
        return jsonify({'error': 'Title and task_type required'}), 400
        
    incomplete_tasks = [t for t in current_user.tasks if not t.is_completed]
    if not current_user.is_pro and len(incomplete_tasks) >= 5:
        return jsonify({'error': 'Free users are limited to 5 active tasks. Please upgrade to Pro.'}), 403
        
    due_date = None
    if data.get('due_date'):
        due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
        
    new_task = TaskItem(
        user_id=current_user.id,
        title=data['title'],
        description=data.get('description', ''),
        task_type=data['task_type'],
        due_date=due_date
    )
    db.session.add(new_task)
    db.session.commit()
    
    return jsonify({'message': 'Task created', 'task_id': new_task.id}), 201

@tasks_bp.route('/<int:task_id>', methods=['PUT', 'DELETE'])
@token_required
def modify_task(current_user, task_id):
    task = TaskItem.query.filter_by(id=task_id, user_id=current_user.id).first()
    if not task:
        return jsonify({'error': 'Task not found'}), 404
        
    if request.method == 'DELETE':
        db.session.delete(task)
        db.session.commit()
        return jsonify({'message': 'Task deleted'}), 200
        
    if request.method == 'PUT':
        data = request.get_json()
        if 'is_completed' in data and data['is_completed'] != task.is_completed:
            task.is_completed = data['is_completed']
            
            # PulseFlow Gamification Engine: XP Logic
            if task.is_completed:
                earned_xp = 5 # Base XP for completing any task
                
                if task.due_date:
                    time_diff = (task.due_date - datetime.utcnow()).total_seconds()
                    
                    if time_diff > 86400: # Early (> 24 hours before)
                        earned_xp += 20
                        task.status = 'early'
                    elif time_diff > 0: # On-Time (0 - 24 hours before)
                        earned_xp += 10
                        task.status = 'on_time'
                    else: # Late
                        earned_xp += 2
                        task.status = 'late'
                else:
                    task.status = 'completed_no_date'
                    
                current_user.total_xp += earned_xp
                
        if 'archived' in data:
            task.archived = data['archived']
            
        db.session.commit()
        return jsonify({'message': 'Task updated', 'total_xp': current_user.total_xp}), 200

@tasks_bp.route('/cron/archive', methods=['GET'])
def auto_archive_tasks():
    # Called by Vercel Cron or an external script to keep the active DB clean
    # Finds all completed tasks that are older than a week and archives them
    from datetime import timedelta
    
    cutoff_date = datetime.utcnow() - timedelta(days=7)
    tasks_to_archive = TaskItem.query.filter(
        TaskItem.is_completed == True,
        TaskItem.archived == False,
        TaskItem.due_date < cutoff_date
    ).all()
    
    archived_count = 0
    for task in tasks_to_archive:
        task.archived = True
        archived_count += 1
        
    db.session.commit()
    return jsonify({'message': f'Auto-archived {archived_count} tasks successfully.'}), 200
