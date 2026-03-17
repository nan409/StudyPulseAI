import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from ..extensions import db

class Integration(db.Model):
    __tablename__ = 'integrations'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    
    provider = db.Column(db.String(50), nullable=False) # canvas, blackboard, google_classroom, moodle
    provider_user_id = db.Column(db.String(255))
    access_token_encrypted = db.Column(db.Text)
    refresh_token_encrypted = db.Column(db.Text)
    token_expires_at = db.Column(db.DateTime(timezone=True))
    
    sync_courses = db.Column(db.Boolean, default=True)
    sync_assignments = db.Column(db.Boolean, default=True)
    sync_grades = db.Column(db.Boolean, default=True)
    last_sync_at = db.Column(db.DateTime(timezone=True))
    
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)

class WebhookEvent(db.Model):
    __tablename__ = 'webhook_events'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'))
    team_id = db.Column(UUID(as_uuid=True), db.ForeignKey('teams.id'))
    
    event_type = db.Column(db.String(50), nullable=False)
    payload = db.Column(db.JSON, nullable=False)
    
    delivered_at = db.Column(db.DateTime(timezone=True))
    delivery_attempts = db.Column(db.Integer, default=0)
    response_status = db.Column(db.Integer)
    
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
