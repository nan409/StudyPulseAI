import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from ..extensions import db

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = db.Column(db.String(255), unique=True, nullable=False)
    hashed_password = db.Column(db.String(255))
    full_name = db.Column(db.String(255), nullable=False)
    avatar_url = db.Column(db.Text)
    
    subscription_tier = db.Column(db.Enum('free', 'pro', 'institution', name='subscription_tier'), default='free')
    subscription_status = db.Column(db.Enum('trialing', 'active', 'past_due', 'cancelled', 'paused', name='subscription_status'), default='active')
    paddle_customer_id = db.Column(db.String(255))
    
    team_id = db.Column(UUID(as_uuid=True), db.ForeignKey('teams.id'))
    
    xp_total = db.Column(db.Integer, default=0)
    current_streak = db.Column(db.Integer, default=0)
    longest_streak = db.Column(db.Integer, default=0)
    last_study_date = db.Column(db.Date)
    
    ai_credits_used = db.Column(db.Integer, default=0)
    ai_credits_limit = db.Column(db.Integer, default=50)
    ai_reset_date = db.Column(db.Date, default=datetime.utcnow().date)
    
    timezone = db.Column(db.String(50), default='UTC')
    theme = db.Column(db.String(20), default='dark')
    email_notifications = db.Column(db.Boolean, default=True)
    push_notifications = db.Column(db.Boolean, default=False)
    
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime(timezone=True))

    # Relationships
    courses = db.relationship('Course', backref='owner', lazy=True)
    study_sessions = db.relationship('StudySession', backref='user', lazy=True)
    flashcard_decks = db.relationship('FlashcardDeck', backref='user', lazy=True)
    tasks = db.relationship('StudyTask', backref='user', lazy=True)
