import os

class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-key')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'jwt-dev-key')
    SQLALCHEMY_DATABASE_URI = os.getenv('DATABASE_URL')
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Paddle
    PADDLE_ENV = os.getenv('PADDLE_ENV', 'sandbox')
    PADDLE_API_KEY = os.getenv('PADDLE_API_KEY')
    PADDLE_WEBHOOK_SECRET = os.getenv('PADDLE_WEBHOOK_SECRET')
    
    # AI Services
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': DevelopmentConfig # Placeholder for testing config
}
