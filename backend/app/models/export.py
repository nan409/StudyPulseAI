import uuid
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from ..extensions import db

class Export(db.Model):
    __tablename__ = 'exports'

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('users.id'), nullable=False)
    
    format = db.Column(db.Enum('pdf', 'csv', 'anki', 'markdown', name='export_format'), nullable=False)
    entity_type = db.Column(db.String(50), nullable=False)
    entity_ids = db.Column(ARRAY(UUID(as_uuid=True)))
    
    file_url = db.Column(db.Text)
    file_size_bytes = db.Column(db.Integer)
    expires_at = db.Column(db.DateTime(timezone=True))
    
    status = db.Column(db.String(20), default='pending')
    error_message = db.Column(db.Text)
    
    celery_task_id = db.Column(db.String(255))
    
    created_at = db.Column(db.DateTime(timezone=True), default=datetime.utcnow)
    completed_at = db.Column(db.DateTime(timezone=True))
