import pytest
from app import create_app
from app.extensions import db
from app.models.user import User
import os

@pytest.fixture(scope='module')
def test_client():
    # Set testing config
    os.environ['FLASK_ENV'] = 'testing'
    os.environ['DATABASE_URL'] = 'sqlite:///:memory:' # Use in-memory SQLite for speed
    
    app = create_app()
    with app.test_client() as testing_client:
        with app.app_context():
            db.create_all()
            yield testing_client
            db.drop_all()

@pytest.fixture(scope='function')
def new_user():
    user = User(
        email='test@example.com',
        full_name='Test User',
        subscription_tier='free'
    )
    user.set_password('Password123!')
    return user

@pytest.fixture(scope='function')
def auth_header(test_client):
    # Register and login to get JWT
    test_client.post('/api/auth/register', json={
        'email': 'auth@example.com',
        'password': 'Password123!',
        'full_name': 'Auth User'
    })
    response = test_client.post('/api/auth/login', json={
        'email': 'auth@example.com',
        'password': 'Password123!'
    })
    token = response.get_json()['access_token']
    return {'Authorization': f'Bearer {token}'}
