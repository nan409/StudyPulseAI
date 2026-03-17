import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from ..extensions import db

class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    
    type = db.Column(db.Enum('assignment_due', 'grade_posted', 'ai_suggestion', 'team_invite', 'subscription_change', 'achievement_unlocked', name='notification_type'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    body = db.Column(db.Text)
    
    action_url = db.Column(db.Text)
    action_text = db.Column(db.String(50))
    
    is_read = db.Column(db.Boolean, default=False)
    read_at = db.Column(db.DateTime(timezone=True))
    
    priority = db.Column(db.String(20), default='normal')
    
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
