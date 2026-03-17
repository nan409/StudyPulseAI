from flask import Blueprint, jsonify, request
from models import db, Achievement, User
from routes.study import token_required
from datetime import datetime

achievements_bp = Blueprint('achievements', __name__)

# Basic logic to check and grant achievements
def check_and_grant_achievements(user):
    granted = []
    
    # Check "First Study Session"
    if len(user.sessions) >= 1:
        first_session_ach = Achievement.query.filter_by(internal_code='FIRST_SESSION').first()
        if first_session_ach and first_session_ach not in user.achievements:
            user.achievements.append(first_session_ach)
            granted.append(first_session_ach)
            
    # Check "Task Master" (Completed 5 tasks)
    completed_tasks = [t for t in user.tasks if t.is_completed]
    if len(completed_tasks) >= 5:
        task_master = Achievement.query.filter_by(internal_code='TASK_MASTER_5').first()
        if task_master and task_master not in user.achievements:
            user.achievements.append(task_master)
            granted.append(task_master)
            
    # Check "Card Sharper" (Generated 3 decks)
    if len(user.decks) >= 3:
        deck_ach = Achievement.query.filter_by(internal_code='DECK_GENERATOR_3').first()
        if deck_ach and deck_ach not in user.achievements:
            user.achievements.append(deck_ach)
            granted.append(deck_ach)

    if granted:
        db.session.commit()
        
    return granted

@achievements_bp.route('/', methods=['GET'])
@token_required
def get_achievements(current_user):
    # Dynamically check just in case
    newly_granted = check_and_grant_achievements(current_user)
    
    # Return all possible achievements and highlight earned ones
    all_achievements = Achievement.query.all()
    user_ach_ids = [a.id for a in current_user.achievements]
    
    ach_list = []
    for ach in all_achievements:
        ach_list.append({
            'id': ach.id,
            'name': ach.name,
            'description': ach.description,
            'icon_name': ach.icon_name,
            'is_earned': ach.id in user_ach_ids
        })
        
    # Send a separate flag if a new one was just unlocked right now
    new_alerts = [{'name': a.name, 'icon_name': a.icon_name} for a in newly_granted]
        
    return jsonify({
        'achievements': ach_list,
        'newly_unlocked': new_alerts
    }), 200
