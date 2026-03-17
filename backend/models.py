from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# Many-to-Many association table for User achievements
user_achievements = db.Table('user_achievements',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('achievement_id', db.Integer, db.ForeignKey('achievement.id'), primary_key=True),
    db.Column('awarded_at', db.DateTime, default=datetime.utcnow)
)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_pro = db.Column(db.Boolean, default=False)
    
    # Profile & Settings
    display_name = db.Column(db.String(100), nullable=True)
    avatar_url = db.Column(db.String(255), nullable=True)
    weekly_goal_hours = db.Column(db.Integer, default=10)
    cgpa_scale = db.Column(db.Text, nullable=True) # JSON stored string 
    email_notifications = db.Column(db.Boolean, default=True)
    push_notifications = db.Column(db.Boolean, default=True) 
    
    # Gamification
    total_xp = db.Column(db.Integer, default=0)
    
    sessions = db.relationship('StudySession', backref='user', lazy=True)
    decks = db.relationship('FlashcardDeck', backref='user', lazy=True)
    subscriptions = db.relationship('Subscription', backref='user', lazy=True)
    tasks = db.relationship('TaskItem', backref='user', lazy=True, cascade="all, delete-orphan")
    courses = db.relationship('Course', backref='user', lazy=True, cascade="all, delete-orphan")
    
    # Gamification
    achievements = db.relationship('Achievement', secondary=user_achievements, lazy='subquery',
        backref=db.backref('users', lazy=True))

class Subscription(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    lemon_squeezy_id = db.Column(db.String(100), unique=True)
    status = db.Column(db.String(50), default='active')
    plan = db.Column(db.String(50), nullable=False) # 'pro' or 'unlimited'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class StudySession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    duration_seconds = db.Column(db.Integer, nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)

class FlashcardDeck(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    cards = db.relationship('Flashcard', backref='deck', lazy=True, cascade="all, delete-orphan")

class Flashcard(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    deck_id = db.Column(db.Integer, db.ForeignKey('flashcard_deck.id'), nullable=False)
    front = db.Column(db.String(500), nullable=False)
    back = db.Column(db.String(1000), nullable=False)

class TaskItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    task_type = db.Column(db.String(50), nullable=False) # e.g., 'assignment', 'quiz', 'midterm', 'final'
    due_date = db.Column(db.DateTime, nullable=True)
    is_completed = db.Column(db.Boolean, default=False)
    status = db.Column(db.String(50), default='pending') # pending, on_time, early, late
    archived = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Achievement(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    internal_code = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    icon_name = db.Column(db.String(50), nullable=False) # e.g., 'Star', 'Trophy', 'Zap'

class Course(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    course_name = db.Column(db.String(100), nullable=False)
    credit_hours = db.Column(db.Float, nullable=False)
    grade = db.Column(db.String(10), nullable=False) # e.g. A, B+
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

