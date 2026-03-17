import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from ..extensions import db

class FlashcardDeck(db.Model):
    __tablename__ = 'flashcard_decks'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    course_id = db.Column(UUID(as_uuid=True), db.ForeignKey('courses.id'))
    
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    source_type = db.Column(db.String(20)) # manual, ai_topic, ai_transcription, ai_notes, import
    source_audio_url = db.Column(db.Text)
    
    card_count = db.Column(db.Integer, default=0)
    last_studied = db.Column(db.DateTime(timezone=True))
    study_count = db.Column(db.Integer, default=0)
    
    is_public = db.Column(db.Boolean, default=False)
    share_code = db.Column(db.String(10), unique=True)
    team_id = db.Column(UUID(as_uuid=True), db.ForeignKey('teams.id'))
    
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    cards = db.relationship('Flashcard', backref='deck', lazy=True)

class Flashcard(db.Model):
    __tablename__ = 'flashcards'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    deck_id = db.Column(UUID(as_uuid=True), db.ForeignKey('flashcard_decks.id'), nullable=False)
    
    front = db.Column(db.Text, nullable=False)
    back = db.Column(db.Text, nullable=False)
    front_html = db.Column(db.Boolean, default=False)
    back_html = db.Column(db.Boolean, default=False)
    example = db.Column(db.Text)
    tags = db.Column(ARRAY(db.String))
    
    difficulty = db.Column(db.Enum('easy', 'medium', 'hard', name='flashcard_difficulty'))
    concept_extraction = db.Column(JSONB)
    
    interval_days = db.Column(db.Integer, default=0)
    repetitions = db.Column(db.Integer, default=0)
    ease_factor = db.Column(db.Numeric(3, 2), default=2.5)
    next_review = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    last_reviewed = db.Column(db.DateTime(timezone=True))
    review_count = db.Column(db.Integer, default=0)
    
    is_suspended = db.Column(db.Boolean, default=False)
    is_buried = db.Column(db.Boolean, default=False)
    
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)
