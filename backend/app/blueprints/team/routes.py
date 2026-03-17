from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from . import team_bp
from ...extensions import db
from ...models.team import Team, TeamMember
from ...models.user import User

@team_bp.route('/', methods=['GET'])
@jwt_required()
def get_team():
    user_id = get_jwt_identity()
    member = TeamMember.query.filter_by(user_id=user_id).first()
    
    if not member:
        return jsonify({'error': 'Not part of a team'}), 404
        
    team = Team.query.get(member.team_id)
    return jsonify({
        'id': str(team.id),
        'name': team.name,
        'role': member.role
    })

@team_bp.route('/invite', methods=['POST'])
@jwt_required()
def invite_member():
    # Implementation for sending invites
    return jsonify({'message': 'Invite sent'})
