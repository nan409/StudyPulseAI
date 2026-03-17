import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from ..extensions import db

class StudySession(db.Model):
    __tablename__ = 'study_sessions'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    course_id = db.Column(UUID(as_uuid=True), db.ForeignKey('courses.id'))
    assignment_id = db.Column(UUID(as_uuid=True), db.ForeignKey('assignments.id'))
    
    started_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    ended_at = db.Column(db.DateTime(timezone=True))
    duration_minutes = db.Column(db.Integer) # Will be calculated by trigger in DB, but mapping here for reference
    
    focus_score = db.Column(db.Integer)
    distraction_count = db.Column(db.Integer, default=0)
    pause_count = db.Column(db.Integer, default=0)
    
    notes = db.Column(db.Text)
    tags = db.Column(ARRAY(db.String))
    
    xp_earned = db.Column(db.Integer, default=0)
    session_type = db.Column(db.String(20), default='focus')
    
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
