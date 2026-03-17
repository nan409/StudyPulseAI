import os
from flask import Flask
from .extensions import db, jwt, migrate, cors, socketio
from .config import config_by_name

def create_app(config_name=os.getenv('FLASK_ENV', 'development')):
    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(app)
    socketio.init_app(app)

    # Register blueprints
    from .blueprints.auth import auth_bp
    from .blueprints.ai import ai_bp
    from .blueprints.billing import billing_bp
    from .blueprints.study import study_bp
    from .blueprints.team import team_bp
    from .blueprints.export import export_bp
    from .blueprints.webhook import webhook_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(billing_bp, url_prefix='/api/billing')
    app.register_blueprint(study_bp, url_prefix='/api/study')
    app.register_blueprint(team_bp, url_prefix='/api/team')
    app.register_blueprint(export_bp, url_prefix='/api/export')
    app.register_blueprint(webhook_bp, url_prefix='/webhooks')

    return app
