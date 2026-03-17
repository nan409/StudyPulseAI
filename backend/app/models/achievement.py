import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from ..extensions import db

class Achievement(db.Model):
    __tablename__ = 'achievements'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    
    type = db.Column(db.String(50), nullable=False)
    tier = db.Column(db.Enum('bronze', 'silver', 'gold', 'platinum', name='achievement_tier'))
    
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    icon_url = db.Column(db.Text)
    
    xp_awarded = db.Column(db.Integer, default=0)
    unlocked_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    
    progress_current = db.Column(db.Integer)
    progress_target = db.Column(db.Integer)
