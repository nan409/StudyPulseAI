import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from ..extensions import db

class StudyTask(db.Model):
    __tablename__ = 'study_tasks'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    course_id = db.Column(UUID(as_uuid=True), db.ForeignKey('courses.id'))
    assignment_id = db.Column(UUID(as_uuid=True), db.ForeignKey('assignments.id'))
    
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    
    scheduled_date = db.Column(db.Date)
    scheduled_time_start = db.Column(db.Time)
    scheduled_time_end = db.Column(db.Time)
    duration_minutes = db.Column(db.Integer)
    
    is_urgent = db.Column(db.Boolean, default=False)
    is_important = db.Column(db.Boolean, default=False)
    # priority_score is generated in SQL, but we can add a property or hybrid_property if needed.
    
    status = db.Column(db.String(20), default='pending')
    completed_at = db.Column(db.DateTime(timezone=True))
    
    is_recurring = db.Column(db.Boolean, default=False)
    recurrence_rule = db.Column(db.String(50))
    
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
