import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from ..extensions import db

class Course(db.Model):
    __tablename__ = 'courses'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    team_id = db.Column(UUID(as_uuid=True), db.ForeignKey('teams.id'))
    
    name = db.Column(db.String(255), nullable=False)
    code = db.Column(db.String(50))
    credits = db.Column(db.Integer)
    instructor = db.Column(db.String(255))
    color = db.Column(db.String(7), default='#6366f1')
    
    semester = db.Column(db.String(50), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    target_grade = db.Column(db.Numeric(3, 2))
    current_grade = db.Column(db.Numeric(5, 2), default=0)
    
    is_active = db.Column(db.Boolean, default=True)
    completed_at = db.Column(db.DateTime(timezone=True))
    
    ai_study_plan = db.Column(JSONB)
    ai_suggested_resources = db.Column(JSONB)
    
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    assignments = db.relationship('Assignment', backref='course', lazy=True)
    study_sessions = db.relationship('StudySession', backref='course', lazy=True)
    flashcard_decks = db.relationship('FlashcardDeck', backref='course', lazy=True)
    tasks = db.relationship('StudyTask', backref='course', lazy=True)
