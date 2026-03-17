import os
from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from models import db

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Supabase PostgreSQL Connection
db_url = os.environ.get('DATABASE_URL', '')
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)
    
app.config['SQLALCHEMY_DATABASE_URI'] = db_url
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev_super_secret_key')

db.init_app(app)

from routes.auth import auth_bp
from routes.study import study_bp
from routes.flashcards import flashcards_bp
from routes.export import export_bp
from routes.payments import payments_bp
from routes.tasks import tasks_bp
from routes.achievements import achievements_bp
from routes.user import user_bp
from routes.ai import ai_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(study_bp, url_prefix='/api/study')
app.register_blueprint(flashcards_bp, url_prefix='/api/flashcards')
app.register_blueprint(export_bp, url_prefix='/api/export')
app.register_blueprint(payments_bp, url_prefix='/api/payments')
app.register_blueprint(tasks_bp, url_prefix='/api/tasks')
app.register_blueprint(achievements_bp, url_prefix='/api/achievements')
app.register_blueprint(user_bp, url_prefix='/api/user')
app.register_blueprint(ai_bp, url_prefix='/api/ai')

with app.app_context():
    db.create_all()
    
    # Initialize basic achievements if they do not exist
    from models import Achievement
    if Achievement.query.count() == 0:
        achievements_to_seed = [
            Achievement(internal_code='FIRST_SESSION', name="First Steps", description="Completed your first study session.", icon_name="PlayCircle"),
            Achievement(internal_code='TASK_MASTER_5', name="Task Master", description="Completed 5 tracking tasks.", icon_name="CheckCircle"),
            Achievement(internal_code='DECK_GENERATOR_3', name="Card Sharper", description="Generated 3 AI flashcard decks.", icon_name="Layers"),
        ]
        db.session.bulk_save_objects(achievements_to_seed)
        db.session.commit()

@app.route('/api/health')
def health_check():
    return jsonify({"status": "ok", "message": "StudyPulse API is running"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
