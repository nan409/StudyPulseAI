import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from ..extensions import db

class Team(db.Model):
    __tablename__ = 'teams'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String(255), nullable=False)
    slug = db.Column(db.String(255), unique=True, nullable=False)
    plan = db.Column(db.Enum('free', 'pro', 'institution', name='subscription_tier'), default='pro')
    
    logo_url = db.Column(db.Text)
    primary_color = db.Column(db.String(7), default='#6366f1')
    accent_color = db.Column(db.String(7), default='#8b5cf6')
    
    owner_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    billing_email = db.Column(db.String(255), nullable=False)
    paddle_subscription_id = db.Column(db.String(255))
    
    max_members = db.Column(db.Integer, default=5)
    current_member_count = db.Column(db.Integer, default=1)
    
    custom_ai_training = db.Column(db.Boolean, default=False)
    sso_enabled = db.Column(db.Boolean, default=False)
    api_access_enabled = db.Column(db.Boolean, default=False)
    
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

class TeamMember(db.Model):
    __tablename__ = 'team_members'

    team_id = db.Column(UUID(as_uuid=True), db.ForeignKey('teams.id'), primary_key=True)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), primary_key=True)
    role = db.Column(db.Enum('owner', 'admin', 'editor', 'viewer', name='team_role'), default='editor')
    invited_by = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'))
    joined_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
