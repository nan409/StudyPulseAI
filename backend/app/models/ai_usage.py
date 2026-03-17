import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
from ..extensions import db

class AIUsageLog(db.Model):
    __tablename__ = 'ai_usage_logs'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    
    model = db.Column(db.Enum('gemini-2.5-flash', 'gpt-4o-mini', 'whisper-1', name='ai_model'), nullable=False)
    feature = db.Column(db.String(50), nullable=False) # chat, flashcards, transcribe, predict, summarize
    
    tokens_input = db.Column(db.Integer)
    tokens_output = db.Column(db.Integer)
    audio_seconds = db.Column(db.Integer)
    cost_usd = db.Column(db.Numeric(10, 6))
    
    prompt_hash = db.Column(db.String(64))
    response_time_ms = db.Column(db.Integer)
    was_cached = db.Column(db.Boolean, default=False)
    
    prompt_preview = db.Column(db.Text)
    status = db.Column(db.String(20), default='success')
    error_message = db.Column(db.Text)
    
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
