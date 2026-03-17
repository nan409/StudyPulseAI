import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from ..extensions import db

class Assignment(db.Model):
    __tablename__ = 'assignments'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    course_id = db.Column(UUID(as_uuid=True), db.ForeignKey('courses.id'), nullable=False)
    
    name = db.Column(db.String(255), nullable=False)
    type = db.Column(db.Enum('homework', 'quiz', 'exam', 'project', 'participation', 'reading', name='assignment_type'), nullable=False)
    description = db.Column(db.Text)
    
    weight_percent = db.Column(db.Integer)
    grade = db.Column(db.Numeric(5, 2))
    max_points = db.Column(db.Numeric(8, 2), default=100)
    
    due_date = db.Column(db.DateTime(timezone=True))
    assigned_date = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    completed_at = db.Column(db.DateTime(timezone=True))
    
    ai_suggested_study_time = db.Column(db.Integer)
    ai_difficulty_prediction = db.Column(db.String(20))
    
    status = db.Column(db.String(20), default='pending')
    
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
